import {
  useEffect,
  useMemo,
} from 'react'

import type {
  OceanVariable,
  Region,
} from '../types/ocean'

interface ControlPanelProps {
  regions: Region[]
  selectedRegion: string
  variable: OceanVariable
  depth: number
  selectedTime: string
  onRegionChange: (regionId: string) => void
  onVariableChange: (
    variable: OceanVariable,
  ) => void
  onDepthChange: (depth: number) => void
  onTimeChange: (time: string) => void
}

const MODEL_TIMES = [
  '2026-08-15T00:00:00',
  '2026-08-16T00:00:00',
]

const MODEL_DEPTHS = [
  0,
  50,
  100,
  150,
  200,
  250,
  300,
  400,
  500,
  600,
  700,
  750,
  850,
  1000,
]

function getDepthLevels(
  _regionId: string,
): number[] {
  return MODEL_DEPTHS
}

function findNearestDepth(
  depth: number,
  levels: number[],
): number {
  return levels.reduce(
    (nearest, current) =>
      Math.abs(current - depth) <
      Math.abs(nearest - depth)
        ? current
        : nearest,
    levels[0],
  )
}

function formatModelTime(
  time: string,
): string {
  const date = new Date(time)

  if (Number.isNaN(date.getTime())) {
    return time
  }

  return new Intl.DateTimeFormat(
    'en-IN',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    },
  ).format(date)
}

function ControlPanel({
  regions,
  selectedRegion,
  variable,
  depth,
  selectedTime,
  onRegionChange,
  onVariableChange,
  onDepthChange,
  onTimeChange,
}: ControlPanelProps) {
  const depthLevels = useMemo(
    () =>
      getDepthLevels(
        selectedRegion,
      ),
    [selectedRegion],
  )

  const validDepth = useMemo(
    () =>
      findNearestDepth(
        depth,
        depthLevels,
      ),
    [depth, depthLevels],
  )

  useEffect(() => {
    if (depth !== validDepth) {
      onDepthChange(validDepth)
    }
  }, [
    depth,
    onDepthChange,
    validDepth,
  ])

  useEffect(() => {
    if (
      !MODEL_TIMES.includes(
        selectedTime,
      )
    ) {
      onTimeChange(
        MODEL_TIMES[
          MODEL_TIMES.length - 1
        ],
      )
    }
  }, [
    onTimeChange,
    selectedTime,
  ])

  const sliderIndex = Math.max(
    0,
    depthLevels.indexOf(
      validDepth,
    ),
  )

  const handleDepthChange = (
    index: number,
  ) => {
    const nextDepth =
      depthLevels[index]

    if (
      nextDepth === undefined
    ) {
      return
    }

    onDepthChange(nextDepth)
  }

  return (
    <aside className="control-panel panel">
      <div className="panel-heading">
        <div>
          <div className="panel-title">
            Controls
          </div>

          <div className="panel-subtitle">
            Configure visualization
          </div>
        </div>

        <div
          className="panel-icon"
          aria-hidden="true"
        >
          ⚙
        </div>
      </div>

      <div className="control-section">
        <label
          className="control-label"
          htmlFor="region-select"
        >
          REGION
        </label>

        <select
          id="region-select"
          className="select-control"
          value={selectedRegion}
          onChange={(event) =>
            onRegionChange(
              event.target.value,
            )
          }
        >
          {regions.map(
            (region) => (
              <option
                key={region.id}
                value={region.id}
              >
                {region.name}
              </option>
            ),
          )}
        </select>
      </div>

      <div className="control-section">
        <label className="control-label">
          VARIABLE
        </label>

        <div className="segmented-control">
          <button
            type="button"
            className={
              variable ===
              'temperature'
                ? 'active'
                : ''
            }
            onClick={() =>
              onVariableChange(
                'temperature',
              )
            }
          >
            Temperature
          </button>

          <button
            type="button"
            className={
              variable === 'salinity'
                ? 'active'
                : ''
            }
            onClick={() =>
              onVariableChange(
                'salinity',
              )
            }
          >
            Salinity
          </button>
        </div>
      </div>

      <div className="control-section">
        <div className="control-row">
          <label
            className="control-label"
            htmlFor="depth-slider"
          >
            DEPTH
          </label>

          <span className="value-badge">
            {validDepth} m
          </span>
        </div>

        <input
          id="depth-slider"
          className="depth-slider"
          type="range"
          min="0"
          max={
            depthLevels.length - 1
          }
          step="1"
          value={sliderIndex}
          onChange={(event) =>
            handleDepthChange(
              Number(
                event.target.value,
              ),
            )
          }
          aria-label="Ocean depth"
        />

        <div className="slider-labels">
          <span>
            Surface
          </span>

          <span>
            {
              depthLevels[
                depthLevels.length - 1
              ]
            }{' '}
            m
          </span>
        </div>

        <div
          className="depth-hint"
          aria-live="polite"
        >
          {depthLevels.length}{' '}
          model depth levels available
        </div>
      </div>

      <div className="control-section">
        <label
          className="control-label"
          htmlFor="time-select"
        >
          TIME
        </label>

        <select
          id="time-select"
          className="select-control"
          value={selectedTime}
          onChange={(event) =>
            onTimeChange(
              event.target.value,
            )
          }
          aria-label="Ocean model time"
        >
          {MODEL_TIMES.map(
            (modelTime) => (
              <option
                key={modelTime}
                value={modelTime}
              >
                {formatModelTime(
                  modelTime,
                )}
              </option>
            ),
          )}
        </select>

        <div
          className="depth-hint"
          aria-live="polite"
        >
          Model timestamp
        </div>
      </div>

      <div className="control-section">
        <div className="control-row">
          <label className="control-label">
            {variable ===
            'salinity'
              ? 'SALINITY SCALE'
              : 'TEMPERATURE SCALE'}
          </label>
        </div>

        <div className="temperature-scale">
          <span>
            Cold
          </span>

          <div className="gradient-bar" />

          <span>
            Warm
          </span>
        </div>
      </div>

      <div className="control-info">
        <div
          className="info-icon"
          aria-hidden="true"
        >
          ⓘ
        </div>

        <div>
          <strong>
            Scientific view
          </strong>

          <p>
            Model fields are shown
            separately from in-situ
            observations.
          </p>
        </div>
      </div>
    </aside>
  )
}

export default ControlPanel