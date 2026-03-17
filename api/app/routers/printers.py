from fastapi import APIRouter

from app.services.printer_service import printer_service

router = APIRouter()

@router.get("/status")
def get_printer_status():
    return printer_service.get_current_status()

@router.get("/list")
def get_printer_list():
    return printer_service.get_devices()