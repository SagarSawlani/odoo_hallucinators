from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import get_db

router = APIRouter(prefix="/audit", tags=["audit"])


class AuditCycleCreate(BaseModel):
    title: str
    department_id: int | None = None
    location: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    created_by: int


class VerifyAsset(BaseModel):
    asset_id: int
    auditor_id: int
    result: str  # 'Verified' | 'Missing' | 'Damaged'
    remarks: str | None = None


def _log_activity(conn, user_id, action, entity_id, description):
    conn.execute(
        "INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)",
        (user_id, action, "audit", entity_id, description)
    )


def _notify(conn, user_id, title, message, type_):
    conn.execute(
        "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
        (user_id, title, message, type_)
    )


@router.post("/cycles")
def create_cycle(payload: AuditCycleCreate):
    conn = get_db()
    try:
        cur = conn.execute(
            """INSERT INTO audit_cycles (title, department_id, location, start_date, end_date, created_by)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (payload.title, payload.department_id, payload.location,
             payload.start_date, payload.end_date, payload.created_by)
        )
        cycle_id = cur.lastrowid
        _log_activity(conn, payload.created_by, "Audit Cycle Created", cycle_id, payload.title)
        conn.commit()
        return {"id": cycle_id, "status": "Open"}
    finally:
        conn.close()


@router.post("/cycles/{cycle_id}/verify")
def verify_asset(cycle_id: int, payload: VerifyAsset):
    if payload.result not in ("Verified", "Missing", "Damaged"):
        raise HTTPException(400, "result must be Verified, Missing, or Damaged")

    conn = get_db()
    try:
        cycle = conn.execute("SELECT status FROM audit_cycles WHERE id = ?", (cycle_id,)).fetchone()
        if cycle is None:
            raise HTTPException(404, "Audit cycle not found")
        if cycle["status"] == "Closed":
            raise HTTPException(400, "Cannot modify a closed audit cycle")

        asset = conn.execute("SELECT id FROM assets WHERE id = ?", (payload.asset_id,)).fetchone()
        if asset is None:
            raise HTTPException(404, "Asset not found")

        existing = conn.execute(
            "SELECT result FROM audit_results WHERE audit_cycle_id = ? AND asset_id = ?",
            (cycle_id, payload.asset_id)
        ).fetchone()

        if existing is not None and existing["result"] == payload.result:
            return {"message": "No change — result already recorded", "result": payload.result}

        conn.execute(
            """INSERT INTO audit_results (audit_cycle_id, asset_id, auditor_id, result, remarks)
               VALUES (?, ?, ?, ?, ?)
               ON CONFLICT(audit_cycle_id, asset_id)
               DO UPDATE SET auditor_id = excluded.auditor_id,
                             result = excluded.result,
                             remarks = excluded.remarks,
                             verified_at = CURRENT_TIMESTAMP""",
            (cycle_id, payload.asset_id, payload.auditor_id, payload.result, payload.remarks)
        )

        action_desc = f"Asset {payload.asset_id} marked {payload.result} in cycle {cycle_id}"
        _log_activity(conn, payload.auditor_id, "Asset Audited", payload.asset_id, action_desc)

        if payload.result == "Missing":
            conn.execute("UPDATE assets SET status = 'Lost' WHERE id = ?", (payload.asset_id,))
            _log_activity(conn, payload.auditor_id, "Asset Marked Lost", payload.asset_id,
                          f"Asset {payload.asset_id} status set to Lost")
            cycle_creator = conn.execute("SELECT created_by FROM audit_cycles WHERE id = ?", (cycle_id,)).fetchone()
            _notify(conn, cycle_creator["created_by"], "Missing Asset Detected",
                    f"Asset {payload.asset_id} was marked Missing during audit.", "audit_missing")

        conn.commit()
        return {"message": f"Asset marked as {payload.result}", "result": payload.result,
                "updated": existing is not None}
    finally:
        conn.close()


@router.post("/cycles/{cycle_id}/close")
def close_cycle(cycle_id: int, closed_by: int):
    conn = get_db()
    try:
        cycle = conn.execute("SELECT status FROM audit_cycles WHERE id = ?", (cycle_id,)).fetchone()
        if cycle is None:
            raise HTTPException(404, "Audit cycle not found")
        if cycle["status"] == "Closed":
            raise HTTPException(400, "Cycle is already closed")

        conn.execute("UPDATE audit_cycles SET status = 'Closed' WHERE id = ?", (cycle_id,))
        _log_activity(conn, closed_by, "Audit Closed", cycle_id, f"Cycle {cycle_id} closed")
        conn.commit()
        return {"id": cycle_id, "status": "Closed"}
    finally:
        conn.close()


@router.get("/cycles/{cycle_id}/results")
def get_results(cycle_id: int):
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT * FROM audit_results WHERE audit_cycle_id = ?", (cycle_id,)
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()