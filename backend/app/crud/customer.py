from sqlalchemy.orm import Session
from typing import List, Optional

from ..models.customers import Customer
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
) -> List[Customer]:
    query = db.query(Customer)

    if search:
        query = query.filter(
            Customer.name.ilike(f"%{search}%") |
            Customer.phone.ilike(f"%{search}%")
        )

    return query.offset(skip).limit(limit).all()


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