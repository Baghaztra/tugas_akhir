from sqlalchemy.orm import Session
from datetime import datetime
from ..models.order import Order, OrderLog, OrderStatus
from ..schemas.order import OrderCreate, OrderUpdate


def _generate_receipt_number(db: Session) -> str:
    """Generate a unique receipt number in format RES-YYYY-NNN."""
    year = datetime.now().year
    # Count all orders in current year to get next number
    prefix = f"RES-{year}-"
    count = db.query(Order).filter(Order.receiptNumber.like(f"{prefix}%")).count()
    return f"{prefix}{str(count + 1).zfill(3)}"


def get_order(db: Session, order_id: int):
    return db.query(Order).filter(Order.id == order_id).first()


def get_order_by_receipt(db: Session, receipt: str):
    return db.query(Order).filter(Order.receiptNumber == receipt).first()


def get_orders(db: Session, skip: int = 0, limit: int = 100, status: str = None, search: str = None):
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    if search:
        query = query.filter(
            Order.customerName.ilike(f"%{search}%") |
            Order.receiptNumber.ilike(f"%{search}%")
        )
    return query.order_by(Order.id.desc()).offset(skip).limit(limit).all()


def create_order(db: Session, order: OrderCreate):
    receipt = _generate_receipt_number(db)
    db_order = Order(
        receiptNumber=receipt,
        customerName=order.customerName,
        customerPhone=order.customerPhone,
        garmentType=order.garmentType,
        description=order.description,
        measurements=order.measurements or {},
        status=OrderStatus.RECEIVED,
        paymentStatus=order.paymentStatus,
        totalPrice=order.totalPrice,
        paidAmount=order.paidAmount,
        deadline=order.deadline,
        assignedTo=order.assignedTo,
        notes=order.notes,
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Add initial log entry
    _add_log(db, db_order.id, "received", "Pesanan diterima", "Admin")
    db.refresh(db_order)
    return db_order


def update_order(db: Session, order_id: int, order: OrderUpdate):
    db_order = get_order(db, order_id)
    if not db_order:
        return None

    old_status = db_order.status
    update_data = order.dict(exclude_unset=True, exclude={"logNote", "logEmployeeName"})

    for key, value in update_data.items():
        setattr(db_order, key, value)

    db.add(db_order)
    db.commit()
    db.refresh(db_order)

    # Auto-add log when status changes
    new_status = update_data.get("status")
    if new_status and new_status != old_status:
        note = order.logNote or ""
        employee = order.logEmployeeName or "Admin"
        _add_log(db, db_order.id, new_status, note, employee)
        db.refresh(db_order)

    return db_order


def delete_order(db: Session, order_id: int):
    db_order = get_order(db, order_id)
    if not db_order:
        return None
    db.delete(db_order)
    db.commit()
    return db_order


def _add_log(db: Session, order_id: int, status: str, note: str, employee_name: str):
    log = OrderLog(
        order_id=order_id,
        status=status,
        note=note,
        employeeName=employee_name,
    )
    db.add(log)
    db.commit()
