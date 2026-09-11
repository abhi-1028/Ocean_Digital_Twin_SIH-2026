import { useEffect, useState } from 'react'

import { getComparison } from '../api/oceanApi'
import {
  salinityProfile,
  temperatureProfile,
  validationMetrics,
} from '../data/mockData'
import type {
  OceanVariable,
  ProfilePoint,
  ValidationMetrics,
} from '../types/ocean'

interface UseComparisonDataResult {
  profile: ProfilePoint[]
  metrics: ValidationMetrics
  loading: boolean
  error: string | null
  source: string
}

function calculateAgreement(
  profile: ProfilePoint[],
  rmse: number,
): number {
  if (!profile.length) return 0

  const values = profile.flatMap((point) => [point.observation, point.model])
  const range = Math.max(Math.max(...values) - Math.min(...values), 0.001)

  return Math.max(0, Math.min(100, 100 * (1 - rmse / range)))
}

export function useComparisonData(
  regionId: string,
  floatId: string | null,
  variable: OceanVariable,
): UseComparisonDataResult {
  const fallbackProfile =
    variable === 'temperature' ? temperatureProfile : salinityProfile

  const [profile, setProfile] = useState<ProfilePoint[]>(fallbackProfile)
  const [metrics, setMetrics] = useState<ValidationMetrics>(validationMetrics)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState('synthetic demo fallback')

  useEffect(() => {
    let cancelled = false

    if (!floatId) {
      setProfile(fallbackProfile)
      setMetrics(validationMetrics)
      setSource('waiting for float')
      setError(null)
      setLoading(false)
      return () => {
        cancelled = true
      }
    }

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const data = await getComparison(regionId, floatId, variable)
        if (cancelled) return

        const nextProfile = data.depths.map((depth, index) => ({
          depth,
          observation: data.observed_values[index],
          model: data.modeled_values[index],
        }))

        if (!nextProfile.length) {
          throw new Error('No matched model-observation points were returned.')
        }

        setProfile(nextProfile)
        setMetrics({
          bias: data.bias,
          rmse: data.rmse,
          samples: data.matched_points,
          agreement: calculateAgreement(nextProfile, data.rmse),
        })
        setSource(data.source || 'model + observation')
      } catch (err) {
        if (cancelled) return

        setProfile(fallbackProfile)
        setMetrics(validationMetrics)
        setSource('synthetic demo fallback')
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load model-observation comparison.',
        )
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [regionId, floatId, variable, fallbackProfile])

  return { profile, metrics, loading, error, source }
}
