import math
import numpy as np

from .ocean_service import get_ocean_data
from .float_service import get_float


def nearest_index(values, target):
    """Find the coordinate index closest to the requested value."""

    values_array = np.asarray(values, dtype=float)

    return int(
        np.argmin(
            np.abs(values_array - target)
        )
    )


def calculate_bias(model, observation):
    """Bias = mean(Model - Observation)."""

    model_array = np.asarray(model, dtype=float)
    observation_array = np.asarray(observation, dtype=float)

    valid = (
        np.isfinite(model_array)
        & np.isfinite(observation_array)
    )

    if not np.any(valid):
        return 0.0

    return float(
        np.mean(
            model_array[valid] - observation_array[valid]
        )
    )


def calculate_rmse(model, observation):
    """RMSE = sqrt(mean((Model - Observation)^2))."""

    model_array = np.asarray(model, dtype=float)
    observation_array = np.asarray(observation, dtype=float)

    valid = (
        np.isfinite(model_array)
        & np.isfinite(observation_array)
    )

    if not np.any(valid):
        return 0.0

    error = (
        model_array[valid]
        - observation_array[valid]
    )

    return float(
        math.sqrt(
            np.mean(error ** 2)
        )
    )


def get_model_profile(float_data):

    ocean = get_ocean_data()

    latitudes = ocean["coordinates"]["lat"]
    longitudes = ocean["coordinates"]["lon"]
    grid_depths = ocean["coordinates"]["depth"]

    lat_index = nearest_index(
        latitudes,
        float_data["latitude"]
    )

    lon_index = nearest_index(
        longitudes,
        float_data["longitude"]
    )

    model_temperature = []

    for depth in float_data["depth"]:

        depth_index = nearest_index(
            grid_depths,
            depth
        )

        temp = ocean["temperature"][0][
            depth_index
        ][lat_index][lon_index]

        model_temperature.append(float(temp))

    return model_temperature


def get_comparison(float_id: str):

    float_data = get_float(float_id)

    model_temperature = get_model_profile(float_data)

    observation_temperature = float_data["temperature"]

    temperature_bias = calculate_bias(
        model_temperature,
        observation_temperature
    )

    temperature_rmse = calculate_rmse(
        model_temperature,
        observation_temperature
    )

    return {
        "float_id": float_id,

        "depth": float_data["depth"],

        "observation": {
            "temperature": observation_temperature,
            "salinity": float_data["salinity"]
        },

        "model": {
            "temperature": model_temperature,
            "salinity": []
        },

        "metrics": {
            "temperature": {
                "bias": round(temperature_bias, 4),
                "rmse": round(temperature_rmse, 4)
            },

            "salinity": {
                "bias": 0.0,
                "rmse": 0.0
            }
        }
    }