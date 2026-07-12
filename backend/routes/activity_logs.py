from fastapi import APIRouter, HTTPException
from db import get_db

router = APIRouter(prefix="/activity-logs", tags=["activity_logs"])

@router.get("/")
def get_activity_logs(
    user_id: int = None,
    action: str = None,
    entity_type: str = None,
    limit: int = 100
):
    """Get activity logs with filters"""
    conn = get_db()
    try:
        query = """
            SELECT id, user_id, action, entity_type, entity_id, description, timestamp
            FROM activity_logs
            WHERE 1=1
        """
        params = []
        
        if user_id:
            query += " AND user_id = ?"
            params.append(user_id)
        if action:
            query += " AND action = ?"
            params.append(action)
        if entity_type:
            query += " AND entity_type = ?"
            params.append(entity_type)
        
        query += " ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)
        
        rows = conn.execute(query, params).fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()

@router.get("/stats")
def get_activity_stats():
    """Get activity statistics"""
    conn = get_db()
    try:
        total = conn.execute("SELECT COUNT(*) FROM activity_logs").fetchone()[0]
        
        actions = conn.execute("""
            SELECT action, COUNT(*) as count 
            FROM activity_logs 
            GROUP BY action 
            ORDER BY count DESC
        """).fetchall()
        
        entities = conn.execute("""
            SELECT entity_type, COUNT(*) as count 
            FROM activity_logs 
            GROUP BY entity_type 
            ORDER BY count DESC
        """).fetchall()
        
        return {
            "total_actions": total,
            "actions": [dict(row) for row in actions],
            "entity_types": [dict(row) for row in entities]
        }
    finally:
        conn.close()
