import math
import numpy as np

from backend.app.services.argo_data import load_argo_data
from backend.app.services.ocean_data import (
    load_model_dataset,
    get_available_variables,
)


# ---------------------------------------------------------
# Matching tolerances
# ---------------------------------------------------------
# These are demonstration values for the synthetic dataset.
# They can be adjusted later for real scientific datasets.

LATITUDE_TOLERANCE = 1.0
LONGITUDE_TOLERANCE = 1.0
DEPTH_TOLERANCE = 10.0
TIME_TOLERANCE_DAYS = 1.0


# ---------------------------------------------------------
# Statistical calculations
# ---------------------------------------------------------

def calculate_bias(observed, modeled):
    """
    Calculate mean model-observation bias.

    Positive value  -> model is higher than observation
    Negative value  -> model is lower than observation
    """

    errors = [
        model - observation
        for observation, model in zip(observed, modeled)
    ]

    if not errors:
        return None

    return sum(errors) / len(errors)


def calculate_rmse(observed, modeled):
    """
    Calculate Root Mean Square Error (RMSE).
    """

    errors = [
        (model - observation) ** 2
        for observation, model in zip(observed, modeled)
    ]

    if not errors:
        return None

    return math.sqrt(
        sum(errors) / len(errors)
    )


# ---------------------------------------------------------
# Model-Argo comparison
# ---------------------------------------------------------

