import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.database import engine, Base
from app.config import settings

# Import all models so Base.metadata knows about them
from app.models import User, Department, Grievance, GrievanceHistory, DepartmentAssignment, Attachment, ContactEnquiry


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    Base.metadata.create_all(bind=engine)
    # Create upload directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    yield


app = FastAPI(
    title="CM Kerala - Grievance Redressal Portal",
    description="Chief Minister's Public Grievance Redressal Portal API",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
from app.routers import auth, departments, grievances, cmo, officer, ai_router, contact

app.include_router(auth.router)
app.include_router(departments.router)
app.include_router(grievances.router)
app.include_router(cmo.router)
app.include_router(officer.router)
app.include_router(ai_router.router)
app.include_router(contact.router)

# Serve uploaded files
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.get("/")
def root():
    return {"message": "CM Kerala Grievance Portal API", "status": "running"}


@app.get("/health")
def health():
    return {"status": "healthy"}

