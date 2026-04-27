from app.db.db_helper import save_token as db_save_token, save_credentials as db_save_credentials
from app.services.bambu_client import BambuClient
from app.services.bambu_cloud import BambuCloudClient
from app.services.print_job_service import PrintJobService


class PrinterService:
    def __init__(
        self,
        client: BambuClient,
        cloud_client: BambuCloudClient,
    ) -> None:
        self.client = client
        self.cloud_client = cloud_client

    def get_token(self) -> str:
        return self.cloud_client.token

    def login(self, code: str | None = None) -> None:
        self.cloud_client.login(code)
        self.save_token()
        self.save_credentials()

    def save_token(self) -> None:
        db_save_token(self.cloud_client.token)

    def save_credentials(self) -> None:
        db_save_credentials(self.cloud_client.email, self.cloud_client.password)


def _create_printer_service() -> PrinterService:
    cloud_client = BambuCloudClient()
    mqtt_client = BambuClient()
    mqtt_client._print_job_service = PrintJobService(cloud_client, mqtt_client.serial)
    return PrinterService(mqtt_client, cloud_client)


printer_service = _create_printer_service()