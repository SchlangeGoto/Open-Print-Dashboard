from datetime import datetime
from sqlmodel import SQLModel, Field
from typing import Optional

class Spool(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    material: str
    brand: str
    color_name: str
    color_hex: str
    full_weight_g: float
    remaining_g: float
    nfc_uid: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

class PrintJob(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    spool_id: Optional[int] = Field(default=None, foreign_key="spool.id")
    title: str                  # print file name
    used_g: float               # grams of filament consumed
    duration_seconds: int       # how long it took
    finished_at: datetime = Field(default_factory=datetime.now)
    bambu_task_id: Optional[str] = None  # ID from Bambu cloud history

class Settings(SQLModel, table=True):
    key: str = Field(primary_key=True)  # e.g. "bambu_token"
    value: str