from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.database import get_session
from app.db.models import Settings, User
from app.dependencies import get_current_active_user

router = APIRouter()

@router.post("/")
def create_setting(
    setting: Settings,
    current_user: Annotated[User, Depends(get_current_active_user)],
    session: Session = Depends(get_session),
):
    existing = session.get(Settings, setting.key)
    if existing:
        existing.value = setting.value
    else:
        session.add(Settings(key=setting.key, value=setting.value))
    session.commit()
    return setting

@router.get("/")
def get_settings(
    current_user: Annotated[User, Depends(get_current_active_user)],
    session: Session = Depends(get_session),
):
    return session.exec(select(Settings)).all()

@router.get("/{key}")
def get_setting(
    key: str,
    current_user: Annotated[User, Depends(get_current_active_user)],
    session: Session = Depends(get_session),
):
    setting = session.get(Settings, key)
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return setting