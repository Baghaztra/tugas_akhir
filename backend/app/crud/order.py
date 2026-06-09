from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import UploadFile

from ..models.order import Order, OrderLog, OrderStatus, OrderItem, GarmentType
from ..models.worker import Worker, WorkerStatus
from ..schemas.order import OrderCreate, OrderUpdate
from ..storage import get_storage


def _generate_receipt_number(db: Session) -> str:
    """Generate a unique receipt number in format ORD-YYYYMMDD-NNNN."""
    now = datetime.now()
    prefix = f"ORD-{now.strftime('%Y%m%d')}-"
    count = db.query(Order).filter(Order.receiptNumber.like(f"{prefix}%")).count()
    new_number = str(count + 1).zfill(4)
    return f"{prefix}{new_number}"


def get_order(db: Session, order_id: int):
    return (
        db.query(Order)
        .options(
            joinedload(Order.items)
            .joinedload(OrderItem.logs),
            joinedload(Order.items)
            .joinedload(OrderItem.garmentType)
        )
        .filter(Order.id == order_id)
        .first()
    )

def get_order_by_receipt(db: Session, receipt: str):
    return (
        db.query(Order)
        .options(
            joinedload(Order.items)
            .joinedload(OrderItem.logs),
            joinedload(Order.items)
            .joinedload(OrderItem.garmentType)
        )
        .filter(Order.receiptNumber == receipt)
        .first()
    )

def get_customer_history(db: Session, search: str, limit: int = 20):
    return (
        db.query(OrderItem)
        .join(Order, OrderItem.order_id == Order.id)
        .options(
            joinedload(OrderItem.garmentType),
            joinedload(OrderItem.order),
        )
        .filter(Order.customerName.ilike(f"%{search}%"))
        .order_by(Order.createdAt.desc())
        .limit(limit)
        .all()
    )


def get_orders(db: Session, skip: int = 0, limit: int = 100, search: str = None):
    query = db.query(Order).options(
        joinedload(Order.items).joinedload(OrderItem.garmentType)
    )

    if search:
        query = query.filter(
            Order.customerName.ilike(f"%{search}%") |
            Order.receiptNumber.ilike(f"%{search}%")
        )

    return (
        query
        .order_by(Order.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

async def create_order(
    db: Session,
    order: OrderCreate,
    sketch_files: Optional[List[Optional[UploadFile]]] = None,
):
    """
    Buat order baru beserta item-itemnya.

    Parameters
    ----------
    db          : SQLAlchemy session
    order       : data order (dari JSON / form-data)
    sketch_files: list UploadFile opsional, satu per item (by index).
                  Elemen boleh None bila item tidak punya sketsa.
    """
    receipt = _generate_receipt_number(db)
    storage = get_storage()

    db_order = Order(
        receiptNumber=receipt,
        customerName=order.customerName,
        customerPhone=order.customerPhone,
        deadline=order.deadline,
        totalPrice=order.totalPrice,
        paidAmount=order.paidAmount,
        paymentStatus=order.paymentStatus,
        notes=order.notes,
    )

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # create items
    for idx, item in enumerate(order.items):
        # Ambil file sketsa untuk item ini (jika ada dan bukan placeholder kosong)
        sketch_url: Optional[str] = None
        if sketch_files and idx < len(sketch_files):
            f = sketch_files[idx]
            if f is not None and f.size and f.size > 0:
                sketch_url = await storage.save_async(f, folder="sketches")

        db_item = OrderItem(
            order_id=db_order.id,
            garmentTypeId=item.garmentTypeId,
            description=item.description,
            sketch=sketch_url,
            quantity=item.quantity,
            measurements=item.measurements,
            attributes=item.attributes,
            status=OrderStatus.RECEIVED,
        )

        db.add(db_item)
        db.commit()
        db.refresh(db_item)

        # initial log
        _add_log(
            db,
            db_item.id,
            "received",
            "Pesanan diterima",
            "Admin"
        )

    db.refresh(db_order)
    return db_order

def update_order(db: Session, order_id: int, order: OrderUpdate):
    db_order = get_order(db, order_id)
    if not db_order:
        return None

    update_data = order.dict(exclude_unset=True)

    for key, value in update_data.items():
        setattr(db_order, key, value)

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    return db_order

def delete_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    if not db_order:
        return None
    db.delete(db_order)
    db.commit()
    return db_order


def _add_log(db: Session, order_item_id: int, status: str, note: str, employee_name: str, worker_id: Optional[int] = None, worker_name: Optional[str] = None):
    log = OrderLog(
        order_item_id=order_item_id,
        status=status,
        note=note,
        employeeName=employee_name,
        worker_id=worker_id,
        worker_name=worker_name,
    )
    db.add(log)
    db.commit()


def _complete_phase(db: Session, item: OrderItem, target_status: OrderStatus, note: str):
    last_log = db.query(OrderLog).filter(
        OrderLog.order_item_id == item.id,
        OrderLog.worker_id.isnot(None)
    ).order_by(OrderLog.id.desc()).first()
    worker_id = last_log.worker_id if last_log else None
    worker_name = last_log.worker_name or "Admin" if last_log else "Admin"

    if worker_id:
        worker = db.query(Worker).filter(Worker.id == worker_id).first()
        if worker:
            worker.status = WorkerStatus.IDLE

    item.status = target_status
    _add_log(db, item.id, item.status, note, worker_name, worker_id, worker_name)

def update_item_status_flow(
    db: Session,
    item_id: int,
    worker_id: Optional[int] = None
):
    item = db.query(OrderItem).filter(OrderItem.id == item_id).first()
    if not item:
        return None

    if item.status == OrderStatus.RECEIVED:
        if worker_id:
            worker = db.query(Worker).filter(Worker.id == worker_id).first()
            if worker:
                item.status = OrderStatus.CUTTING
                worker.status = WorkerStatus.WORKING
                _add_log(db, item.id, item.status, "Pesanan mulai dipotong", worker.name, worker.id, worker.name)
    elif item.status == OrderStatus.CUTTING:
        _complete_phase(db, item, OrderStatus.CUTTED, "Pesanan selesai dipotong")
    elif item.status == OrderStatus.CUTTED:
        if worker_id:
            worker = db.query(Worker).filter(Worker.id == worker_id).first()
            if worker:
                item.status = OrderStatus.SEWING
                worker.status = WorkerStatus.WORKING
                _add_log(db, item.id, item.status, "Pesanan mulai dijahit", worker.name, worker.id, worker.name)
    elif item.status == OrderStatus.SEWING:
        _complete_phase(db, item, OrderStatus.SEWED, "Pesanan selesai dijahit")
    elif item.status == OrderStatus.SEWED:
        if worker_id:
            worker = db.query(Worker).filter(Worker.id == worker_id).first()
            if worker:
                item.status = OrderStatus.FINISHING
                worker.status = WorkerStatus.WORKING
                _add_log(db, item.id, item.status, "Pesanan mulai difinishing", worker.name, worker.id, worker.name)
    elif item.status == OrderStatus.FINISHING:
        _complete_phase(db, item, OrderStatus.DONE, "Pesanan selesai difinishing")

    # Jika item berubah ke DONE, cek apakah semua item di order sudah selesai
    if item.status == OrderStatus.DONE:
        order = db.query(Order).filter(Order.id == item.order_id).first()
        if order:
            all_done = all(
                i.status == OrderStatus.DONE
                for i in db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
            )
            if all_done:
                order.updatedAt = datetime.now(timezone.utc)
                db.add(order)

    db.commit()
    db.refresh(item)
    return item