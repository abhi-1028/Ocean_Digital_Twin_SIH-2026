import { useMemo, useState } from 'react'

import Header from './components/Header'
import ControlPanel from './components/ControlPanel'
import OceanViewer from './components/OceanViewer'
import AnalyticsPanel from './components/AnalyticsPanel'

import {
  argoFloats,
  regions,
  salinityProfile,
  temperatureProfile,
  validationMetrics,
} from './data/mockData'

import type { OceanVariable } from './types/ocean'

function App() {
  const [selectedRegion, setSelectedRegion] =
    useState(regions[0].id)

  const [variable, setVariable] =
    useState<OceanVariable>('temperature')

  const [depth, setDepth] = useState(100)

  const [selectedFloat, setSelectedFloat] =
    useState<string | null>(argoFloats[0].id)

  const currentRegion = useMemo(
    () =>
      regions.find(
        (region) => region.id === selectedRegion
      ) ?? regions[0],
    [selectedRegion]
  )

  const currentFloat = useMemo(
    () =>
      argoFloats.find(
        (float) => float.id === selectedFloat
      ) ?? argoFloats[0],
    [selectedFloat]
  )

  const profile =
    variable === 'temperature'
      ? temperatureProfile
      : salinityProfile

  const handleRegionChange = (
    regionId: string
  ) => {
    setSelectedRegion(regionId)
    setSelectedFloat(argoFloats[0].id)
  }

  return (
    <div className="app-shell">
      <Header
        regionName={currentRegion.name}
      />

      <main className="dashboard">
        <div className="dashboard-intro">
          <div>
            <span className="eyebrow">
              OCEAN OBSERVATION & MODELING
            </span>

            <h1>
              Explore the ocean
              <span> through data.</span>
            </h1>

            <p>
              Interactive visualization of numerical
              ocean model fields and real-world
              in-situ observations.
            </p>
          </div>

          <div className="intro-stat">
            <span>ACTIVE REGION</span>
            <strong>{currentRegion.name}</strong>
            <small>
              {currentRegion.description}
            </small>
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
              depth={depth}
              floats={argoFloats}
              selectedFloat={selectedFloat}
              onFloatSelect={setSelectedFloat}
            />

            <div className="float-strip panel">
              <div className="float-strip-heading">
                <div>
                  <strong>Argo observations</strong>
                  <span>
                    {argoFloats.length} floats available
                  </span>
                </div>

                <span className="observation-chip">
                  LIVE DATA LAYER
                </span>
              </div>

              <div className="float-list">
                {argoFloats.map((float) => (
                  <button
                    key={float.id}
                    className={
                      selectedFloat === float.id
                        ? 'float-card selected'
                        : 'float-card'
                    }
                    onClick={() =>
                      setSelectedFloat(float.id)
                    }
                  >
                    <span className="float-card-dot" />

                    <div>
                      <strong>{float.name}</strong>

                      <small>
                        {float.latitude.toFixed(1)}°N ·{' '}
                        {float.longitude.toFixed(1)}°E
                      </small>
                    </div>

                    <span className="float-depth">
                      {float.depth}m
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <AnalyticsPanel
              selectedFloat={currentFloat}
              variable={variable}
              profile={profile}
              metrics={validationMetrics}
            />
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
            AI-assisted scientific visualization
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