import type {
  ArgoFloat,
  ArgoObservation,
  OceanPoint,
  ProfilePoint,
  Region,
  ValidationMetrics,
  OceanVariable,
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
  observation(
    'bay_of_bengal',
    'ARGO_BOB_001',
    14,
    85,
    '2026-08-15',
    0,
    28.2,
    34.5,
    0,
  ),
  observation(
    'bay_of_bengal',
    'ARGO_BOB_001',
    14,
    85,
    '2026-08-15',
    50,
    27.2,
    35,
    1,
  ),
  observation(
    'bay_of_bengal',
    'ARGO_BOB_001',
    14,
    85,
    '2026-08-15',
    100,
    26.1,
    35.5,
    2,
  ),
  observation(
    'bay_of_bengal',
    'ARGO_BOB_002',
    16,
    87.5,
    '2026-08-16',
    0,
    28,
    34.6,
    3,
  ),
  observation(
    'bay_of_bengal',
    'ARGO_BOB_002',
    16,
    87.5,
    '2026-08-16',
    50,
    27.1,
    35.1,
    4,
  ),
  observation(
    'bay_of_bengal',
    'ARGO_BOB_002',
    16,
    87.5,
    '2026-08-16',
    100,
    26,
    35.6,
    5,
  ),

  observation(
    'arabian_sea',
    'ARGO_AS_001',
    15,
    65,
    '2026-08-15',
    0,
    28.4,
    35.4,
    6,
  ),
  observation(
    'arabian_sea',
    'ARGO_AS_001',
    15,
    65,
    '2026-08-15',
    50,
    27.8,
    35.5,
    7,
  ),
  observation(
    'arabian_sea',
    'ARGO_AS_001',
    15,
    65,
    '2026-08-15',
    100,
    27.3,
    35.6,
    8,
  ),
  observation(
    'arabian_sea',
    'ARGO_AS_002',
    13,
    68,
    '2026-08-16',
    0,
    28.1,
    35.2,
    9,
  ),
  observation(
    'arabian_sea',
    'ARGO_AS_002',
    13,
    68,
    '2026-08-16',
    50,
    27.5,
    35.3,
    10,
  ),
  observation(
    'arabian_sea',
    'ARGO_AS_002',
    13,
    68,
    '2026-08-16',
    100,
    26.9,
    35.4,
    11,
  ),

  observation(
    'indian_ocean',
    'ARGO_IO_001',
    -10,
    80,
    '2026-08-15',
    0,
    26.8,
    34.9,
    12,
  ),
  observation(
    'indian_ocean',
    'ARGO_IO_001',
    -10,
    80,
    '2026-08-15',
    50,
    26.2,
    35,
    13,
  ),
  observation(
    'indian_ocean',
    'ARGO_IO_001',
    -10,
    80,
    '2026-08-15',
    100,
    25.8,
    35.2,
    14,
  ),
  observation(
    'indian_ocean',
    'ARGO_IO_002',
    -7,
    84,
    '2026-08-16',
    0,
    27,
    34.8,
    15,
  ),
  observation(
    'indian_ocean',
    'ARGO_IO_002',
    -7,
    84,
    '2026-08-16',
    50,
    26.5,
    34.9,
    16,
  ),
  observation(
    'indian_ocean',
    'ARGO_IO_002',
    -7,
    84,
    '2026-08-16',
    100,
    26.1,
    35.1,
    17,
  ),

  observation(
    'north_atlantic',
    'ARGO_NA_001',
    35,
    -45,
    '2026-08-15',
    0,
    21.8,
    35.6,
    18,
  ),
  observation(
    'north_atlantic',
    'ARGO_NA_001',
    35,
    -45,
    '2026-08-15',
    50,
    20.9,
    35.7,
    19,
  ),
  observation(
    'north_atlantic',
    'ARGO_NA_001',
    35,
    -45,
    '2026-08-15',
    100,
    20.4,
    35.7,
    20,
  ),
  observation(
    'north_atlantic',
    'ARGO_NA_002',
    38,
    -42,
    '2026-08-16',
    0,
    21.2,
    35.5,
    21,
  ),
  observation(
    'north_atlantic',
    'ARGO_NA_002',
    38,
    -42,
    '2026-08-16',
    50,
    20.3,
    35.6,
    22,
  ),
  observation(
    'north_atlantic',
    'ARGO_NA_002',
    38,
    -42,
    '2026-08-16',
    100,
    19.7,
    35.6,
    23,
  ),
]

interface GridRegionDefinition {
  centerLat: number
  centerLon: number
  temperatureBase: number
  salinityBase: number
}

