from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.db.database import create_tables
from app.routers import health, printers, spools, settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_tables()
    yield


app = FastAPI(
    lifespan=lifespan,
    title="Open Print Dashboard API",
)

@app.get("/")
def read_root():
    return {"message": "Yipieee!"}
app.include_router(health.router, tags=["health"])
app.include_router(printers.router, prefix="/printers", tags=["printers"])
app.include_router(spools.router, prefix="/spools", tags=["spools"])
app.include_router(settings.router, prefix="/settings", tags=["settings"])