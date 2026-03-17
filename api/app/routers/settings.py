from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db.database import get_session
from app.db.models import Settings

router = APIRouter()

@router.post("/")
def create_setting(setting: Settings, session: Session = Depends(get_session)):
    session.add(setting)
    session.commit()
    session.refresh(setting)
    return setting

@router.get("/")
def get_settings(session: Session = Depends(get_session)):
    return session.exec(select(Settings)).all()