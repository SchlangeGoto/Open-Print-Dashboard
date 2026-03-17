from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from app.db.database import get_session
from app.db.models import Spool

router = APIRouter()

@router.post("/")
def create_spool(spool: Spool, session: Session = Depends(get_session)):
    session.add(spool)
    session.commit()
    session.refresh(spool)
    return spool

@router.get("/")
def list_spools(session: Session = Depends(get_session)):
    return session.exec(select(Spool)).all()