from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from db import get_db

router = APIRouter(
    prefix="/assets",
    tags=["Assets"]
)

# ---------------------------------
# Pydantic Models
# ---------------------------------

class AssetCreate(BaseModel):
    name: str
    category_id: int
    serial_number: Optional[str] = None
    acquisition_date: Optional[str] = None
    acquisition_cost: Optional[float] = None
    location: Optional[str] = None
    condition: str
    current_department_id: Optional[int] = None
    is_bookable: bool = False
    criticality: Optional[str] = None
    image_url: Optional[str] = None
    document_url: Optional[str] = None


class AssetUpdate(BaseModel):
    name: str
    category_id: int
    serial_number: Optional[str] = None
    acquisition_date: Optional[str] = None
    acquisition_cost: Optional[float] = None
    location: Optional[str] = None
    condition: str
    status: str
    current_department_id: Optional[int] = None
    is_bookable: bool = False
    criticality: Optional[str] = None
    image_url: Optional[str] = None
    document_url: Optional[str] = None


# ---------------------------------
# Helper Function
# Generate Asset Tag
# ---------------------------------

def generate_asset_tag(cursor):

    cursor.execute("SELECT MAX(id) FROM assets")

    last_id = cursor.fetchone()[0]

    if last_id is None:
        next_id = 1
    else:
        next_id = last_id + 1

    return f"AF-{next_id:04d}"


# ---------------------------------
# Register Asset
# ---------------------------------

@router.post("/")
def create_asset(asset: AssetCreate):

    conn = get_db()
    cursor = conn.cursor()

    # Check Category Exists
    cursor.execute(
        "SELECT id FROM asset_categories WHERE id=?",
        (asset.category_id,)
    )

    if not cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Asset category not found"
        )

    # Check Duplicate Serial Number
    if asset.serial_number:

        cursor.execute(
            "SELECT id FROM assets WHERE serial_number=?",
            (asset.serial_number,)
        )

        if cursor.fetchone():
            conn.close()
            raise HTTPException(
                status_code=400,
                detail="Serial number already exists"
            )

    asset_tag = generate_asset_tag(cursor)

    cursor.execute(
        """
        INSERT INTO assets
        (
            asset_tag,
            name,
            category_id,
            serial_number,
            acquisition_date,
            acquisition_cost,
            location,
            condition,
            current_department_id,
            is_bookable,
            criticality,
            image_url,
            document_url
        )

        VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            asset_tag,
            asset.name,
            asset.category_id,
            asset.serial_number,
            asset.acquisition_date,
            asset.acquisition_cost,
            asset.location,
            asset.condition,
            asset.current_department_id,
            asset.is_bookable,
            asset.criticality,
            asset.image_url,
            asset.document_url
        )
    )

    conn.commit()

    asset_id = cursor.lastrowid

    conn.close()

    return {
        "message": "Asset registered successfully",
        "asset_id": asset_id,
        "asset_tag": asset_tag
    }


# ---------------------------------
# Get All Assets
# ---------------------------------

@router.get("/")
def get_assets():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT

            a.id,
            a.asset_tag,
            a.name,

            c.name AS category,

            a.serial_number,
            a.location,
            a.condition,
            a.status,
            a.is_bookable,
            a.criticality,

            d.name AS department,

            u.name AS holder

        FROM assets a

        LEFT JOIN asset_categories c
        ON a.category_id = c.id

        LEFT JOIN departments d
        ON a.current_department_id = d.id

        LEFT JOIN users u
        ON a.current_holder_id = u.id

        ORDER BY a.id
        """
    )

    rows = cursor.fetchall()

    conn.close()

    return [dict(row) for row in rows]


# ---------------------------------
# Get Asset By ID
# ---------------------------------

