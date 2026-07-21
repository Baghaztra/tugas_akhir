from sqlalchemy.orm import Session, joinedload
from datetime import datetime, timezone
from typing import List, Optional

from fastapi import UploadFile

from ..models.order import Order, OrderLog, OrderStatus, OrderItem, GarmentType
from ..models.worker import Worker, WorkerStatus
from ..models.customers import Customer
from ..schemas.order import OrderCreate, OrderUpdate, PaymentStatus
from ..storage import save_file_async


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

    # Handle customer linking/creation
    customer_id = order.customer_id
    if customer_id is None and order.items:
        # Create new customer from first item's measurements
        first_item = order.items[0]
        db_customer = Customer(
            name=order.customerName,
            phone=order.customerPhone,
            lingkar_badan=first_item.measurements.get("lingkar_badan"),
            lingkar_pinggang=first_item.measurements.get("lingkar_pinggang"),
            lingkar_panggul=first_item.measurements.get("lingkar_panggul"),
            panjang_bahu=first_item.measurements.get("panjang_bahu"),
            panjang_tgn=first_item.measurements.get("panjang_tgn"),
            panjang_baju=first_item.measurements.get("panjang_baju"),
            panjang_rok=first_item.measurements.get("panjang_rok"),
        )
        db.add(db_customer)
        db.commit()
        db.refresh(db_customer)
        customer_id = db_customer.id
    elif customer_id is not None:
        # Verify customer exists
        db_customer = db.query(Customer).filter(Customer.id == customer_id).first()
        if not db_customer:
            raise ValueError(f"Customer with id {customer_id} not found")
        # Update customer name/phone from order (denormalized)
        db_customer.name = order.customerName
        db_customer.phone = order.customerPhone
        db.add(db_customer)
        db.commit()

    db_order = Order(
        receiptNumber=receipt,
        customer_id=customer_id,
        customerName=order.customerName,
        customerPhone=order.customerPhone,
        deadline=order.deadline,
        totalPrice=order.totalPrice,
        dpAmount=order.dpAmount or 0,
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
                sketch_url = await save_file_async(f, folder="sketches")

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

    update_data = order.model_dump(exclude_unset=True)

    # Apply non-financial fields directly
    for key, value in update_data.items():
        if key not in ('totalPrice', 'dpAmount', 'paymentStatus'):
            setattr(db_order, key, value)

    # Apply dpAmount if provided
    if 'dpAmount' in update_data:
        db_order.dpAmount = update_data['dpAmount'] or 0

    # If paymentStatus explicitly provided (e.g. "Set Lunas"), respect it
    if 'paymentStatus' in update_data:
        db_order.paymentStatus = update_data['paymentStatus']
        if 'totalPrice' in update_data:
            db_order.totalPrice = update_data['totalPrice'] or 0
    else:
        # Derive financial state from current totalPrice + dpAmount
        tp = update_data.get('totalPrice', db_order.totalPrice) or 0
        dp = db_order.dpAmount or 0
        if dp < 0 or tp < 0:
            raise ValueError('Data pembayaran tidak valid')
        if dp > tp and tp > 0:
            raise ValueError('dpAmount tidak boleh melebihi totalPrice')
        db_order.totalPrice = tp
        db_order.paymentStatus = (
            PaymentStatus.PAID if dp >= tp and tp > 0
            else PaymentStatus.PARTIAL if dp > 0
            else PaymentStatus.UNPAID
        )

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


STATUS_REVERSE_MAP = {
    OrderStatus.CUTTING: OrderStatus.RECEIVED,
    OrderStatus.CUTTED: OrderStatus.CUTTING,
    OrderStatus.SEWING: OrderStatus.CUTTED,
    OrderStatus.SEWED: OrderStatus.SEWING,
    OrderStatus.FINISHING: OrderStatus.SEWED,
    OrderStatus.DONE: OrderStatus.FINISHING,
}


def undo_item_status(db: Session, item_id: int):
    """
    Reverse the last status transition for an order item.
    - In_progress → ready (undo assign): worker → Idle
    - Ready → in_progress / done → finishing (undo complete): worker → Working
    """
    item = db.query(OrderItem).filter(OrderItem.id == item_id).first()
    if not item:
        return None

    if item.status not in STATUS_REVERSE_MAP:
        return None

    previous_status = STATUS_REVERSE_MAP[item.status]
    logs = (
        db.query(OrderLog)
        .filter(OrderLog.order_item_id == item.id)
        .order_by(OrderLog.id.desc())
        .limit(2)
        .all()
    )

    if item.status in (OrderStatus.CUTTING, OrderStatus.SEWING, OrderStatus.FINISHING):
        # Undo assign: worker was set to WORKING, set back to IDLE
        last_log = logs[0] if logs else None
        if last_log and last_log.worker_id:
            worker = db.query(Worker).filter(Worker.id == last_log.worker_id).first()
            if worker:
                worker.status = WorkerStatus.IDLE
    else:
        # Undo complete: worker was set to IDLE, set back to WORKING
        if len(logs) >= 2:
            prev_log = logs[1]
            if prev_log and prev_log.worker_id:
                worker = db.query(Worker).filter(Worker.id == prev_log.worker_id).first()
                if worker:
                    worker.status = WorkerStatus.WORKING

    item.status = previous_status
    _add_log(db, item.id, previous_status.value, f"Undo: kembali ke {previous_status.value}", "Admin")

    db.commit()
    db.refresh(item)
    return item