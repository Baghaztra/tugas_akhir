from typing import List, Optional
from sqlalchemy.orm import Session

from ..models.portfolio import PortfolioItem
from ..schemas.portfolio import PortfolioItemCreate, PortfolioItemUpdate


def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[PortfolioItem]:
    return db.query(PortfolioItem).order_by(PortfolioItem.id.desc()).offset(skip).limit(limit).all()


def get_one(db: Session, item_id: int) -> Optional[PortfolioItem]:
    return db.query(PortfolioItem).filter(PortfolioItem.id == item_id).first()


def create(db: Session, data: PortfolioItemCreate, image_url: Optional[str] = None) -> PortfolioItem:
    item = PortfolioItem(
        title=data.title,
        category=data.category,
        description=data.description,
        image=image_url,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update(db: Session, item_id: int, data: PortfolioItemUpdate) -> Optional[PortfolioItem]:
    item = get_one(db, item_id)
    if item is None:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


def update_image(db: Session, item_id: int, image_url: str) -> Optional[PortfolioItem]:
    item = get_one(db, item_id)
    if item is None:
        return None
    item.image = image_url
    db.commit()
    db.refresh(item)
    return item


def delete(db: Session, item_id: int) -> Optional[PortfolioItem]:
    item = get_one(db, item_id)
    if item is None:
        return None
    db.delete(item)
    db.commit()
    return item
