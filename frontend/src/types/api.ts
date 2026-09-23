export interface OceanApiResponse {
  lat: number[]
  lon: number[]
  depth: number[]
  temperature: number[]
}

export interface ArgoApiFloat {
  id: string
  latitude: number
  longitude: number
  date: string
}

export type ArgoDataResponse =
  | ArgoApiFloat[]
  | {
      floats?: ArgoApiFloat[]
      data?: ArgoApiFloat[]
    }

export interface ArgoProfileResponse {
  float_id?: string
  id?: string

  depth?: number[]

  temperature?: number[]

  salinity?: number[]

  observation?: {
    temperature?: number[]
    salinity?: number[]
  }

  model?: {
    temperature?: number[]
    salinity?: number[]
  }
}

export interface ComparisonVariable {
  bias: number
  rmse: number
}

export interface ComparisonResponse {
  float_id: string

  depth: number[]

  observation: {
    temperature: number[]
    salinity: number[]
  }

  model: {
    temperature: number[]
    salinity: number[]
  }

  metrics: {
    temperature: ComparisonVariable
    salinity: ComparisonVariable
  }
}