from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date
from datetime import date, timedelta
from collections import defaultdict

from ..database import get_db
from ..models.order import Order, OrderLog, OrderStatus, PaymentStatus
from ..auth import get_current_user
from ..models.user import User

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    """
    Ringkasan dashboard admin:
    - Total pesanan aktif (belum DONE)
    - Pendapatan minggu ini (paidAmount pada pesanan yang dibuat minggu ini)
    - Jumlah worker (diambil dari /workers di frontend, tidak dihitung di sini)
    """
    active_orders = (
        db.query(func.count(Order.id))
        .filter(Order.status != OrderStatus.DONE)
        .scalar()
    ) or 0

    # Pendapatan minggu ini: jumlah paidAmount pesanan yang createdAt dalam 7 hari
    week_start = date.today() - timedelta(days=6)
    weekly_revenue = (
        db.query(func.coalesce(func.sum(Order.paidAmount), 0))
        .filter(cast(Order.createdAt, Date) >= week_start)
        .scalar()
    ) or 0

    # Pesanan selesai hari ini
    today_done = (
        db.query(func.count(Order.id))
        .filter(
            Order.status == OrderStatus.DONE,
            cast(Order.updatedAt, Date) == date.today(),
        )
        .scalar()
    ) or 0

    return {
        "activeOrders": active_orders,
        "weeklyRevenue": float(weekly_revenue),
        "todayDone": today_done,
    }


@router.get("/trend")
def get_trend(db: Session = Depends(get_db)):
    """
    Data tren 7 hari terakhir: pesanan masuk vs pesanan selesai per hari.
    """
    today = date.today()
    days = 7
    start = today - timedelta(days=days - 1)

    # Pesanan masuk (createdAt per hari)
    incoming_rows = (
        db.query(cast(Order.createdAt, Date).label("day"), func.count(Order.id).label("cnt"))
        .filter(cast(Order.createdAt, Date) >= start)
        .group_by(cast(Order.createdAt, Date))
        .all()
    )

    # Pesanan selesai (status DONE, updatedAt per hari)
    done_rows = (
        db.query(cast(Order.updatedAt, Date).label("day"), func.count(Order.id).label("cnt"))
        .filter(
            Order.status == OrderStatus.DONE,
            cast(Order.updatedAt, Date) >= start,
        )
        .group_by(cast(Order.updatedAt, Date))
        .all()
    )

    incoming_map = {str(r.day): r.cnt for r in incoming_rows}
    done_map = {str(r.day): r.cnt for r in done_rows}

    labels, incoming, completed = [], [], []
    for i in range(days):
        d = start + timedelta(days=i)
        ds = d.isoformat()
        labels.append(ds)
        incoming.append(incoming_map.get(ds, 0))
        completed.append(done_map.get(ds, 0))

    return {"labels": labels, "incoming": incoming, "completed": completed}


@router.get("/notifications")
def get_notifications(db: Session = Depends(get_db)):
    """
    Pesanan yang mendekati deadline (≤3 hari) dan belum selesai.
    """
    today = date.today()
    threshold = today + timedelta(days=3)

    orders = (
        db.query(Order)
        .filter(
            Order.status != OrderStatus.DONE,
            Order.deadline <= threshold.isoformat(),
        )
        .order_by(Order.deadline.asc())
        .limit(20)
        .all()
    )

    result = []
    for o in orders:
        days_left = (date.fromisoformat(o.deadline) - today).days
        result.append({
            "id": o.id,
            "receiptNumber": o.receiptNumber,
            "customerName": o.customerName,
            "garmentType": o.garmentType,
            "deadline": o.deadline,
            "daysLeft": days_left,
            "status": o.status.value,
            "urgency": "critical" if days_left <= 0 else ("high" if days_left <= 1 else "medium"),
        })

    return result
