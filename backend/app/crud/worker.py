from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import date, timedelta
from collections import defaultdict
from ..models.worker import Worker
from ..models.order import OrderLog, Order, OrderStatus
from ..schemas.worker import WorkerCreate, WorkerUpdate


def get_worker(db: Session, worker_id: int):
    return db.query(Worker).filter(Worker.id == worker_id).first()


def get_workers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Worker).offset(skip).limit(limit).all()


def create_worker(db: Session, worker: WorkerCreate):
    db_worker = Worker(**worker.dict())
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


# ─── Wages ───────────────────────────────────────────────────────────────────

def get_worker_wages(db: Session, worker_id: int, start_date: date, end_date: date):
    """
    Hitung upah worker berdasarkan jumlah log 'done' pada OrderLog
    yang di-assign ke worker tersebut dalam rentang tanggal.
    """
    worker = get_worker(db, worker_id)
    if not worker:
        return None

    # Hitung jumlah item selesai: order status DONE yg createdAt dalam range
    completed = (
        db.query(func.count(OrderLog.id))
        .join(Order, OrderLog.order_id == Order.id)
        .filter(
            OrderLog.employeeName == worker.name,
            OrderLog.status == "done",
            cast(OrderLog.createdAt, Date) >= start_date,
            cast(OrderLog.createdAt, Date) <= end_date,
        )
        .scalar()
    ) or 0

    period_str = f"{start_date.isoformat()} - {end_date.isoformat()}"
    return {
        "worker_id": worker_id,
        "worker_name": worker.name,
        "period": period_str,
        "completed_items": completed,
        "rate_per_item": worker.wagePerPiece,
        "total_wage": completed * worker.wagePerPiece,
    }


# ─── Performance ─────────────────────────────────────────────────────────────

def get_worker_performance(db: Session, worker_id: int, days: int = 7):
    """
    Ambil data produktivitas harian worker berdasarkan OrderLog.
    """
    worker = get_worker(db, worker_id)
    if not worker:
        return None

    end = date.today()
    start = end - timedelta(days=days - 1)

    rows = (
        db.query(cast(OrderLog.createdAt, Date).label("day"), func.count(OrderLog.id).label("cnt"))
        .filter(
            OrderLog.employeeName == worker.name,
            OrderLog.status == "done",
            cast(OrderLog.createdAt, Date) >= start,
            cast(OrderLog.createdAt, Date) <= end,
        )
        .group_by(cast(OrderLog.createdAt, Date))
        .all()
    )

    # Build daily dict with zero-fill
    daily_map = defaultdict(int)
    for row in rows:
        daily_map[str(row.day)] = row.cnt

    daily = []
    for i in range(days):
        d = start + timedelta(days=i)
        daily.append({"date": d.isoformat(), "count": daily_map.get(d.isoformat(), 0)})

    total = sum(d["count"] for d in daily)
    avg = round(total / days, 2)

    return {
        "worker_id": worker_id,
        "worker_name": worker.name,
        "performance_score": avg,
        "total_finished": total,
        "daily": daily,
    }
