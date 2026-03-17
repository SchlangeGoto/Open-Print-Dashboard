import os
from dataclasses import dataclass

print("DEBUG ENV:", os.getenv("PRINTER_IP"), os.getenv("PRINTER_SERIAL"))


@dataclass
class Config:
    printer_ip: str = os.getenv("PRINTER_IP", "127.0.0.1")
    printer_serial: str = os.getenv("PRINTER_SERIAL", "")
    printer_access_code: str = os.getenv("PRINTER_ACCESS_CODE", "")
    bambu_email: str = os.getenv("BAMBU_EMAIL", "")
    bambu_password: str = os.getenv("BAMBU_PASSWORD", "")
    database_url: str = os.getenv("DATABASE_URL", "")

config = Config()