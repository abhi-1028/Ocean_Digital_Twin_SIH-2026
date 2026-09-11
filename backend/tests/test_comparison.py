from backend.app.services.comparison import (
    calculate_bias,
    calculate_rmse,
    compare_float,
)


def test_calculate_bias():
    observed = [10, 20, 30]
    modeled = [11, 19, 32]

    bias = calculate_bias(observed, modeled)

    assert bias == 2 / 3


def test_calculate_rmse():
    observed = [10, 20, 30]
    modeled = [11, 19, 32]

    rmse = calculate_rmse(observed, modeled)

    assert round(rmse, 6) == round((6 / 3) ** 0.5, 6)


def test_temperature_comparison():
    result = compare_float(
        "bay_of_bengal",
        "ARGO_BOB_001",
        "temperature",
    )

    assert result["matched_points"] == 3
    assert round(result["bias"], 4) == -0.1667
    assert round(result["rmse"], 4) == 0.1732


def test_salinity_comparison():
    result = compare_float(
        "bay_of_bengal",
        "ARGO_BOB_001",
        "salinity",
    )

    assert result["matched_points"] == 3
    assert result["bias"] == 0.0
    assert result["rmse"] == 0.0


def test_invalid_float():
    try:
        compare_float(
            "bay_of_bengal",
            "INVALID_FLOAT",
            "temperature",
        )
        assert False
    except ValueError as exc:
        assert "not found" in str(exc)


def test_invalid_variable():
    try:
        compare_float(
            "bay_of_bengal",
            "ARGO_BOB_001",
            "pressure",
        )
        assert False
    except ValueError as exc:
        assert "not available" in str(exc)