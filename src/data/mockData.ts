import type {
  ArgoFloat,
  ArgoObservation,
  OceanPoint,
  ProfilePoint,
  Region,
  ValidationMetrics,
} from '../types/ocean'

export const regions: Region[] = [
  {
    id: 'bay_of_bengal',
    name: 'Bay of Bengal',
    center: [15, 88],
    description: 'Indian Ocean marginal sea',
  },
  {
    id: 'arabian_sea',
    name: 'Arabian Sea',
    center: [15, 65],
    description: 'Western Indian Ocean basin',
  },
  {
    id: 'indian_ocean',
    name: 'Indian Ocean',
    center: [-10, 80],
    description: 'Tropical Indian Ocean basin',
  },
  {
    id: 'north_atlantic',
    name: 'North Atlantic',
    center: [35, -45],
    description: 'North Atlantic Ocean basin',
  },
]

export const argoFloats: ArgoFloat[] = [
  {
    id: 'ARGO_BOB_001',
    name: 'ARGO_BOB_001',
    latitude: 14,
    longitude: 85,
    temperature: 28.2,
    salinity: 34.5,
    depth: 100,
  },
  {
    id: 'ARGO_BOB_002',
    name: 'ARGO_BOB_002',
    latitude: 16,
    longitude: 87.5,
    temperature: 28,
    salinity: 34.6,
    depth: 100,
  },
  {
    id: 'ARGO_AS_001',
    name: 'ARGO_AS_001',
    latitude: 15,
    longitude: 65,
    temperature: 27.3,
    salinity: 35.6,
    depth: 100,
  },
  {
    id: 'ARGO_AS_002',
    name: 'ARGO_AS_002',
    latitude: 13,
    longitude: 68,
    temperature: 27.8,
    salinity: 35.4,
    depth: 100,
  },
  {
    id: 'ARGO_IO_001',
    name: 'ARGO_IO_001',
    latitude: -10,
    longitude: 80,
    temperature: 25.8,
    salinity: 35.2,
    depth: 100,
  },
  {
    id: 'ARGO_IO_002',
    name: 'ARGO_IO_002',
    latitude: -7,
    longitude: 84,
    temperature: 26.1,
    salinity: 35.1,
    depth: 100,
  },
  {
    id: 'ARGO_NA_001',
    name: 'ARGO_NA_001',
    latitude: 35,
    longitude: -45,
    temperature: 20.4,
    salinity: 35.7,
    depth: 100,
  },
  {
    id: 'ARGO_NA_002',
    name: 'ARGO_NA_002',
    latitude: 38,
    longitude: -42,
    temperature: 19.7,
    salinity: 35.6,
    depth: 100,
  },
]

function observation(
  regionId: string,
  floatId: string,
  latitude: number,
  longitude: number,
  time: string,
  depth: number,
  temperature: number,
  salinity: number,
  index: number,
): ArgoObservation {
  return {
    id: `${regionId}-${floatId}-${depth}-${index}`,
    regionId,
    floatId,
    latitude,
    longitude,
    observationTime: time,
    depth,
    temperature,
    salinity,
  }
}

