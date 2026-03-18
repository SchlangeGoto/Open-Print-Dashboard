from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.get_db import get_cloud_token_db
from app.services.bambu_client import BambuClient
from app.services.bambu_cloud import BambuCloudClient
from app.services import printer_service as printer_service_module
from app.services.printer_service import init_printer_service

router = APIRouter()

class LoginStartRequest(BaseModel):
    email: str
    password: str

_pending_login = False

class LoginVerifyRequest(BaseModel):
    code: str


@router.post("/login/start")
def login_start(payload: LoginStartRequest):

    if get_cloud_token_db() and get_cloud_token_db().value:
        raise HTTPException(status_code=400, detail="Already logged in")

    global _pending_login
    init_printer_service(BambuClient(), BambuCloudClient(payload.email, payload.password))
    result = printer_service_module.printer_service.login()


    if result.get("require_code"):
        _pending_login = True
        return {
            "requireCode": True,
            "message": "Verification code required. Check your email.",
        }

    return {
        "message": "Login successful",
    }


@router.post("/login/verify")
def login_verify(payload: LoginVerifyRequest):
    global _pending_login

    if not _pending_login:
        raise HTTPException(status_code=400, detail="No pending login session")

    result = printer_service_module.printer_service.login(payload.code)


    if result.get("require_code"):
        raise HTTPException(status_code=400, detail="Verification code still required")

    return {
        "message": "Login successful",
    }