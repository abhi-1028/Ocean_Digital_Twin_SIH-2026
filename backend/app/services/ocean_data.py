from pathlib import Path

import xarray as xr


BASE_DATA_DIR = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "regions"
)


def get_model_file(region_id: str) -> Path:
    """
    Return the NetCDF model file for a region.
    """
    model_dir = BASE_DATA_DIR / region_id / "model"

    if not model_dir.exists():
        raise FileNotFoundError(
            f"Model data directory not found for region: {region_id}"
        )

    netcdf_files = list(model_dir.glob("*.nc"))

    if not netcdf_files:
        raise FileNotFoundError(
            f"No NetCDF model file found for region: {region_id}"
        )

    return netcdf_files[0]


def load_model_dataset(region_id: str) -> xr.Dataset:
    """
    Load a regional ocean model dataset using xarray.
    """
    file_path = get_model_file(region_id)

    return xr.open_dataset(file_path)


def validate_model_dataset(dataset: xr.Dataset) -> None:
    """
    Validate that the dataset contains the required coordinates.
    """
    required_coordinates = {
        "latitude",
        "longitude",
        "depth",
        "time",
    }

    missing = required_coordinates - set(dataset.coords)

    if missing:
        raise ValueError(
            f"Dataset is missing required coordinates: {sorted(missing)}"
        )


def get_available_variables(dataset: xr.Dataset) -> list[str]:
    """
    Return variables available in the ocean model dataset.
    """
    return list(dataset.data_vars)