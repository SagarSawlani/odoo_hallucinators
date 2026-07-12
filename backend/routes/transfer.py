from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from db import get_db

router = APIRouter(
    prefix="/transfers",
    tags=["Transfer Requests"]
)


# ---------------------------------
# Pydantic Models
# ---------------------------------

class TransferRequest(BaseModel):
    asset_id: int
    to_employee: int
    requested_by: int
    reason: Optional[str] = None

class TransferApproval(BaseModel):
    approved_by: int
# ---------------------------------
# Create Transfer Request
# ---------------------------------

@router.post("/")
def create_transfer_request(request: TransferRequest):

    conn = get_db()
    cursor = conn.cursor()

    # Check asset exists
    cursor.execute(
        """
        SELECT
            current_holder_id,
            status
        FROM assets
        WHERE id=?
        """,
        (request.asset_id,)
    )

    asset = cursor.fetchone()

    if not asset:
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    if asset["status"] != "Allocated":
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Only allocated assets can be transferred"
        )

    # Check destination employee
    cursor.execute(
        "SELECT id FROM users WHERE id=?",
        (request.to_employee,)
    )

    if not cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Destination employee not found"
        )

    # Check requester
    cursor.execute(
        "SELECT id FROM users WHERE id=?",
        (request.requested_by,)
    )

    if not cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Requester not found"
        )

    cursor.execute(
        """
        INSERT INTO transfer_requests
        (
            asset_id,
            from_employee,
            to_employee,
            requested_by,
            reason
        )

        VALUES (?, ?, ?, ?, ?)
        """,
        (
            request.asset_id,
            asset["current_holder_id"],
            request.to_employee,
            request.requested_by,
            request.reason
        )
    )

    conn.commit()

    transfer_id = cursor.lastrowid

    conn.close()

    return {
        "message": "Transfer request created successfully",
        "transfer_request_id": transfer_id
    }


# ---------------------------------
# Get All Transfer Requests
# ---------------------------------

@router.get("/")
def get_transfer_requests():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT

            tr.id,

            a.asset_tag,
            a.name AS asset_name,

            fu.name AS from_employee,

            tu.name AS to_employee,

            ru.name AS requested_by,

            tr.reason,
            tr.status,
            tr.requested_at,
            tr.approved_at

        FROM transfer_requests tr

        JOIN assets a
            ON tr.asset_id = a.id

        LEFT JOIN users fu
            ON tr.from_employee = fu.id

        JOIN users tu
            ON tr.to_employee = tu.id

        JOIN users ru
            ON tr.requested_by = ru.id

        ORDER BY tr.requested_at DESC
        """
    )

    rows = cursor.fetchall()

    conn.close()

    return [dict(row) for row in rows]

# ---------------------------------
# Approve Transfer Request
# ---------------------------------

@router.post("/{transfer_id}/approve")
def approve_transfer(
    transfer_id: int,
    data: TransferApproval
):

    conn = get_db()
    cursor = conn.cursor()

    # Check transfer request exists
    cursor.execute(
        """
        SELECT *
        FROM transfer_requests
        WHERE id=?
        """,
        (transfer_id,)
    )

    transfer = cursor.fetchone()

    if not transfer:
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Transfer request not found"
        )

    if transfer["status"] != "Pending":
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Transfer request already processed"
        )

    # Check approver exists and has permission
    cursor.execute(
        """
        SELECT role
        FROM users
        WHERE id=?
        """,
        (data.approved_by,)
    )

    approver = cursor.fetchone()

    if not approver:
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Approver not found"
        )

    if approver["role"] not in ["Admin", "AssetManager", "DepartmentHead"]:
        conn.close()
        raise HTTPException(
            status_code=403,
            detail="Only Admin, Asset Manager or Department Head can reject transfers."
        )

    # Get destination employee department
    cursor.execute(
        """
        SELECT department_id
        FROM users
        WHERE id=?
        """,
        (transfer["to_employee"],)
    )

    employee = cursor.fetchone()

    # Close previous allocation
    cursor.execute(
        """
        UPDATE asset_allocations
        SET
            status='Returned',
            actual_return_date=DATE('now')
        WHERE
            asset_id=?
            AND status='Allocated'
        """,
        (transfer["asset_id"],)
    )

    # Create new allocation
    cursor.execute(
        """
        INSERT INTO asset_allocations
        (
            asset_id,
            employee_id,
            allocated_by
        )
        VALUES (?, ?, ?)
        """,
        (
            transfer["asset_id"],
            transfer["to_employee"],
            data.approved_by
        )
    )

    # Update asset table
    cursor.execute(
        """
        UPDATE assets
        SET
            current_holder_id=?,
            current_department_id=?,
            status='Allocated'
        WHERE id=?
        """,
        (
            transfer["to_employee"],
            employee["department_id"],
            transfer["asset_id"]
        )
    )

    # Approve transfer request
    cursor.execute(
        """
        UPDATE transfer_requests
        SET
            status='Approved',
            approved_by=?,
            approved_at=CURRENT_TIMESTAMP
        WHERE id=?
        """,
        (
            data.approved_by,
            transfer_id
        )
    )

    conn.commit()

    conn.close()

    return {
        "message": "Transfer approved successfully"
    }

# ---------------------------------
# Reject Transfer Request
# ---------------------------------

@router.post("/{transfer_id}/reject")
def reject_transfer(
    transfer_id: int,
    data: TransferApproval
):

    conn = get_db()
    cursor = conn.cursor()

    # Check transfer request exists
    cursor.execute(
        """
        SELECT status
        FROM transfer_requests
        WHERE id=?
        """,
        (transfer_id,)
    )

    transfer = cursor.fetchone()

    if not transfer:
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Transfer request not found"
        )

    if transfer["status"] != "Pending":
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Transfer request already processed"
        )

   # Check approver exists and has permission
    cursor.execute(
        """
        SELECT role
        FROM users
        WHERE id=?
        """,
        (data.approved_by,)
    )

    approver = cursor.fetchone()

    if not approver:
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Approver not found"
        )

    if approver["role"] not in ["Admin", "AssetManager", "DepartmentHead"]:
        conn.close()
        raise HTTPException(
            status_code=403,
            detail="Only Admin, Asset Manager or Department Head can approve transfers."
        )

    # Reject transfer request
    cursor.execute(
        """
        UPDATE transfer_requests
        SET
            status='Rejected',
            approved_by=?,
            approved_at=CURRENT_TIMESTAMP
        WHERE id=?
        """,
        (
            data.approved_by,
            transfer_id
        )
    )

    conn.commit()
    conn.close()

    return {
        "message": "Transfer request rejected successfully"
    }


