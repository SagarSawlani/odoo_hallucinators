# routes/reports.py
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from db import get_db
import json

router = APIRouter(prefix="/reports", tags=["reports"])

# ============================================
# Helper Functions
# ============================================

def execute_query(query: str, params: tuple = ()) -> List[Dict[str, Any]]:
    """Execute a query and return results as list of dicts"""
    conn = get_db()
    try:
        rows = conn.execute(query, params).fetchall()
        return [dict(row) for row in rows]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    finally:
        conn.close()

def validate_date(date_str: Optional[str]) -> bool:
    """Validate date format YYYY-MM-DD"""
    if date_str is None:
        return True
    try:
        datetime.strptime(date_str, "%Y-%m-%d")
        return True
    except ValueError:
        return False

# ============================================
# Core Report Endpoints
# ============================================

@router.get("/maintenance")
def maintenance_report(
    asset_id: Optional[int] = Query(None, description="Filter by asset ID"),
    status: Optional[str] = Query(None, description="Filter by status (Pending/Approved/Rejected/Resolved)"),
    priority: Optional[str] = Query(None, description="Filter by priority (Low/Medium/High/Critical)"),
    from_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(100, ge=1, le=500, description="Max results")
):
    """
    📊 Maintenance History Report
    
    Get comprehensive maintenance request history with filtering options.
    Useful for analyzing maintenance patterns and asset reliability.
    """
    # Validate dates
    if from_date and not validate_date(from_date):
        raise HTTPException(400, "Invalid from_date format. Use YYYY-MM-DD")
    if to_date and not validate_date(to_date):
        raise HTTPException(400, "Invalid to_date format. Use YYYY-MM-DD")
    
    query = """
        SELECT 
            mr.id,
            mr.asset_id,
            a.asset_tag,
            a.name as asset_name,
            mr.issue_description,
            mr.priority,
            mr.status,
            mr.priority_reasons,
            u1.name as reported_by_name,
            u2.name as approved_by_name,
            mr.resolution_notes,
            mr.created_at,
            mr.updated_at
        FROM maintenance_requests mr
        LEFT JOIN assets a ON mr.asset_id = a.id
        LEFT JOIN users u1 ON mr.reported_by = u1.id
        LEFT JOIN users u2 ON mr.approved_by = u2.id
        WHERE 1=1
    """
    params = []
    
    if asset_id:
        query += " AND mr.asset_id = ?"
        params.append(asset_id)
    if status:
        query += " AND mr.status = ?"
        params.append(status)
    if priority:
        query += " AND mr.priority = ?"
        params.append(priority)
    if from_date:
        query += " AND DATE(mr.created_at) >= ?"
        params.append(from_date)
    if to_date:
        query += " AND DATE(mr.created_at) <= ?"
        params.append(to_date)
        
    query += " ORDER BY mr.created_at DESC LIMIT ?"
    params.append(limit)
    
    results = execute_query(query, tuple(params))
    
    # Parse priority reasons JSON
    for row in results:
        if row.get('priority_reasons'):
            try:
                row['priority_reasons'] = json.loads(row['priority_reasons'])
            except:
                row['priority_reasons'] = []
    
    return {
        "data": results,
        "count": len(results),
        "filters": {
            "asset_id": asset_id,
            "status": status,
            "priority": priority,
            "from_date": from_date,
            "to_date": to_date
        }
    }

