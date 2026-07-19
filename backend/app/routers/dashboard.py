from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, cast, Date, case
from datetime import date, timedelta
from collections import defaultdict

from ..database import get_db
from ..models.order import Order, OrderItem, OrderLog, OrderStatus, PaymentStatus, GarmentType
from ..models.worker import Worker, WorkerStatus
from ..auth import get_current_user
from .analytics import _get_week_range

router = APIRouter(
    prefix="/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(get_current_user)],
)


@router.get("/summary")
def get_summary(db: Session = Depends(get_db)):
    """
    Ringkasan dashboard admin:
    - Total pesanan aktif (memiliki item belum DONE)
    - Pendapatan minggu ini (dpAmount pada pesanan yang dibuat minggu ini)
    - Pesanan selesai hari ini (updatedAt hari ini & semua item DONE)
    - Karyawan aktif (status Working)
    - Pesanan mendekati/deadline lewat (deadline < hari ini & ada item belum DONE)
    - Breakdown status pembayaran dari pesanan aktif
    """
    # Pesanan aktif: order yang punya minimal 1 item belum DONE
    active_orders = (
        db.query(func.count(func.distinct(Order.id)))
        .join(OrderItem, OrderItem.order_id == Order.id)
        .filter(OrderItem.status != OrderStatus.DONE)
        .scalar()
    ) or 0

    # Pendapatan minggu ini: DP dari pesanan masuk minggu ini + sisa bayar dari pesanan yang dilunasi minggu ini
    start, end = _get_week_range(None)

    # DP revenue: orders created this week (paid → full price, else → dpAmount)
    dp_revenue = (
        db.query(func.coalesce(func.sum(
            case(
                (Order.paymentStatus == PaymentStatus.PAID, Order.totalPrice),
                else_=Order.dpAmount
            )
        ), 0))
        .filter(cast(Order.createdAt, Date) >= start, cast(Order.createdAt, Date) <= end)
        .scalar()
    ) or 0

    # Remaining revenue: orders PAID this week but created before this week
    remaining_revenue = (
        db.query(func.coalesce(func.sum(Order.totalPrice - Order.dpAmount), 0))
        .filter(
            Order.paymentStatus == PaymentStatus.PAID,
            cast(Order.updatedAt, Date) >= start,
            cast(Order.updatedAt, Date) <= end,
            cast(Order.createdAt, Date) < start,
        )
        .scalar()
    ) or 0

    weekly_revenue = dp_revenue + remaining_revenue

    # Pesanan selesai hari ini: updatedAt hari ini & semua item DONE
    today_done = (
        db.query(func.count(Order.id))
        .filter(
            cast(Order.updatedAt, Date) == date.today(),
            ~Order.id.in_(
                db.query(OrderItem.order_id)
                .filter(OrderItem.status != OrderStatus.DONE)
                .distinct()
            ),
        )
        .scalar()
    ) or 0

    # Karyawan aktif
    active_employees = (
        db.query(func.count(Worker.id))
        .filter(Worker.status == WorkerStatus.WORKING)
        .scalar()
    ) or 0

    # Pesanan overdue: deadline < hari ini & punya item belum DONE
    overdue_orders = (
        db.query(func.count(func.distinct(Order.id)))
        .join(OrderItem, OrderItem.order_id == Order.id)
        .filter(
            OrderItem.status != OrderStatus.DONE,
            Order.deadline < date.today().isoformat(),
        )
        .scalar()
    ) or 0

    # Breakdown pembayaran dari semua order yang punya item belum DONE
    active_order_ids = (
        db.query(func.distinct(Order.id))
        .join(OrderItem, OrderItem.order_id == Order.id)
        .filter(OrderItem.status != OrderStatus.DONE)
    )
    payment_rows = (
        db.query(Order.paymentStatus, func.count(Order.id))
        .filter(Order.id.in_(active_order_ids))
        .group_by(Order.paymentStatus)
        .all()
    )
    payment_map = {row[0].value if hasattr(row[0], 'value') else row[0]: row[1] for row in payment_rows}

    return {
        "activeOrders": active_orders,
        "weeklyRevenue": float(weekly_revenue),
        "todayDone": today_done,
        "activeEmployees": active_employees,
        "overdueOrders": overdue_orders,
        "paymentBreakdown": {
            "paid": payment_map.get("paid", 0),
            "partial": payment_map.get("partial", 0),
            "unpaid": payment_map.get("unpaid", 0),
        },
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

    # Pesanan selesai (semua item DONE, updatedAt per hari)
    done_rows = (
        db.query(cast(Order.updatedAt, Date).label("day"), func.count(Order.id).label("cnt"))
        .filter(
            cast(Order.updatedAt, Date) >= start,
            ~Order.id.in_(
                db.query(OrderItem.order_id)
                .filter(OrderItem.status != OrderStatus.DONE)
                .distinct()
            ),
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
    Pesanan yang mendekati deadline (≤3 hari) dan belum selesai
    (memiliki setidaknya 1 item yang belum DONE).
    """
    from sqlalchemy.orm import joinedload

    today = date.today()
    threshold = today + timedelta(days=3)

    # Cari order yang punya minimal 1 item belum DONE & deadline <= threshold
    orders = (
        db.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.garmentType),
        )
        .filter(
            Order.deadline <= threshold.isoformat(),
            Order.id.in_(
                db.query(OrderItem.order_id)
                .filter(OrderItem.status != OrderStatus.DONE)
                .distinct()
            ),
        )
        .order_by(Order.deadline.asc())
        .limit(20)
        .all()
    )

    result = []
    for o in orders:
        days_left = (date.fromisoformat(o.deadline) - today).days
        # Ambil garment type dari item pertama yang belum DONE
        active_item = next(
            (i for i in o.items if i.status != OrderStatus.DONE), None
        )
        garment_name = (
            active_item.garmentType.name
            if active_item and active_item.garmentType
            else None
        )
        item_status = active_item.status.value if active_item else "done"
        result.append({
            "id": o.id,
            "receiptNumber": o.receiptNumber,
            "customerName": o.customerName,
            "garmentType": garment_name,
            "deadline": o.deadline,
            "daysLeft": days_left,
            "status": item_status,
            "urgency": "critical" if days_left <= 0 else ("high" if days_left <= 1 else "medium"),
        })

    return result
