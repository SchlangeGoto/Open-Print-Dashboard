import requests

BASE_URL = "https://api.bambulab.com"

class BambuCloudClient:
    """Small client for the Bambu Lab cloud API.

    The client authenticates with email/password and stores the returned
    bearer token in memory for subsequent requests.

    Notes:
    - Some accounts require an email verification code during login.
    - `login()` must be called before any request method.
    """
    def __init__(self, email: str, password: str):
        self.email = email
        self.password = password
        self.token = None
        self.user_id = None

    def login(self) -> bool:
        """Authenticate and store the access token.

        If the API requests email-based verification, the user is prompted
        interactively for the code and the login request is repeated.
        """
        resp = requests.post(
            f"{BASE_URL}/v1/user-service/user/login",
            json={"account": self.email, "password": self.password},
        )
        resp.raise_for_status()
        data = resp.json()

        # Bambu returns loginType="verifyCode" if 2FA email was sent
        if data.get("loginType") == "verifyCode":
            code = input("Enter the verification code from your email: ") # TODO: make the input field a form on the next.js site
            resp = requests.post(
                f"{BASE_URL}/v1/user-service/user/login",
                json={
                    "account": self.email,
                    "password": self.password,
                    "code": code,
                },
            )
            resp.raise_for_status()
            data = resp.json()

        self.token = data["accessToken"]  # valid ~3 months
        return True

    def _headers(self) -> dict:
        """Return authorization headers for authenticated requests."""
        return {"Authorization": f"Bearer {self.token}"}

    def get_user_id(self) -> str:
        """Fetch and cache the current user's Bambu Cloud user id."""
        resp = requests.get(
            f"{BASE_URL}/v1/design-user-service/my/preference",
            headers=self._headers(),
        )
        resp.raise_for_status()
        self.user_id = resp.json()["uid"]
        return self.user_id

    def get_devices(self) -> list[dict]:
        """List all printers on your account."""
        resp = requests.get(
            f"{BASE_URL}/v1/iot-service/api/user/bind",
            headers=self._headers(),
        )
        resp.raise_for_status()
        return resp.json().get("devices", [])

    def get_print_tasks(self, limit: int = 20) -> list[dict]:
        """Return recent print tasks for the authenticated account."""
        resp = requests.get(
            f"{BASE_URL}/v1/user-service/my/tasks",
            headers=self._headers(),
            params={"limit": limit},
        )
        resp.raise_for_status()
        return resp.json().get("hits", [])

    def get_filament_profiles(self) -> list[dict]:
        """Return available filament/slicer setting profiles."""
        resp = requests.get(
            f"{BASE_URL}/v1/iot-service/api/slicer/setting",
            headers=self._headers(),
            params={"version": "1.0"},
        )
        resp.raise_for_status()
        return resp.json()