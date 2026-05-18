import json

from fastapi import APIRouter, Depends, HTTPException, Query, Form, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from ..crud import order as crud_order
from ..schemas.order import (
    Order,
    OrderCreate,
    OrderUpdate,
    OrderTracking,
    OrderCreateFormData,
)
from ..database import get_db
from ..models.order import Order as OrderModel, OrderStatus, OrderItem
from ..models.user import User
from ..auth import get_current_user
from ..ranking_logic import sort_by_priority, get_urgency_label, group_by_phase, STAGE_STATUS_MAP

router = APIRouter(
    prefix="/orders",
    tags=["orders"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=Order)
async def create_order(
    data: str = Form(
        ...,
        description=(
            "JSON string berisi data order. "
            "Contoh: {\"customerName\":\"Budi\", \"deadline\":\"2026-05-01\", "
            "\"items\":[{\"garmentType\":\"Kemeja\"}]}"
        ),
    ),
    sketch_files: Optional[List[UploadFile]] = File(
        default=None,
        description=(
            "File sketsa untuk tiap item (urutan harus sama dengan array `items`). "
            "Kirim null / tidak kirim jika item tidak punya sketsa. "
            "Field name: sketch_files"
        ),
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Buat order baru via multipart/form-data.

    - **data**: JSON string (field form) berisi seluruh data order + items.
    - **sketch_files**: file-file gambar sketsa, satu per item (opsional).
    """
    # Parse JSON string → schema
    try:
        raw = json.loads(data)
        form_data = OrderCreateFormData(**raw)
    except (json.JSONDecodeError, Exception) as exc:
        raise HTTPException(status_code=422, detail=f"Format data tidak valid: {exc}")

    # Konversi ke OrderCreate (kompatibel dengan CRUD)
    order_in = OrderCreate(**form_data.model_dump())

    # Normalise: jika tidak ada file sama sekali, jadikan None
    files = sketch_files if sketch_files else None

    return await crud_order.create_order(db=db, order=order_in, sketch_files=files)



@router.get("/", response_model=List[Order])
def read_orders(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud_order.get_orders(
        db,
        skip=skip,
        limit=limit,
        search=search
    )

@router.get("/tracking/{receipt}", response_model=OrderTracking)
def track_order(receipt: str, db: Session = Depends(get_db)):
    """Public endpoint — track order by receipt number."""
    db_order = crud_order.get_order_by_receipt(db, receipt=receipt)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")
    return db_order

@router.get("/admin-work")
def get_admin_work(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Mengembalikan antrian pesanan untuk halaman admin (Kanban).
    Dikelompokkan per phase, lalu dibagi lagi menjadi 'ready' (belum di-assign) 
    dan 'in_progress' (sedang dikerjakan).
    """
    from sqlalchemy.orm import joinedload
    query = db.query(OrderModel).options(
        joinedload(OrderModel.items).joinedload(OrderItem.garmentType),
        joinedload(OrderModel.items).joinedload(OrderItem.logs),
    )
    orders = query.all()

    results = []

    for order in orders:
        for item in order.items:
            # Skip item yang sudah selesai (done)
            if item.status == OrderStatus.DONE:
                continue

            # Cari worker dari log terakhir yang punya worker_id
            worker_log = next((log for log in reversed(item.logs) if log.worker_id is not None), None)

            results.append({
                "order_id": order.id,
                "item_id": item.id,
                "receiptNumber": order.receiptNumber,
                "customerName": order.customerName,
                "garmentType": item.garmentType.name if item.garmentType else None,
                "deadline": order.deadline,
                "status": item.status.value if hasattr(item.status, 'value') else item.status,
                "urgency_label": get_urgency_label(order.deadline),
                "created_at": order.createdAt,
                "attributes": item.attributes,
                "assigned_worker_id": worker_log.worker_id if worker_log else None,
                "assigned_worker_name": worker_log.worker_name if worker_log else None,
            })

    # Sort results
    sorted_results = sort_by_priority(results)

    # Group by phase and status
    PHASE_ORDER = ["cutting", "sewing", "finishing"]
    PHASE_LABELS = {
        "cutting": "Potong",
        "sewing": "Jahit",
        "finishing": "Finishing",
    }

    buckets = {phase: {"ready": [], "in_progress": []} for phase in PHASE_ORDER}

    for task in sorted_results:
        status = task.get("status", "")
        
        if status == "received":
            buckets["cutting"]["ready"].append(task)
        elif status == "cutting":
            buckets["cutting"]["in_progress"].append(task)
        elif status == "cutted":
            buckets["sewing"]["ready"].append(task)
        elif status == "sewing":
            buckets["sewing"]["in_progress"].append(task)
        elif status == "sewed":
            buckets["finishing"]["ready"].append(task)
        elif status == "finishing":
            buckets["finishing"]["in_progress"].append(task)

    phases_response = []
    for phase in PHASE_ORDER:
        phases_response.append({
            "phase": phase,
            "phase_label": PHASE_LABELS.get(phase, phase),
            "ready": buckets[phase]["ready"],
            "in_progress": buckets[phase]["in_progress"],
            "ready_count": len(buckets[phase]["ready"]),
            "in_progress_count": len(buckets[phase]["in_progress"]),
        })

    return {"phases": phases_response}

class ItemStatusUpdate(BaseModel):
    worker_id: Optional[int] = None

@router.put("/items/{item_id}/status")
def update_item_status(
    item_id: int,
    payload: ItemStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = crud_order.update_item_status_flow(
        db,
        item_id=item_id,
        worker_id=payload.worker_id
    )

    if not item:
        raise HTTPException(status_code=404, detail="Item tidak ditemukan")

    return item

@router.get("/{order_id}", response_model=Order)
def read_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_order = crud_order.get_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")
    return db_order


@router.put("/{order_id}", response_model=Order)
def update_order(
    order_id: int,
    order: OrderUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_order = crud_order.update_order(db, order_id=order_id, order=order)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")
    return db_order


@router.delete("/{order_id}", response_model=Order)
def delete_order(
    order_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_order = crud_order.delete_order(db, order_id=order_id)
    if db_order is None:
        raise HTTPException(status_code=404, detail="Pesanan tidak ditemukan")
    return db_order
