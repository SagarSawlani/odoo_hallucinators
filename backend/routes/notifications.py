from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from db import get_db

router = APIRouter(prefix="/notifications", tags=["notifications"])

# Pydantic Models
class NotificationRead(BaseModel):
    notification_id: int

class MarkAllRead(BaseModel):
    user_id: int

@router.get("/")
def get_notifications(
    user_id: Optional[int] = None, 
    unread_only: bool = False,
    limit: int = 50
):
    """
    Get notifications for a user.
    If user_id is not provided, returns all notifications.
    """
    conn = get_db()
    try:
        query = """
            SELECT id, user_id, title, message, type, is_read, created_at 
            FROM notifications 
            WHERE 1=1
        """
        params = []
        
        if user_id:
            query += " AND user_id = ?"
            params.append(user_id)
        
        if unread_only:
            query += " AND is_read = 0"
        
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)
        
        rows = conn.execute(query, params).fetchall()
        result = []
        for row in rows:
            d = dict(row)
            d["is_read"] = bool(d["is_read"])
            result.append(d)
        return result
    finally:
        conn.close()

@router.get("/{notification_id}")
def get_notification(notification_id: int):
    """Get a single notification by ID"""
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT id, user_id, title, message, type, is_read, created_at FROM notifications WHERE id = ?",
            (notification_id,)
        ).fetchone()
        
        if not row:
            raise HTTPException(404, "Notification not found")
        
        d = dict(row)
        d["is_read"] = bool(d["is_read"])
        return d
    finally:
        conn.close()

@router.put("/{notification_id}/read")
def mark_as_read(notification_id: int):
    """Mark a notification as read"""
    conn = get_db()
    try:
        # Check if exists
        row = conn.execute("SELECT id, is_read FROM notifications WHERE id = ?", (notification_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Notification not found")
        
        if row["is_read"]:
            return {"message": "Notification already read", "id": notification_id}
        
        conn.execute("UPDATE notifications SET is_read = 1 WHERE id = ?", (notification_id,))
        conn.commit()
        return {"message": "Notification marked as read", "id": notification_id}
    finally:
        conn.close()

@router.put("/read-all")
def mark_all_as_read(data: MarkAllRead):
    """Mark all notifications for a user as read"""
    conn = get_db()
    try:
        # Check if user exists
        user = conn.execute("SELECT id FROM users WHERE id = ?", (data.user_id,)).fetchone()
        if not user:
            raise HTTPException(404, f"User {data.user_id} not found")
        
        # Count how many will be marked
        count = conn.execute(
            "SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0",
            (data.user_id,)
        ).fetchone()[0]
        
        conn.execute(
            "UPDATE notifications SET is_read = 1 WHERE user_id = ?",
            (data.user_id,)
        )
        conn.commit()
        
        return {
            "message": f"Marked {count} notifications as read for user {data.user_id}",
            "user_id": data.user_id,
            "marked_count": count
        }
    finally:
        conn.close()

@router.delete("/{notification_id}")
def delete_notification(notification_id: int):
    """Delete a notification"""
    conn = get_db()
    try:
        row = conn.execute("SELECT id FROM notifications WHERE id = ?", (notification_id,)).fetchone()
        if not row:
            raise HTTPException(404, "Notification not found")
        
        conn.execute("DELETE FROM notifications WHERE id = ?", (notification_id,))
        conn.commit()
        return {"message": "Notification deleted", "id": notification_id}
    finally:
        conn.close()

@router.get("/unread/count")
def get_unread_count(user_id: int):
    """Get count of unread notifications for a user"""
    conn = get_db()
    try:
        # Check if user exists
        user = conn.execute("SELECT id FROM users WHERE id = ?", (user_id,)).fetchone()
        if not user:
            raise HTTPException(404, f"User {user_id} not found")
        
        count = conn.execute(
            "SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0",
            (user_id,)
        ).fetchone()[0]
        
        return {"user_id": user_id, "unread_count": count}
    finally:
        conn.close()
