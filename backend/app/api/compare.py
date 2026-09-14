from fastapi import APIRouter, HTTPException

from backend.app.models.responses import ComparisonResponse

from backend.app.services.comparison import compare_float


router = APIRouter(
    prefix="/api/compare",
    tags=["Model Validation"],
)


@router.get("/{region_id}/{float_id}", response_model=ComparisonResponse)
def compare_argo_float(
    region_id: str,
    float_id: str,
    variable: str = "temperature",
):
    try:
        return compare_float(
            region_id=region_id,
            float_id=float_id,
            variable=variable,
        )

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to compare model and Argo data: {exc}",
        ) from exc