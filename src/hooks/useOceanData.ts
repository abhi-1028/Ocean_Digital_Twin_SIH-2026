import { useEffect, useState } from 'react'

import { getOceanData } from '../api/oceanApi'
import { getMockOceanPoints } from '../data/mockData'
import type {
  OceanPoint,
  OceanVariable,
} from '../types/ocean'

interface UseOceanDataResult {
  points: OceanPoint[]
  loading: boolean
  error: string | null
  source: string
  actualDepth: number
  timestamp: string | null
}

export function useOceanData(
  regionId: string,
  variable: OceanVariable,
  depth: number,
  time?: string | null,
): UseOceanDataResult {
  const [points, setPoints] =
    useState<OceanPoint[]>([])

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const [source, setSource] =
    useState('loading')

  const [actualDepth, setActualDepth] =
    useState(depth)

  const [timestamp, setTimestamp] =
    useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const data =
          await getOceanData(
            regionId,
            variable,
            depth,
            time,
          )

        if (cancelled) {
          return
        }

        if (
          !data.points ||
          data.points.length === 0
        ) {
          throw new Error(
            'No model points are available for this selection.',
          )
        }

        setPoints(data.points)

        setActualDepth(
          data.depth?.[0] ?? depth,
        )

        setTimestamp(
          data.time?.[0] ?? time ?? null,
        )

        setSource(
          data.source || 'model',
        )

        setError(null)
      } catch (err) {
        if (cancelled) {
          return
        }

        const fallbackPoints =
          getMockOceanPoints(
            regionId,
            variable,
            depth,
          )

        if (
          fallbackPoints.length > 0
        ) {
          setPoints(fallbackPoints)

          setActualDepth(depth)

          setTimestamp(
            time ?? null,
          )

          setSource(
            'synthetic demo fallback',
          )

          setError(null)

          return
        }

        setPoints([])
        setActualDepth(depth)
        setTimestamp(time ?? null)
        setSource('unavailable')

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load ocean model data.',
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [
    regionId,
    variable,
    depth,
    time,
  ])

  return {
    points,
    loading,
    error,
    source,
    actualDepth,
    timestamp,
  }
}