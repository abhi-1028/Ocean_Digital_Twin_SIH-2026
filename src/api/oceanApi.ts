import { apiGet } from './client'
import type {
  BackendArgoDataResponse,
  BackendArgoFloatResponse,
  BackendComparisonResponse,
  BackendOceanDataResponse,
} from '../types/api'
import type { OceanVariable } from '../types/ocean'

export function getOceanData(
  regionId: string,
  variable: OceanVariable,
  depth: number,
) {
  const params = new URLSearchParams({
    variable,
    depth: String(depth),
    max_points: '1200',
  })
  return apiGet<BackendOceanDataResponse>(
    `/api/ocean/${encodeURIComponent(regionId)}?${params.toString()}`,
  )
}

export function getArgoData(regionId: string) {
  return apiGet<BackendArgoDataResponse>(
    `/api/argo/${encodeURIComponent(regionId)}`,
  )
}

export function getArgoProfile(regionId: string, floatId: string) {
  return apiGet<BackendArgoFloatResponse>(
    `/api/argo/${encodeURIComponent(regionId)}/${encodeURIComponent(floatId)}`,
  )
}

export function getComparison(
  regionId: string,
  floatId: string,
  variable: OceanVariable,
) {
  const params = new URLSearchParams({ variable })
  return apiGet<BackendComparisonResponse>(
    `/api/compare/${encodeURIComponent(regionId)}/${encodeURIComponent(floatId)}?${params.toString()}`,
  )
}
