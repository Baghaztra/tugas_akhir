from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta

from ..crud import worker as crud_worker
from ..schemas import worker as schema_worker
from ..database import get_db
from ..auth import get_current_user
from ..models.user import User
from typing import List

router = APIRouter(
    prefix="/workers",
    tags=["workers"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=schema_worker.Worker)
def create_worker(worker: schema_worker.WorkerBase, db: Session = Depends(get_db)):
    return crud_worker.create_worker(db=db, worker=worker)


@router.get("/", response_model=List[schema_worker.Worker])
def read_workers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud_worker.get_workers(db, skip=skip, limit=limit)


@router.get("/{worker_id}", response_model=schema_worker.Worker)
def read_worker(worker_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_worker = crud_worker.get_worker(db, worker_id=worker_id)
    if db_worker is None or db_worker.is_deleted:
        raise HTTPException(status_code=404, detail="Worker not found")
    return db_worker


@router.put("/{worker_id}", response_model=schema_worker.Worker)
def update_worker(worker_id: int, worker: schema_worker.WorkerUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_worker = crud_worker.get_worker(db, worker_id=worker_id)
    if db_worker is None or db_worker.is_deleted:
        raise HTTPException(status_code=404, detail="Worker not found")
    db_worker = crud_worker.update_worker(db, worker_id=worker_id, worker=worker)
    return db_worker


@router.delete("/{worker_id}", response_model=schema_worker.Worker)
def delete_worker(worker_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_worker = crud_worker.get_worker(db, worker_id=worker_id)
    if db_worker is None or db_worker.is_deleted:
        raise HTTPException(status_code=404, detail="Worker not found")
    db_worker = crud_worker.delete_worker(db, worker_id=worker_id)
    return db_worker


# Performance
@router.get("/{worker_id}/performance", response_model=schema_worker.WorkerPerformance)
def get_performance(
    worker_id: int,
    days: int = Query(default=7, ge=1, le=90, description="Jumlah hari histori"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = crud_worker.get_worker_performance(db, worker_id, days=days)
    if result is None:
        raise HTTPException(status_code=404, detail="Worker not found")
    return result


# Tasks
@router.get("/{worker_id}/tasks", response_model=List[schema_worker.WorkerTask])
def get_tasks(
    worker_id: int,
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = crud_worker.get_worker_tasks(db, worker_id, limit=limit)
    if result is None:
        raise HTTPException(status_code=404, detail="Worker not found")
    return result
