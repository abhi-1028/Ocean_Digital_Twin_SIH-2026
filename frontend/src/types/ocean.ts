export type OceanVariable = 'temperature' | 'salinity'

export interface Region {
  id: string
  name: string
  center: [number, number]
  description: string
}

export interface ArgoFloat {
  id: string
  name: string
  latitude: number
  longitude: number
  temperature: number
  salinity: number
  depth: number
}

export interface ArgoObservation {
  id: string
  floatId: string
  latitude: number
  longitude: number
  depth: number
  temperature: number
  salinity: number
  timestamp?: string
}

export interface OceanPoint {
  id: string
  latitude: number
  longitude: number
  depth: number
  temperature: number
  salinity: number
  timestamp?: string
}

export interface ProfilePoint {
  depth: number
  observation: number
  model: number
}

export interface ValidationMetrics {
  bias: number
  rmse: number
  samples: number
  agreement: number
}