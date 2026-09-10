import type { OceanVariable, Region } from '../types/ocean'

interface ControlPanelProps {
  regions: Region[]
  selectedRegion: string
  variable: OceanVariable
  depth: number
  onRegionChange: (regionId: string) => void
  onVariableChange: (variable: OceanVariable) => void
  onDepthChange: (depth: number) => void
}

function ControlPanel({
  regions,
  selectedRegion,
  variable,
  depth,
  onRegionChange,
  onVariableChange,
  onDepthChange,
}: ControlPanelProps) {
  return (
    <aside className="control-panel panel">
      <div className="panel-heading">
        <div>
          <div className="panel-title">Controls</div>
          <div className="panel-subtitle">
            Configure visualization
          </div>
        </div>

        <div className="panel-icon">⚙</div>
      </div>

      <div className="control-section">
        <label className="control-label">REGION</label>

        <select
          className="select-control"
          value={selectedRegion}
          onChange={(event) => onRegionChange(event.target.value)}
        >
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      <div className="control-section">
        <label className="control-label">VARIABLE</label>

        <div className="segmented-control">
          <button
            className={variable === 'temperature' ? 'active' : ''}
            onClick={() => onVariableChange('temperature')}
          >
            Temperature
          </button>

          <button
            className={variable === 'salinity' ? 'active' : ''}
            onClick={() => onVariableChange('salinity')}
          >
            Salinity
          </button>
        </div>
      </div>

      <div className="control-section">
        <div className="control-row">
          <label className="control-label">DEPTH</label>

          <span className="value-badge">
            {depth} m
          </span>
        </div>

        <input
          className="depth-slider"
          type="range"
          min="0"
          max="1000"
          step="25"
          value={depth}
          onChange={(event) =>
            onDepthChange(Number(event.target.value))
          }
        />

        <div className="slider-labels">
          <span>Surface</span>
          <span>1000 m</span>
        </div>
      </div>

      <div className="control-section">
        <label className="control-label">TIME</label>

        <div className="time-display">
          <span className="live-dot" />
          <div>
            <strong>Current</strong>
            <small>Latest available observation</small>
          </div>
        </div>
      </div>

      <div className="control-section">
        <div className="control-row">
          <label className="control-label">
            TEMPERATURE SCALE
          </label>
        </div>

        <div className="temperature-scale">
          <span>Cold</span>

          <div className="gradient-bar" />

          <span>Warm</span>
        </div>
      </div>

      <div className="control-info">
        <div className="info-icon">ⓘ</div>

        <div>
          <strong>Scientific view</strong>
          <p>
            Model fields are shown separately from
            in-situ observations.
          </p>
        </div>
      </div>
    </aside>
  )
}

export default ControlPanel