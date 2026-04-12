from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from .database import engine, Base
from .routers import workers, orders, profile, portfolio, dashboard, analytics

# Import models so Base.metadata picks them up before create_all
from .models import worker, order, profile as profile_model, portfolio as portfolio_model  # noqa: F401

# Create database tables (will create new tables, won't drop existing ones)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Production Management System API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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
app.include_router(orders.router)
app.include_router(profile.router)
app.include_router(portfolio.router)
app.include_router(dashboard.router)
app.include_router(analytics.router)


@app.get("/")
def read_root():
    return {"message": "API is running..."}
