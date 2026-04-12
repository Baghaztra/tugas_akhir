from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import date, timedelta
from collections import defaultdict

from ..database import get_db
from ..models.order import Order, OrderLog, OrderStatus
from ..models.worker import Worker

router = APIRouter(
    prefix="/reports",
    tags=["reports"],
)


@router.get("/volume")
def get_volume(
    period: str = Query(default="monthly", description="weekly | monthly"),
    db: Session = Depends(get_db),
):
    """
    Volume pesanan per label periode (weekly = 7 hari, monthly = 30 hari terakhir dibagi per minggu).
    """
    today = date.today()

    if period == "weekly":
        # 7 hari terakhir, group by hari
        start = today - timedelta(days=6)
        rows = (
            db.query(cast(Order.createdAt, Date).label("day"), func.count(Order.id).label("cnt"))
            .filter(cast(Order.createdAt, Date) >= start)
            .group_by(cast(Order.createdAt, Date))
            .all()
        )
        day_map = {str(r.day): r.cnt for r in rows}
        labels, data = [], []
        for i in range(7):
            d = start + timedelta(days=i)
            labels.append(d.strftime("%a %d/%m"))
            data.append(day_map.get(d.isoformat(), 0))
    else:
        # monthly: 4 minggu terakhir
        labels, data = [], []
        for w in range(3, -1, -1):
            week_end = today - timedelta(days=w * 7)
            week_start = week_end - timedelta(days=6)
            cnt = (
                db.query(func.count(Order.id))
                .filter(
                    cast(Order.createdAt, Date) >= week_start,
                    cast(Order.createdAt, Date) <= week_end,
                )
                .scalar()
            ) or 0
            labels.append(f"W{4 - w} ({week_start.strftime('%d/%m')})")
            data.append(cnt)

    return {"labels": labels, "data": data}


@router.get("/product-trends")
def get_product_trends(db: Session = Depends(get_db)):
    """
    Jumlah pesanan per jenis pakaian (garmentType).
    """
    rows = (
        db.query(Order.garmentType, func.count(Order.id).label("count"))
        .group_by(Order.garmentType)
        .order_by(func.count(Order.id).desc())
        .all()
    )
    return [{"type": r.garmentType, "count": r.count} for r in rows]


@router.get("/productivity")
def get_productivity(db: Session = Depends(get_db)):
    """
    Produktivitas per worker: total pesanan selesai dan rata-rata waktu per item
    berdasarkan OrderLog dengan status 'done'.
    """
    workers = db.query(Worker).all()
    result = []

    for w in workers:
        # Hitung total log 'done' yang di-assign ke worker ini
        total = (
            db.query(func.count(OrderLog.id))
            .filter(OrderLog.employeeName == w.name, OrderLog.status == "done")
            .scalar()
        ) or 0

        result.append({
            "worker": w.name,
            "role": w.role.value,
            "total_finished": total,
            "avg_time_per_item": None,  # Placeholder: hitung jika ada data time tracking
        })

    return sorted(result, key=lambda x: x["total_finished"], reverse=True)
