import json
import math
from pathlib import Path

import numpy as np


# ---------------------------------------------------------
# Paths
# ---------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
MOCK_DIR = BASE_DIR / "data" / "mock"

MOCK_DIR.mkdir(parents=True, exist_ok=True)


# ---------------------------------------------------------
# Configuration
# ---------------------------------------------------------

REGION_NAME = "Bay of Bengal"

LAT_MIN = 5.0
LAT_MAX = 23.0

LON_MIN = 78.0
LON_MAX = 100.0

DEPTH_MIN = 0.0
DEPTH_MAX = 1000.0

TIMESTAMP = "2026-01-15T00:00:00Z"


# Manageable browser-sized grid
LAT_COUNT = 20
LON_COUNT = 25
DEPTH_COUNT = 15


# ---------------------------------------------------------
# Coordinates
# ---------------------------------------------------------

latitudes = np.linspace(LAT_MIN, LAT_MAX, LAT_COUNT)
longitudes = np.linspace(LON_MIN, LON_MAX, LON_COUNT)
depths = np.linspace(0, 1000, DEPTH_COUNT)


# ---------------------------------------------------------
# Generate model fields
#
# Array layout:
#
# temperature[depth][lat][lon]
# salinity[depth][lat][lon]
# u[depth][lat][lon]
# v[depth][lat][lon]
# ---------------------------------------------------------

temperature = np.zeros(
    (DEPTH_COUNT, LAT_COUNT, LON_COUNT),
    dtype=float
)

salinity = np.zeros(
    (DEPTH_COUNT, LAT_COUNT, LON_COUNT),
    dtype=float
)

u = np.zeros(
    (DEPTH_COUNT, LAT_COUNT, LON_COUNT),
    dtype=float
)

v = np.zeros(
    (DEPTH_COUNT, LAT_COUNT, LON_COUNT),
    dtype=float
)


for d, depth in enumerate(depths):

    # Temperature decreases with depth.
    depth_effect = 0.018 * depth

    for i, lat in enumerate(latitudes):

        for j, lon in enumerate(longitudes):

            # Smooth spatial variations.
            spatial_temperature = (
                27.5
                + 0.10 * (lat - 14)
                - 0.05 * (lon - 89)
            )

            temp_value = (
                spatial_temperature
                - depth_effect
                + 0.8 * math.sin(math.radians(lat * 5))
            )

            # Keep temperatures realistic for demonstration.
            temp_value = max(5.0, min(31.0, temp_value))

            temperature[d, i, j] = temp_value

            # Salinity gradually increases with depth.
            salinity_value = (
                34.2
                + 0.0012 * depth
                + 0.015 * (lat - 14)
                + 0.01 * math.sin(math.radians(lon * 4))
            )

            salinity[d, i, j] = salinity_value

            # Simple synthetic current field.
            u[d, i, j] = (
                0.35
                * math.sin(math.radians(lat * 8))
                * math.cos(math.radians(depth / 10))
            )

            v[d, i, j] = (
                0.25
                * math.cos(math.radians(lon * 5))
                * math.exp(-depth / 800)
            )


# ---------------------------------------------------------
# Generate mock Argo floats
# ---------------------------------------------------------

float_locations = [
    ("ARGO_001", 14.2, 88.3),
    ("ARGO_002", 16.8, 84.7),
    ("ARGO_003", 10.5, 92.1),
    ("ARGO_004", 19.1, 81.8),
    ("ARGO_005", 7.8, 96.2),
]


profile_depths = [
    0,
    50,
    100,
    200,
    300,
    500,
    750,
    1000,
]


def nearest_index(values, target):
    """
    Find the nearest coordinate index.
    Used only for creating mock observations.
    """
    return int(np.argmin(np.abs(values - target)))


floats = []


for float_id, latitude, longitude in float_locations:

    observation_temperature = []
    observation_salinity = []

    lat_index = nearest_index(latitudes, latitude)
    lon_index = nearest_index(longitudes, longitude)

    for depth in profile_depths:

        depth_index = nearest_index(depths, depth)

        model_temp = temperature[
            depth_index,
            lat_index,
            lon_index
        ]

        model_salinity = salinity[
            depth_index,
            lat_index,
            lon_index
        ]

        # Small synthetic observation differences.
        temp_difference = (
            0.25 * math.sin(depth / 180)
            + 0.08
        )

        salinity_difference = (
            0.05 * math.cos(depth / 250)
            - 0.02
        )

        observation_temperature.append(
            round(model_temp + temp_difference, 3)
        )

        observation_salinity.append(
            round(model_salinity + salinity_difference, 3)
        )

    floats.append(
        {
            "id": float_id,
            "latitude": latitude,
            "longitude": longitude,
            "date": "2026-01-15",
            "depth": profile_depths,
            "temperature": observation_temperature,
            "salinity": observation_salinity,
        }
    )


# ---------------------------------------------------------
# Ocean JSON
# ---------------------------------------------------------

ocean_data = {
    "region": {
        "name": REGION_NAME,
        "lat_min": LAT_MIN,
        "lat_max": LAT_MAX,
        "lon_min": LON_MIN,
        "lon_max": LON_MAX,
        "depth_min": DEPTH_MIN,
        "depth_max": DEPTH_MAX,
    },

    "dimensions": {
        "lat": LAT_COUNT,
        "lon": LON_COUNT,
        "depth": DEPTH_COUNT,
    },

    "coordinates": {
        "lat": [round(float(x), 4) for x in latitudes],
        "lon": [round(float(x), 4) for x in longitudes],
        "depth": [round(float(x), 4) for x in depths],
    },

    "temperature": np.round(
        temperature, 3
    ).tolist(),

    "salinity": np.round(
        salinity, 3
    ).tolist(),

    "currents": {
        "u": np.round(u, 3).tolist(),
        "v": np.round(v, 3).tolist(),
    },

    "timestamp": TIMESTAMP,
}


# ---------------------------------------------------------
# Save files
# ---------------------------------------------------------

ocean_file = MOCK_DIR / "ocean.json"
floats_file = MOCK_DIR / "floats.json"


with open(ocean_file, "w", encoding="utf-8") as file:
    json.dump(ocean_data, file)


with open(floats_file, "w", encoding="utf-8") as file:
    json.dump(floats, file, indent=2)


print("Mock data generation completed.")
print(f"Ocean data: {ocean_file}")
print(f"Float data: {floats_file}")
print(f"Ocean grid: {DEPTH_COUNT} depth × {LAT_COUNT} lat × {LON_COUNT} lon")
print(f"Floats generated: {len(floats)}")