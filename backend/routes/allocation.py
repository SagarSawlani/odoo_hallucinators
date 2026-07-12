from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from db import get_db

router = APIRouter(
    prefix="/allocations",
    tags=["Asset Allocation"]
)

# ---------------------------------
# Pydantic Models
# ---------------------------------

class AllocationCreate(BaseModel):
    asset_id: int
    employee_id: int
    allocated_by: int
    expected_return_date: Optional[str] = None


# ---------------------------------
# Allocate Asset
# ---------------------------------

@router.post("/")
def allocate_asset(allocation: AllocationCreate):

    conn = get_db()
    cursor = conn.cursor()

    # Check asset exists
    cursor.execute(
        """
        SELECT
            a.status,
            u.name AS holder_name
        FROM assets a
        LEFT JOIN users u
            ON a.current_holder_id = u.id
        WHERE a.id=?
        """,
        (allocation.asset_id,)
    )

    asset = cursor.fetchone()

    if not asset:
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    # Prevent double allocation
    if asset["status"] != "Available":

        holder = asset["holder_name"] if asset["holder_name"] else "another employee"

        conn.close()

        raise HTTPException(
            status_code=400,
            detail=f"Asset is already allocated to {holder}. Please create a transfer request."
        )

    # Check employee exists
    cursor.execute(
        "SELECT id, department_id FROM users WHERE id=?",
        (allocation.employee_id,)
    )

    employee = cursor.fetchone()

    if not employee:
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Employee not found"
        )

    # Check allocator exists
    cursor.execute(
        "SELECT id FROM users WHERE id=?",
        (allocation.allocated_by,)
    )

    if not cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Allocated By user not found"
        )

    # Insert allocation
    cursor.execute(
        """
        INSERT INTO asset_allocations
        (
            asset_id,
            employee_id,
            allocated_by,
            expected_return_date
        )
        VALUES (?, ?, ?, ?)
        """,
        (
            allocation.asset_id,
            allocation.employee_id,
            allocation.allocated_by,
            allocation.expected_return_date
        )
    )

    # Update asset table
    cursor.execute(
        """
        UPDATE assets
        SET
            status='Allocated',
            current_holder_id=?,
            current_department_id=?
        WHERE id=?
        """,
        (
            allocation.employee_id,
            employee["department_id"],
            allocation.asset_id
        )
    )

    conn.commit()

    allocation_id = cursor.lastrowid

    conn.close()

    return {
        "message": "Asset allocated successfully",
        "allocation_id": allocation_id
    }


# ---------------------------------
# Get All Allocations
# ---------------------------------

@router.get("/")
def get_allocations():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT

            aa.id,

            a.asset_tag,
            a.name AS asset_name,

            u.name AS employee_name,

            m.name AS allocated_by,

            aa.allocated_date,
            aa.expected_return_date,
            aa.actual_return_date,
            aa.status

        FROM asset_allocations aa

        JOIN assets a
            ON aa.asset_id = a.id

        JOIN users u
            ON aa.employee_id = u.id

        JOIN users m
            ON aa.allocated_by = m.id

        ORDER BY aa.id DESC
        """
    )

    rows = cursor.fetchall()

    conn.close()

    return [dict(row) for row in rows]

# ---------------------------------
# Pydantic Model
# ---------------------------------

class ReturnAsset(BaseModel):
    allocation_id: int
    condition_on_return: str
    return_notes: Optional[str] = None


# ---------------------------------
# Return Asset
# ---------------------------------

@router.post("/return")
def return_asset(data: ReturnAsset):

    conn = get_db()
    cursor = conn.cursor()

    # Check allocation exists
    cursor.execute(
        """
        SELECT asset_id,status
        FROM asset_allocations
        WHERE id=?
        """,
        (data.allocation_id,)
    )

    allocation = cursor.fetchone()

    if not allocation:
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Allocation not found"
        )

    if allocation["status"] == "Returned":
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Asset has already been returned"
        )

    # Update allocation
    cursor.execute(
        """
        UPDATE asset_allocations
        SET
            actual_return_date = DATE('now'),
            condition_on_return = ?,
            return_notes = ?,
            status = 'Returned'
        WHERE id = ?
        """,
        (
            data.condition_on_return,
            data.return_notes,
            data.allocation_id
        )
    )

    # Update asset status
    cursor.execute(
        """
        UPDATE assets
        SET
            status='Available',
            current_holder_id=NULL,
            current_department_id=NULL
        WHERE id=?
        """,
        (allocation["asset_id"],)
    )

    conn.commit()

    conn.close()

    return {
        "message": "Asset returned successfully"
    }

# ---------------------------------
# Get Overdue Allocations
# ---------------------------------

@router.get("/overdue")
def get_overdue_allocations():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT

            aa.id,

            a.asset_tag,
            a.name AS asset_name,

            u.name AS employee_name,

            aa.allocated_date,
            aa.expected_return_date

        FROM asset_allocations aa

        JOIN assets a
            ON aa.asset_id = a.id

        JOIN users u
            ON aa.employee_id = u.id

        WHERE
            aa.status='Allocated'
            AND aa.expected_return_date IS NOT NULL
            AND aa.expected_return_date < DATE('now')

        ORDER BY aa.expected_return_date
        """
    )

    rows = cursor.fetchall()

    conn.close()

    return [dict(row) for row in rows]