def compare_float(
    region_id: str,
    float_id: str,
    variable: str = "temperature",
):
    """
    Compare Argo observations with the nearest model grid points.

    Matching is performed using:
    - latitude
    - longitude
    - depth
    - observation time

    A match is accepted only when all differences are
    within the configured tolerances.
    """

    # -----------------------------------------------------
    # Load Argo observations
    # -----------------------------------------------------

    argo_data = load_argo_data(region_id)

    float_data = argo_data[
        argo_data["float_id"] == float_id
    ].copy()

    if float_data.empty:
        raise ValueError(
            f"Argo float '{float_id}' not found "
            f"in region '{region_id}'"
        )

    # -----------------------------------------------------
    # Load ocean model dataset
    # -----------------------------------------------------

    dataset = load_model_dataset(region_id)

    try:

        # -------------------------------------------------
        # Validate requested variable
        # -------------------------------------------------

        available_variables = get_available_variables(
            dataset
        )

        if variable not in available_variables:
            raise ValueError(
                f"Variable '{variable}' not available. "
                f"Available variables: "
                f"{available_variables}"
            )

        # -------------------------------------------------
        # Result containers
        # -------------------------------------------------

        observed_values = []
        modeled_values = []
        matched_depths = []

        # -------------------------------------------------
        # Model coordinates
        # -------------------------------------------------

        model_times = dataset["time"].values
        model_depths = dataset["depth"].values
        model_latitudes = dataset["latitude"].values
        model_longitudes = dataset["longitude"].values

        # -------------------------------------------------
        # Process every Argo observation
        # -------------------------------------------------

        for _, observation in float_data.iterrows():

            try:

                # -----------------------------------------
                # Read observation coordinates
                # -----------------------------------------

                observation_latitude = float(
                    observation["latitude"]
                )

                observation_longitude = float(
                    observation["longitude"]
                )

                observation_depth = float(
                    observation["depth"]
                )

                # -----------------------------------------
                # Convert observation time to NumPy
                # datetime64.
                #
                # This is important because the model
                # dataset also uses NumPy datetime values.
                # -----------------------------------------

                observation_time = np.datetime64(
                    observation["observation_time"]
                )

                # -----------------------------------------
                # Find nearest latitude
                # -----------------------------------------

                nearest_latitude = min(
                    model_latitudes,
                    key=lambda value: abs(
                        float(value)
                        - observation_latitude
                    ),
                )

                # -----------------------------------------
                # Find nearest longitude
                # -----------------------------------------

                nearest_longitude = min(
                    model_longitudes,
                    key=lambda value: abs(
                        float(value)
                        - observation_longitude
                    ),
                )

                # -----------------------------------------
                # Find nearest depth
                # -----------------------------------------

                nearest_depth = min(
                    model_depths,
                    key=lambda value: abs(
                        float(value)
                        - observation_depth
                    ),
                )

                # -----------------------------------------
                # Find nearest model time
                # -----------------------------------------

                nearest_time = min(
                    model_times,
                    key=lambda value: abs(
                        value - observation_time
                    ),
                )

                # -----------------------------------------
                # Calculate coordinate differences
                # -----------------------------------------

                latitude_difference = abs(
                    float(nearest_latitude)
                    - observation_latitude
                )

                longitude_difference = abs(
                    float(nearest_longitude)
                    - observation_longitude
                )

                depth_difference = abs(
                    float(nearest_depth)
                    - observation_depth
                )

                # -----------------------------------------
                # Calculate time difference in days
                # -----------------------------------------

                time_difference_days = abs(
                    float(
                        (
                            nearest_time
                            - observation_time
                        )
                        / np.timedelta64(1, "D")
                    )
                )

                # -----------------------------------------
                # Check latitude tolerance
                # -----------------------------------------

                if (
                    latitude_difference
                    > LATITUDE_TOLERANCE
                ):
                    continue

                # -----------------------------------------
                # Check longitude tolerance
                # -----------------------------------------

                if (
                    longitude_difference
                    > LONGITUDE_TOLERANCE
                ):
                    continue

                # -----------------------------------------
                # Check depth tolerance
                # -----------------------------------------

                if (
                    depth_difference
                    > DEPTH_TOLERANCE
                ):
                    continue

                # -----------------------------------------
                # Check time tolerance
                # -----------------------------------------

                if (
                    time_difference_days
                    > TIME_TOLERANCE_DAYS
                ):
                    continue

                # -----------------------------------------
                # Get model value at matched point
                # -----------------------------------------

                model_point = dataset[variable].sel(
                    latitude=nearest_latitude,
                    longitude=nearest_longitude,
                    depth=nearest_depth,
                    time=nearest_time,
                )

                # -----------------------------------------
                # Get observed value
                # -----------------------------------------

                observed_value = float(
                    observation[variable]
                )

                # -----------------------------------------
                # Get modeled value
                # -----------------------------------------

                modeled_value = float(
                    model_point.values
                )

            except Exception:
                # Ignore invalid observations and continue
                # processing the remaining observations.
                continue

            # -------------------------------------------------
            # Ignore NaN values
            # -------------------------------------------------

            if math.isnan(observed_value):
                continue

            if math.isnan(modeled_value):
                continue

            # -------------------------------------------------
            # Store valid matched values
            # -------------------------------------------------

            observed_values.append(
                observed_value
            )

            modeled_values.append(
                modeled_value
            )

            matched_depths.append(
                float(observation["depth"])
            )

        # -----------------------------------------------------
        # Make sure at least one valid match exists
        # -----------------------------------------------------

        if not observed_values:
            raise ValueError(
                "No valid model-observation matches found"
            )

        # -----------------------------------------------------
        # Calculate validation metrics
        # -----------------------------------------------------

        bias = calculate_bias(
            observed_values,
            modeled_values,
        )

        rmse = calculate_rmse(
            observed_values,
            modeled_values,
        )

        # -----------------------------------------------------
        # Return comparison result
        # -----------------------------------------------------

        return {
            "region_id": region_id,
            "float_id": float_id,
            "variable": variable,

            "matched_points": len(
                observed_values
            ),

            "depths": matched_depths,

            "observed_values": observed_values,

            "modeled_values": modeled_values,

            "bias": bias,

            "rmse": rmse,

            "matching_method": (
                "nearest model grid point "
                "within configured tolerances"
            ),

            "matching_tolerances": {
                "latitude_degrees": (
                    LATITUDE_TOLERANCE
                ),

                "longitude_degrees": (
                    LONGITUDE_TOLERANCE
                ),

                "depth": (
                    DEPTH_TOLERANCE
                ),

                "time_days": (
                    TIME_TOLERANCE_DAYS
                ),
            },
        }

    finally:
        # Always close the NetCDF dataset.
        dataset.close()