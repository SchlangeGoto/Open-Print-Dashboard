from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlmodel import Session, select

from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from app.db.database import get_session
from app.db.models import User, Settings, Token
from app.dependencies import get_current_active_user
from app.services.printer_service import printer_service

router = APIRouter()


class UserCreate(BaseModel):
    username: str
    password: str


@router.get("/")
def get_user():
    return printer_service.cloud_client.get_user_profile()


@router.get("/exists")
def user_exists(session: Session = Depends(get_session)):
    """Check if any local user account has been created (setup done?)."""
    user = session.exec(select(User)).first()
    return {"exists": user is not None}


@router.post("/register")
def register_user(payload: UserCreate, session: Session = Depends(get_session)):
    """Create the default admin user — only works if no user exists yet."""
    existing = session.exec(select(User)).first()
    if existing:
        raise HTTPException(status_code=400, detail="A user already exists")

    # The docs say to use pwdlib to hash — store only the hash, no manual salt needed
    user = User(username=payload.username, password=get_password_hash(payload.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return {"ok": True, "username": user.username}


@router.post("/token", response_model=Token)
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Session = Depends(get_session),
):
    """
    The docs say this endpoint MUST accept form data (not JSON)
    and return access_token + token_type.
    """
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me")
def read_users_me(current_user: Annotated[User, Depends(get_current_active_user)]):
    """Protected route — the docs use this as the example of a secured endpoint."""
    return {"username": current_user.username}


@router.get("/setup-status")
def get_setup_status(session: Session = Depends(get_session)):
    """Return which setup steps are completed."""
    user_done = session.exec(select(User)).first() is not None
    bambu_done = session.get(Settings, "bambu_cloud_token") is not None
    printer_done = session.get(Settings, "printer_ip") is not None

    return {
        "user_created": user_done,
        "bambu_logged_in": bambu_done,
        "printer_configured": printer_done,
        "setup_complete": user_done and bambu_done and printer_done,
    }