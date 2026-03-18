from sqlmodel import Session
from app.db.database import engine
from app.db.models import Settings
from app.services.bambu_client import BambuClient
from app.services.bambu_cloud import BambuCloudClient



class PrinterService:
    def __init__(
        self,
        client: BambuClient | None = None,
        cloud_client: BambuCloudClient | None = None,
    ) -> None:
        self.client = client
        self.cloud_client = cloud_client

    def get_current_status(self) -> dict[str, object]:
        return self.client.get_status()

    def get_devices(self) -> list[dict]:
        if not self.cloud_client.token:
            self.cloud_client.login()
        return self.cloud_client.get_devices()

    def get_token(self) -> str:
        return self.cloud_client.token

    def login(self, code: str | None = None) -> dict:
        result = self.cloud_client.login(code)
        if not result.get("require_code"):
            self.save_token()
        return result

    def save_token(self) -> None:
        with Session(engine) as session:
            session.add(Settings(key="bambu_cloud_token", value=self.cloud_client.token))
            session.commit()


printer_service = PrinterService()

def init_printer_service(client: BambuClient, cloud_client: BambuCloudClient):
    global printer_service
    printer_service = PrinterService(client, cloud_client)
