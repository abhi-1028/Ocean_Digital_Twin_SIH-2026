from fastapi import APIRouter, HTTPException

from backend.app.models.responses import (
    ArgoDataResponse,
    ArgoFloatResponse,
)

from backend.app.services.argo_data import (
    load_argo_data,
    get_float_ids,
)


router = APIRouter(
    prefix="/api/argo",
    tags=["Argo Data"],
)


def serialize_observations(dataframe):
    observations = dataframe.to_dict(orient="records")

    for observation in observations:
        observation["observation_time"] = str(
            observation["observation_time"]
        )

    return observations


@router.get(
    "/{region_id}",
    response_model=ArgoDataResponse,
)
def get_argo_data(region_id: str):

    try:
        dataframe = load_argo_data(region_id)

        return {
            "region_id": region_id,
            "float_ids": get_float_ids(dataframe),
            "observation_count": len(dataframe),
            "observations": serialize_observations(dataframe),
            "source": "observation",
        }

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
            detail=f"Unable to load Argo data: {exc}",
        ) from exc


@router.get(
    "/{region_id}/{float_id}",
    response_model=ArgoFloatResponse,
)
def get_argo_float(
    region_id: str,
    float_id: str,
):

    try:
        dataframe = load_argo_data(region_id)

        float_data = dataframe[
            dataframe["float_id"] == float_id
        ]

        if float_data.empty:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"Argo float '{float_id}' not found "
                    f"in region '{region_id}'"
                ),
            )

        return {
            "region_id": region_id,
            "float_id": float_id,
            "observation_count": len(float_data),
            "observations": serialize_observations(float_data),
            "source": "observation",
        }

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except HTTPException:
        raise

    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=str(exc),
        ) from exc

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to load Argo float data: {exc}",
        ) from exc