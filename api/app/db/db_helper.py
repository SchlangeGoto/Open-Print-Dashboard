from sqlmodel import Session

from app.core.security import decrypt_secret, encrypt_secret
from app.db.database import engine
from app.db.models import Settings


def get_credentials() -> dict:
    with Session(engine) as session:
        email_setting = session.get(Settings, "bambu_cloud_email")
        password_setting = session.get(Settings, "bambu_cloud_password")

        if not email_setting or not password_setting:
            return {"email": None, "password": None}

        return {
            "email": decrypt_secret(email_setting.value),
            "password": decrypt_secret(password_setting.value),
        }


def get_cloud_token() -> str | None:
    with Session(engine) as session:
        setting = session.get(Settings, "bambu_cloud_token")
        if not setting:
            return None
        return decrypt_secret(setting.value)


def save_cloud_token(token: str) -> bool:
    with Session(engine) as session:
        setting = session.get(Settings, "bambu_cloud_token")
        if setting:
            setting.value = encrypt_secret(token)
        else:
            session.add(Settings(key="bambu_cloud_token", value=encrypt_secret(token)))

        session.commit()
    return True


def save_credentials(email: str, password: str) -> bool:
    with Session(engine) as session:
        email_setting = session.get(Settings, "bambu_cloud_email")
        if email_setting:
            email_setting.value = encrypt_secret(email)
        else:
            session.add(Settings(key="bambu_cloud_email", value=encrypt_secret(email)))

        password_setting = session.get(Settings, "bambu_cloud_password")
        if password_setting:
            password_setting.value = encrypt_secret(password)
        else:
            session.add(Settings(key="bambu_cloud_password", value=encrypt_secret(password)))
        session.commit()
    return True
