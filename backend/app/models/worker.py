from sqlalchemy import Column, Integer, String, Enum, DateTime
from sqlalchemy.sql import func
import enum
from ..database import Base

class WorkerRole(str, enum.Enum):
    POTONG = "Potong"
    JAHIT = "Jahit"
    FINISHING = "Finishing"

class WorkerStatus(str, enum.Enum):
    WORKING = "Working"
    IDLE = "Idle"

class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), index=True)
    role = Column(Enum(WorkerRole))
    status = Column(Enum(WorkerStatus), default=WorkerStatus.IDLE)
    date_joined = Column(DateTime(timezone=True), server_default=func.now())
