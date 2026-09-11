import type { OceanPoint, OceanVariable } from './ocean'

export interface BackendOceanDataResponse {
  region_id: string
  variable: OceanVariable
  units?: string | null
  dimensions: string[]
  latitude: number[]
  longitude: number[]
  depth: number[]
  time: string[]
  shape: number[]
  values: unknown
  points: OceanPoint[]
  source: string
}

export interface BackendArgoObservation {
  float_id: string
  latitude: number
  longitude: number
  observation_time: string
  depth: number
  temperature: number
  salinity: number
}

export interface BackendArgoDataResponse {
  region_id: string
  float_ids: string[]
  observation_count: number
  observations: BackendArgoObservation[]
  source: string
}

export interface BackendArgoFloatResponse {
  region_id: string
  float_id: string
  observation_count: number
  observations: BackendArgoObservation[]
  source: string
}

export interface BackendComparisonResponse {
  region_id: string
  float_id: string
  variable: OceanVariable
  matched_points: number
  depths: number[]
  observed_values: number[]
  modeled_values: number[]
  bias: number
  rmse: number
  matching_method: string
  matching_tolerances: Record<string, number>
  source: string
}
