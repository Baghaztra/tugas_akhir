from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import workers, orders

# Import models so Base.metadata picks them up before create_all
from .models import worker, order  # noqa: F401

# Create database tables (will create new tables, won't drop existing ones)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Production Management System API", version="1.0.0")

# ─── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(workers.router)
app.include_router(orders.router)


@app.get("/")
def read_root():
    return {"message": "API is running..."}
