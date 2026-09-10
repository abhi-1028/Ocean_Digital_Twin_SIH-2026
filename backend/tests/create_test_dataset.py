from pathlib import Path

import numpy as np
import pandas as pd
import xarray as xr


OUTPUT_PATH = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "regions"
    / "bay_of_bengal"
    / "model"
    / "sample_ocean.nc"
)


def create_dataset():
    times = pd.date_range("2026-08-15", periods=2, freq="D")
    depths = np.array([0.0, 50.0, 100.0])
    latitudes = np.linspace(10.0, 18.0, 5)
    longitudes = np.linspace(80.0, 90.0, 5)

    shape = (
        len(times),
        len(depths),
        len(latitudes),
        len(longitudes),
    )

    temperature = 28.0 - 0.02 * depths[None, :, None, None]
    temperature = np.broadcast_to(temperature, shape).copy()

    salinity = 34.5 + 0.01 * depths[None, :, None, None]
    salinity = np.broadcast_to(salinity, shape).copy()

    u_current = np.full(shape, 0.15)
    v_current = np.full(shape, 0.08)

    dataset = xr.Dataset(
        data_vars={
            "temperature": (
                ["time", "depth", "latitude", "longitude"],
                temperature,
                {"units": "degree_C"},
            ),
            "salinity": (
                ["time", "depth", "latitude", "longitude"],
                salinity,
                {"units": "psu"},
            ),
            "u": (
                ["time", "depth", "latitude", "longitude"],
                u_current,
                {"units": "m/s"},
            ),
            "v": (
                ["time", "depth", "latitude", "longitude"],
                v_current,
                {"units": "m/s"},
            ),
        },
        coords={
            "time": times,
            "depth": depths,
            "latitude": latitudes,
            "longitude": longitudes,
        },
        attrs={
            "description": "Synthetic Ocean Digital Twin test dataset",
            "region": "Bay of Bengal",
        },
    )

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    dataset.to_netcdf(OUTPUT_PATH)

    print(f"Created test dataset: {OUTPUT_PATH}")
    print(dataset)


if __name__ == "__main__":
    create_dataset()