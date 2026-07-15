from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..crud import customer as crud_customer
from ..schemas.customer import (
    Customer,
    CustomerBase as CustomerCreate,
    CustomerUpdate,
    CustomerBrief,
)
from ..database import get_db
from ..auth import get_current_user
from ..models.user import User

router = APIRouter(
    prefix="/customers",
    tags=["customers"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=Customer)
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud_customer.create_customer(db, customer)


@router.get("/", response_model=List[Customer])
def read_customers(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud_customer.get_customers(db, skip=skip, limit=limit, search=search)


@router.get("/search", response_model=List[CustomerBrief])
def search_customers(
    query: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud_customer.search_customers(db, query, limit)


@router.get("/{customer_id}", response_model=Customer)
def read_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_customer = crud_customer.get_customer(db, customer_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Pelanggan tidak ditemukan")
    return db_customer


@router.put("/{customer_id}", response_model=Customer)
def update_customer(
    customer_id: int,
    customer: CustomerUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_customer = crud_customer.update_customer(db, customer_id, customer)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Pelanggan tidak ditemukan")
    return db_customer


@router.delete("/{customer_id}", response_model=Customer)
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_customer = crud_customer.delete_customer(db, customer_id)
    if not db_customer:
        raise HTTPException(status_code=404, detail="Pelanggan tidak ditemukan")
    return db_customer