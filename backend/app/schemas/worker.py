from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class WorkerRole(str, Enum):
    POTONG = "Potong"
    JAHIT = "Jahit"
    FINISHING = "Finishing"
    MAGANG = "Magang"
    OTHER = "Other"


class WorkerStatus(str, Enum):
    WORKING = "Working"
    IDLE = "Idle"


class WorkerBase(BaseModel):
    name: str
    role: WorkerRole
    status: Optional[WorkerStatus] = WorkerStatus.IDLE

class WorkerUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[WorkerRole] = None
    status: Optional[WorkerStatus] = None

class Worker(WorkerBase):
    id: int
    date_joined: datetime
    is_deleted: bool = False

    class Config:
        from_attributes = True

# Performance
class DailyPerf(BaseModel):
    date: str
    count: int


class WorkerPerformance(BaseModel):
    worker_id: int
    worker_name: str
    performance_score: float
    total_finished: int
    daily: List[DailyPerf] = []


# Tasks
class WorkerTask(BaseModel):
    log_id: int
    order_item_id: int
    receipt_number: str
    customer_name: str
    garment_type: str
    status: str
    completed_at: str
