import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import Header from './components/Header'
import ControlPanel from './components/ControlPanel'
import OceanViewer from './components/OceanViewer'
import AnalyticsPanel from './components/AnalyticsPanel'

import {
  getComparison,
} from './api/oceanApi'

import {
  argoFloats,
  regions,
  salinityProfile,
  temperatureProfile,
  validationMetrics,
} from './data/mockData'

import useArgoData from './hooks/useArgoData'
import useOceanData from './hooks/useOceanData'

import type {
  ComparisonResponse,
} from './types/api'

import type {
  ArgoFloat,
  OceanVariable,
  ProfilePoint,
  ValidationMetrics,
} from './types/ocean'

function App() {
  const [
    selectedRegion,
    setSelectedRegion,
  ] = useState(
    regions[0].id
  )

  const [
    variable,
    setVariable,
  ] = useState<OceanVariable>(
    'temperature'
  )

  const [
    depth,
    setDepth,
  ] = useState(100)

  const [
    selectedFloat,
    setSelectedFloat,
  ] = useState<string | null>(
    argoFloats[0]?.id ?? null
  )

  const {
    floats,
    loading: argoLoading,
    error: argoError,
    usingMockData: argoUsingMock,
  } = useArgoData(
    selectedRegion
  )

  const oceanData =
    useOceanData(
      selectedRegion,
      variable,
      depth
    )

  const {
    points: oceanPoints,
    loading: oceanLoading,
    error: oceanError,
    usingMockData:
      oceanUsingMock,
  } = oceanData

  const currentRegion =
    useMemo(
      () =>
        regions.find(
          (region) =>
            region.id ===
            selectedRegion
        ) ??
        regions[0],
      [selectedRegion]
    )

    const displayedFloats =
    floats.length > 0
      ? floats
      : argoUsingMock
        ? []
        : argoFloats

  useEffect(() => {
    if (
      displayedFloats.length ===
      0
    ) {
      setSelectedFloat(null)
      return
    }

    const selectedStillExists =
      displayedFloats.some(
        (float) =>
          float.id ===
          selectedFloat
      )

    if (
      !selectedStillExists
    ) {
      setSelectedFloat(
        displayedFloats[0].id
      )
    }
  }, [
    displayedFloats,
    selectedFloat,
  ])

  const currentFloat =
    useMemo<ArgoFloat | null>(
      () => {
        return (
          displayedFloats.find(
            (float) =>
              float.id ===
              selectedFloat
          ) ??
          displayedFloats[0] ??
          null
        )
      },
      [
        displayedFloats,
        selectedFloat,
      ]
    )

  const [
    comparison,
    setComparison,
  ] = useState<
    ComparisonResponse | null
  >(null)

  const [
    comparisonLoading,
    setComparisonLoading,
  ] = useState(false)

  const [
    comparisonError,
    setComparisonError,
  ] = useState<string | null>(
    null
  )

  useEffect(() => {
    if (!selectedFloat) {
      setComparison(null)
      setComparisonError(null)
      setComparisonLoading(false)
      return
    }

    const floatId =
      selectedFloat

    let cancelled = false

    async function loadComparison() {
      setComparisonLoading(true)
      setComparisonError(null)

      try {
        const response =
          await getComparison(
            floatId
          )

        if (!cancelled) {
          setComparison(response)
        }
      } catch (error) {
        console.warn(
          'Comparison API unavailable:',
          error
        )

        if (!cancelled) {
          setComparison(null)

          setComparisonError(
            'Comparison data unavailable. Showing demo profile.'
          )
        }
      } finally {
        if (!cancelled) {
          setComparisonLoading(false)
        }
      }
    }

    void loadComparison()

    return () => {
      cancelled = true
    }
  }, [selectedFloat])

  const profile =
    useMemo<ProfilePoint[]>(() => {
      if (
        comparison &&
        comparison.depth.length > 0
      ) {
        const depths =
          comparison.depth

        const observations =
          comparison.observation[
            variable
          ] ?? []

        const models =
          comparison.model[
            variable
          ] ?? []

        const length =
          Math.min(
            depths.length,
            observations.length,
            models.length
          )

        if (length > 0) {
          return Array.from(
            { length },
            (_, index) => ({
              depth:
                depths[index],
              observation:
                observations[index],
              model:
                models[index],
            })
          )
        }
      }

      return variable ===
        'temperature'
        ? temperatureProfile
        : salinityProfile
    }, [
      comparison,
      variable,
    ])

  const metrics =
    useMemo<ValidationMetrics>(() => {
      const backendMetric =
        comparison?.metrics?.[
          variable
        ]

      if (
        backendMetric &&
        profile.length > 0
      ) {
        return {
          bias:
            backendMetric.bias,
          rmse:
            backendMetric.rmse,
          samples:
            profile.length,
          agreement: 0,
        }
      }

      return validationMetrics
    }, [
      comparison,
      variable,
      profile.length,
    ])

  const handleRegionChange =
    (regionId: string) => {
      setSelectedRegion(
        regionId
      )

      setSelectedFloat(null)
      setComparison(null)
      setComparisonError(null)
    }

  const isLoading =
    argoLoading ||
    oceanLoading ||
    comparisonLoading

  const hasLiveOceanData =
    !oceanUsingMock &&
    !oceanError

  const hasLiveArgoData =
    !argoUsingMock &&
    !argoError

  const statusLabel =
    isLoading
      ? 'Connecting to backend'
      : hasLiveOceanData ||
          hasLiveArgoData
        ? 'Live API connected'
        : 'Demo data active'

  const activeError =
    comparisonError ||
    argoError ||
    oceanError

  return (
    <div className="app-shell">
      <Header
        regionName={
          currentRegion.name
        }
      />

      <main className="dashboard">
        <section className="dashboard-intro">
          <div className="intro-copy">
            <span className="eyebrow">
              OCEAN OBSERVATION &
              MODELING
            </span>

            <h1>
              Explore the ocean
              <span>
                {' '}
                through data.
              </span>
            </h1>

            <p>
              Interactive 3D
              visualization of
              numerical ocean model
              fields and real-world
              in-situ observations.
            </p>
          </div>

          <div className="intro-stat">
            <span>
              ACTIVE REGION
            </span>

            <strong>
              {currentRegion.name}
            </strong>

            <small>
              {
                currentRegion.description
              }
            </small>
          </div>
        </section>

        <section className="api-status-strip">
          <div className="status-main">
            <span
              className={
                isLoading
                  ? 'status-dot loading'
                  : hasLiveOceanData ||
                      hasLiveArgoData
                    ? 'status-dot live'
                    : 'status-dot demo'
              }
            />

            <strong>
              {statusLabel}
            </strong>
          </div>

          <div className="status-details">
            <span>
              Ocean:
              {' '}
              {hasLiveOceanData
                ? 'API'
                : 'Demo'}
            </span>

            <span>
              Argo:
              {' '}
              {hasLiveArgoData
                ? 'API'
                : 'Demo'}
            </span>

            {activeError && (
              <span className="status-error">
                {activeError}
              </span>
            )}
          </div>
        </section>

        <div className="main-layout">
          <ControlPanel
            regions={regions}
            selectedRegion={
              selectedRegion
            }
            variable={variable}
            depth={depth}
            onRegionChange={
              handleRegionChange
            }
            onVariableChange={
              setVariable
            }
            onDepthChange={
              setDepth
            }
          />

          <div className="visual-column">
            <OceanViewer
              variable={variable}
              depth={depth}
              floats={
                displayedFloats
              }
              oceanPoints={
                oceanPoints
              }
              selectedFloat={
                selectedFloat
              }
              onFloatSelect={
                setSelectedFloat
              }
              region={
                currentRegion
              }
            />

            <section className="float-strip panel">
              <div className="float-strip-heading">
                <div>
                  <strong>
                    Argo observations
                  </strong>

                  <span>
                    {
                      displayedFloats.length
                    }{' '}
                    floats available
                  </span>
                </div>

                <span className="observation-chip">
                  IN-SITU DATA
                </span>
              </div>

              {displayedFloats.length >
              0 ? (
                <div className="float-list">
                  {displayedFloats.map(
                    (float) => (
                      <button
                        key={
                          float.id
                        }
                        className={
                          selectedFloat ===
                          float.id
                            ? 'float-card selected'
                            : 'float-card'
                        }
                        onClick={() =>
                          setSelectedFloat(
                            float.id
                          )
                        }
                      >
                        <span className="float-card-dot" />

                        <div>
                          <strong>
                            {
                              float.name
                            }
                          </strong>

                          <small>
                            {float.latitude.toFixed(
                              1
                            )}
                            ° ·{' '}
                            {float.longitude.toFixed(
                              1
                            )}
                            °
                          </small>
                        </div>

                        <span className="float-depth">
                          {float.depth > 0
                            ? `${float.depth}m`
                            : 'Profile'}
                        </span>
                      </button>
                    )
                  )}
                </div>
              ) : (
                <div className="empty-state">
                  <span className="empty-icon">
                    ◌
                  </span>

                  <div>
                    <strong>
                      No Argo floats in
                      this region
                    </strong>

                    <p>
                      Live float data will
                      appear here when the
                      selected region contains
                      observations.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {currentFloat && (
              <AnalyticsPanel
                selectedFloat={
                  currentFloat
                }
                variable={variable}
                profile={profile}
                metrics={metrics}
              />
            )}

            {comparisonLoading && (
              <div className="panel loading-panel">
                <span className="spinner" />

                <div>
                  <strong>
                    Loading comparison
                    profile
                  </strong>

                  <span>
                    Fetching model and
                    observation data for{' '}
                    {selectedFloat}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className="dashboard-footer">
          <div>
            <span className="footer-logo">
              🌊
            </span>

            <span>
              Ocean Digital Twin
            </span>
          </div>

          <span>
            AI-assisted scientific
            visualization
          </span>

          <span>
            MODEL ≠ OBSERVATION
          </span>
        </footer>
      </main>
    </div>
  )
}

export default App