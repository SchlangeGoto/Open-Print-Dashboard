from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.db.database import create_tables
from app.routers import health, printers, spools, settings, auth


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()

    yield


app = FastAPI(
    lifespan=lifespan,
    title="Open Print Dashboard API",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Yipieee!"}
app.include_router(health.router, tags=["health"])
app.include_router(printers.router, prefix="/printers", tags=["printers"])
app.include_router(spools.router, prefix="/spools", tags=["spools"])
app.include_router(settings.router, prefix="/settings", tags=["settings"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])