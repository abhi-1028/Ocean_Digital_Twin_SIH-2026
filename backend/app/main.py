from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.api.regions import router as regions_router
from backend.app.api.ocean import router as ocean_router
from backend.app.api.argo import router as argo_router
from backend.app.api.compare import router as compare_router
from backend.app.models.responses import HealthResponse

app = FastAPI(
    title="Ocean Digital Twin API",
    description=(
        "Backend API for numerical ocean model and Argo observation "
        "visualization and validation."
    ),
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "Ocean Digital Twin API",
        "version": "0.2.0",
    }


app.include_router(regions_router)
app.include_router(ocean_router)
app.include_router(argo_router)
app.include_router(compare_router)
