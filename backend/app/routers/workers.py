from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta

from ..crud import worker as crud_worker
from ..schemas import worker as schema_worker
from ..database import get_db

router = APIRouter(
    prefix="/workers",
    tags=["workers"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=schema_worker.Worker)
def create_worker(worker: schema_worker.WorkerCreate, db: Session = Depends(get_db)):
    return crud_worker.create_worker(db=db, worker=worker)


@router.get("/", response_model=List[schema_worker.Worker])
def read_workers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_worker.get_workers(db, skip=skip, limit=limit)


@router.get("/{worker_id}", response_model=schema_worker.Worker)
def read_worker(worker_id: int, db: Session = Depends(get_db)):
    db_worker = crud_worker.get_worker(db, worker_id=worker_id)
    if db_worker is None:
        raise HTTPException(status_code=404, detail="Worker not found")
    return db_worker


@router.put("/{worker_id}", response_model=schema_worker.Worker)
def update_worker(worker_id: int, worker: schema_worker.WorkerUpdate, db: Session = Depends(get_db)):
    db_worker = crud_worker.update_worker(db, worker_id=worker_id, worker=worker)
    if db_worker is None:
        raise HTTPException(status_code=404, detail="Worker not found")
    return db_worker


@router.delete("/{worker_id}", response_model=schema_worker.Worker)
def delete_worker(worker_id: int, db: Session = Depends(get_db)):
    db_worker = crud_worker.delete_worker(db, worker_id=worker_id)
    if db_worker is None:
        raise HTTPException(status_code=404, detail="Worker not found")
    return db_worker


# Wages
@router.get("/{worker_id}/wages", response_model=schema_worker.WorkerWage)
def get_wages(
    worker_id: int,
    start_date: date = Query(default=None, description="Awal periode (YYYY-MM-DD)"),
    end_date: date = Query(default=None, description="Akhir periode (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    if end_date is None:
        end_date = date.today()
    if start_date is None:
        start_date = end_date - timedelta(days=6)

    result = crud_worker.get_worker_wages(db, worker_id, start_date, end_date)
    if result is None:
        raise HTTPException(status_code=404, detail="Worker not found")
    return result


# Performance
@router.get("/{worker_id}/performance", response_model=schema_worker.WorkerPerformance)
def get_performance(
    worker_id: int,
    days: int = Query(default=7, ge=1, le=90, description="Jumlah hari histori"),
    db: Session = Depends(get_db),
):
    result = crud_worker.get_worker_performance(db, worker_id, days=days)
    if result is None:
        raise HTTPException(status_code=404, detail="Worker not found")
    return result
