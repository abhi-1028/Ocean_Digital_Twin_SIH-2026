import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { getArgoData } from '../api/oceanApi'

import {
  mockArgoObservations,
  regions,
} from '../data/mockData'

import type {
  ArgoDataResponse,
  ArgoApiFloat,
} from '../types/api'

import type {
  ArgoFloat,
  ArgoObservation,
} from '../types/ocean'

export interface UseArgoDataResult {
  floats: ArgoFloat[]
  observations: ArgoObservation[]
  loading: boolean
  error: string | null
  usingMockData: boolean
  getFloatObservation: (
    floatId: string
  ) => ArgoObservation | undefined
  refresh: () => void
}

function normalizeFloats(
  payload: ArgoDataResponse
): ArgoFloat[] {
  let rawFloats: ArgoApiFloat[] = []

  if (Array.isArray(payload)) {
    rawFloats = payload
  } else if (
    Array.isArray(payload.floats)
  ) {
    rawFloats = payload.floats
  } else if (
    Array.isArray(payload.data)
  ) {
    rawFloats = payload.data
  }

  return rawFloats
    .filter(
      (float) =>
        float &&
        typeof float.id ===
          'string' &&
        Number.isFinite(
          Number(float.latitude)
        ) &&
        Number.isFinite(
          Number(float.longitude)
        )
    )
    .map(
      (float) => ({
        id: float.id,
        name: float.id,
        latitude: Number(
          float.latitude
        ),
        longitude: Number(
          float.longitude
        ),

        /*
         * The /api/floats endpoint does
         * not provide temperature,
         * salinity, or depth.
         *
         * These are populated later by
         * the detailed/profile endpoint.
         */
        temperature: 0,
        salinity: 0,
        depth: 0,
      })
    )
}

function observationsFromFloats(
  floats: ArgoFloat[]
): ArgoObservation[] {
  return floats.map(
    (float, index) => ({
      id: `OBS-${String(
        index + 1
      ).padStart(3, '0')}`,

      floatId: float.id,

      latitude:
        float.latitude,

      longitude:
        float.longitude,

      depth:
        float.depth,

      temperature:
        float.temperature,

      salinity:
        float.salinity,
    })
  )
}

function useArgoData(
  selectedRegion?: string
): UseArgoDataResult {
  const [
    floats,
    setFloats,
  ] = useState<ArgoFloat[]>(
    []
  )

  const [
    observations,
    setObservations,
  ] = useState<
    ArgoObservation[]
  >(mockArgoObservations)

  const [
    loading,
    setLoading,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  )

  const [
    usingMockData,
    setUsingMockData,
  ] = useState(true)

  const loadArgoData =
    useCallback(async () => {
      setLoading(true)
      setError(null)

      try {
        const response =
          await getArgoData()

        const apiFloats =
          normalizeFloats(
            response
          )

        if (
          apiFloats.length > 0
        ) {
          setFloats(apiFloats)

          setObservations(
            observationsFromFloats(
              apiFloats
            )
          )

          setUsingMockData(
            false
          )
        } else {
          throw new Error(
            'Argo API returned no floats.'
          )
        }
      } catch (err) {
        console.warn(
          'Argo API unavailable:',
          err
        )

        const fallbackFloats =
          mockArgoObservations.map(
            (observation) => ({
              id:
                observation.floatId,

              name:
                observation.floatId,

              latitude:
                observation.latitude,

              longitude:
                observation.longitude,

              temperature:
                observation.temperature,

              salinity:
                observation.salinity,

              depth:
                observation.depth,
            })
          )

        setFloats(
          fallbackFloats
        )

        setObservations(
          mockArgoObservations
        )

        setUsingMockData(
          true
        )

        setError(
          'Argo backend unavailable. Showing demo data.'
        )
      } finally {
        setLoading(false)
      }
    }, [])

  useEffect(() => {
    void loadArgoData()
  }, [loadArgoData])

  const visibleFloats =
    useMemo(() => {
      if (
        !selectedRegion
      ) {
        return floats
      }

      const region =
        regions.find(
          (item) =>
            item.id ===
            selectedRegion
        )

      if (!region) {
        return floats
      }

      const [
        centerLat,
        centerLon,
      ] = region.center

      const latRange =
        selectedRegion ===
        'north-atlantic'
          ? 20
          : selectedRegion ===
              'indian-ocean'
            ? 18
            : 8

      const lonRange =
        selectedRegion ===
        'north-atlantic'
          ? 25
          : selectedRegion ===
              'indian-ocean'
            ? 25
            : 10

      return floats.filter(
        (float) =>
          float.latitude >=
            centerLat -
              latRange &&
          float.latitude <=
            centerLat +
              latRange &&
          float.longitude >=
            centerLon -
              lonRange &&
          float.longitude <=
            centerLon +
              lonRange
      )
    }, [
      floats,
      selectedRegion,
    ])

  const visibleObservations =
    useMemo(() => {
      return observations.filter(
        (observation) =>
          visibleFloats.some(
            (float) =>
              float.id ===
              observation.floatId
          )
      )
    }, [
      observations,
      visibleFloats,
    ])

  const getFloatObservation =
    useCallback(
      (
        floatId: string
      ) =>
        visibleObservations.find(
          (observation) =>
            observation.floatId ===
            floatId
        ),
      [visibleObservations]
    )

  return {
    floats: visibleFloats,
    observations:
      visibleObservations,
    loading,
    error,
    usingMockData,
    getFloatObservation,
    refresh:
      loadArgoData,
  }
}

export default useArgoData