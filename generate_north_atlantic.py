from pathlib import Path

import numpy as np
import pandas as pd
import xarray as xr


# ============================================================
# Ocean Digital Twin - North Atlantic Synthetic Dataset Generator
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent

MODEL_DIR = (
    PROJECT_ROOT
    / "backend"
    / "data"
    / "regions"
    / "north_atlantic"
    / "model"
)

OBSERVATIONS_DIR = (
    PROJECT_ROOT
    / "backend"
    / "data"
    / "regions"
    / "north_atlantic"
    / "observations"
)

MODEL_FILE = MODEL_DIR / "sample_ocean.nc"
ARGO_FILE = OBSERVATIONS_DIR / "argo_profiles.csv"


# ------------------------------------------------------------
# Dataset configuration
# ------------------------------------------------------------

TIMES = pd.to_datetime(
    [
        "2026-08-15",
        "2026-08-16",
    ]
)

DEPTHS = np.array(
    [
        0.0,
        50.0,
        100.0,
        150.0,
        200.0,
        250.0,
        300.0,
        400.0,
        500.0,
        600.0,
        700.0,
        750.0,
        850.0,
        1000.0,
    ],
    dtype=float,
)

LATITUDES = np.array(
    [
        30.2,
        32.6,
        35.0,
        37.4,
        39.8,
    ],
    dtype=float,
)

LONGITUDES = np.array(
    [
        -51.0,
        -48.0,
        -45.0,
        -42.0,
        -39.0,
    ],
    dtype=float,
)


# ------------------------------------------------------------
# Create output directories
# ------------------------------------------------------------

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True,
)

OBSERVATIONS_DIR.mkdir(
    parents=True,
    exist_ok=True,
)


# ------------------------------------------------------------
# Create model grid
# ------------------------------------------------------------

time_count = len(TIMES)
depth_count = len(DEPTHS)
lat_count = len(LATITUDES)
lon_count = len(LONGITUDES)

temperature = np.zeros(
    (
        time_count,
        depth_count,
        lat_count,
        lon_count,
    ),
    dtype=float,
)

salinity = np.zeros_like(
    temperature
)

u_current = np.zeros_like(
    temperature
)

v_current = np.zeros_like(
    temperature
)


# ------------------------------------------------------------
# Generate synthetic ocean model fields
# ------------------------------------------------------------

for time_index in range(time_count):

    time_variation = (
        0.06 * time_index
    )

    for depth_index, depth in enumerate(
        DEPTHS
    ):

        depth_factor = (
            depth / 1000.0
        )

        for lat_index, latitude in enumerate(
            LATITUDES
        ):

            lat_offset = (
                latitude - 35.0
            )

            for lon_index, longitude in enumerate(
                LONGITUDES
            ):

                lon_offset = (
                    longitude + 45.0
                )

                radial = np.sqrt(
                    (lat_offset / 5.0) ** 2
                    + (lon_offset / 6.0) ** 2
                )

                spatial_variation = (
                    np.sin(
                        lat_offset * 0.45
                    )
                    * 0.16
                    + np.cos(
                        lon_offset * 0.38
                    )
                    * 0.13
                )

                # --------------------------------------------
                # Temperature
                # --------------------------------------------

                surface_temperature = (
                    21.0
                    - radial * 0.32
                    + spatial_variation
                    + time_variation
                )

                temperature_value = (
                    surface_temperature
                    - depth_factor * 8.8
                    - depth_factor**2 * 1.4
                )

                # --------------------------------------------
                # Salinity
                # --------------------------------------------

                surface_salinity = (
                    35.60
                    + radial * 0.065
                    + spatial_variation * 0.07
                    - lat_offset * 0.008
                )

                salinity_value = (
                    surface_salinity
                    + depth_factor * 0.72
                    + depth_factor**2 * 0.20
                )

                # --------------------------------------------
                # Zonal current (u)
                # --------------------------------------------

                u_value = (
                    0.24
                    * np.sin(
                        (latitude - 35.0)
                        / 5.0
                    )
                    * np.cos(
                        (longitude + 45.0)
                        / 6.0
                    )
                    * (
                        1.0
                        - 0.55
                        * depth_factor
                    )
                )

                # --------------------------------------------
                # Meridional current (v)
                # --------------------------------------------

                v_value = (
                    0.20
                    * np.cos(
                        (latitude - 35.0)
                        / 5.5
                    )
                    * np.sin(
                        (longitude + 45.0)
                        / 6.5
                    )
                    * (
                        1.0
                        - 0.60
                        * depth_factor
                    )
                )

                temperature[
                    time_index,
                    depth_index,
                    lat_index,
                    lon_index,
                ] = round(
                    temperature_value,
                    4,
                )

                salinity[
                    time_index,
                    depth_index,
                    lat_index,
                    lon_index,
                ] = round(
                    salinity_value,
                    4,
                )

                u_current[
                    time_index,
                    depth_index,
                    lat_index,
                    lon_index,
                ] = round(
                    u_value,
                    5,
                )

                v_current[
                    time_index,
                    depth_index,
                    lat_index,
                    lon_index,
                ] = round(
                    v_value,
                    5,
                )


# ------------------------------------------------------------
# Build xarray Dataset
# ------------------------------------------------------------

