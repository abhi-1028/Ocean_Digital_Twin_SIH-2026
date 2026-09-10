from fastapi import APIRouter

from backend.app.core.regions import REGIONS

router = APIRouter(
    prefix="/api/regions",
    tags=["Regions"],
)


@router.get("")
def get_regions():
    return REGIONS