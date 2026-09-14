from pathlib import Path

import pandas as pd


BASE_DATA_DIR = (
    Path(__file__).resolve().parents[2]
    / "data"
    / "regions"
)


def get_argo_file(region_id: str) -> Path:
    observations_dir = BASE_DATA_DIR / region_id / "observations"

    if not observations_dir.exists():
        raise FileNotFoundError(
            f"Observation data directory not found for region: {region_id}"
        )

    csv_file = observations_dir / "argo_profiles.csv"

    if not csv_file.exists():
        raise FileNotFoundError(
            f"No Argo observation file found for region: {region_id}"
        )

    return csv_file


def load_argo_data(region_id: str) -> pd.DataFrame:
    file_path = get_argo_file(region_id)

    dataframe = pd.read_csv(file_path)

    required_columns = {
        "float_id",
        "latitude",
        "longitude",
        "observation_time",
        "depth",
        "temperature",
        "salinity",
    }

    missing_columns = required_columns - set(dataframe.columns)

    if missing_columns:
        raise ValueError(
            f"Argo dataset is missing columns: {sorted(missing_columns)}"
        )

    return dataframe


def get_float_ids(dataframe: pd.DataFrame) -> list[str]:
    return sorted(
        dataframe["float_id"].dropna().unique().tolist()
    )