@router.get("/bookings")
def booking_report(
    asset_id: Optional[int] = Query(None, description="Filter by asset ID"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    status: Optional[str] = Query(None, description="Filter by status (Upcoming/Ongoing/Completed/Cancelled)"),
    from_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(100, ge=1, le=500, description="Max results")
):
    """
    📅 Booking History Report
    
    Get detailed booking history with filters for assets, users, and date ranges.
    Helps track resource utilization and booking patterns.
    """
    if from_date and not validate_date(from_date):
        raise HTTPException(400, "Invalid from_date format. Use YYYY-MM-DD")
    if to_date and not validate_date(to_date):
        raise HTTPException(400, "Invalid to_date format. Use YYYY-MM-DD")
    
    query = """
        SELECT 
            rb.id,
            rb.asset_id,
            a.asset_tag,
            a.name as asset_name,
            u.name as booked_by_name,
            rb.start_time,
            rb.end_time,
            rb.purpose,
            rb.status,
            rb.ended_early,
            rb.created_at,
            julianday(rb.end_time) - julianday(rb.start_time) as duration_hours
        FROM resource_bookings rb
        LEFT JOIN assets a ON rb.asset_id = a.id
        LEFT JOIN users u ON rb.booked_by = u.id
        WHERE 1=1
    """
    params = []
    
    if asset_id:
        query += " AND rb.asset_id = ?"
        params.append(asset_id)
    if user_id:
        query += " AND rb.booked_by = ?"
        params.append(user_id)
    if status:
        query += " AND rb.status = ?"
        params.append(status)
    if from_date:
        query += " AND DATE(rb.start_time) >= ?"
        params.append(from_date)
    if to_date:
        query += " AND DATE(rb.end_time) <= ?"
        params.append(to_date)
        
    query += " ORDER BY rb.created_at DESC LIMIT ?"
    params.append(limit)
    
    results = execute_query(query, tuple(params))
    
    return {
        "data": results,
        "count": len(results),
        "filters": {
            "asset_id": asset_id,
            "user_id": user_id,
            "status": status,
            "from_date": from_date,
            "to_date": to_date
        }
    }

@router.get("/audit")
def audit_report(
    cycle_id: Optional[int] = Query(None, description="Filter by audit cycle ID"),
    result: Optional[str] = Query(None, description="Filter by result (Verified/Missing/Damaged)"),
    auditor_id: Optional[int] = Query(None, description="Filter by auditor ID"),
    from_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    to_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(100, ge=1, le=500, description="Max results")
):
    """
    🔍 Audit Results Report
    
    Get all audit findings with filtering capabilities.
    Essential for compliance tracking and asset verification history.
    """
    if from_date and not validate_date(from_date):
        raise HTTPException(400, "Invalid from_date format. Use YYYY-MM-DD")
    if to_date and not validate_date(to_date):
        raise HTTPException(400, "Invalid to_date format. Use YYYY-MM-DD")
    
    query = """
        SELECT 
            ar.id,
            ar.audit_cycle_id,
            ac.title as cycle_title,
            ar.asset_id,
            a.asset_tag,
            a.name as asset_name,
            u.name as auditor_name,
            ar.result,
            ar.remarks,
            ar.verified_at
        FROM audit_results ar
        LEFT JOIN audit_cycles ac ON ar.audit_cycle_id = ac.id
        LEFT JOIN assets a ON ar.asset_id = a.id
        LEFT JOIN users u ON ar.auditor_id = u.id
        WHERE 1=1
    """
    params = []
    
    if cycle_id:
        query += " AND ar.audit_cycle_id = ?"
        params.append(cycle_id)
    if result:
        query += " AND ar.result = ?"
        params.append(result)
    if auditor_id:
        query += " AND ar.auditor_id = ?"
        params.append(auditor_id)
    if from_date:
        query += " AND DATE(ar.verified_at) >= ?"
        params.append(from_date)
    if to_date:
        query += " AND DATE(ar.verified_at) <= ?"
        params.append(to_date)
        
    query += " ORDER BY ar.verified_at DESC LIMIT ?"
    params.append(limit)
    
    results = execute_query(query, tuple(params))
    
    return {
        "data": results,
        "count": len(results),
        "filters": {
            "cycle_id": cycle_id,
            "result": result,
            "auditor_id": auditor_id,
            "from_date": from_date,
            "to_date": to_date
        }
    }

# ============================================
# Asset Status Reports
# ============================================

@router.get("/assets/by-status")
def assets_by_status_report(
    status: str = Query(..., description="Asset status (Available/Allocated/UnderMaintenance/Lost)")
):
    """
    📋 Assets by Status
    
    Get all assets with a specific status with detailed information.
    """
    query = """
        SELECT 
            a.id, 
            a.asset_tag, 
            a.name, 
            a.status, 
            a.location,
            a.criticality,
            a.acquisition_cost,
            a.acquisition_date,
            c.name as category,
            u.name as current_holder,
            d.name as department
        FROM assets a
        LEFT JOIN asset_categories c ON a.category_id = c.id
        LEFT JOIN users u ON a.current_holder_id = u.id
        LEFT JOIN departments d ON a.current_department_id = d.id
        WHERE a.status = ?
        ORDER BY a.id
    """
    
    results = execute_query(query, (status,))
    
    return {
        "status": status,
        "count": len(results),
        "assets": results
    }

@router.get("/missing-assets")
def missing_assets_report():
    """🚨 Missing/Lost Assets Report"""
    return assets_by_status_report("Lost")

@router.get("/under-maintenance")
def under_maintenance_report():
    """🔧 Assets Under Maintenance Report"""
    return assets_by_status_report("UnderMaintenance")

@router.get("/available-assets")
def available_assets_report():
    """✅ Available Assets Report"""
    return assets_by_status_report("Available")

@router.get("/allocated-assets")
def allocated_assets_report():
    """📤 Allocated Assets Report"""
    return assets_by_status_report("Allocated")

@router.get("/damaged-assets")
def damaged_assets_report():
    """
    💔 Damaged Assets Report
    
    Get all assets that have been marked as Damaged in any audit.
    Shows the most recent damage record for each asset.
    """
    query = """
        SELECT 
            a.id,
            a.asset_tag,
            a.name,
            a.status,
            a.location,
            ar.result,
            ar.remarks,
            ar.verified_at as last_damaged_date,
            u.name as verified_by
        FROM assets a
        INNER JOIN (
            SELECT asset_id, MAX(verified_at) as latest
            FROM audit_results
            WHERE result = 'Damaged'
            GROUP BY asset_id
        ) latest_damage ON a.id = latest_damage.asset_id
        INNER JOIN audit_results ar 
            ON ar.asset_id = latest_damage.asset_id 
            AND ar.verified_at = latest_damage.latest
        LEFT JOIN users u ON ar.auditor_id = u.id
        ORDER BY ar.verified_at DESC
    """
    
    results = execute_query(query)
    
    return {
        "count": len(results),
        "assets": results
    }

# ============================================
# Analytics & Insights Endpoints
# ============================================

@router.get("/utilization-by-department")
def utilization_by_department():
    """
    📊 Department Utilization Report
    
    Get utilization percentage by department.
    Shows how effectively each department is using its assets.
    """
    query = """
        SELECT 
            d.id,
            d.name,
            COUNT(a.id) as total_assets,
            SUM(CASE WHEN a.status = 'Allocated' THEN 1 ELSE 0 END) as allocated,
            SUM(CASE WHEN a.status = 'UnderMaintenance' THEN 1 ELSE 0 END) as under_maintenance,
            SUM(CASE WHEN a.status = 'Available' THEN 1 ELSE 0 END) as available,
            SUM(CASE WHEN a.status = 'Lost' THEN 1 ELSE 0 END) as lost
        FROM departments d
        LEFT JOIN assets a ON a.current_department_id = d.id
        WHERE d.status = 'Active'
        GROUP BY d.id
        HAVING COUNT(a.id) > 0
        ORDER BY d.name
    """
    
    results = execute_query(query)
    
    for row in results:
        total = row['total_assets']
        allocated = row['allocated'] or 0
        row['utilization_percentage'] = round((allocated / total) * 100) if total > 0 else 0
        
    return {
        "departments": results,
        "total_departments": len(results)
    }

@router.get("/maintenance-frequency")
def maintenance_frequency(
    period: str = Query("month", description="Time period: week, month, year")
):
    """
    📈 Maintenance Frequency Report
    
    Get maintenance request frequency over time.
    Useful for identifying maintenance patterns and seasonal trends.
    """
    if period not in ["week", "month", "year"]:
        raise HTTPException(400, "period must be 'week', 'month', or 'year'")
    
    group_by = {
        "week": "strftime('%Y-%W', created_at)",
        "month": "strftime('%Y-%m', created_at)",
        "year": "strftime('%Y', created_at)"
    }[period]
    
    query = f"""
        SELECT 
            {group_by} as period,
            COUNT(*) as count,
            SUM(CASE WHEN priority = 'Critical' THEN 1 ELSE 0 END) as critical,
            SUM(CASE WHEN priority = 'High' THEN 1 ELSE 0 END) as high,
            SUM(CASE WHEN priority = 'Medium' THEN 1 ELSE 0 END) as medium,
            SUM(CASE WHEN priority = 'Low' THEN 1 ELSE 0 END) as low,
            SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
        FROM maintenance_requests
        WHERE created_at >= date('now', '-1 year')
        GROUP BY {group_by}
        ORDER BY period
    """
    
    results = execute_query(query)
    
    return {
        "period": period,
        "data": results,
        "total_periods": len(results)
    }

@router.get("/most-used-assets")
def most_used_assets(
    limit: int = Query(5, ge=1, le=20, description="Number of assets to return"),
    days: int = Query(30, ge=1, le=365, description="Days to look back")
):
    """
    ⭐ Most Used Assets Report
    
    Get the most frequently booked assets.
    Helps identify high-demand resources and capacity planning.
    """
    query = """
        SELECT 
            a.id,
            a.asset_tag,
            a.name,
            a.status,
            a.location,
            COUNT(rb.id) as booking_count,
            SUM(CASE WHEN rb.status = 'Ongoing' THEN 1 ELSE 0 END) as active_bookings,
            SUM(CASE WHEN rb.ended_early = 1 THEN 1 ELSE 0 END) as early_ends,
            ROUND(AVG(julianday(rb.end_time) - julianday(rb.start_time)), 2) as avg_duration_hours
        FROM assets a
        LEFT JOIN resource_bookings rb ON a.id = rb.asset_id
        WHERE rb.created_at >= date('now', ?)
            AND rb.status != 'Cancelled'
        GROUP BY a.id
        HAVING COUNT(rb.id) > 0
        ORDER BY booking_count DESC
        LIMIT ?
    """
    
    results = execute_query(query, (f'-{days} days', limit))
    
    return {
        "period_days": days,
        "limit": limit,
        "assets": results,
        "total_assets_with_bookings": len(results)
    }

@router.get("/idle-assets")
def idle_assets(
    days: int = Query(30, ge=1, le=365, description="Days idle threshold"),
    limit: int = Query(10, ge=1, le=50, description="Max results")
):
    """
    💤 Idle Assets Report
    
    Get assets that haven't been used in X days.
    Identifies underutilized resources and potential cost savings.
    """
    query = """
        WITH last_usage AS (
            SELECT 
                asset_id,
                MAX(created_at) as last_used
            FROM resource_bookings
            WHERE status != 'Cancelled'
            GROUP BY asset_id
        )
        SELECT 
            a.id,
            a.asset_tag,
            a.name,
            a.status,
            a.location,
            a.acquisition_cost,
            julianday('now') - julianday(COALESCE(lu.last_used, a.acquisition_date, '2020-01-01')) as days_idle,
            lu.last_used as last_used_date,
            COALESCE(lu.last_used, 'Never used') as last_used_display
        FROM assets a
        LEFT JOIN last_usage lu ON a.id = lu.asset_id
        WHERE a.status = 'Available'
            AND (lu.last_used IS NULL OR julianday('now') - julianday(lu.last_used) >= ?)
        ORDER BY days_idle DESC
        LIMIT ?
    """
    
    results = execute_query(query, (days, limit))
    
    for row in results:
        row['days_idle'] = int(row['days_idle']) if row['days_idle'] else days + 100
    
    return {
        "idle_threshold_days": days,
        "limit": limit,
        "assets": results,
        "total_idle_assets": len(results)
    }

@router.get("/assets-due-maintenance")
def assets_due_maintenance(
    days: int = Query(30, ge=1, le=365, description="Days since last maintenance threshold")
):
    """
    ⚠️ Maintenance Due Report
    
    Get assets that are overdue or due for maintenance.
    Helps schedule preventive maintenance and avoid breakdowns.
    """
    query = """
        WITH last_maintenance AS (
            SELECT 
                asset_id,
                MAX(created_at) as last_maintenance_date
            FROM maintenance_requests
            WHERE status = 'Resolved'
            GROUP BY asset_id
        )
        SELECT 
            a.id,
            a.asset_tag,
            a.name,
            a.status,
            a.location,
            a.acquisition_date,
            a.acquisition_cost,
            lm.last_maintenance_date,
            julianday('now') - julianday(
                COALESCE(lm.last_maintenance_date, a.acquisition_date, '2020-01-01')
            ) as days_since_service,
            COALESCE(lm.last_maintenance_date, 'Never maintained') as last_service_display
        FROM assets a
        LEFT JOIN last_maintenance lm ON a.id = lm.asset_id
        WHERE a.status NOT IN ('Lost', 'Retired', 'Disposed')
            AND (
                lm.last_maintenance_date IS NULL 
                OR julianday('now') - julianday(lm.last_maintenance_date) >= ?
            )
        ORDER BY days_since_service DESC
        LIMIT 20
    """
    
    results = execute_query(query, (days,))
    
    for row in results:
        days_since = int(row['days_since_service']) if row['days_since_service'] else days + 100
        row['days_since_service'] = days_since
        row['is_overdue'] = days_since > days
        row['days_overdue'] = max(0, days_since - days) if days_since else 0
    
    return {
        "threshold_days": days,
        "assets": results,
        "total_due": len(results),
        "overdue_count": sum(1 for r in results if r.get('is_overdue', False))
    }

@router.get("/assets-nearing-retirement")
def assets_nearing_retirement(
    years: int = Query(5, ge=1, le=10, description="Minimum age in years"),
    limit: int = Query(10, ge=1, le=50, description="Max results")
):
    """
    🔄 Asset Retirement Report
    
    Get assets nearing retirement based on age.
    Helps with capital planning and replacement budgeting.
    """
    query = """
        SELECT 
            a.id,
            a.asset_tag,
            a.name,
            a.acquisition_date,
            a.acquisition_cost,
            a.status,
            a.location,
            strftime('%Y', 'now') - strftime('%Y', a.acquisition_date) as age_years,
            c.name as category,
            d.name as department
        FROM assets a
        LEFT JOIN asset_categories c ON a.category_id = c.id
        LEFT JOIN departments d ON a.current_department_id = d.id
        WHERE a.acquisition_date IS NOT NULL
            AND a.status NOT IN ('Lost', 'Retired', 'Disposed')
            AND strftime('%Y', 'now') - strftime('%Y', a.acquisition_date) >= ?
        ORDER BY age_years DESC
        LIMIT ?
    """
    
    results = execute_query(query, (years, limit))
    
    for row in results:
        row['age_years'] = int(row['age_years']) if row['age_years'] else 0
    
    return {
        "minimum_age_years": years,
        "limit": limit,
        "assets": results,
        "total_nearing_retirement": len(results)
    }

# ============================================
# Summary & Export Endpoints
# ============================================

@router.get("/summary")
def report_summary():
    """
    📊 Reports Dashboard Summary
    
    Get summary statistics for all report categories.
    One-stop view of all key metrics.
    """
    # Maintenance stats
    maint_stats = execute_query("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
            SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
            SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved,
            SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
            SUM(CASE WHEN priority = 'Critical' THEN 1 ELSE 0 END) as critical,
            SUM(CASE WHEN priority = 'High' THEN 1 ELSE 0 END) as high,
            SUM(CASE WHEN priority = 'Medium' THEN 1 ELSE 0 END) as medium,
            SUM(CASE WHEN priority = 'Low' THEN 1 ELSE 0 END) as low
        FROM maintenance_requests
    """)
    
    # Booking stats
    booking_stats = execute_query("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN status = 'Upcoming' THEN 1 ELSE 0 END) as upcoming,
            SUM(CASE WHEN status = 'Ongoing' THEN 1 ELSE 0 END) as ongoing,
            SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completed,
            SUM(CASE WHEN status = 'Cancelled' THEN 1 ELSE 0 END) as cancelled,
            SUM(CASE WHEN ended_early = 1 THEN 1 ELSE 0 END) as ended_early
        FROM resource_bookings
    """)
    
    # Audit stats
    audit_stats = execute_query("""
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN result = 'Verified' THEN 1 ELSE 0 END) as verified,
            SUM(CASE WHEN result = 'Missing' THEN 1 ELSE 0 END) as missing,
            SUM(CASE WHEN result = 'Damaged' THEN 1 ELSE 0 END) as damaged
        FROM audit_results
    """)
    
    # Asset status
    asset_status = execute_query("""
        SELECT 
            status,
            COUNT(*) as count
        FROM assets
        GROUP BY status
    """)
    
    # Recent activity
    recent_activity = execute_query("""
        SELECT 
            action,
            COUNT(*) as count,
            MAX(timestamp) as last_occurrence
        FROM activity_logs
        WHERE timestamp >= datetime('now', '-7 days')
        GROUP BY action
        ORDER BY count DESC
        LIMIT 5
    """)
    
    asset_status_dict = {row['status']: row['count'] for row in asset_status}
    
    return {
        "maintenance": maint_stats[0] if maint_stats else {},
        "bookings": booking_stats[0] if booking_stats else {},
        "audit_results": audit_stats[0] if audit_stats else {},
        "asset_status": asset_status_dict,
        "recent_activity": recent_activity,
        "generated_at": datetime.now().isoformat()
    }

@router.get("/export-summary")
def export_report_summary():
    """
    📥 Complete Data Export
    
    Get all report data in one call for CSV/Excel export.
    Contains comprehensive data for offline analysis.
    """
    # Get all maintenance requests with asset info
    maintenance = execute_query("""
        SELECT 
            mr.id,
            a.asset_tag,
            a.name as asset_name,
            a.asset_tag,
            mr.issue_description,
            mr.priority,
            mr.status,
            u1.name as reported_by,
            u2.name as approved_by,
            mr.resolution_notes,
            mr.created_at,
            mr.updated_at
        FROM maintenance_requests mr
        LEFT JOIN assets a ON mr.asset_id = a.id
        LEFT JOIN users u1 ON mr.reported_by = u1.id
        LEFT JOIN users u2 ON mr.approved_by = u2.id
        ORDER BY mr.created_at DESC
        LIMIT 500
    """)
    
    # Get all bookings
    bookings = execute_query("""
        SELECT 
            rb.id,
            a.asset_tag,
            a.name as asset_name,
            u.name as booked_by,
            rb.start_time,
            rb.end_time,
            rb.purpose,
            rb.status,
            rb.ended_early,
            rb.created_at
        FROM resource_bookings rb
        LEFT JOIN assets a ON rb.asset_id = a.id
        LEFT JOIN users u ON rb.booked_by = u.id
        ORDER BY rb.created_at DESC
        LIMIT 500
    """)
    
    # Get all audit results
    audit = execute_query("""
        SELECT 
            ar.id,
            ac.title as cycle_title,
            a.asset_tag,
            a.name as asset_name,
            ar.result,
            ar.remarks,
            u.name as auditor,
            ar.verified_at
        FROM audit_results ar
        LEFT JOIN audit_cycles ac ON ar.audit_cycle_id = ac.id
        LEFT JOIN assets a ON ar.asset_id = a.id
        LEFT JOIN users u ON ar.auditor_id = u.id
        ORDER BY ar.verified_at DESC
        LIMIT 500
    """)
    
    # Get all assets
    assets = execute_query("""
        SELECT 
            a.id,
            a.asset_tag,
            a.name,
            a.serial_number,
            a.acquisition_date,
            a.acquisition_cost,
            a.location,
            a.condition,
            a.status,
            a.is_bookable,
            a.criticality,
            c.name as category,
            d.name as department,
            u.name as current_holder
        FROM assets a
        LEFT JOIN asset_categories c ON a.category_id = c.id
        LEFT JOIN departments d ON a.current_department_id = d.id
        LEFT JOIN users u ON a.current_holder_id = u.id
        ORDER BY a.id
    """)
    
    return {
        "maintenance_requests": maintenance,
        "bookings": bookings,
        "audit_results": audit,
        "assets": assets,
        "metadata": {
            "exported_at": datetime.now().isoformat(),
            "version": "1.0",
            "records": {
                "maintenance": len(maintenance),
                "bookings": len(bookings),
                "audit": len(audit),
                "assets": len(assets)
            }
        }
    }