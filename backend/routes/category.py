from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from db import get_db

router = APIRouter(
    prefix="/categories",
    tags=["Asset Categories"]
)

# -----------------------------
# Pydantic Models
# -----------------------------

class CategoryCreate(BaseModel):
    name: str
    description: Optional[str] = None
    warranty_period_months: Optional[int] = None


class CategoryUpdate(BaseModel):
    name: str
    description: Optional[str] = None
    warranty_period_months: Optional[int] = None


# -----------------------------
# Create Category
# -----------------------------

@router.post("/")
def create_category(category: CategoryCreate):

    conn = get_db()
    cursor = conn.cursor()

    # Check duplicate category name
    cursor.execute(
        "SELECT id FROM asset_categories WHERE name=?",
        (category.name,)
    )

    if cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Category already exists"
        )

    cursor.execute(
        """
        INSERT INTO asset_categories
        (
            name,
            description,
            warranty_period_months
        )
        VALUES (?, ?, ?)
        """,
        (
            category.name,
            category.description,
            category.warranty_period_months
        )
    )

    conn.commit()

    category_id = cursor.lastrowid

    conn.close()

    return {
        "message": "Category created successfully",
        "category_id": category_id
    }


# -----------------------------
# Get All Categories
# -----------------------------

@router.get("/")
def get_categories():

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT *
        FROM asset_categories
        ORDER BY id
    """)

    rows = cursor.fetchall()

    conn.close()

    return [dict(row) for row in rows]


# -----------------------------
# Get Category By ID
# -----------------------------

@router.get("/{category_id}")
def get_category(category_id: int):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT *
        FROM asset_categories
        WHERE id=?
        """,
        (category_id,)
    )

    row = cursor.fetchone()

    conn.close()

    if not row:
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    return dict(row)


# -----------------------------
# Update Category
# -----------------------------

@router.put("/{category_id}")
def update_category(
    category_id: int,
    category: CategoryUpdate
):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id FROM asset_categories WHERE id=?",
        (category_id,)
    )

    if not cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    # Prevent duplicate names
    cursor.execute(
        """
        SELECT id
        FROM asset_categories
        WHERE name=? AND id!=?
        """,
        (
            category.name,
            category_id
        )
    )

    if cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=400,
            detail="Category name already exists"
        )

    cursor.execute(
        """
        UPDATE asset_categories
        SET
            name=?,
            description=?,
            warranty_period_months=?
        WHERE id=?
        """,
        (
            category.name,
            category.description,
            category.warranty_period_months,
            category_id
        )
    )

    conn.commit()

    conn.close()

    return {
        "message": "Category updated successfully"
    }


# -----------------------------
# Delete Category
# -----------------------------

@router.delete("/{category_id}")
def delete_category(category_id: int):

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT id FROM asset_categories WHERE id=?",
        (category_id,)
    )

    if not cursor.fetchone():
        conn.close()
        raise HTTPException(
            status_code=404,
            detail="Category not found"
        )

    cursor.execute(
        """
        DELETE FROM asset_categories
        WHERE id=?
        """,
        (category_id,)
    )

    conn.commit()

    conn.close()

    return {
        "message": "Category deleted successfully"
    }