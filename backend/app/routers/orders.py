from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..crud import order as crud_order
from ..schemas.order import Order, OrderCreate, OrderUpdate, OrderTracking
from ..database import get_db
from ..models.order import Order as OrderModel, OrderStatus
from ..ranking_logic import sort_by_priority, get_urgency_label, STAGE_STATUS_MAP

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
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return crud_order.get_orders(
        db,
        skip=skip,
        limit=limit,
        search=search
    )

# ─── Priority (Employee Tasks) — HARUS sebelum /{order_id} ───────────────────

@router.get("/priority")
def get_priority_orders(
    stage: Optional[str] = Query(
        default="semua",
        description="Filter tahap: potong | jahit | finishing | semua",
    ),
    db: Session = Depends(get_db),
):
    stage_key = (stage or "semua").lower()
    target_status = STAGE_STATUS_MAP.get(stage_key)

    query = db.query(OrderModel)

    orders = query.all()

    results = []

    for order in orders:
        for item in order.items:

            if item.status == OrderStatus.DONE:
                continue

            if target_status and item.status != target_status:
                continue

            results.append({
                "order_id": order.id,
                "item_id": item.id,
                "receiptNumber": order.receiptNumber,
                "customerName": order.customerName,
                "garmentType": item.garmentType,
                "deadline": order.deadline,
                "status": item.status,
                "urgency_label": get_urgency_label(order.deadline),
            })

    sorted_results = sort_by_priority(results)

    return sorted_results


@router.get("/tracking/{receipt}", response_model=OrderTracking)
def track_order(receipt: str, db: Session = Depends(get_db)):
    """Public endpoint — track order by receipt number."""
    db_order = crud_order.get_order_by_receipt(db, receipt=receipt)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")
    return db_order

@router.put("/items/{item_id}/status")
def update_item_status(
    item_id: int,
    status: OrderStatus,
    note: Optional[str] = "",
    employee: Optional[str] = "Admin",
    db: Session = Depends(get_db)
):
    item = crud_order.update_item_status(
        db,
        item_id=item_id,
        status=status,
        note=note,
        employee=employee
    )

    if not item:
        raise HTTPException(status_code=404, detail="Item tidak ditemukan")

    return item

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
