from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional

from ..models.customers import Customer
from ..models.order import Order, OrderItem, GarmentType, PaymentStatus
from ..schemas.customer import CustomerBase as CustomerCreate, CustomerUpdate, CustomerBrief


def create_customer(db: Session, customer: CustomerCreate) -> Customer:
    db_customer = Customer(**customer.model_dump())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer


def get_customer(db: Session, customer_id: int) -> Optional[Customer]:
    return db.query(Customer).filter(Customer.id == customer_id).first()


def get_customers(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None
) -> List[dict]:
    query = db.query(
        Customer,
        func.count(Order.id).label("total_orders")
    ).outerjoin(Order, Customer.id == Order.customer_id)

    if search:
        query = query.filter(
            Customer.name.ilike(f"%{search}%") |
            Customer.phone.ilike(f"%{search}%")
        )

    results = query.group_by(Customer.id).offset(skip).limit(limit).all()

    customers = []
    for c, total in results:
        d = {k: getattr(c, k) for k in (
            "id", "name", "phone",
            "lingkar_badan", "lingkar_pinggang", "lingkar_panggul",
            "panjang_bahu", "panjang_tgn", "panjang_baju", "panjang_rok",
            "createdAt", "updatedAt"
        )}
        d["total_orders"] = total
        customers.append(d)
    return customers


def update_customer(
    db: Session,
    customer_id: int,
    customer: CustomerUpdate
) -> Optional[Customer]:
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        return None

    update_data = customer.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_customer, key, value)

    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer


def delete_customer(db: Session, customer_id: int) -> Optional[Customer]:
    db_customer = get_customer(db, customer_id)
    if not db_customer:
        return None
    db.delete(db_customer)
    db.commit()
    return db_customer


def search_customers(
    db: Session,
    query: str,
    limit: int = 10
) -> List[CustomerBrief]:
    customers = (
        db.query(Customer)
        .filter(
            Customer.name.ilike(f"%{query}%") |
            Customer.phone.ilike(f"%{query}%")
        )
        .limit(limit)
        .all()
    )
    return [
        CustomerBrief(id=c.id, name=c.name, phone=c.phone)
        for c in customers
    ]


def get_customer_detail(db: Session, customer_id: int) -> Optional[dict]:
    customer = get_customer(db, customer_id)
    if not customer:
        return None

    orders = (
        db.query(Order)
        .filter(Order.customer_id == customer_id)
        .order_by(Order.createdAt.desc())
        .all()
    )

    order_items = []
    total_bon = 0.0
    for o in orders:
        unpaid = (o.totalPrice or 0) - (o.paidAmount or 0)
        if o.paymentStatus != PaymentStatus.PAID and unpaid > 0:
            total_bon += unpaid
        order_items.append({
            "id": o.id,
            "receipt_number": o.receiptNumber,
            "total_price": o.totalPrice,
            "paid_amount": o.paidAmount,
            "payment_status": o.paymentStatus.value,
            "status": "",
            "created_at": o.createdAt,
        })

    c = customer
    customer_dict = {k: getattr(c, k) for k in (
        "id", "name", "phone",
        "lingkar_badan", "lingkar_pinggang", "lingkar_panggul",
        "panjang_bahu", "panjang_tgn", "panjang_baju", "panjang_rok",
        "createdAt", "updatedAt"
    )}
    customer_dict["total_orders"] = len(orders)

    return {
        "customer": customer_dict,
        "orders": order_items,
        "total_bon": total_bon,
    }
