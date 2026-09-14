import { useEffect, useState } from 'react'

import { getArgoData } from '../api/oceanApi'
import { mockArgoObservations } from '../data/mockData'
import type { ArgoObservation } from '../types/ocean'

interface UseArgoDataResult {
  observations: ArgoObservation[]
  loading: boolean
  error: string | null
  source: string
}

function mapObservation(
  regionId: string,
  item: {
    float_id: string
    latitude: number
    longitude: number
    observation_time: string
    depth: number
    temperature: number
    salinity: number
  },
  index: number,
): ArgoObservation {
  return {
    id: `${regionId}-${item.float_id}-${item.observation_time}-${item.depth}-${index}`,
    regionId,
    floatId: item.float_id,
    latitude: item.latitude,
    longitude: item.longitude,
    observationTime: item.observation_time,
    depth: item.depth,
    temperature: item.temperature,
    salinity: item.salinity,
  }
}

export function useArgoData(regionId: string): UseArgoDataResult {
  const [observations, setObservations] = useState<ArgoObservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState('loading')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const data = await getArgoData(regionId)
        if (cancelled) return

        const mapped = data.observations.map((item, index) =>
          mapObservation(regionId, item, index),
        )

        if (mapped.length > 0) {
          setObservations(mapped)
          setSource(data.source || 'observation')
        } else {
          throw new Error('No Argo observations are available for this region.')
        }
      } catch (err) {
        if (cancelled) return

        const fallback = mockArgoObservations.filter(
          (item) => item.regionId === regionId,
        )
        setObservations(fallback)
        setSource('synthetic demo fallback')
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load Argo observations.',
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [regionId])

  return { observations, loading, error, source }
}
