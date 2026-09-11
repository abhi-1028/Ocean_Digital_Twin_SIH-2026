from fastapi import FastAPI

from backend.app.api.regions import router as regions_router
from backend.app.api.ocean import router as ocean_router
from backend.app.api.argo import router as argo_router
from backend.app.api.compare import router as compare_router
from backend.app.models.responses import HealthResponse


app = FastAPI(
    title="Ocean Digital Twin API",
    description=(
        "Backend API for numerical ocean model and "
        "Argo observation visualization and validation."
    ),
    version="0.1.0",
)


@app.get(
    "/api/health",
    response_model=HealthResponse,
    tags=["Health"],
)
def health_check():
    return {
        "status": "healthy",
        "service": "Ocean Digital Twin API",
        "version": "0.1.0",
    }


app.include_router(regions_router)
app.include_router(ocean_router)
app.include_router(argo_router)
app.include_router(compare_router)