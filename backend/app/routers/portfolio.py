from typing import List, Optional
from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from ..crud import portfolio as crud_portfolio
from ..schemas.portfolio import PortfolioItemCreate, PortfolioItemRead, PortfolioItemUpdate
from ..database import get_db
from ..storage import save_file, delete_file
from ..auth import get_current_user
from ..models.user import User

router = APIRouter(
    prefix="/portfolio",
    tags=["portfolio"],
)


@router.get("/", response_model=List[PortfolioItemRead])
def list_portfolio(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Endpoint publik — daftar semua item portofolio."""
    return crud_portfolio.get_all(db, skip=skip, limit=limit)


@router.post("/", response_model=PortfolioItemRead)
def create_portfolio_item(
    title: str = Form(...),
    category: str = Form(...),
    description: Optional[str] = Form(""),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Buat item portofolio baru (opsional: sertakan gambar)."""
    image_url: Optional[str] = None
    if image and image.filename:
        image_url = save_file(image, folder="portfolio")

    data = PortfolioItemCreate(title=title, category=category, description=description)
    return crud_portfolio.create(db, data, image_url=image_url)


@router.put("/{item_id}", response_model=PortfolioItemRead)
def update_portfolio_item(
    item_id: int,
    data: PortfolioItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update metadata item (title, category, description) — tanpa mengubah gambar."""
    item = crud_portfolio.update(db, item_id, data)
    if item is None:
        raise HTTPException(status_code=404, detail="Item portofolio tidak ditemukan")
    return item


@router.post("/{item_id}/image", response_model=PortfolioItemRead)
def update_portfolio_image(
    item_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ganti gambar item portofolio yang sudah ada."""
    existing = crud_portfolio.get_one(db, item_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Item portofolio tidak ditemukan")

    if existing.image:
        delete_file(existing.image)

    new_url = save_file(image, folder="portfolio")
    item = crud_portfolio.update_image(db, item_id, new_url)
    return item


@router.delete("/{item_id}", response_model=PortfolioItemRead)
def delete_portfolio_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Hapus item portofolio beserta file gambarnya."""
    existing = crud_portfolio.get_one(db, item_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Item portofolio tidak ditemukan")

    # Hapus file gambar dari storage terlebih dahulu
    if existing.image:
        delete_file(existing.image)

    item = crud_portfolio.delete(db, item_id)
    return item
