import { apiGet } from './client'

import type {
  ArgoDataResponse,
  ArgoProfileResponse,
  ComparisonResponse,
  OceanApiResponse,
} from '../types/api'

export async function getOceanData(): Promise<OceanApiResponse> {
  return apiGet<OceanApiResponse>('/api/ocean')
}

export async function getArgoData(): Promise<ArgoDataResponse> {
  return apiGet<ArgoDataResponse>('/api/floats')
}

export async function getArgoProfile(
  floatId: string
): Promise<ArgoProfileResponse> {
  return apiGet<ArgoProfileResponse>(
    `/api/floats/${encodeURIComponent(floatId)}`
  )
}

export async function getComparison(
  floatId: string
): Promise<ComparisonResponse> {
  return apiGet<ComparisonResponse>(
    `/api/comparison/${encodeURIComponent(floatId)}`
  )
}