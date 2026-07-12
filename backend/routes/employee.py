from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from db import get_db

router = APIRouter(
    prefix="/employees",
    tags=["Employees"]
)

# -----------------------------
# Models
# -----------------------------

class EmployeeCreate(BaseModel):
    firebase_uid: Optional[str] = None
    name: str
    email: str
    phone: Optional[str] = None
    department_id: Optional[int] = None


class EmployeeUpdate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    department_id: Optional[int] = None
    status: str = "Active"


class RoleUpdate(BaseModel):
    role: str


class DepartmentUpdate(BaseModel):
    department_id: int


# -----------------------------
# Create Employee
# -----------------------------

@router.post("/")
def create_employee(employee: EmployeeCreate):

    conn = get_db()
    cursor = conn.cursor()

    # Duplicate email
    cursor.execute(
        "SELECT id FROM users WHERE email=?",
        (employee.email,)
    )

    if cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    # Validate department
    if employee.department_id:

        cursor.execute(
            "SELECT id FROM departments WHERE id=?",
            (employee.department_id,)
        )

        if not cursor.fetchone():
            conn.close()
            raise HTTPException(
                status_code=404,
                detail="Department not found"
            )

    cursor.execute(
        """
        INSERT INTO users
        (
            firebase_uid,
            name,
            email,
            phone,
            department_id,
            role,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            employee.firebase_uid,
            employee.name,
            employee.email,
            employee.phone,
            employee.department_id,
            "Employee",
            "Active"
        )
    )

    conn.commit()

    employee_id = cursor.lastrowid

    conn.close()

    return {
        "message": "Employee created successfully",
        "employee_id": employee_id
    }


# -----------------------------
# Get All Employees
# -----------------------------

@router.get("/")
def get_employees():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            u.id,
            u.firebase_uid,
            u.name,
            u.email,
            u.phone,
            u.role,
            u.status,
            d.name AS department_name,
            u.created_at
        FROM users u
        LEFT JOIN departments d
        ON u.department_id=d.id
        ORDER BY u.id
    """)

    rows = cursor.fetchall()

    conn.close()

    return [dict(row) for row in rows]


# -----------------------------
# Get Employee
# -----------------------------

@router.get("/{employee_id}")
def get_employee(employee_id: int):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            u.*,
            d.name AS department_name
        FROM users u
        LEFT JOIN departments d
        ON u.department_id=d.id
        WHERE u.id=?
    """, (employee_id,))

    row = cursor.fetchone()

    conn.close()

    if not row:
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    return dict(row)


# -----------------------------
# Update Employee
# -----------------------------

@router.put("/{employee_id}")
def update_employee(employee_id: int, employee: EmployeeUpdate):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id FROM users WHERE id=?",
        (employee_id,)
    )

    if not cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    cursor.execute(
        """
        UPDATE users
        SET
            name=?,
            email=?,
            phone=?,
            department_id=?,
            status=?,
            updated_at=CURRENT_TIMESTAMP
        WHERE id=?
        """,
        (
            employee.name,
            employee.email,
            employee.phone,
            employee.department_id,
            employee.status,
            employee_id
        )
    )

    conn.commit()

    conn.close()

    return {
        "message": "Employee updated successfully"
    }


# -----------------------------
# Assign Role
# -----------------------------

@router.patch("/{employee_id}/role")
def assign_role(employee_id: int, role: RoleUpdate):

    allowed_roles = [
        "Admin",
        "AssetManager",
        "DepartmentHead",
        "Employee"
    ]

    if role.role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="Invalid role"
        )

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE users
        SET role=?,
            updated_at=CURRENT_TIMESTAMP
        WHERE id=?
        """,
        (
            role.role,
            employee_id
        )
    )

    conn.commit()

    conn.close()

    return {
        "message": "Role updated successfully"
    }


# -----------------------------
# Assign Department
# -----------------------------

@router.patch("/{employee_id}/department")
def assign_department(employee_id: int, department: DepartmentUpdate):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id FROM departments WHERE id=?",
        (department.department_id,)
    )

    if not cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    cursor.execute(
        """
        UPDATE users
        SET department_id=?,
            updated_at=CURRENT_TIMESTAMP
        WHERE id=?
        """,
        (
            department.department_id,
            employee_id
        )
    )

    conn.commit()

    conn.close()

    return {
        "message": "Department assigned successfully"
    }


# -----------------------------
# Soft Delete
# -----------------------------

@router.delete("/{employee_id}")
def delete_employee(employee_id: int):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        UPDATE users
        SET
            status='Inactive',
            updated_at=CURRENT_TIMESTAMP
        WHERE id=?
        """,
        (employee_id,)
    )

    conn.commit()

    conn.close()

    return {
        "message": "Employee deactivated successfully"
    }