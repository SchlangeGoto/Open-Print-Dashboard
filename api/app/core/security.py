# api/app/core/security.py
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

import jwt
from cryptography.fernet import Fernet
from dotenv import set_key
from pwdlib import PasswordHash

SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production") # TODO: if secret key is not set, generate one and save to .env (but warn the user that existing tokens will be invalidated)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
ENV_PATH = Path(__file__).resolve().parents[3] / ".env"

password_hash = PasswordHash.recommended()

def get_or_create_bambu_key() -> str:
    existing = os.getenv("BAMBU_CREDENTIALS_KEY")
    if existing:
        return existing

    new_key = Fernet.generate_key().decode()
    set_key(ENV_PATH, "BAMBU_CREDENTIALS_KEY", new_key)
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


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)