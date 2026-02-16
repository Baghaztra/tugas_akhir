from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

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
    workers = crud_worker.get_workers(db, skip=skip, limit=limit)
    return workers

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
