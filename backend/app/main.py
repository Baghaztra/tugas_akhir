from fastapi import FastAPI
from .database import engine, Base
from .routers import workers

# Create database tables (simplified for now, ideally use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Production Management System API")

app.include_router(workers.router)

@app.get("/")
def read_root():
    return {"message": "API is running..."}
