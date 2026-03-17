from sqlmodel import Session
from app.db.database import engine
from app.db.models import Settings
from app.core.config import config
from app.services.bambu_client import BambuClient
from app.services.bambu_cloud import BambuCloudClient



class PrinterService:
    def __init__(
        self,
        client: BambuClient | None = None,
        cloud_client: BambuCloudClient | None = None,
    ) -> None:
        self.client = client or BambuClient()
        self.cloud_client = cloud_client or BambuCloudClient(
            config.bambu_email,
            config.bambu_password,
        )

    def get_current_status(self) -> dict[str, object]:
        return self.client.get_status()

    def get_devices(self) -> list[dict]:
        if not self.cloud_client.token:
            self.cloud_client.login()
        return self.cloud_client.get_devices()

    def get_token(self) -> str:
        return self.cloud_client.token

    def login(self) -> bool:
        success = self.cloud_client.login()
        if success:
            self.save_token()
        return success

    def save_token(self) -> None:
        with Session(engine) as session:
            session.add(Settings(key="bambu_cloud_token", value=self.cloud_client.token))
            session.commit()


printer_service = PrinterService()