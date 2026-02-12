from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.models import init_db
from app.routes import inventory_router, students_router, schools_router, optimize_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="EquipRoute", version="0.1.0", lifespan=lifespan)

app.include_router(inventory_router)
app.include_router(students_router)
app.include_router(schools_router)
app.include_router(optimize_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
