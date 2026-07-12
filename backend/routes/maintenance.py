# routers/maintenance.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from db import get_db
from services.priority_engine import calculate_priority

router = APIRouter(prefix="/maintenance", tags=["maintenance"])


class MaintenanceCreate(BaseModel):
    asset_id: int
    reported_by: int
    issue_description: str
    image_url: str | None = None
    blocks_work: bool = False


class MaintenanceReject(BaseModel):
    approved_by: int
    resolution_notes: str | None = None


class MaintenanceApprove(BaseModel):
    approved_by: int


class MaintenanceResolve(BaseModel):
    resolution_notes: str | None = None


def _log_activity(conn, user_id, action, entity_id, description):
    conn.execute(
        "INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)",
        (user_id, action, "maintenance_request", entity_id, description)
    )


def _notify(conn, user_id, title, message, type_):
    conn.execute(
        "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
        (user_id, title, message, type_)
    )


@router.post("")
def raise_request(payload: MaintenanceCreate):
    import json
    conn = get_db()
    try:
        asset = conn.execute(
            "SELECT criticality, acquisition_cost, status FROM assets WHERE id = ?",
            (payload.asset_id,)
        ).fetchone()
        if asset is None:
            raise HTTPException(404, "Asset not found")

        criticality = asset["criticality"] or "Low"
        cost = asset["acquisition_cost"] or 0

        priority, reasons = calculate_priority(criticality, cost, payload.blocks_work, payload.issue_description)

        cur = conn.execute(
            """INSERT INTO maintenance_requests
               (asset_id, reported_by, issue_description, image_url, priority, priority_reasons)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (payload.asset_id, payload.reported_by, payload.issue_description,
             payload.image_url, priority, json.dumps(reasons))
        )
        request_id = cur.lastrowid

        _log_activity(conn, payload.reported_by, "Maintenance Requested", request_id,
                      f"Priority: {priority}")

        conn.commit()
        return {"id": request_id, "priority": priority, "reasons": reasons, "status": "Pending"}
    finally:
        conn.close()


@router.post("/{request_id}/approve")
def approve_request(request_id: int, payload: MaintenanceApprove):
    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM maintenance_requests WHERE id = ?", (request_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "Maintenance request not found")
        if row["status"] != "Pending":
            raise HTTPException(400, f"Cannot approve a request with status '{row['status']}'")

        # 🔒 ADD THIS GUARD - Check if asset is already UnderMaintenance
        asset = conn.execute("SELECT status FROM assets WHERE id = ?", (row["asset_id"],)).fetchone()
        if asset["status"] == "UnderMaintenance":
            raise HTTPException(
                409, 
                f"Asset {row['asset_id']} is already under maintenance. Please resolve the existing maintenance request first."
            )

        conn.execute(
            "UPDATE maintenance_requests SET status = 'Approved', approved_by = ? WHERE id = ?",
            (payload.approved_by, request_id)
        )
        conn.execute("UPDATE assets SET status = 'UnderMaintenance' WHERE id = ?", (row["asset_id"],))

        _log_activity(conn, payload.approved_by, "Maintenance Approved", request_id,
                      f"Asset {row['asset_id']} set to UnderMaintenance")
        _notify(conn, row["reported_by"], "Maintenance Approved",
                f"Your maintenance request for asset {row['asset_id']} was approved.", "maintenance_approved")

        conn.commit()
        return {"id": request_id, "status": "Approved"}
    finally:
        conn.close()


@router.post("/{request_id}/reject")
def reject_request(request_id: int, payload: MaintenanceReject):
    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM maintenance_requests WHERE id = ?", (request_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "Maintenance request not found")
        if row["status"] != "Pending":
            raise HTTPException(400, f"Cannot reject a request with status '{row['status']}'")

        conn.execute(
            "UPDATE maintenance_requests SET status = 'Rejected', approved_by = ?, resolution_notes = ? WHERE id = ?",
            (payload.approved_by, payload.resolution_notes, request_id)
        )

        _log_activity(conn, payload.approved_by, "Maintenance Rejected", request_id,
                      payload.resolution_notes or "No reason provided")

        conn.commit()
        return {"id": request_id, "status": "Rejected"}
    finally:
        conn.close()


@router.post("/{request_id}/resolve")
def resolve_request(request_id: int, payload: MaintenanceResolve):
    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM maintenance_requests WHERE id = ?", (request_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "Maintenance request not found")
        if row["status"] != "Approved":
            raise HTTPException(400, f"Cannot resolve a request with status '{row['status']}' (must be Approved first)")

        conn.execute(
            "UPDATE maintenance_requests SET status = 'Resolved', resolution_notes = ? WHERE id = ?",
            (payload.resolution_notes, request_id)
        )
        conn.execute("UPDATE assets SET status = 'Available' WHERE id = ?", (row["asset_id"],))

        _log_activity(conn, row["approved_by"], "Maintenance Resolved", request_id,
                      f"Asset {row['asset_id']} set to Available")
        _notify(conn, row["reported_by"], "Maintenance Resolved",
                f"Maintenance for asset {row['asset_id']} is complete.", "maintenance_resolved")

        conn.commit()
        return {"id": request_id, "status": "Resolved"}
    finally:
        conn.close()


@router.get("/{request_id}")
def get_request(request_id: int):
    import json
    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM maintenance_requests WHERE id = ?", (request_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "Maintenance request not found")
        d = dict(row)
        d["priority_reasons"] = json.loads(d["priority_reasons"]) if d["priority_reasons"] else []
        return d
    finally:
        conn.close()


@router.get("")
def maintenance_history(asset_id: int | None = None, status: str | None = None):
    import json
    conn = get_db()
    try:
        query = "SELECT * FROM maintenance_requests WHERE 1=1"
        params = []
        if asset_id is not None:
            query += " AND asset_id = ?"
            params.append(asset_id)
        if status is not None:
            query += " AND status = ?"
            params.append(status)
        query += " ORDER BY created_at DESC"

        rows = conn.execute(query, params).fetchall()
        results = []
        for row in rows:
            d = dict(row)
            d["priority_reasons"] = json.loads(d["priority_reasons"]) if d["priority_reasons"] else []
            results.append(d)
        return results
    finally:
        conn.close()