dataset = xr.Dataset(
    data_vars={
        "temperature": (
            [
                "time",
                "depth",
                "latitude",
                "longitude",
            ],
            temperature,
            {
                "units": "degC",
                "long_name": (
                    "Sea Water Temperature"
                ),
            },
        ),

        "salinity": (
            [
                "time",
                "depth",
                "latitude",
                "longitude",
            ],
            salinity,
            {
                "units": "PSU",
                "long_name": (
                    "Sea Water Salinity"
                ),
            },
        ),

        "u": (
            [
                "time",
                "depth",
                "latitude",
                "longitude",
            ],
            u_current,
            {
                "units": "m s-1",
                "long_name": (
                    "Eastward Sea Water Velocity"
                ),
            },
        ),

        "v": (
            [
                "time",
                "depth",
                "latitude",
                "longitude",
            ],
            v_current,
            {
                "units": "m s-1",
                "long_name": (
                    "Northward Sea Water Velocity"
                ),
            },
        ),
    },

    coords={
        "time": TIMES,
        "depth": DEPTHS,
        "latitude": LATITUDES,
        "longitude": LONGITUDES,
    },

    attrs={
        "description": (
            "Synthetic North Atlantic Ocean Digital Twin "
            "demonstration dataset"
        ),
        "region": "North Atlantic",
        "data_type": "synthetic demonstration",
    },
)


# ------------------------------------------------------------
# Save NetCDF model dataset
# ------------------------------------------------------------

dataset.to_netcdf(
    MODEL_FILE
)


# ------------------------------------------------------------
# Create synthetic ARGO observations
# ------------------------------------------------------------

argo_rows = []


argo_floats = [
    {
        "float_id": "ARGO_NA_001",
        "latitude": 35.0,
        "longitude": -45.0,
        "observation_time": "2026-08-15",
        "temperature_offset": 0.00,
        "salinity_offset": 0.00,
    },

    {
        "float_id": "ARGO_NA_002",
        "latitude": 38.0,
        "longitude": -42.0,
        "observation_time": "2026-08-16",
        "temperature_offset": -0.10,
        "salinity_offset": -0.06,
    },
]


# Same 14 levels as the model.

argo_depths = np.array(
    [
        0.0,
        50.0,
        100.0,
        150.0,
        200.0,
        250.0,
        300.0,
        400.0,
        500.0,
        600.0,
        700.0,
        750.0,
        850.0,
        1000.0,
    ],
    dtype=float,
)


# ------------------------------------------------------------
# Generate ARGO profiles
# ------------------------------------------------------------

for float_data in argo_floats:

    latitude = float_data[
        "latitude"
    ]

    longitude = float_data[
        "longitude"
    ]

    lat_offset = (
        latitude - 35.0
    )

    lon_offset = (
        longitude + 45.0
    )

    radial = np.sqrt(
        (lat_offset / 5.0) ** 2
        + (lon_offset / 6.0) ** 2
    )

    for depth in argo_depths:

        depth_factor = (
            depth / 1000.0
        )

        spatial_variation = (
            np.sin(
                lat_offset * 0.45
            )
            * 0.16
            + np.cos(
                lon_offset * 0.38
            )
            * 0.13
        )

        # --------------------------------------------
        # Model temperature
        # --------------------------------------------

        surface_temperature = (
            21.0
            - radial * 0.32
            + spatial_variation
        )

        model_temperature = (
            surface_temperature
            - depth_factor * 8.8
            - depth_factor**2 * 1.4
        )

        # --------------------------------------------
        # Model salinity
        # --------------------------------------------

        surface_salinity = (
            35.60
            + radial * 0.065
            + spatial_variation * 0.07
            - lat_offset * 0.008
        )

        model_salinity = (
            surface_salinity
            + depth_factor * 0.72
            + depth_factor**2 * 0.20
        )

        # --------------------------------------------
        # Observation differences
        # --------------------------------------------

        temperature_observation = (
            model_temperature
            + float_data[
                "temperature_offset"
            ]
            + 0.050
            * np.sin(
                depth / 180.0
            )
        )

        salinity_observation = (
            model_salinity
            + float_data[
                "salinity_offset"
            ]
            - 0.020
            * np.cos(
                depth / 220.0
            )
        )

        argo_rows.append(
            {
                "float_id": float_data[
                    "float_id"
                ],

                "latitude": latitude,

                "longitude": longitude,

                "observation_time": float_data[
                    "observation_time"
                ],

                "depth": depth,

                "temperature": round(
                    temperature_observation,
                    3,
                ),

                "salinity": round(
                    salinity_observation,
                    3,
                ),
            }
        )


argo_dataframe = pd.DataFrame(
    argo_rows
)


# ------------------------------------------------------------
# Save ARGO observations
# ------------------------------------------------------------

argo_dataframe.to_csv(
    ARGO_FILE,
    index=False,
)


# ------------------------------------------------------------
# Close dataset
# ------------------------------------------------------------

dataset.close()


# ------------------------------------------------------------
# Verification
# ------------------------------------------------------------

print()
print("=" * 65)
print(
    "North Atlantic dataset created successfully"
)
print("=" * 65)

print()

print("Model file:")
print(MODEL_FILE)

print()

print("ARGO file:")
print(ARGO_FILE)

print()

print("Model dimensions:")
print(
    f"  time      : {time_count}"
)
print(
    f"  depth     : {depth_count}"
)
print(
    f"  latitude  : {lat_count}"
)
print(
    f"  longitude : {lon_count}"
)

print()

print("Available depths:")
print(
    DEPTHS.tolist()
)

print()

print("Maximum model depth:")
print(
    f"  {DEPTHS.max()} m"
)

print()

print("Model variables:")
print(
    [
        "temperature",
        "salinity",
        "u",
        "v",
    ]
)

print()

print("ARGO floats:")
print(
    argo_dataframe[
        "float_id"
    ]
    .unique()
    .tolist()
)

print()

print(
    f"ARGO observations: "
    f"{len(argo_dataframe)}"
)

print()

print(
    "Observations per float:"
)

print(
    argo_dataframe[
        "float_id"
    ]
    .value_counts()
    .to_string()
)

print()

print("=" * 65)