export type OceanVariable = "temperature" | "salinity";

export interface Region {
  id: string;
  name: string;
  center: [number, number];
  description: string;
}

export interface ArgoFloat {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  temperature: number;
  salinity: number;
  depth: number;
}

export interface ArgoObservation {
  id: string;
  regionId: string;
  floatId: string;
  latitude: number;
  longitude: number;
  observationTime: string;
  depth: number;
  temperature: number;
  salinity: number;
}

export interface OceanPoint {
  latitude: number;
  longitude: number;
  value: number;
}

export interface ProfilePoint {
  depth: number;
  observation: number;
  model: number;
}

export interface ValidationMetrics {
  bias: number;
  rmse: number;
  samples: number;
  agreement: number;
}

export interface OceanState {
  region: Region;
  variable: OceanVariable;
  depth: number;
  time: string;
}