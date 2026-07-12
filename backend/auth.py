from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from firebase_admin import auth

from db import get_db

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        decoded_token = auth.verify_id_token(token)

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Invalid Firebase token"
        )

    firebase_uid = decoded_token["uid"]

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE firebase_uid = ?
        """,
        (firebase_uid,)
    )

    user = cursor.fetchone()

    conn.close()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return dict(user)


# -----------------------------
# Role Dependencies
# -----------------------------

def require_admin(
    current_user=Depends(get_current_user)
):

    if current_user["role"] != "Admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user


def require_asset_manager(
    current_user=Depends(get_current_user)
):

    if current_user["role"] != "AssetManager":
        raise HTTPException(
            status_code=403,
            detail="Asset Manager access required"
        )

    return current_user


def require_department_head(
    current_user=Depends(get_current_user)
):

    if current_user["role"] != "DepartmentHead":
        raise HTTPException(
            status_code=403,
            detail="Department Head access required"
        )

    return current_user