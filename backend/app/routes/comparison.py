from fastapi import APIRouter, HTTPException

from ..models import ComparisonResponse
from ..services.comparsion_service import get_comparison


router = APIRouter(
    prefix="/api",
    tags=["Comparison"]
)


@router.get(
    "/comparison/{float_id}",
    response_model=ComparisonResponse
)
def comparison(float_id: str):

    try:
        return get_comparison(float_id)

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )
