from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class WorkerRole(str, Enum):
    POTONG = "Potong"
    JAHIT = "Jahit"
    FINISHING = "Finishing"


class WorkerStatus(str, Enum):
    WORKING = "Working"
    IDLE = "Idle"


class WorkerBase(BaseModel):
    name: str
    role: WorkerRole
    status: Optional[WorkerStatus] = WorkerStatus.IDLE
    wagePerPiece: Optional[float] = 0
    currentTask: Optional[str] = None
    weeklyCompleted: Optional[int] = 0


class WorkerCreate(WorkerBase):
    pass


class WorkerUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[WorkerRole] = None
    status: Optional[WorkerStatus] = None
    wagePerPiece: Optional[float] = None
    currentTask: Optional[str] = None
    weeklyCompleted: Optional[int] = None


class Worker(WorkerBase):
    id: int
    date_joined: datetime

    class Config:
        from_attributes = True


# ─── Wages ───────────────────────────────────────────────────────────────────

class WorkerWage(BaseModel):
    worker_id: int
    worker_name: str
    period: str                 # e.g. "2026-03-20 - 2026-03-26"
    completed_items: int
    rate_per_item: float
    total_wage: float


# ─── Performance ─────────────────────────────────────────────────────────────

class DailyPerf(BaseModel):
    date: str       # YYYY-MM-DD
    count: int


class WorkerPerformance(BaseModel):
    worker_id: int
    worker_name: str
    performance_score: float    # avg items/day over period
    total_finished: int
    daily: List[DailyPerf] = []
