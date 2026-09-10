from typing import Optional

from fastapi import APIRouter, HTTPException

from backend.app.services.ocean_data import (
    load_model_dataset,
    validate_model_dataset,
    get_available_variables,
)

router = APIRouter(
    prefix="/api/ocean",
    tags=["Ocean Data"],
)


@router.get("/{region_id}")
def get_ocean_data(
    region_id: str,
    variable: str = "temperature",
    depth: Optional[float] = None,
    time: Optional[str] = None,
):
    dataset = None

    try:
        dataset = load_model_dataset(region_id)
        validate_model_dataset(dataset)

        available_variables = get_available_variables(dataset)

        if variable not in available_variables:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Variable '{variable}' not available. "
                    f"Available variables: {available_variables}"
                ),
            )

        data = dataset[variable]

        # Filter by depth
        if depth is not None:
            available_depths = dataset["depth"].values.tolist()

            if depth not in available_depths:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Depth {depth} not available. "
                        f"Available depths: {available_depths}"
                    ),
                )

            data = data.sel(depth=depth)

        # Filter by time
        if time is not None:
            try:
                data = data.sel(time=time)
            except Exception as exc:
                available_times = [
                    str(value)
                    for value in dataset["time"].values
                ]

                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Time '{time}' not available. "
                        f"Available times: {available_times}"
                    ),
                ) from exc

        response = {
            "region_id": region_id,
            "variable": variable,
            "units": data.attrs.get("units"),
            "dimensions": list(data.dims),
            "shape": list(data.shape),
            "latitude": dataset["latitude"].values.tolist(),
            "longitude": dataset["longitude"].values.tolist(),
            "depth": (
                [depth]
                if depth is not None
                else dataset["depth"].values.tolist()
            ),
            "time": (
                [time]
                if time is not None
                else [
                    str(value)
                    for value in dataset["time"].values
                ]
            ),
            "values": data.values.tolist(),
        }

        return response

    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to load ocean data: {exc}",
        ) from exc

    finally:
        if dataset is not None:
            dataset.close()