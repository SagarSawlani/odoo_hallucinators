from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from firebase import firebase_config
from crud import create_user, get_all_users, UserAlreadyExists
from routes.booking import router as booking_router
from routes.department import router as department_router
from routes.category import router as category_router
from routes.employee import router as employee_router
from routes.maintenance import router as maintenance_router
from routes.audit import router as audit_router
from routes.dashboard import router as dashboard_router
from routes.assets import router as assets_router
from routes.allocation import router as allocation_router
from routes.transfer import router as transfer_router
from routes.notifications import router as notifications_router
from routes.activity_logs import router as activity_logs_router

app = FastAPI(
    title="AssetFlow API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(UserAlreadyExists)
def user_already_exists_handler(request: Request, exc: UserAlreadyExists):
    return JSONResponse(
        status_code=400,
        content={"detail": str(exc)}
    )


app.include_router(department_router)
app.include_router(category_router)
app.include_router(employee_router)
app.include_router(booking_router)
app.include_router(maintenance_router)
app.include_router(audit_router)
app.include_router(dashboard_router)
app.include_router(notifications_router)
app.include_router(activity_logs_router)

# Person 2
app.include_router(assets_router)
app.include_router(allocation_router)
app.include_router(transfer_router)

# -----------------------------
# Home
# -----------------------------

from fastapi import Depends
from auth import get_current_user

@app.get("/me")
def me(current_user=Depends(get_current_user)):
    return current_user

@app.get("/")
def read_root():
    return {
        "message": "Odoo Hackathon - AssetFlow API"
    }

# -----------------------------
# Dummy User (Testing)
# -----------------------------

@app.post("/dummy")
def add_dummy():
    create_user(
        "uid123",
        "Sagar",
        "sagar@gmail.com",
        "Admin"
    )

    return {
        "message": "Inserted"
    }

# -----------------------------
# Users
# -----------------------------

@app.get("/users")
def users():
    return get_all_users()
