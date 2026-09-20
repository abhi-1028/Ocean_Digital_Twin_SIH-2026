# OceanTwin API Contract

## Base URL

http://localhost:8000

## 1. Ocean Data

GET /api/ocean

Returns the processed ocean model data used by the 3D visualization.

Expected response:

{
  "lat": [],
  "lon": [],
  "depth": [],
  "temperature": []
}

---

## 2. Float Locations

GET /api/floats

Returns available Argo/in-situ observation locations.

Expected response:

[
  {
    "id": "ARGO_001",
    "latitude": 15.5,
    "longitude": 88.2,
    "date": "2026-01-15"
  }
]

---

## 3. Float Details

GET /api/floats/{float_id}

Returns detailed information about one float.

---

## 4. Model vs Observation Comparison

GET /api/comparison/{float_id}

Expected response:

{
  "float_id": "ARGO_001",
  "depth": [0, 50, 100, 200],
  "observation": {
    "temperature": [28.4, 27.9, 26.7, 23.9],
    "salinity": [34.2, 34.4, 34.7, 35.0]
  },
  "model": {
    "temperature": [28.1, 27.7, 26.9, 24.3],
    "salinity": [34.3, 34.5, 34.6, 35.1]
  },
  "metrics": {
    "temperature": {
      "bias": 0,
      "rmse": 0
    },
    "salinity": {
      "bias": 0,
      "rmse": 0
    }
  }
}

## Metric Definitions

Bias:

mean(model - observation)

RMSE:

sqrt(mean((model - observation)^2))

## Integration Rule

Frontend should use these API endpoint names and response structures.

Backend should implement these endpoints.

No database is required for the initial prototype.
