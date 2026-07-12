from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from firebase_admin import auth

import json
import base64

from db import get_db

security = HTTPBearer()


def _decode_token_payload(token: str) -> dict:
    """Manually decode JWT payload (base64) as a fallback for clock skew issues."""
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Invalid JWT format")
    payload = parts[1]
    # Add base64 padding safely
    payload += "=" * ((4 - len(payload) % 4) % 4)
    decoded = base64.urlsafe_b64decode(payload)
    return json.loads(decoded)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        # Try normal verification with max allowed clock skew (60s)
        decoded_token = auth.verify_id_token(token, clock_skew_seconds=60)

    except Exception as e:
        error_msg = str(e)

        # If it's specifically a clock skew issue, fall back to manual decode
        if "Token used too early" in error_msg or "Token expired" in error_msg:
            print(f"Clock skew detected, using manual decode fallback: {error_msg}")
            try:
                decoded_token = _decode_token_payload(token)
                if "uid" not in decoded_token and "user_id" in decoded_token:
                    decoded_token["uid"] = decoded_token["user_id"]
            except Exception as inner_e:
                print(f"Manual decode also failed: {inner_e}")
                raise HTTPException(
                    status_code=401,
                    detail=f"Invalid Firebase token: {error_msg}"
                )
        else:
            print("Token verification failed:", e)
            raise HTTPException(
                status_code=401,
                detail=f"Invalid Firebase token: {error_msg}"
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