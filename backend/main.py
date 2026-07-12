from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from crud import create_user, get_all_users, UserAlreadyExists
from routers.booking import router as booking_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(booking_router)

@app.exception_handler(UserAlreadyExists)
def user_already_exists_handler(request: Request, exc: UserAlreadyExists):
    return JSONResponse(status_code=400, content={"detail": str(exc)})

@app.get("/")
def read_root():
    return {"message": "odoo Hackathon"}

@app.post("/dummy")
def add_dummy():
    create_user("uid123", "Sagar", "sagar@gmail.com", "Admin")
    return {"message": "Inserted"}

@app.get("/users")
def users():
    return get_all_users()