from pydantic import BaseModel
from typing import Optional
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

class WorkerCreate(WorkerBase):
    pass

class WorkerUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[WorkerRole] = None
    status: Optional[WorkerStatus] = None

class Worker(WorkerBase):
    id: int
    date_joined: datetime

    class Config:
        from_attributes = True
