from typing import Optional

import numpy as np
from fastapi import APIRouter, HTTPException

from backend.app.models.responses import OceanDataResponse
from backend.app.services.ocean_data import (
    load_model_dataset,
    validate_model_dataset,
    get_available_variables,
)

router = APIRouter(prefix="/api/ocean", tags=["Ocean Data"])


def _flatten_points(data, latitudes, longitudes) -> list[dict]:
    """Convert a 2-D latitude/longitude field into frontend-friendly points."""
    values = np.asarray(data.values, dtype=float)

    # After selecting a single time and depth, the expected shape is
    # latitude x longitude. Keep this defensive for singleton dimensions.
    while values.ndim > 2:
        values = values[0]

    if values.ndim != 2:
        raise ValueError(
            "Selected ocean field must resolve to a latitude/longitude grid."
        )

    points: list[dict] = []
    for lat_index, latitude in enumerate(latitudes):
        for lon_index, longitude in enumerate(longitudes):
            value = float(values[lat_index, lon_index])
            if np.isfinite(value):
                points.append(
                    {
                        "latitude": float(latitude),
                        "longitude": float(longitude),
                        "value": value,
                    }
                )
    return points


@router.get("/{region_id}", response_model=OceanDataResponse)
def get_ocean_data(
    region_id: str,
    variable: str = "temperature",
    depth: Optional[float] = None,
    time: Optional[str] = None,
    max_points: Optional[int] = 1000,
):
    dataset = None

    try:
        if variable not in {"temperature", "salinity", "u", "v"}:
            raise HTTPException(
                status_code=400,
                detail=(
                    f"Variable '{variable}' not available. "
                    "Supported variables: ['temperature', 'salinity', 'u', 'v']"
                ),
            )

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

        if max_points is not None and max_points < 1:
            raise HTTPException(
                status_code=400,
                detail="max_points must be greater than 0",
            )

        data = dataset[variable]

        if depth is not None:
            available_depths = dataset["depth"].values.tolist()
            nearest_depth = min(
                available_depths,
                key=lambda value: abs(float(value) - depth),
            )
            depth_differences = [
                abs(float(value) - depth)
                for value in available_depths
            ]
            nearest_difference = min(depth_differences)
            sorted_depths = sorted(float(value) for value in available_depths)
            spacing = min(
                (b - a for a, b in zip(sorted_depths, sorted_depths[1:])),
                default=0.0,
            )
            allowed_difference = max(spacing / 2.0, 1e-9)
            if nearest_difference > allowed_difference:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Depth {depth} not available. "
                        f"Available depths: {available_depths}"
                    ),
                )
            data = data.sel(depth=nearest_depth)
            selected_depth = float(nearest_depth)
        else:
            selected_depth = float(dataset["depth"].values[0])
            data = data.sel(depth=selected_depth)

        available_times = dataset["time"].values
        if time is not None:
            try:
                data = data.sel(time=time)
                selected_time = str(np.datetime_as_string(data["time"].values, unit="s"))
            except Exception as exc:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        f"Time '{time}' not available. "
                        f"Available times: {[str(value) for value in available_times]}"
                    ),
                ) from exc
        else:
            # Latest model time is the default displayed slice.
            data = data.isel(time=-1)
            selected_time = str(
                np.datetime_as_string(dataset["time"].values[-1], unit="s")
            )

        latitudes = dataset["latitude"].values
        longitudes = dataset["longitude"].values

        # Spatial downsampling while preserving the rectangular grid.
        total_points = len(latitudes) * len(longitudes)
        if max_points is not None and total_points > max_points:
            step = max(1, int(np.ceil(np.sqrt(total_points / max_points))))
            data = data.isel(
                latitude=slice(None, None, step),
                longitude=slice(None, None, step),
            )
            latitudes = latitudes[::step]
            longitudes = longitudes[::step]

        points = _flatten_points(data, latitudes, longitudes)

        return {
            "region_id": region_id,
            "variable": variable,
            "units": data.attrs.get("units"),
            "dimensions": list(data.dims),
            "shape": list(data.shape),
            "latitude": [float(value) for value in latitudes],
            "longitude": [float(value) for value in longitudes],
            "depth": [selected_depth],
            "time": [selected_time],
            "values": data.values.tolist(),
            "points": points,
            "source": "model",
        }

    except FileNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except HTTPException:
        raise
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to load ocean data: {exc}",
        ) from exc
    finally:
        if dataset is not None:
            dataset.close()
