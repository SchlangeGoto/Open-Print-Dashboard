from fastapi import HTTPException
from sqlmodel import Session

from app.db.database import engine
from app.db.models import Settings


def get_cloud_token_db():
    with Session(engine) as session:
        return session.get(Settings, "bambu_cloud_token")