export const mockArgoObservations: ArgoObservation[] = [
  observation('bay_of_bengal', 'ARGO_BOB_001', 14, 85, '2026-08-15', 0, 28.2, 34.5, 0),
  observation('bay_of_bengal', 'ARGO_BOB_001', 14, 85, '2026-08-15', 50, 27.2, 35, 1),
  observation('bay_of_bengal', 'ARGO_BOB_001', 14, 85, '2026-08-15', 100, 26.1, 35.5, 2),
  observation('bay_of_bengal', 'ARGO_BOB_002', 16, 87.5, '2026-08-16', 0, 28, 34.6, 3),
  observation('bay_of_bengal', 'ARGO_BOB_002', 16, 87.5, '2026-08-16', 50, 27.1, 35.1, 4),
  observation('bay_of_bengal', 'ARGO_BOB_002', 16, 87.5, '2026-08-16', 100, 26, 35.6, 5),

  observation('arabian_sea', 'ARGO_AS_001', 15, 65, '2026-08-15', 0, 28.4, 35.4, 6),
  observation('arabian_sea', 'ARGO_AS_001', 15, 65, '2026-08-15', 50, 27.8, 35.5, 7),
  observation('arabian_sea', 'ARGO_AS_001', 15, 65, '2026-08-15', 100, 27.3, 35.6, 8),
  observation('arabian_sea', 'ARGO_AS_002', 13, 68, '2026-08-16', 0, 28.1, 35.2, 9),
  observation('arabian_sea', 'ARGO_AS_002', 13, 68, '2026-08-16', 50, 27.5, 35.3, 10),
  observation('arabian_sea', 'ARGO_AS_002', 13, 68, '2026-08-16', 100, 26.9, 35.4, 11),

  observation('indian_ocean', 'ARGO_IO_001', -10, 80, '2026-08-15', 0, 26.8, 34.9, 12),
  observation('indian_ocean', 'ARGO_IO_001', -10, 80, '2026-08-15', 50, 26.2, 35.0, 13),
  observation('indian_ocean', 'ARGO_IO_001', -10, 80, '2026-08-15', 100, 25.8, 35.2, 14),
  observation('indian_ocean', 'ARGO_IO_002', -7, 84, '2026-08-16', 0, 27.0, 34.8, 15),
  observation('indian_ocean', 'ARGO_IO_002', -7, 84, '2026-08-16', 50, 26.5, 34.9, 16),
  observation('indian_ocean', 'ARGO_IO_002', -7, 84, '2026-08-16', 100, 26.1, 35.1, 17),

  observation('north_atlantic', 'ARGO_NA_001', 35, -45, '2026-08-15', 0, 21.8, 35.6, 18),
  observation('north_atlantic', 'ARGO_NA_001', 35, -45, '2026-08-15', 50, 20.9, 35.7, 19),
  observation('north_atlantic', 'ARGO_NA_001', 35, -45, '2026-08-15', 100, 20.4, 35.7, 20),
  observation('north_atlantic', 'ARGO_NA_002', 38, -42, '2026-08-16', 0, 21.2, 35.5, 21),
  observation('north_atlantic', 'ARGO_NA_002', 38, -42, '2026-08-16', 50, 20.3, 35.6, 22),
  observation('north_atlantic', 'ARGO_NA_002', 38, -42, '2026-08-16', 100, 19.7, 35.6, 23),
]

function makeGrid(
  centerLat: number,
  centerLon: number,
  variable: 'temperature' | 'salinity',
): OceanPoint[] {
  const points: OceanPoint[] = []

  for (let latIndex = -2; latIndex <= 2; latIndex += 1) {
    for (let lonIndex = -2; lonIndex <= 2; lonIndex += 1) {
      const latitude = centerLat + latIndex * 1.2
      const longitude = centerLon + lonIndex * 1.5
      const radial = Math.sqrt(latIndex ** 2 + lonIndex ** 2)

      const value =
        variable === 'temperature'
          ? 28.5 - radial * 0.45 + latIndex * 0.05
          : 35.1 + radial * 0.08 - latIndex * 0.015

      points.push({ latitude, longitude, value })
    }
  }

  return points
}

export const mockOceanPoints: Record<string, OceanPoint[]> = {
  bay_of_bengal: makeGrid(15, 88, 'temperature'),
  arabian_sea: makeGrid(15, 65, 'temperature'),
  indian_ocean: makeGrid(-10, 80, 'temperature'),
  north_atlantic: makeGrid(35, -45, 'temperature'),
}

export const temperatureProfile: ProfilePoint[] = [
  { depth: 0, observation: 28.2, model: 28.0 },
  { depth: 50, observation: 27.2, model: 27.0 },
  { depth: 100, observation: 26.1, model: 26.0 },
  { depth: 150, observation: 25.5, model: 25.5 },
  { depth: 200, observation: 24.8, model: 24.9 },
  { depth: 250, observation: 24.1, model: 24.2 },
  { depth: 300, observation: 23.5, model: 23.6 },
  { depth: 400, observation: 22.4, model: 22.5 },
  { depth: 500, observation: 21.6, model: 21.7 },
  { depth: 600, observation: 20.8, model: 20.9 },
  { depth: 700, observation: 20.1, model: 20.2 },
  { depth: 850, observation: 19.2, model: 19.3 },
  { depth: 1000, observation: 18.6, model: 18.7 },
]

export const salinityProfile: ProfilePoint[] = [
  { depth: 0, observation: 34.5, model: 34.5 },
  { depth: 50, observation: 35.0, model: 35.0 },
  { depth: 100, observation: 35.5, model: 35.5 },
  { depth: 150, observation: 35.6, model: 35.6 },
  { depth: 200, observation: 35.7, model: 35.7 },
  { depth: 250, observation: 35.8, model: 35.8 },
  { depth: 300, observation: 35.7, model: 35.7 },
  { depth: 400, observation: 35.6, model: 35.6 },
  { depth: 500, observation: 35.5, model: 35.5 },
  { depth: 600, observation: 35.4, model: 35.4 },
  { depth: 700, observation: 35.3, model: 35.3 },
  { depth: 850, observation: 35.2, model: 35.2 },
  { depth: 1000, observation: 35.1, model: 35.1 },
]

export const validationMetrics: ValidationMetrics = {
  bias: 0.18,
  rmse: 0.42,
  samples: 13,
  agreement: 94.2,
}
