# api/app/core/security.py
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

import jwt
from cryptography.fernet import Fernet
from dotenv import load_dotenv, set_key
from pwdlib import PasswordHash
from sqlmodel import select, Session

from app.db.models import User

API_ROOT = Path(__file__).resolve().parents[2]
ENV_PATH = Path(os.getenv("OPD_ENV_PATH", API_ROOT / ".env"))
load_dotenv(ENV_PATH)

SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production") # TODO: if secret key is not set, generate one and save to .env (but warn the user that existing tokens will be invalidated)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

password_hash = PasswordHash.recommended()
DUMMY_HASH = password_hash.hash("dummypassword")

def _is_valid_fernet_key(key: str) -> bool:
    try:
        Fernet(key.encode())
        return True
    except (TypeError, ValueError):
        return False


def get_or_create_bambu_key() -> str:
    existing = os.getenv("BAMBU_CREDENTIALS_KEY")
    if existing and _is_valid_fernet_key(existing):
        return existing

    new_key = Fernet.generate_key().decode()
    try:
        set_key(ENV_PATH, "BAMBU_CREDENTIALS_KEY", new_key)
    except OSError:
        pass
    os.environ["BAMBU_CREDENTIALS_KEY"] = new_key
    return new_key


def _get_fernet() -> Fernet:
    key = get_or_create_bambu_key()
    return Fernet(key.encode())


def encrypt_secret(value: str) -> str:
    return _get_fernet().encrypt(value.encode()).decode()


def decrypt_secret(value: str) -> str:
    return _get_fernet().decrypt(value.encode()).decode()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return password_hash.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return password_hash.hash(password)

def authenticate_user(username: str, password: str, session: Session) -> User | None:
    user = session.exec(select(User).where(User.username == username)).first()
    if not user:
        verify_password(password, DUMMY_HASH)
        return None
    if not verify_password(password, user.password):
        return None
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
