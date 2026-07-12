from fastapi import APIRouter
import sqlite3
from db import get_db

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/summary")
def get_dashboard_summary():
    conn = get_db()
    cursor = conn.cursor()
    
    # All your counts in one query batch
    result = {}
    
    # Total assets
    cursor.execute("SELECT COUNT(*) FROM assets")
    result["total_assets"] = cursor.fetchone()[0]
    
    # By status
    for status in ["Available", "Allocated", "UnderMaintenance", "Lost"]:
        cursor.execute("SELECT COUNT(*) FROM assets WHERE status = ?", (status,))
        result[status.lower().replace(" ", "_")] = cursor.fetchone()[0]
    
    # Active bookings (Ongoing)
    cursor.execute("SELECT COUNT(*) FROM resource_bookings WHERE status = 'Ongoing'")
    result["active_bookings"] = cursor.fetchone()[0]
    
    # Pending maintenance
    cursor.execute("SELECT COUNT(*) FROM maintenance_requests WHERE status = 'Pending'")
    result["pending_maintenance"] = cursor.fetchone()[0]
    
    # Open audit cycles
    cursor.execute("SELECT COUNT(*) FROM audit_cycles WHERE status = 'Open'")
    result["open_audit_cycles"] = cursor.fetchone()[0]
    
    # Recent notifications (limit 5)
    cursor.execute("""
        SELECT id, message, created_at, is_read 
        FROM notifications 
        ORDER BY created_at DESC 
        LIMIT 5
    """)
    result["recent_notifications"] = [dict(row) for row in cursor.fetchall()]
    
    return result