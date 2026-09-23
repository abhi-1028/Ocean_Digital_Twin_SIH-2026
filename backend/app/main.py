from fastapi import FastAPI

from .routes.ocean import router as ocean_router
from .routes.floats import router as floats_router
from .routes.comparison import router as comparison_router


app = FastAPI(
    title="Ocean Digital Twin API",
    description="Backend API for ocean model data and observations",
    version="1.0.0",
)


@app.get("/")
def root():
    return {
        "status": "online",
        "message": "Ocean Digital Twin backend is running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }


app.include_router(ocean_router)
app.include_router(floats_router)
app.include_router(comparison_router)