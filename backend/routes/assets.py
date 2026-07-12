from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
import pandas as pd
import io

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

# ---------------------------------
# Get Excel Template
# ---------------------------------

@router.get("/bulk-upload/template")
def get_template():
    columns = [
        "Asset Name",
        "Category",
        "Serial Number",
        "Acquisition Date (YYYY-MM-DD)",
        "Acquisition Cost",
        "Location",
        "Condition",
        "Department",
        "Is Bookable (Yes/No)",
        "Criticality"
    ]
    df = pd.DataFrame(columns=columns)
    
    # Add a sample row
    df.loc[0] = [
        "Dell XPS 15",
        "Laptops",
        "SN-12345",
        "2023-01-15",
        "1500.00",
        "HQ - Floor 2",
        "Excellent",
        "Engineering Department",
        "No",
        "Medium"
    ]
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Template')
        
        # Adjust column widths
        worksheet = writer.sheets['Template']
        for col in worksheet.columns:
            max_length = 0
            column = col[0].column_letter
            for cell in col:
                try:
                    if len(str(cell.value)) > max_length:
                        max_length = len(str(cell.value))
                except:
                    pass
            adjusted_width = (max_length + 2)
            worksheet.column_dimensions[column].width = adjusted_width
            
    output.seek(0)
    
    return Response(
        content=output.getvalue(),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=AssetFlow_Bulk_Import_Template.xlsx"}
    )

# ---------------------------------
# Bulk Upload Assets
# ---------------------------------

from auth import get_current_user
from fastapi import Depends

@router.post("/bulk-upload")
def bulk_upload(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(400, "Only .xlsx files are supported")
        
    try:
        contents = file.file.read()
        df = pd.read_excel(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(400, f"Error reading Excel file: {str(e)}")
        
    # Required columns
    required_cols = [
        "Asset Name", "Category", "Condition"
    ]
    
    for col in required_cols:
        if col not in df.columns:
            raise HTTPException(400, f"Missing required column: {col}")
            
    conn = get_db()
    cursor = conn.cursor()
    
    # Pre-fetch lookup data
    cursor.execute("SELECT id, name FROM asset_categories")
    categories = {row["name"]: row["id"] for row in cursor.fetchall()}
    
    cursor.execute("SELECT id, name FROM departments")
    departments = {row["name"]: row["id"] for row in cursor.fetchall()}
    
    cursor.execute("SELECT serial_number FROM assets WHERE serial_number IS NOT NULL")
    existing_serials = {row["serial_number"] for row in cursor.fetchall()}
    
    success_count = 0
    failed_count = 0
    errors = []
    
    # Iterate rows
    for index, row in df.iterrows():
        row_num = index + 2  # +2 because index 0 is row 2 in excel (header is row 1)
        reason = None
        
        try:
            name = str(row.get("Asset Name", "")).strip()
            cat_name = str(row.get("Category", "")).strip()
            serial = str(row.get("Serial Number", "")).strip() if pd.notna(row.get("Serial Number")) else None
            acq_date = str(row.get("Acquisition Date (YYYY-MM-DD)", "")).strip() if pd.notna(row.get("Acquisition Date (YYYY-MM-DD)")) else None
            cost = row.get("Acquisition Cost")
            loc = str(row.get("Location", "")).strip() if pd.notna(row.get("Location")) else None
            cond = str(row.get("Condition", "")).strip()
            dept_name = str(row.get("Department", "")).strip() if pd.notna(row.get("Department")) else None
            bookable_str = str(row.get("Is Bookable (Yes/No)", "No")).strip().lower()
            crit = str(row.get("Criticality", "")).strip() if pd.notna(row.get("Criticality")) else None
            
            if not name or name == "nan":
                reason = "Asset Name is required"
                raise ValueError()
                
            if not cat_name or cat_name == "nan":
                reason = "Category is required"
                raise ValueError()
                
            if cat_name not in categories:
                reason = f"Category '{cat_name}' not found"
                raise ValueError()
                
            cat_id = categories[cat_name]
            
            if not cond or cond == "nan":
                reason = "Condition is required"
                raise ValueError()
                
            valid_conditions = ["Excellent", "Good", "Fair", "Poor"]
            if cond not in valid_conditions:
                reason = f"Condition must be one of: {', '.join(valid_conditions)}"
                raise ValueError()
                
            dept_id = None
            if dept_name and dept_name != "nan":
                if dept_name not in departments:
                    reason = f"Department '{dept_name}' not found"
                    raise ValueError()
                dept_id = departments[dept_name]
                
            if serial and serial != "nan":
                if serial in existing_serials:
                    reason = f"Serial number '{serial}' already exists"
                    raise ValueError()
                    
            if pd.notna(cost) and cost != "nan":
                try:
                    cost = float(cost)
                except ValueError:
                    reason = "Acquisition Cost must be numeric"
                    raise ValueError()
            else:
                cost = None
                
            is_bookable = bookable_str in ['yes', 'y', 'true', '1']
            
            valid_crit = ["Low", "Medium", "High", "Critical"]
            if crit and crit != "nan":
                if crit not in valid_crit:
                    reason = f"Criticality must be one of: {', '.join(valid_crit)}"
                    raise ValueError()
            else:
                crit = None
                
            if acq_date == "nan":
                acq_date = None
                
            if serial == "nan":
                serial = None
            if loc == "nan":
                loc = None
                
            # If valid, insert
            asset_tag = generate_asset_tag(cursor)
            
            cursor.execute(
                '''
                INSERT INTO assets
                (
                    asset_tag, name, category_id, serial_number, acquisition_date,
                    acquisition_cost, location, condition, current_department_id,
                    is_bookable, criticality
                )
                VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''',
                (
                    asset_tag, name, cat_id, serial, acq_date, cost, loc, cond, dept_id, is_bookable, crit
                )
            )
            
            # Add serial to set so subsequent rows in same file don't duplicate
            if serial:
                existing_serials.add(serial)
                
            success_count += 1
            
        except ValueError:
            failed_count += 1
            errors.append({
                "row": row_num,
                "reason": reason or "Invalid data format"
            })
        except Exception as e:
            failed_count += 1
            errors.append({
                "row": row_num,
                "reason": str(e)
            })
            
    if success_count > 0:
        cursor.execute(
            "INSERT INTO activity_logs (user_id, action, entity_type, description) VALUES (?, ?, ?, ?)",
            (current_user["id"], "Bulk Import", "assets", f"Imported {success_count} assets via Excel")
        )
            
    conn.commit()
    conn.close()
    
    return {
        "success_count": success_count,
        "failed_count": failed_count,
        "errors": errors
    }