import asyncio
import logging
from contextlib import asynccontextmanager

import requests
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware

from app.core.bambu_exceptions import (
    CloudflareError,
    CodeRequiredError,
    CodeExpiredError,
    CodeIncorrectError,
    NotLoggedInError,
)
from app.core.config import config
from app.db.database import create_tables
from app.routers import health, printers, spools, settings, auth, filaments, prints, users
from app.services.printer_service import printer_service

logger = logging.getLogger("uvicorn.error")

# Maps exception types to HTTP status codes for the global handler
_BAMBU_EXCEPTION_STATUS: dict[type, int] = {
    CloudflareError: 503,
    CodeRequiredError: 401,
    CodeExpiredError: 400,
    CodeIncorrectError: 400,
    NotLoggedInError: 401,
}


async def wait_for_db(max_attempts: int = 30, delay_seconds: float = 2.0) -> None:
    last_error = None

    for attempt in range(1, max_attempts + 1):
        try:
            create_tables()
            return
        except Exception as exc:
            last_error = exc
            if attempt < max_attempts:
                await asyncio.sleep(delay_seconds)

    raise last_error


@asynccontextmanager
async def lifespan(app: FastAPI):
    await wait_for_db()
    printer_service.client.connect()
    yield
    printer_service.client.disconnect()

app = FastAPI(
    lifespan=lifespan,
    title="Open Print Dashboard API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)

    for exc_type, status_code in _BAMBU_EXCEPTION_STATUS.items():
        if isinstance(exc, exc_type):
            return JSONResponse(status_code=status_code, content={"detail": str(exc)})

    if isinstance(exc, requests.RequestException):
        return JSONResponse(
            status_code=502,
            content={"detail": "Upstream request failed"},
        )

    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )


@app.get("/")
def read_root():
    return {"message": "Yipieee!"}


app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(filaments.router, prefix="/filaments", tags=["filaments"])
app.include_router(health.router, tags=["health"])
app.include_router(printers.router, prefix="/printers", tags=["printers"])
app.include_router(prints.router, prefix="/prints", tags=["prints"])
app.include_router(settings.router, prefix="/settings", tags=["settings"])
app.include_router(spools.router, prefix="/spools", tags=["spools"])
app.include_router(users.router, prefix="/users", tags=["users"])
