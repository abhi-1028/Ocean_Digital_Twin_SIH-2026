import { useEffect, useMemo, useState } from 'react'

import Header from './components/Header'
import ControlPanel from './components/ControlPanel'
import OceanViewer from './components/OceanViewer'
import AnalyticsPanel from './components/AnalyticsPanel'

import { argoFloats, regions } from './data/mockData'
import { useArgoData } from './hooks/useArgoData'
import { useComparisonData } from './hooks/useComparisonData'
import { useOceanData } from './hooks/useOceanData'
import type { ArgoFloat, OceanVariable } from './types/ocean'

function buildFloats(observations: ReturnType<typeof useArgoData>['observations']): ArgoFloat[] {
  const grouped = new Map<string, typeof observations>()

  observations.forEach((observation) => {
    const existing = grouped.get(observation.floatId) ?? []
    existing.push(observation)
    grouped.set(observation.floatId, existing)
  })

  return Array.from(grouped.entries()).map(([floatId, items]) => {
    const latest = [...items].sort(
      (a, b) => new Date(b.observationTime).getTime() - new Date(a.observationTime).getTime(),
    )[0]

    return {
      id: floatId,
      name: floatId,
      latitude: latest.latitude,
      longitude: latest.longitude,
      temperature: latest.temperature,
      salinity: latest.salinity,
      depth: Math.max(...items.map((item) => item.depth)),
    }
  })
}

function App() {
  const [selectedRegion, setSelectedRegion] = useState(regions[0].id)
  const [variable, setVariable] = useState<OceanVariable>('temperature')
  const [depth, setDepth] = useState(100)
  const [selectedFloat, setSelectedFloat] = useState<string | null>(null)

  const currentRegion = useMemo(
    () => regions.find((region) => region.id === selectedRegion) ?? regions[0],
    [selectedRegion],
  )

  const ocean = useOceanData(selectedRegion, variable, depth)
  const argo = useArgoData(selectedRegion)
  const comparison = useComparisonData(selectedRegion, selectedFloat, variable)

  const floats = useMemo(() => {
    const liveFloats = buildFloats(argo.observations)
    return liveFloats.length > 0
      ? liveFloats
      : argoFloats.filter((float) => float.id.startsWith(
          selectedRegion === 'bay_of_bengal'
            ? 'ARGO_BOB_'
            : selectedRegion === 'arabian_sea'
              ? 'ARGO_AS_'
              : selectedRegion === 'indian_ocean'
                ? 'ARGO_IO_'
                : 'ARGO_NA_',
        ))
  }, [argo.observations, selectedRegion])

  const currentFloat = useMemo(
    () => floats.find((float) => float.id === selectedFloat) ?? floats[0] ?? null,
    [floats, selectedFloat],
  )

  useEffect(() => {
    if (!floats.length) {
      setSelectedFloat(null)
      return
    }

    if (!selectedFloat || !floats.some((float) => float.id === selectedFloat)) {
      setSelectedFloat(floats[0].id)
    }
  }, [floats, selectedFloat])

  const handleRegionChange = (regionId: string) => {
    setSelectedRegion(regionId)
    setSelectedFloat(null)
  }

  return (
    <div className="app-shell">
      <Header regionName={currentRegion.name} />

      <main className="dashboard">
        <div className="dashboard-intro">
          <div>
            <span className="eyebrow">OCEAN OBSERVATION & MODELING</span>
            <h1>
              Explore the ocean
              <span> through data.</span>
            </h1>
            <p>
              Interactive visualization of numerical ocean model fields and real-world
              in-situ observations.
            </p>
          </div>

          <div className="intro-stat">
            <span>ACTIVE REGION</span>
            <strong>{currentRegion.name}</strong>
            <small>{currentRegion.description}</small>
          </div>
        </div>

        <div className="main-layout">
          <ControlPanel
            regions={regions}
            selectedRegion={selectedRegion}
            variable={variable}
            depth={depth}
            onRegionChange={handleRegionChange}
            onVariableChange={setVariable}
            onDepthChange={setDepth}
          />

          <div className="visual-column">
            <OceanViewer
              variable={variable}
              depth={ocean.actualDepth}
              points={ocean.points}
              floats={floats}
              selectedFloat={selectedFloat}
              onFloatSelect={setSelectedFloat}
            />

            <div className="float-strip panel">
              <div className="float-strip-heading">
                <div>
                  <strong>Argo observations</strong>
                  <span>{floats.length} floats available</span>
                </div>
                <span className="observation-chip">
                  {argo.source === 'observation' ? 'LIVE DATA LAYER' : 'SYNTHETIC DEMO'}
                </span>
              </div>

              <div className="float-list">
                {floats.map((float) => (
                  <button
                    key={float.id}
                    className={selectedFloat === float.id ? 'float-card selected' : 'float-card'}
                    onClick={() => setSelectedFloat(float.id)}
                  >
                    <span className="float-card-dot" />
                    <div>
                      <strong>{float.name}</strong>
                      <small>
                        {float.latitude.toFixed(1)}° · {float.longitude.toFixed(1)}°
                      </small>
                    </div>
                    <span className="float-depth">{float.depth}m</span>
                  </button>
                ))}
              </div>
            </div>

            <AnalyticsPanel
              selectedFloat={currentFloat}
              variable={variable}
              profile={comparison.profile}
              metrics={comparison.metrics}
              source={comparison.source}
              loading={comparison.loading}
            />
          </div>
        </div>

        <footer className="dashboard-footer">
          <div>
            <span className="footer-logo">🌊</span>
            <span>Ocean Digital Twin</span>
          </div>
          <span>
            {ocean.source === 'model' ? 'Numerical model field' : 'Synthetic demonstration field'}
          </span>
          <span>MODEL ≠ OBSERVATION</span>
        </footer>
      </main>
    </div>
  )
}

export default App
