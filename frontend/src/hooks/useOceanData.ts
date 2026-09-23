import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { getOceanData } from '../api/oceanApi'

import { mockOceanPoints, regions } from '../data/mockData'

import type {
  OceanPoint,
  OceanVariable,
} from '../types/ocean'

interface OceanApiPayload {
  lat: number[]
  lon: number[]
  depth: number[]
  temperature: number[]
}

function normalizeOceanPoints(
  payload: OceanApiPayload
): OceanPoint[] {
  const length = Math.min(
    payload.lat?.length ?? 0,
    payload.lon?.length ?? 0,
    payload.depth?.length ?? 0,
    payload.temperature?.length ?? 0
  )

  return Array.from(
    { length },
    (_, index) => ({
      id: `OCEAN-${String(index + 1).padStart(3, '0')}`,
      latitude: Number(payload.lat[index]),
      longitude: Number(payload.lon[index]),
      depth: Number(payload.depth[index]),
      temperature: Number(
        payload.temperature[index]
      ),
      salinity: 0,
    })
  ).filter(
    (point) =>
      Number.isFinite(point.latitude) &&
      Number.isFinite(point.longitude) &&
      Number.isFinite(point.depth) &&
      Number.isFinite(point.temperature)
  )
}

function getRegionBounds(
  regionId: string
) {
  const region = regions.find(
    (item) => item.id === regionId
  )

  if (!region) {
    return null
  }

  const [centerLat, centerLon] =
    region.center

  /*
   * The demo regions use a broad geographic
   * window around their center.
   */
  const latitudeRange =
    regionId === 'indian-ocean'
      ? 18
      : regionId === 'north-atlantic'
        ? 20
        : 8

  const longitudeRange =
    regionId === 'indian-ocean'
      ? 25
      : regionId === 'north-atlantic'
        ? 25
        : 10

  return {
    minLat: centerLat - latitudeRange,
    maxLat: centerLat + latitudeRange,
    minLon: centerLon - longitudeRange,
    maxLon: centerLon + longitudeRange,
  }
}

function filterByRegion(
  points: OceanPoint[],
  regionId?: string
): OceanPoint[] {
  if (!regionId) {
    return points
  }

  const bounds =
    getRegionBounds(regionId)

  if (!bounds) {
    return points
  }

  return points.filter(
    (point) =>
      point.latitude >= bounds.minLat &&
      point.latitude <= bounds.maxLat &&
      point.longitude >= bounds.minLon &&
      point.longitude <= bounds.maxLon
  )
}

function filterByDepth(
  points: OceanPoint[],
  selectedDepth: number
): OceanPoint[] {
  /*
   * We keep a depth window instead of requiring
   * an exact match because real ocean datasets
   * rarely contain exactly 100m / 200m / etc.
   */
  const tolerance =
    selectedDepth <= 100
      ? 100
      : 150

  const filtered =
    points.filter(
      (point) =>
        Math.abs(
          point.depth -
            selectedDepth
        ) <= tolerance
    )

  /*
   * If the API has data but nothing exists in
   * the selected depth range, return the nearest
   * points so the 3D viewer never appears empty.
   */
  if (
    filtered.length === 0 &&
    points.length > 0
  ) {
    return [...points]
      .sort(
        (a, b) =>
          Math.abs(
            a.depth -
              selectedDepth
          ) -
          Math.abs(
            b.depth -
              selectedDepth
          )
      )
      .slice(0, 12)
  }

  return filtered
}

function applyVariableData(
  points: OceanPoint[],
  variable: OceanVariable
): OceanPoint[] {
  /*
   * The current API contract provides temperature.
   * Salinity is therefore kept as 0 when the backend
   * does not provide it.
   *
   * This function deliberately keeps the same point
   * structure so the 3D viewer can switch variables
   * without breaking.
   */
  if (variable === 'salinity') {
    return points.map((point) => ({
      ...point,
      salinity:
        point.salinity > 0
          ? point.salinity
          : 34,
    }))
  }

  return points
}

function useOceanData(
  selectedRegion?: string,
  variable: OceanVariable = 'temperature',
  depth = 100
) {
  const [
    points,
    setPoints,
  ] = useState<OceanPoint[]>(
    mockOceanPoints
  )

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

  const loadOceanData =
    useCallback(async () => {
      setLoading(true)
      setError(null)

      try {
        const response =
          await getOceanData()

        const apiPoints =
          normalizeOceanPoints(
            response
          )

        if (apiPoints.length > 0) {
          setPoints(apiPoints)
          setUsingMockData(false)
        } else {
          setPoints(
            mockOceanPoints
          )
          setUsingMockData(true)

          setError(
            'Ocean API returned no data. Showing demo data.'
          )
        }
      } catch (err) {
        console.warn(
          'Ocean API unavailable:',
          err
        )

        setPoints(
          mockOceanPoints
        )

        setUsingMockData(true)

        setError(
          'Ocean backend unavailable. Showing demo data.'
        )
      } finally {
        setLoading(false)
      }
    }, [])

  useEffect(() => {
    void loadOceanData()
  }, [loadOceanData])

  const visiblePoints =
    useMemo(() => {
      let result =
        filterByRegion(
          points,
          selectedRegion
        )

      result =
        filterByDepth(
          result,
          depth
        )

      result =
        applyVariableData(
          result,
          variable
        )

      /*
       * During demo mode, some regions/depths
       * may legitimately have no matching point.
       * Falling back to all points prevents the
       * visualization from becoming completely empty.
       */
      if (
        result.length === 0 &&
        points.length > 0
      ) {
        return applyVariableData(
          points,
          variable
        )
      }

      return result
    }, [
      points,
      selectedRegion,
      variable,
      depth,
    ])

  const getPointsForVariable =
    useCallback(
      (
        requestedVariable: OceanVariable
      ) =>
        applyVariableData(
          visiblePoints,
          requestedVariable
        ),
      [visiblePoints]
    )

  return {
    points: visiblePoints,
    loading,
    error,
    usingMockData,
    getPointsForVariable,
    refresh: loadOceanData,
  }
}

export default useOceanData