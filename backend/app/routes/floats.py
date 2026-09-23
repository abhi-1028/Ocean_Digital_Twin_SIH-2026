from fastapi import APIRouter, HTTPException

from ..models import FloatSummary, FloatProfile
from ..services.float_service import (
    get_floats,
    get_float_profile,
)


router = APIRouter(
    prefix="/api",
    tags=["Argo Floats"]
)


@router.get("/floats", response_model=list[FloatSummary])
def floats():

    try:
        return get_floats()

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=500,
            detail=str(error)
        )


@router.get("/floats/{float_id}", response_model=FloatProfile)
def float_profile(float_id: str):

    try:
        return get_float_profile(float_id)

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )