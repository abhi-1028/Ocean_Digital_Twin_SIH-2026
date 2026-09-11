from typing import Optional

from fastapi import APIRouter, HTTPException

from backend.app.models.responses import OceanDataResponse
from backend.app.services.ocean_data import (
    load_model_dataset,
    validate_model_dataset,
    get_available_variables,
)

router = APIRouter(
    prefix="/api/ocean",
    tags=["Ocean Data"],
)


@router.get(
    "/{region_id}",
    response_model=OceanDataResponse,
)
def get_ocean_data(
    region_id: str,
    variable: str = "temperature",
    depth: Optional[float] = None,
    time: Optional[str] = None,
max_points: Optional[int] = 1000,
):
    dataset = None

    try:
        # Load regional ocean model dataset
        dataset = load_model_dataset(region_id)

        # Validate required coordinates
        validate_model_dataset(dataset)

        # Check requested variable
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

        # ---------------------------------------------------------
        # DEPTH FILTER
        # ---------------------------------------------------------
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

        # ---------------------------------------------------------
        # TIME FILTER
        # ---------------------------------------------------------
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

        # ---------------------------------------------------------
        # DOWNSAMPLING
        # ---------------------------------------------------------
        if max_points is not None:

            if max_points < 1:
                raise HTTPException(
                    status_code=400,
                    detail="max_points must be greater than 0",
                )

            lat_size = len(dataset["latitude"])
            lon_size = len(dataset["longitude"])

            total_points = lat_size * lon_size

            if total_points > max_points:

                # Calculate approximate spatial sampling step
                step = int(
                    (total_points / max_points) ** 0.5
                )

                step = max(step, 1)

                # Apply sampling to the data
                data = data.isel(
                    latitude=slice(
                        None,
                        None,
                        step,
                    ),
                    longitude=slice(
                        None,
                        None,
                        step,
                    ),
                )

                # Apply the same sampling to coordinates
                latitude = (
                    dataset["latitude"]
                    .isel(
                        latitude=slice(
                            None,
                            None,
                            step,
                        )
                    )
                    .values
                    .tolist()
                )

                longitude = (
                    dataset["longitude"]
                    .isel(
                        longitude=slice(
                            None,
                            None,
                            step,
                        )
                    )
                    .values
                    .tolist()
                )

            else:
                latitude = (
                    dataset["latitude"]
                    .values
                    .tolist()
                )

                longitude = (
                    dataset["longitude"]
                    .values
                    .tolist()
                )

        else:
            latitude = (
                dataset["latitude"]
                .values
                .tolist()
            )

            longitude = (
                dataset["longitude"]
                .values
                .tolist()
            )

        # ---------------------------------------------------------
        # RESPONSE
        # ---------------------------------------------------------
        response = {
            "region_id": region_id,
            "variable": variable,
            "units": data.attrs.get("units"),

            "dimensions": list(data.dims),

            "shape": list(data.shape),

            "latitude": latitude,

            "longitude": longitude,

            "depth": (
                [depth]
                if depth is not None
                else dataset["depth"]
                .values
                .tolist()
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

    # -------------------------------------------------------------
    # FILE / REGION ERRORS
    # -------------------------------------------------------------
    except FileNotFoundError as exc:

        raise HTTPException(
            status_code=404,
            detail=str(exc),
        ) from exc

    # -------------------------------------------------------------
    # EXPECTED API ERRORS
    # -------------------------------------------------------------
    except HTTPException:
        raise

    # -------------------------------------------------------------
    # UNEXPECTED ERRORS
    # -------------------------------------------------------------
    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=f"Unable to load ocean data: {exc}",
        ) from exc

    # -------------------------------------------------------------
    # ALWAYS CLOSE DATASET
    # -------------------------------------------------------------
    finally:

        if dataset is not None:
            dataset.close()