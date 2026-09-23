from fastapi import APIRouter, HTTPException, Query

from ..models import OceanResponse
from ..services.ocean_service import get_ocean_data


router = APIRouter(
    prefix="/api",
    tags=["Ocean"]
)


@router.get(
    "/ocean",
    response_model=OceanResponse
)
def ocean(
    time_index: int = Query(
        0,
        ge=0,
        description="Time index in the Copernicus dataset"
    ),
    depth_index: int = Query(
        0,
        ge=0,
        description="Depth index in the Copernicus dataset"
    )
):

    try:
        return get_ocean_data(
            time_index=time_index,
            depth_index=depth_index
        )

    except FileNotFoundError as error:
        raise HTTPException(
            status_code=404,
            detail=str(error)
        )

    except IndexError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Ocean data processing failed: {error}"
        )