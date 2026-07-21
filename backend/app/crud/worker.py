from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import date, timedelta
from collections import defaultdict
from ..models.worker import Worker
from ..models.order import OrderLog, Order, OrderItem, GarmentType, OrderStatus
from ..schemas.worker import WorkerBase, WorkerUpdate


def get_worker(db: Session, worker_id: int):
    return db.query(Worker).filter(Worker.id == worker_id).first()


def get_workers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Worker).filter(Worker.is_deleted == False).offset(skip).limit(limit).all()


def create_worker(db: Session, worker: WorkerBase):
    db_worker = Worker(**worker.model_dump())
    db.add(db_worker)
    db.commit()
    db.refresh(db_worker)
    return db_worker


def update_worker(db: Session, worker_id: int, worker: WorkerUpdate):
    db_worker = get_worker(db, worker_id)
    if not db_worker:
        return None
    update_data = worker.model_dump(exclude_unset=True)
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
    db_worker.is_deleted = True
    db.add(db_worker)
    db.commit()
    db.refresh(db_worker)
    return db_worker


def get_worker_performance(db: Session, worker_id: int, days: int = 7):
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

def get_worker_tasks(db: Session, worker_id: int, limit: int = 20):
    worker = get_worker(db, worker_id)
    if not worker:
        return None

    rows = (
        db.query(
            OrderLog.id.label("log_id"),
            OrderLog.order_item_id,
            OrderLog.status,
            OrderLog.createdAt,
            Order.receiptNumber,
            Order.customerName,
            GarmentType.name.label("garment_name"),
        )
        .join(OrderItem, OrderLog.order_item_id == OrderItem.id)
        .join(Order, OrderItem.order_id == Order.id)
        .outerjoin(GarmentType, OrderItem.garmentTypeId == GarmentType.id)
        .filter(OrderLog.worker_id == worker_id)
        .order_by(OrderLog.createdAt.desc())
        .limit(limit)
        .all()
    )

    return [
        {
            "log_id": r.log_id,
            "order_item_id": r.order_item_id,
            "receipt_number": r.receiptNumber,
            "customer_name": r.customerName,
            "garment_type": r.garment_name or "",
            "status": r.status,
            "completed_at": r.createdAt.isoformat() if r.createdAt else "",
        }
        for r in rows
    ]