const gridRegions: Record<string, GridRegionDefinition> = {
  bay_of_bengal: {
    centerLat: 15,
    centerLon: 88,
    temperatureBase: 28.5,
    salinityBase: 34.8,
  },
  arabian_sea: {
    centerLat: 15,
    centerLon: 65,
    temperatureBase: 28,
    salinityBase: 35.5,
  },
  indian_ocean: {
    centerLat: -10,
    centerLon: 80,
    temperatureBase: 26,
    salinityBase: 35.1,
  },
  north_atlantic: {
    centerLat: 35,
    centerLon: -45,
    temperatureBase: 21,
    salinityBase: 35.6,
  },
}

function makeGrid(
  centerLat: number,
  centerLon: number,
  variable: OceanVariable,
  depth: number,
): OceanPoint[] {
  const points: OceanPoint[] = []

  const depthFactor = depth / 1000

  for (let latIndex = -2; latIndex <= 2; latIndex += 1) {
    for (let lonIndex = -2; lonIndex <= 2; lonIndex += 1) {
      const latitude = centerLat + latIndex * 1.2
      const longitude = centerLon + lonIndex * 1.5

      const radial = Math.sqrt(
        latIndex ** 2 + lonIndex ** 2,
      )

      const horizontalVariation =
        Math.sin((latIndex + 2) * 0.9) * 0.18 +
        Math.cos((lonIndex + 2) * 0.7) * 0.12

      let value: number

      if (variable === 'temperature') {
        const surfaceTemperature =
          gridRegions[
            Object.keys(gridRegions).find(
              (key) =>
                gridRegions[key].centerLat === centerLat &&
                gridRegions[key].centerLon === centerLon,
            ) ?? 'bay_of_bengal'
          ].temperatureBase

        value =
          surfaceTemperature -
          depthFactor * 8.5 -
          radial * 0.35 +
          latIndex * 0.04 +
          horizontalVariation
      } else {
        const surfaceSalinity =
          gridRegions[
            Object.keys(gridRegions).find(
              (key) =>
                gridRegions[key].centerLat === centerLat &&
                gridRegions[key].centerLon === centerLon,
            ) ?? 'bay_of_bengal'
          ].salinityBase

        value =
          surfaceSalinity +
          depthFactor * 0.75 +
          radial * 0.07 -
          latIndex * 0.015 +
          horizontalVariation * 0.12
      }

      points.push({
        latitude,
        longitude,
        value: Number(value.toFixed(3)),
      })
    }
  }

  return points
}

export function getMockOceanPoints(
  regionId: string,
  variable: OceanVariable,
  depth: number,
): OceanPoint[] {
  const region = gridRegions[regionId] ?? gridRegions.bay_of_bengal

  return makeGrid(
    region.centerLat,
    region.centerLon,
    variable,
    depth,
  )
}

export const mockOceanPoints: Record<string, OceanPoint[]> =
  Object.fromEntries(
    Object.keys(gridRegions).map((regionId) => [
      regionId,
      getMockOceanPoints(regionId, 'temperature', 100),
    ]),
  )

function buildProfile(
  variable: OceanVariable,
  temperatureOffset = 0,
  salinityOffset = 0,
): ProfilePoint[] {
  const depths = [
    0,
    50,
    100,
    150,
    200,
    250,
    300,
    400,
    500,
    600,
    700,
    850,
    1000,
  ]

  return depths.map((depth) => {
    const depthFactor = depth / 1000

    if (variable === 'temperature') {
      const observation =
        28.2 -
        depthFactor * 9.6 +
        temperatureOffset

      const model =
        observation -
        0.08 +
        Math.sin(depth / 180) * 0.03

      return {
        depth,
        observation: Number(observation.toFixed(2)),
        model: Number(model.toFixed(2)),
      }
    }

    const observation =
      34.5 +
      depthFactor * 0.9 +
      Math.sin(depth / 150) * 0.35 +
      salinityOffset

    const model =
      observation +
      0.04 -
      Math.cos(depth / 220) * 0.02

    return {
      depth,
      observation: Number(observation.toFixed(2)),
      model: Number(model.toFixed(2)),
    }
  })
}

export const temperatureProfile = buildProfile(
  'temperature',
)

export const salinityProfile = buildProfile(
  'salinity',
)

export function getFallbackProfile(
  floatId: string,
  variable: OceanVariable,
): ProfilePoint[] {
  const float = argoFloats.find(
    (item) => item.id === floatId,
  )

  if (!float) {
    return variable === 'temperature'
      ? temperatureProfile
      : salinityProfile
  }

  if (variable === 'temperature') {
    const offset = float.temperature - 28

    return buildProfile(
      'temperature',
      offset,
      0,
    )
  }

  const offset = float.salinity - 34.6

  return buildProfile(
    'salinity',
    0,
    offset,
  )
}

export const validationMetrics: ValidationMetrics = {
  bias: 0.08,
  rmse: 0.09,
  samples: 13,
  agreement: 98.2,
}