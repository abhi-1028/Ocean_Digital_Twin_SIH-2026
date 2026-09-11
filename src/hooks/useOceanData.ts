import { useEffect, useState } from 'react'

import { getOceanData } from '../api/oceanApi'
import { mockOceanPoints } from '../data/mockData'
import type { OceanPoint, OceanVariable } from '../types/ocean'

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
): UseOceanDataResult {
  const [points, setPoints] = useState<OceanPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState('loading')
  const [actualDepth, setActualDepth] = useState(depth)
  const [timestamp, setTimestamp] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const data = await getOceanData(regionId, variable, depth)
        if (cancelled) return

        if (!data.points?.length) {
          throw new Error('No model points are available for this selection.')
        }

        setPoints(data.points)
        setActualDepth(data.depth?.[0] ?? depth)
        setTimestamp(data.time?.[0] ?? null)
        setSource(data.source || 'model')
      } catch (err) {
        if (cancelled) return

        setPoints((mockOceanPoints[regionId] ?? []).map((point) => ({
          ...point,
          value:
            variable === 'salinity'
              ? 35.1 + (point.value - 28.5) * 0.12
              : point.value,
        })))
        setActualDepth(depth)
        setTimestamp(null)
        setSource('synthetic demo fallback')
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load ocean model data.',
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [regionId, variable, depth])

  return { points, loading, error, source, actualDepth, timestamp }
}
