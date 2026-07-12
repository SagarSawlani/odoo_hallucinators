from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from db import get_db

router = APIRouter(
    prefix="/departments",
    tags=["Departments"]
)


# -----------------------------
# Pydantic Models
# -----------------------------

class DepartmentCreate(BaseModel):
    name: str
    code: Optional[str] = None
    parent_department_id: Optional[int] = None


class DepartmentUpdate(BaseModel):
    name: str
    code: Optional[str] = None
    parent_department_id: Optional[int] = None
    status: str = "Active"


class DepartmentHeadUpdate(BaseModel):
    head_id: int


# -----------------------------
# Create Department
# -----------------------------

@router.post("/")
def create_department(department: DepartmentCreate):

    conn = get_db()
    cursor = conn.cursor()

    # Check duplicate code
    if department.code:
        cursor.execute(
            "SELECT id FROM departments WHERE code = ?",
            (department.code,)
        )

        if cursor.fetchone():
            conn.close()
            raise HTTPException(
                status_code=400,
                detail="Department code already exists"
            )

    cursor.execute(
        """
        INSERT INTO departments
        (name, code, parent_department_id)
        VALUES (?, ?, ?)
        """,
        (
            department.name,
            department.code,
            department.parent_department_id
        )
    )

    conn.commit()

    department_id = cursor.lastrowid

    conn.close()

    return {
        "message": "Department created successfully",
        "department_id": department_id
    }


# -----------------------------
# Get All Departments
# -----------------------------

@router.get("/")
def get_departments():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            d.id,
            d.name,
            d.code,
            d.parent_department_id,
            d.head_id,
            u.name AS head_name,
            d.status,
            d.created_at
        FROM departments d
        LEFT JOIN users u
        ON d.head_id = u.id
        ORDER BY d.id
    """)

    rows = cursor.fetchall()

    conn.close()

    return [dict(row) for row in rows]


# -----------------------------
# Get Department By ID
# -----------------------------

@router.get("/{department_id}")
def get_department(department_id: int):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT
            d.*,
            u.name AS head_name
        FROM departments d
        LEFT JOIN users u
        ON d.head_id = u.id
        WHERE d.id = ?
    """, (department_id,))

    department = cursor.fetchone()

    conn.close()

    if not department:
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    return dict(department)


# -----------------------------
# Update Department
# -----------------------------

@router.put("/{department_id}")
def update_department(
    department_id: int,
    department: DepartmentUpdate
):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id FROM departments WHERE id=?",
        (department_id,)
    )

    if not cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    # Prevent duplicate department code
    if department.code:
        cursor.execute(
            """
            SELECT id
            FROM departments
            WHERE code=? AND id!=?
            """,
            (
                department.code,
                department_id
            )
        )

        if cursor.fetchone():
            conn.close()
            raise HTTPException(
                status_code=400,
                detail="Department code already exists"
            )

    cursor.execute(
        """
        UPDATE departments
        SET
            name=?,
            code=?,
            parent_department_id=?,
            status=?
        WHERE id=?
        """,
        (
            department.name,
            department.code,
            department.parent_department_id,
            department.status,
            department_id
        )
    )

    conn.commit()
    conn.close()

    return {
        "message": "Department updated successfully"
    }


# -----------------------------
# Assign Department Head
# -----------------------------

@router.patch("/{department_id}/head")
def assign_department_head(
    department_id: int,
    data: DepartmentHeadUpdate
):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id FROM departments WHERE id=?",
        (department_id,)
    )

    if not cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    cursor.execute(
        "SELECT id FROM users WHERE id=?",
        (data.head_id,)
    )

    if not cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    cursor.execute(
        """
        UPDATE departments
        SET head_id=?
        WHERE id=?
        """,
        (
            data.head_id,
            department_id
        )
    )

    conn.commit()
    conn.close()

    return {
        "message": "Department head assigned successfully"
    }


# -----------------------------
# Soft Delete Department
# -----------------------------

@router.delete("/{department_id}")
def delete_department(department_id: int):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id FROM departments WHERE id=?",
        (department_id,)
    )

    if not cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    cursor.execute(
        """
        UPDATE departments
        SET status='Inactive'
        WHERE id=?
        """,
        (department_id,)
    )

    conn.commit()
    conn.close()

    return {
        "message": "Department deactivated successfully"
    }