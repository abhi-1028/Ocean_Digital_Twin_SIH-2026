from pathlib import Path

import numpy as np
import xarray as xr


BASE_DIR = Path(__file__).resolve().parents[2]

OCEAN_FILE = (
    BASE_DIR
    / "data"
    / "copernicus"
    / "bay_of_bengal_test.nc"
)


def _to_list(data):
    """Convert numpy/xarray values into JSON-safe Python lists."""
    return np.asarray(data).tolist()


def _find_variable(ds, names):
    """Find the first available variable from a list of possible names."""
    for name in names:
        if name in ds.data_vars:
            return name
    return None


def get_ocean_data(time_index=0, depth_index=0):

    if not OCEAN_FILE.exists():
        raise FileNotFoundError(
            f"Copernicus data not found: {OCEAN_FILE}"
        )

    ds = xr.open_dataset(OCEAN_FILE)

    try:
        # ---------------------------------------------------------
        # Validate indexes
        # ---------------------------------------------------------
        if time_index >= len(ds.time):
            raise IndexError(
                f"time_index must be between 0 and {len(ds.time) - 1}"
            )

        if depth_index >= len(ds.depth):
            raise IndexError(
                f"depth_index must be between 0 and {len(ds.depth) - 1}"
            )

        # ---------------------------------------------------------
        # Temperature
        # ---------------------------------------------------------
        temperature_name = _find_variable(
            ds,
            ["thetao", "temperature"]
        )

        if temperature_name is None:
            raise ValueError(
                "Temperature variable not found in Copernicus dataset."
            )

        temperature = ds[temperature_name].isel(
            time=time_index,
            depth=depth_index
        )

        # ---------------------------------------------------------
        # Optional salinity
        # ---------------------------------------------------------
        salinity_name = _find_variable(
            ds,
            ["so", "salinity"]
        )

        if salinity_name:
            salinity = _to_list(
                ds[salinity_name]
                .isel(time=time_index, depth=depth_index)
                .values
            )
        else:
            salinity = []

        # ---------------------------------------------------------
        # Optional currents
        # ---------------------------------------------------------
        u_name = _find_variable(ds, ["uo", "u"])
        v_name = _find_variable(ds, ["vo", "v"])

        if u_name:
            u = _to_list(
                ds[u_name]
                .isel(time=time_index, depth=depth_index)
                .values
            )
        else:
            u = []

        if v_name:
            v = _to_list(
                ds[v_name]
                .isel(time=time_index, depth=depth_index)
                .values
            )
        else:
            v = []

        # ---------------------------------------------------------
        # Coordinates
        # ---------------------------------------------------------
        time_values = [
            str(value)
            for value in ds.time.values
        ]

        lat_values = _to_list(ds.latitude.values)
        lon_values = _to_list(ds.longitude.values)
        depth_values = _to_list(ds.depth.values)

        # ---------------------------------------------------------
        # Region
        # ---------------------------------------------------------
        region = {
            "name": "Bay of Bengal",

            "lat_min": float(ds.latitude.min()),
            "lat_max": float(ds.latitude.max()),

            "lon_min": float(ds.longitude.min()),
            "lon_max": float(ds.longitude.max()),

            "depth_min": float(ds.depth.min()),
            "depth_max": float(ds.depth.max()),
        }

        # ---------------------------------------------------------
        # Dimensions
        # ---------------------------------------------------------
        dimensions = {
            "time": len(ds.time),
            "lat": len(ds.latitude),
            "lon": len(ds.longitude),
            "depth": len(ds.depth),
        }

        # ---------------------------------------------------------
        # Final API response
        # ---------------------------------------------------------
        return {
            "region": region,

            "dimensions": dimensions,

            "coordinates": {
                "time": time_values,
                "lat": lat_values,
                "lon": lon_values,
                "depth": depth_values,
            },

            "temperature": _to_list(temperature.values),

            "salinity": salinity,

            "currents": {
                "u": u,
                "v": v,
            },

            "variable": temperature_name,

            "unit": temperature.attrs.get(
                "units",
                "degrees_C"
            ),

            "timestamp": time_values[time_index],
        }

    finally:
        ds.close()