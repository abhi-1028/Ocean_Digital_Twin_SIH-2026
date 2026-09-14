import { useEffect, useState } from 'react'

import { getComparison } from '../api/oceanApi'
import { getFallbackProfile } from '../data/mockData'
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

  const values = profile.flatMap((point) => [
    point.observation,
    point.model,
  ])

  const range = Math.max(
    Math.max(...values) - Math.min(...values),
    0.001,
  )

  return Math.max(
    0,
    Math.min(100, 100 * (1 - rmse / range)),
  )
}

function calculateFallbackMetrics(
  profile: ProfilePoint[],
): ValidationMetrics {
  if (!profile.length) {
    return {
      bias: 0,
      rmse: 0,
      samples: 0,
      agreement: 0,
    }
  }

  const errors = profile.map(
    (point) => point.model - point.observation,
  )

  const bias =
    errors.reduce(
      (sum, value) => sum + value,
      0,
    ) / errors.length

  const rmse = Math.sqrt(
    errors.reduce(
      (sum, value) => sum + value ** 2,
      0,
    ) / errors.length,
  )

  return {
    bias,
    rmse,
    samples: profile.length,
    agreement: calculateAgreement(
      profile,
      rmse,
    ),
  }
}

export function useComparisonData(
  regionId: string,
  floatId: string | null,
  variable: OceanVariable,
): UseComparisonDataResult {
  const [profile, setProfile] =
    useState<ProfilePoint[]>([])

  const [metrics, setMetrics] =
    useState<ValidationMetrics>({
      bias: 0,
      rmse: 0,
      samples: 0,
      agreement: 0,
    })

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  const [source, setSource] =
    useState('waiting for float')

  useEffect(() => {
    let cancelled = false

    if (!floatId) {
      setProfile([])
      setMetrics({
        bias: 0,
        rmse: 0,
        samples: 0,
        agreement: 0,
      })
      setSource('waiting for float')
      setError(null)
      setLoading(false)

      return () => {
        cancelled = true
      }
    }

    const selectedFloatId = floatId

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const data = await getComparison(
          regionId,
          selectedFloatId,
          variable,
        )

        if (cancelled) return

        const nextProfile = data.depths
          .map((depth, index) => ({
            depth,
            observation:
              data.observed_values[index],
            model:
              data.modeled_values[index],
          }))
          .filter(
            (point) =>
              Number.isFinite(
                point.observation,
              ) &&
              Number.isFinite(point.model),
          )

        if (!nextProfile.length) {
          throw new Error(
            'No matched model-observation points were returned.',
          )
        }

        setProfile(nextProfile)

        setMetrics({
          bias: data.bias,
          rmse: data.rmse,
          samples: data.matched_points,
          agreement: calculateAgreement(
            nextProfile,
            data.rmse,
          ),
        })

        setSource(
          data.source ||
            'model + observation',
        )
      } catch (err) {
        if (cancelled) return

        const fallbackProfile =
          getFallbackProfile(
            selectedFloatId,
            variable,
          )

        setProfile(fallbackProfile)

        setMetrics(
          calculateFallbackMetrics(
            fallbackProfile,
          ),
        )

        setSource(
          'synthetic demo fallback',
        )

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load model-observation comparison.',
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [regionId, floatId, variable])

  return {
    profile,
    metrics,
    loading,
    error,
    source,
  }
}