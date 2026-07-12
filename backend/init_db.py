# init_db_full.py
from db import get_db

STATEMENTS = [

# ---------- 1. Departments ----------
"""
CREATE TABLE IF NOT EXISTS departments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    code TEXT,
    parent_department_id INTEGER,
    head_id INTEGER,
    status TEXT CHECK(status IN ('Active','Inactive')) DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_department_id) REFERENCES departments(id),
    FOREIGN KEY (head_id) REFERENCES users(id)
)
""",

# ---------- 2. Users ----------
"""
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    firebase_uid TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    department_id INTEGER,
    role TEXT CHECK(role IN ('Admin','AssetManager','DepartmentHead','Employee')),
    status TEXT CHECK(status IN ('Active','Inactive')) DEFAULT 'Active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
)
""",

# ---------- 3. Asset Categories ----------
"""
CREATE TABLE IF NOT EXISTS asset_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    warranty_period_months INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
""",

# ---------- 4. Assets ----------
"""
CREATE TABLE IF NOT EXISTS assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_tag TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category_id INTEGER,
    serial_number TEXT,
    acquisition_date DATE,
    acquisition_cost REAL,
    location TEXT,
    condition TEXT CHECK(condition IN ('Excellent','Good','Fair','Poor')),
    status TEXT CHECK(status IN ('Available','Allocated','Reserved','UnderMaintenance','Lost','Retired','Disposed')) DEFAULT 'Available',
    current_holder_id INTEGER,
    current_department_id INTEGER,
    is_bookable BOOLEAN DEFAULT 0,
    criticality TEXT CHECK(criticality IN ('Low','Medium','High','Critical')),  -- UNCONFIRMED, verify with Person 2
    image_url TEXT,
    document_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES asset_categories(id),
    FOREIGN KEY (current_holder_id) REFERENCES users(id),
    FOREIGN KEY (current_department_id) REFERENCES departments(id)
)
""",

# ---------- 5. Asset Allocations (Person 2) ----------
"""
CREATE TABLE IF NOT EXISTS asset_allocations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    employee_id INTEGER NOT NULL,
    allocated_by INTEGER NOT NULL,
    allocated_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    expected_return_date DATE,
    actual_return_date DATE,
    condition_on_return TEXT,
    return_notes TEXT,
    status TEXT CHECK(status IN ('Allocated','Returned','Overdue')) DEFAULT 'Allocated',
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (employee_id) REFERENCES users(id),
    FOREIGN KEY (allocated_by) REFERENCES users(id)
)
""",

# ---------- 6. Transfer Requests (Person 2) ----------
"""
CREATE TABLE IF NOT EXISTS transfer_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    from_employee INTEGER,
    to_employee INTEGER NOT NULL,
    requested_by INTEGER NOT NULL,
    approved_by INTEGER,
    reason TEXT,
    status TEXT CHECK(status IN ('Pending','Approved','Rejected')) DEFAULT 'Pending',
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (from_employee) REFERENCES users(id),
    FOREIGN KEY (to_employee) REFERENCES users(id),
    FOREIGN KEY (requested_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
)
""",

# ---------- 7. Resource Bookings (Person 3) ----------
"""
CREATE TABLE IF NOT EXISTS resource_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    booked_by INTEGER NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    purpose TEXT,
    status TEXT CHECK(status IN ('Upcoming','Ongoing','Completed','Cancelled')) DEFAULT 'Upcoming',
    ended_early BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (booked_by) REFERENCES users(id)
)
""",

# ---------- 8. Maintenance Requests (Person 3) ----------
"""
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    asset_id INTEGER NOT NULL,
    reported_by INTEGER NOT NULL,
    issue_description TEXT NOT NULL,
    image_url TEXT,
    priority TEXT CHECK(priority IN ('Low','Medium','High','Critical')),
    priority_reasons TEXT,
    status TEXT CHECK(status IN ('Pending','Approved','Rejected','Resolved')) DEFAULT 'Pending',
    resolution_notes TEXT,
    approved_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (reported_by) REFERENCES users(id),
    FOREIGN KEY (approved_by) REFERENCES users(id)
)
""",

# ---------- 9. Audit Cycles (Person 3) ----------
"""
CREATE TABLE IF NOT EXISTS audit_cycles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    department_id INTEGER,
    location TEXT,
    start_date DATE,
    end_date DATE,
    created_by INTEGER NOT NULL,
    status TEXT CHECK(status IN ('Open','Closed')) DEFAULT 'Open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
)
""",

# ---------- 10. Audit Results (Person 3) ----------
"""
CREATE TABLE IF NOT EXISTS audit_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    audit_cycle_id INTEGER NOT NULL,
    asset_id INTEGER NOT NULL,
    auditor_id INTEGER NOT NULL,
    result TEXT CHECK(result IN ('Verified','Missing','Damaged')) NOT NULL,
    remarks TEXT,
    verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (audit_cycle_id) REFERENCES audit_cycles(id),
    FOREIGN KEY (asset_id) REFERENCES assets(id),
    FOREIGN KEY (auditor_id) REFERENCES users(id)
)
""",

# ---------- 11. Notifications (Person 3) ----------
"""
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    message TEXT,
    type TEXT,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)
""",

# ---------- 12. Activity Logs (Person 3) ----------
"""
CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    description TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)
"""

]

def init():
    conn = get_db()
    cur = conn.cursor()
    for stmt in STATEMENTS:
        cur.execute(stmt)
    conn.commit()
    conn.close()
    print(f"Initialized {len(STATEMENTS)} tables.")

if __name__ == "__main__":
    init()