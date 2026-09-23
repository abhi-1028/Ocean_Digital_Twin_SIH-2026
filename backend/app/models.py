from typing import Any, List
from pydantic import BaseModel, Field


class Region(BaseModel):
    name: str
    lat_min: float
    lat_max: float
    lon_min: float
    lon_max: float
    depth_min: float
    depth_max: float


class Dimensions(BaseModel):
    time: int
    lat: int
    lon: int
    depth: int


class Coordinates(BaseModel):
    time: List[str]
    lat: List[float]
    lon: List[float]
    depth: List[float]


class Currents(BaseModel):
    u: List[Any] = Field(default_factory=list)
    v: List[Any] = Field(default_factory=list)


class OceanResponse(BaseModel):
    region: Region
    dimensions: Dimensions
    coordinates: Coordinates

    temperature: List[Any]
    salinity: List[Any] = Field(default_factory=list)

    currents: Currents

    variable: str = "thetao"
    unit: str = "degrees_C"
    timestamp: str


class FloatSummary(BaseModel):
    id: str
    latitude: float
    longitude: float
    date: str


class FloatProfile(BaseModel):
    id: str
    latitude: float
    longitude: float
    date: str
    depth: List[float]
    temperature: List[float]
    salinity: List[float]


class ProfileData(BaseModel):
    temperature: List[float]
    salinity: List[float]


class Metric(BaseModel):
    bias: float
    rmse: float


class Metrics(BaseModel):
    temperature: Metric
    salinity: Metric


class ComparisonResponse(BaseModel):
    float_id: str
    depth: List[float]
    observation: ProfileData
    model: ProfileData
    metrics: Metrics