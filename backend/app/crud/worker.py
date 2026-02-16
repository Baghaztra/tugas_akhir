from sqlalchemy.orm import Session
from ..models.worker import Worker
from ..schemas.worker import WorkerCreate, WorkerUpdate

def get_worker(db: Session, worker_id: int):
    return db.query(Worker).filter(Worker.id == worker_id).first()

def get_workers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Worker).offset(skip).limit(limit).all()

def create_worker(db: Session, worker: WorkerCreate):
    db_worker = Worker(name=worker.name, role=worker.role, status=worker.status)
    db.add(db_worker)
    db.commit()
    db.refresh(db_worker)
    return db_worker

def update_worker(db: Session, worker_id: int, worker: WorkerUpdate):
    db_worker = get_worker(db, worker_id)
    if not db_worker:
        return None
    update_data = worker.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_worker, key, value)
    db.add(db_worker)
    db.commit()
    db.refresh(db_worker)
    return db_worker

def delete_worker(db: Session, worker_id: int):
    db_worker = get_worker(db, worker_id)
    if not db_worker:
        return None
    db.delete(db_worker)
    db.commit()
    return db_worker
