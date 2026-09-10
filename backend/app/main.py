from fastapi import FastAPI

from backend.app.api.regions import router as regions_router
from backend.app.api.ocean import router as ocean_router

app = FastAPI(
    title="Ocean Digital Twin API",
    description=(
        "Backend API for numerical ocean model and "
        "Argo observation visualization and validation."
    ),
    version="0.1.0",
)


@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Ocean Digital Twin API",
        "version": "0.1.0",
    }
        
app.include_router(ocean_router)
app.include_router(regions_router)