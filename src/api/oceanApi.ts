import { apiGet } from "./client";

import type {
  ArgoDataResponse,
  ArgoProfileResponse,
  ComparisonResponse,
  OceanDataResponse,
} from "../types/api";

export async function getOceanData(
  regionId: string,
  variable: "temperature" | "salinity",
  depth: number
): Promise<OceanDataResponse> {
  return apiGet<OceanDataResponse>(
    `/api/ocean/${regionId}?variable=${variable}&depth=${depth}`
  );
}

export async function getArgoData(
  regionId: string
): Promise<ArgoDataResponse> {
  return apiGet<ArgoDataResponse>(
    `/api/argo/${regionId}`
  );
}

export async function getArgoProfile(
  regionId: string,
  floatId: string
): Promise<ArgoProfileResponse> {
  return apiGet<ArgoProfileResponse>(
    `/api/argo/${regionId}/${floatId}`
  );
}

export async function getComparison(
  regionId: string,
  floatId: string
): Promise<ComparisonResponse> {
  return apiGet<ComparisonResponse>(
    `/api/compare/${regionId}/${floatId}`
  );
}