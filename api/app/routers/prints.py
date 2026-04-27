from typing import Annotated

from fastapi import APIRouter
from fastapi.params import Depends
from sqlmodel import Session, select, desc

from app.db.database import get_session
from app.db.models import PrintJob, User
from app.dependencies import get_current_active_user
from app.services.printer_service import printer_service

router = APIRouter()

@router.get("/")
def get_prints(
    current_user: Annotated[User, Depends(get_current_active_user)],
    session: Session = Depends(get_session),
):
    return session.exec(select(PrintJob).order_by(desc(PrintJob.finished_at))).all()

@router.get("/active")
def get_active_prints(
    current_user: Annotated[User, Depends(get_current_active_user)],
    session: Session = Depends(get_session),
):
    return session.exec(select(PrintJob).where(PrintJob.status == 1)).all()

@router.get("/stats")
def get_stats(
    current_user: Annotated[User, Depends(get_current_active_user)],
    session: Session = Depends(get_session),
):
    return session.exec(select(PrintJob).order_by(desc(PrintJob.finished_at))).first()

@router.get("/{print_id}")
def get_print(
    print_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    session: Session = Depends(get_session),
):
    return session.get(PrintJob, print_id)

@router.delete("/{print_id}")
def delete_print(
    print_id: int,
    current_user: Annotated[User, Depends(get_current_active_user)],
    session: Session = Depends(get_session),
):
    print_job = session.get(PrintJob, print_id)
    if not print_job:
        return {"ok": False}
    session.delete(print_job)
    session.commit()
    return {"ok": True}


