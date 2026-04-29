from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base
from .routers import workers, orders, profile, portfolio, dashboard, analytics, garment_types, attributes
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(title=os.getenv("APP_NAME"), version=os.getenv("APP_VERSION"))

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS"),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (uploads)
UPLOADS_DIR = Path(__file__).parent.parent / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# Routers
app.include_router(workers.router)
app.include_router(garment_types.router)
app.include_router(attributes.router)
app.include_router(orders.router)
app.include_router(profile.router)
app.include_router(portfolio.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)


@app.get("/")
def read_root():
    return {"message": "API is running..."}
