from fastapi.testclient import TestClient

from backend.app.main import app


client = TestClient(app)


# ---------------------------------------------------------
# Health API
# ---------------------------------------------------------

def test_health():
    response = client.get("/api/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "healthy"


# ---------------------------------------------------------
# Regions API
# ---------------------------------------------------------

def test_regions():
    response = client.get("/api/regions")

    assert response.status_code == 200

    data = response.json()

    assert len(data) == 4
    assert data[0]["id"] == "bay_of_bengal"


# ---------------------------------------------------------
# Ocean API
# ---------------------------------------------------------

def test_ocean_temperature():
    response = client.get(
        "/api/ocean/bay_of_bengal",
        params={
            "variable": "temperature",
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["region_id"] == "bay_of_bengal"
    assert data["variable"] == "temperature"


def test_ocean_depth_filter():
    response = client.get(
        "/api/ocean/bay_of_bengal",
        params={
            "variable": "temperature",
            "depth": 50,
        },
    )

    assert response.status_code == 200

    data = response.json()

    assert data["depth"] == [50.0]


# ---------------------------------------------------------
# Argo API
# ---------------------------------------------------------

def test_argo_data():
    response = client.get(
        "/api/argo/bay_of_bengal"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["observation_count"] == 6

    assert "ARGO_BOB_001" in data["float_ids"]

    assert "ARGO_BOB_002" in data["float_ids"]


def test_argo_float():
    response = client.get(
        "/api/argo/bay_of_bengal/ARGO_BOB_001"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["float_id"] == "ARGO_BOB_001"

    assert data["observation_count"] == 3


# ---------------------------------------------------------
# Model-Argo Comparison API
# ---------------------------------------------------------

def test_comparison():
    response = client.get(
        "/api/compare/bay_of_bengal/ARGO_BOB_001"
    )

    assert response.status_code == 200

    data = response.json()

    assert data["matched_points"] == 3

    assert round(data["bias"], 4) == -0.1667

    assert round(data["rmse"], 4) == 0.1732


# ---------------------------------------------------------
# Existing Error Tests
# ---------------------------------------------------------

def test_invalid_float():
    response = client.get(
        "/api/argo/bay_of_bengal/INVALID_FLOAT"
    )

    assert response.status_code == 404


def test_invalid_region():
    response = client.get(
        "/api/ocean/invalid_region"
    )

    assert response.status_code == 404


# ---------------------------------------------------------
# Additional Edge-Case Tests
# ---------------------------------------------------------

def test_invalid_ocean_variable():
    response = client.get(
        "/api/ocean/bay_of_bengal",
        params={
            "variable": "pressure",
        },
    )

    assert response.status_code == 400

    data = response.json()

    assert "not available" in data["detail"]


def test_invalid_ocean_depth():
    response = client.get(
        "/api/ocean/bay_of_bengal",
        params={
            "variable": "temperature",
            "depth": 999,
        },
    )

    assert response.status_code == 400

    data = response.json()

    assert "not available" in data["detail"]


def test_invalid_ocean_time():
    response = client.get(
        "/api/ocean/bay_of_bengal",
        params={
            "variable": "temperature",
            "time": "2030-01-01",
        },
    )

    assert response.status_code == 400

    data = response.json()

    assert "not available" in data["detail"]


def test_invalid_argo_region():
    response = client.get(
        "/api/argo/invalid_region"
    )

    assert response.status_code == 404


def test_invalid_comparison_variable():
    response = client.get(
        "/api/compare/bay_of_bengal/ARGO_BOB_001",
        params={
            "variable": "pressure",
        },
    )

    assert response.status_code == 400

    data = response.json()

    assert "not available" in data["detail"]