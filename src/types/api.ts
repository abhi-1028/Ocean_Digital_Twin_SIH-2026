import type {
  ArgoObservation,
  OceanPoint,
  ValidationMetrics,
  ProfilePoint,
} from "./ocean";

export interface OceanDataResponse {
  region_id: string;
  variable: "temperature" | "salinity";
  depth: number;
  points: OceanPoint[];
  source: "model" | "mock";
  timestamp?: string;
}

export interface ArgoDataResponse {
  region_id: string;
  observations: ArgoObservation[];
  source: "observation" | "mock";
}

export interface ArgoProfileResponse {
  region_id: string;
  float_id: string;
  profile: ProfilePoint[];
  source: "observation" | "mock";
}

export interface ComparisonResponse {
  region_id: string;
  float_id: string;
  variable: "temperature" | "salinity";
  metrics: ValidationMetrics;

  modelProfile?: {
    depth: number;
    value: number;
  }[];

  observationProfile?: {
    depth: number;
    value: number;
  }[];
}