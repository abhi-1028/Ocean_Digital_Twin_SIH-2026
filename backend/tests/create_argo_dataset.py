from pathlib import Path

import pandas as pd


OUTPUT_PATH = (
    Path(__file__).resolve().parents[1]
    / "data"
    / "regions"
    / "bay_of_bengal"
    / "observations"
    / "argo_profiles.csv"
)


def create_dataset():
    data = [
        {
            "float_id": "ARGO_BOB_001",
            "latitude": 14.0,
            "longitude": 85.0,
            "observation_time": "2026-08-15",
            "depth": 0.0,
            "temperature": 28.2,
            "salinity": 34.5,
        },
        {
            "float_id": "ARGO_BOB_001",
            "latitude": 14.0,
            "longitude": 85.0,
            "observation_time": "2026-08-15",
            "depth": 50.0,
            "temperature": 27.2,
            "salinity": 35.0,
        },
        {
            "float_id": "ARGO_BOB_001",
            "latitude": 14.0,
            "longitude": 85.0,
            "observation_time": "2026-08-15",
            "depth": 100.0,
            "temperature": 26.1,
            "salinity": 35.5,
        },
        {
            "float_id": "ARGO_BOB_002",
            "latitude": 16.0,
            "longitude": 87.5,
            "observation_time": "2026-08-16",
            "depth": 0.0,
            "temperature": 28.0,
            "salinity": 34.6,
        },
        {
            "float_id": "ARGO_BOB_002",
            "latitude": 16.0,
            "longitude": 87.5,
            "observation_time": "2026-08-16",
            "depth": 50.0,
            "temperature": 27.1,
            "salinity": 35.1,
        },
        {
            "float_id": "ARGO_BOB_002",
            "latitude": 16.0,
            "longitude": 87.5,
            "observation_time": "2026-08-16",
            "depth": 100.0,
            "temperature": 26.0,
            "salinity": 35.6,
        },
    ]

    dataframe = pd.DataFrame(data)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    dataframe.to_csv(OUTPUT_PATH, index=False)

    print(f"Created Argo dataset: {OUTPUT_PATH}")
    print(dataframe)


if __name__ == "__main__":
    create_dataset()