@router.get("/{asset_id}")
def get_asset(asset_id: int):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT

            a.*,

            c.name AS category,

            d.name AS department,

            u.name AS holder

        FROM assets a

        LEFT JOIN asset_categories c
        ON a.category_id = c.id

        LEFT JOIN departments d
        ON a.current_department_id = d.id

        LEFT JOIN users u
        ON a.current_holder_id = u.id

        WHERE a.id=?
        """,
        (asset_id,)
    )

    asset = cursor.fetchone()

    conn.close()

    if not asset:
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    return dict(asset)

# ---------------------------------
# Update Asset
# ---------------------------------

@router.put("/{asset_id}")
def update_asset(asset_id: int, asset: AssetUpdate):

    conn = get_db()
    cursor = conn.cursor()

    # Check asset exists
    cursor.execute(
        "SELECT id FROM assets WHERE id=?",
        (asset_id,)
    )

    if not cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    # Check category exists
    cursor.execute(
        "SELECT id FROM asset_categories WHERE id=?",
        (asset.category_id,)
    )

    if not cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Asset category not found"
        )

    # Prevent duplicate serial number
    if asset.serial_number:

        cursor.execute(
            """
            SELECT id
            FROM assets
            WHERE serial_number=? AND id!=?
            """,
            (
                asset.serial_number,
                asset_id
            )
        )

        if cursor.fetchone():
            conn.close()
            raise HTTPException(
                status_code=400,
                detail="Serial number already exists"
            )

    cursor.execute(
        """
        UPDATE assets
        SET
            name=?,
            category_id=?,
            serial_number=?,
            acquisition_date=?,
            acquisition_cost=?,
            location=?,
            condition=?,
            status=?,
            current_department_id=?,
            is_bookable=?,
            criticality=?,
            image_url=?,
            document_url=?
        WHERE id=?
        """,
        (
            asset.name,
            asset.category_id,
            asset.serial_number,
            asset.acquisition_date,
            asset.acquisition_cost,
            asset.location,
            asset.condition,
            asset.status,
            asset.current_department_id,
            asset.is_bookable,
            asset.criticality,
            asset.image_url,
            asset.document_url,
            asset_id
        )
    )

    conn.commit()
    conn.close()

    return {
        "message": "Asset updated successfully"
    }


# ---------------------------------
# Soft Delete Asset
# ---------------------------------

@router.delete("/{asset_id}")
def delete_asset(asset_id: int):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id FROM assets WHERE id=?",
        (asset_id,)
    )

    if not cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Asset not found"
        )

    cursor.execute(
        """
        UPDATE assets
        SET status='Disposed'
        WHERE id=?
        """,
        (asset_id,)
    )

    conn.commit()
    conn.close()

    return {
        "message": "Asset disposed successfully"
    }


# ---------------------------------
# Search Assets
# ---------------------------------

@router.get("/search/")
def search_assets(

    asset_tag: str = None,
    serial_number: str = None,
    category_id: int = None,
    status: str = None,
    department_id: int = None,
    location: str = None

):

    conn = get_db()
    cursor = conn.cursor()

    query = """
    SELECT
        a.*,
        c.name AS category,
        d.name AS department,
        u.name AS holder
    FROM assets a
    LEFT JOIN asset_categories c
        ON a.category_id=c.id
    LEFT JOIN departments d
        ON a.current_department_id=d.id
    LEFT JOIN users u
        ON a.current_holder_id=u.id
    WHERE 1=1
    """

    params = []

    if asset_tag:
        query += " AND a.asset_tag LIKE ?"
        params.append(f"%{asset_tag}%")

    if serial_number:
        query += " AND a.serial_number LIKE ?"
        params.append(f"%{serial_number}%")

    if category_id:
        query += " AND a.category_id=?"
        params.append(category_id)

    if status:
        query += " AND a.status=?"
        params.append(status)

    if department_id:
        query += " AND a.current_department_id=?"
        params.append(department_id)

    if location:
        query += " AND a.location LIKE ?"
        params.append(f"%{location}%")

    query += " ORDER BY a.id"

    cursor.execute(query, params)

    rows = cursor.fetchall()

    conn.close()

    return [dict(row) for row in rows]