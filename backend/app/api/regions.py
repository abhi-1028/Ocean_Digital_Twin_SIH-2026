from fastapi import APIRouter

from backend.app.core.regions import REGIONS
from backend.app.models.responses import Region


router = APIRouter(
    prefix="/api/regions",
    tags=["Regions"],
)


@router.get(
    "",
    response_model=list[Region],
)
def get_regions():
    return REGIONS