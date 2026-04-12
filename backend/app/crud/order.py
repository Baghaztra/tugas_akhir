from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from ..models.order import Order, OrderLog, OrderStatus, OrderItem
from ..schemas.order import OrderCreate, OrderUpdate


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
            joinedload(Order.items).joinedload(OrderItem.logs)
        )
        .filter(Order.id == order_id)
        .first()
    )

def get_order_by_receipt(db: Session, receipt: str):
    return (
        db.query(Order)
        .options(
            joinedload(Order.items).joinedload(OrderItem.logs)
        )
        .filter(Order.receiptNumber == receipt)
        .first()
    )

def get_orders(db: Session,skip: int = 0,limit: int = 100,search: str = None):
    query = db.query(Order)

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

def create_order(db: Session, order: OrderCreate):
    receipt = _generate_receipt_number(db)

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
    for item in order.items:
        db_item = OrderItem(
            order_id=db_order.id,
            garmentType=item.garmentType,
            description=item.description,
            quantity=item.quantity,
            measurements=item.measurements,
            attributes=item.attributes,
            status=OrderStatus.RECEIVED
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


def _add_log(db: Session, order_item_id: int, status: str, note: str, employee_name: str):
    log = OrderLog(
        order_item_id=order_item_id,
        status=status,
        note=note,
        employeeName=employee_name,
    )
    db.add(log)
    db.commit()

def update_item_status(
    db: Session,
    item_id: int,
    status: str,
    note: str = "",
    employee: str = "Admin"
):
    item = db.query(OrderItem).filter(OrderItem.id == item_id).first()
    if not item:
        return None

    old_status = item.status
    item.status = status

    db.add(item)
    db.commit()
    db.refresh(item)

    if old_status != status:
        _add_log(db, item.id, status, note, employee)

    return item