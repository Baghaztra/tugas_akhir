from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..crud import order as crud_order
from ..schemas.order import Order, OrderCreate, OrderUpdate, OrderTracking
from ..database import get_db

router = APIRouter(
    prefix="/orders",
    tags=["orders"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=Order)
def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    return crud_order.create_order(db=db, order=order)


@router.get("/", response_model=List[Order])
def read_orders(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = Query(None, description="Filter by status: received|cutting|sewing|finishing|done"),
    search: Optional[str] = Query(None, description="Search by customer name or receipt number"),
    db: Session = Depends(get_db),
):
    return crud_order.get_orders(db, skip=skip, limit=limit, status=status, search=search)


@router.get("/tracking/{receipt}", response_model=OrderTracking)
def track_order(receipt: str, db: Session = Depends(get_db)):
    """Public endpoint — track order by receipt number."""
    db_order = crud_order.get_order_by_receipt(db, receipt=receipt)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")
    return db_order


@router.get("/{order_id}", response_model=Order)
def read_order(order_id: int, db: Session = Depends(get_db)):
    db_order = crud_order.get_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")
    return db_order


@router.put("/{order_id}", response_model=Order)
def update_order(order_id: int, order: OrderUpdate, db: Session = Depends(get_db)):
    db_order = crud_order.update_order(db, order_id=order_id, order=order)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")
    return db_order


@router.delete("/{order_id}", response_model=Order)
def delete_order(order_id: int, db: Session = Depends(get_db)):
    db_order = crud_order.delete_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")
    return db_order
