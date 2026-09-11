from typing import Any, Optional

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


class Region(BaseModel):
    id: str
    name: str


class OceanPoint(BaseModel):
    latitude: float
    longitude: float
    value: float


class OceanDataResponse(BaseModel):
    region_id: str
    variable: str
    units: Optional[str] = None
    dimensions: list[str] = []
    latitude: list[float]
    longitude: list[float]
    depth: list[float]
    time: list[str]
    shape: list[int]
    values: Any
    points: list[OceanPoint] = []
    source: str = "model"


class ArgoObservation(BaseModel):
    float_id: str
    latitude: float
    longitude: float
    observation_time: str
    depth: float
    temperature: float
    salinity: float


class ArgoDataResponse(BaseModel):
    region_id: str
    float_ids: list[str]
    observation_count: int
    observations: list[ArgoObservation]
    source: str = "observation"


class ArgoFloatResponse(BaseModel):
    region_id: str
    float_id: str
    observation_count: int
    observations: list[ArgoObservation]
    source: str = "observation"


class ComparisonResponse(BaseModel):
    region_id: str
    float_id: str
    variable: str
    matched_points: int
    depths: list[float]
    observed_values: list[float]
    modeled_values: list[float]
    bias: float
    rmse: float
    matching_method: str
    matching_tolerances: dict[str, float]
    source: str = "model + observation"
