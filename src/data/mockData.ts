import type {
  ArgoFloat,
  ProfilePoint,
  Region,
  ValidationMetrics,
} from '../types/ocean'

export const regions: Region[] = [
  {
    id: 'bay-of-bengal',
    name: 'Bay of Bengal',
    center: [15, 88],
    description: 'Tropical northern Indian Ocean',
  },
  {
    id: 'arabian-sea',
    name: 'Arabian Sea',
    center: [15, 65],
    description: 'Western Indian Ocean basin',
  },
  {
    id: 'indian-ocean',
    name: 'Indian Ocean',
    center: [-10, 80],
    description: 'Large-scale Indian Ocean domain',
  },
  {
    id: 'north-atlantic',
    name: 'North Atlantic',
    center: [35, -45],
    description: 'North Atlantic Ocean domain',
  },
]

export const argoFloats: ArgoFloat[] = [
  {
    id: 'ARGO-2901',
    name: 'ARGO-2901',
    latitude: 15.2,
    longitude: 88.4,
    temperature: 28.4,
    salinity: 34.7,
    depth: 100,
  },
  {
    id: 'ARGO-3147',
    name: 'ARGO-3147',
    latitude: 13.7,
    longitude: 86.9,
    temperature: 27.8,
    salinity: 35.1,
    depth: 250,
  },
  {
    id: 'ARGO-4278',
    name: 'ARGO-4278',
    latitude: 17.1,
    longitude: 90.1,
    temperature: 29.1,
    salinity: 34.4,
    depth: 150,
  },
  {
    id: 'ARGO-5182',
    name: 'ARGO-5182',
    latitude: 11.9,
    longitude: 89.2,
    temperature: 26.9,
    salinity: 35.4,
    depth: 350,
  },
  {
    id: 'ARGO-6044',
    name: 'ARGO-6044',
    latitude: 16.4,
    longitude: 85.7,
    temperature: 28.8,
    salinity: 34.9,
    depth: 200,
  },
  {
    id: 'ARGO-7315',
    name: 'ARGO-7315',
    latitude: 14.3,
    longitude: 91.2,
    temperature: 27.4,
    salinity: 35.2,
    depth: 450,
  },
]

export const temperatureProfile: ProfilePoint[] = [
  { depth: 0, observation: 29.1, model: 28.9 },
  { depth: 25, observation: 28.8, model: 28.7 },
  { depth: 50, observation: 28.4, model: 28.5 },
  { depth: 75, observation: 27.9, model: 28.0 },
  { depth: 100, observation: 27.5, model: 27.7 },
  { depth: 150, observation: 26.7, model: 26.9 },
  { depth: 200, observation: 25.9, model: 26.1 },
  { depth: 300, observation: 24.2, model: 24.5 },
  { depth: 400, observation: 22.8, model: 23.0 },
  { depth: 500, observation: 21.5, model: 21.7 },
  { depth: 600, observation: 20.4, model: 20.5 },
  { depth: 750, observation: 18.8, model: 19.0 },
  { depth: 1000, observation: 16.9, model: 17.2 },
]

export const salinityProfile: ProfilePoint[] = [
  { depth: 0, observation: 34.1, model: 34.3 },
  { depth: 25, observation: 34.2, model: 34.3 },
  { depth: 50, observation: 34.5, model: 34.4 },
  { depth: 75, observation: 34.7, model: 34.6 },
  { depth: 100, observation: 34.8, model: 34.7 },
  { depth: 150, observation: 35.0, model: 34.9 },
  { depth: 200, observation: 35.1, model: 35.0 },
  { depth: 300, observation: 35.2, model: 35.2 },
  { depth: 400, observation: 35.3, model: 35.2 },
  { depth: 500, observation: 35.4, model: 35.3 },
  { depth: 600, observation: 35.5, model: 35.4 },
  { depth: 750, observation: 35.6, model: 35.5 },
  { depth: 1000, observation: 35.7, model: 35.6 },
]

export const validationMetrics: ValidationMetrics = {
  bias: 0.18,
  rmse: 0.42,
  samples: 13,
  agreement: 94.2,
}