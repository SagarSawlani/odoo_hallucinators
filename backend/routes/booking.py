from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from db import get_db
from services.booking_logic import check_overlap, compute_status, resolve_cancel_status

router = APIRouter(prefix="/bookings", tags=["bookings"])


class BookingCreate(BaseModel):
    asset_id: int
    booked_by: int          # stub — replace with token-derived user once auth exists
    start_time: datetime
    end_time: datetime
    purpose: str | None = None


def _log_activity(conn, user_id, action, entity_id, description):
    conn.execute(
        "INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description) VALUES (?, ?, ?, ?, ?)",
        (user_id, action, "resource_booking", entity_id, description)
    )


def _notify(conn, user_id, title, message, type_):
    conn.execute(
        "INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)",
        (user_id, title, message, type_)
    )


@router.post("")
def create_booking(payload: BookingCreate):
    if payload.end_time <= payload.start_time:
        raise HTTPException(400, "end_time must be after start_time")

    conn = get_db()
    try:
        # in create_booking():
        asset = conn.execute(
            "SELECT is_bookable, status FROM assets WHERE id = ?", (payload.asset_id,)
        ).fetchone()
        if asset is None:
            raise HTTPException(404, "Asset not found")
        if not asset["is_bookable"]:
            raise HTTPException(400, "Asset is not bookable")
        if asset["status"] == "UnderMaintenance":
            raise HTTPException(400, "Asset is under maintenance")

        rows = conn.execute(
            "SELECT start_time, end_time FROM resource_bookings WHERE asset_id = ? AND status IN ('Upcoming','Ongoing')",
            (payload.asset_id,)
        ).fetchall()
        existing = [(datetime.fromisoformat(r["start_time"]), datetime.fromisoformat(r["end_time"])) for r in rows]

        if check_overlap(payload.start_time, payload.end_time, existing):
            raise HTTPException(409, "Booking overlaps with an existing booking for this asset")

        cur = conn.execute(
            "INSERT INTO resource_bookings (asset_id, booked_by, start_time, end_time, purpose) VALUES (?, ?, ?, ?, ?)",
            (payload.asset_id, payload.booked_by, payload.start_time.isoformat(),
             payload.end_time.isoformat(), payload.purpose)
        )
        booking_id = cur.lastrowid

        _log_activity(conn, payload.booked_by, "Booking Created", booking_id,
                      f"Booking created for asset {payload.asset_id}")
        _notify(conn, payload.booked_by, "Booking Confirmed",
                f"Your booking for asset {payload.asset_id} is confirmed.", "booking_created")

        conn.commit()
        return {"id": booking_id, "status": "Upcoming"}
    finally:
        conn.close()


@router.get("/{booking_id}")
def get_booking(booking_id: int):
    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM resource_bookings WHERE id = ?", (booking_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "Booking not found")
        actual_status = compute_status(
            datetime.fromisoformat(row["start_time"]),
            datetime.fromisoformat(row["end_time"]),
            row["status"]
        )
        result = dict(row)
        result["status"] = actual_status
        return result
    finally:
        conn.close()


@router.get("")
def booking_history(asset_id: int | None = None, user_id: int | None = None):
    conn = get_db()
    try:
        query = "SELECT * FROM resource_bookings WHERE 1=1"
        params = []
        if asset_id is not None:
            query += " AND asset_id = ?"
            params.append(asset_id)
        if user_id is not None:
            query += " AND booked_by = ?"
            params.append(user_id)
        query += " ORDER BY start_time DESC"

        rows = conn.execute(query, params).fetchall()
        results = []
        for row in rows:
            actual_status = compute_status(
                datetime.fromisoformat(row["start_time"]),
                datetime.fromisoformat(row["end_time"]),
                row["status"]
            )
            d = dict(row)
            d["status"] = actual_status
            results.append(d)
        return results
    finally:
        conn.close()


@router.post("/{booking_id}/cancel")
def cancel_booking(booking_id: int, requesting_user_id: int):  # stub param — replace with real auth
    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM resource_bookings WHERE id = ?", (booking_id,)).fetchone()
        if row is None:
            raise HTTPException(404, "Booking not found")

        if row["booked_by"] != requesting_user_id:
            raise HTTPException(403, "Only the user who made this booking can cancel it")

        actual_status = compute_status(
            datetime.fromisoformat(row["start_time"]),
            datetime.fromisoformat(row["end_time"]),
            row["status"]
        )

        try:
            new_status, ended_early = resolve_cancel_status(actual_status)
        except ValueError as e:
            raise HTTPException(400, str(e))

        if new_status == "Completed":
            conn.execute(
                "UPDATE resource_bookings SET status = 'Completed', end_time = ?, ended_early = 1 WHERE id = ?",
                (datetime.utcnow().isoformat(), booking_id)
            )
            desc = f"Booking {booking_id} ended early"
        else:
            conn.execute("UPDATE resource_bookings SET status = 'Cancelled' WHERE id = ?", (booking_id,))
            desc = f"Booking {booking_id} cancelled"

        _log_activity(conn, requesting_user_id, "Booking Cancelled" if new_status == "Cancelled" else "Booking Ended Early",
                      booking_id, desc)

        conn.commit()
        return {"message": desc, "previous_status": actual_status, "ended_early": ended_early}
    finally:
        conn.close()