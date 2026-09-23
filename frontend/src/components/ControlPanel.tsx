import type {
  Region,
  OceanVariable,
} from '../types/ocean'

interface ControlPanelProps {
  regions: Region[]
  selectedRegion: string
  variable: OceanVariable
  depth: number

  onRegionChange: (
    regionId: string
  ) => void

  onVariableChange: (
    variable: OceanVariable
  ) => void

  onDepthChange: (
    depth: number
  ) => void
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
      <div className="control-header">
        <h2>Controls</h2>

        <p>
          Configure visualization
        </p>
      </div>

      <div className="control-section">
        <label
          className="control-label"
          htmlFor="region-select"
        >
          Region
        </label>

        <select
          id="region-select"
          className="control-select"
          value={selectedRegion}
          onChange={(event) =>
            onRegionChange(
              event.target.value
            )
          }
        >
          {regions.map((region) => (
            <option
              key={region.id}
              value={region.id}
            >
              {region.name}
            </option>
          ))}
        </select>
      </div>

      <div className="control-section">
        <span className="control-label">
          Variable
        </span>

        <div className="variable-switch">
          <button
            type="button"
            className={
              variable ===
              'temperature'
                ? 'variable-button active'
                : 'variable-button'
            }
            onClick={() =>
              onVariableChange(
                'temperature'
              )
            }
          >
            Temperature
          </button>

          <button
            type="button"
            className={
              variable === 'salinity'
                ? 'variable-button active'
                : 'variable-button'
            }
            onClick={() =>
              onVariableChange(
                'salinity'
              )
            }
          >
            Salinity
          </button>
        </div>
      </div>

      <div className="control-section">
        <div className="depth-header">
          <span className="control-label">
            Depth
          </span>

          <span className="depth-value">
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
            onDepthChange(
              Number(
                event.target.value
              )
            )
          }
        />

        <div className="depth-scale">
          <span>Surface</span>
          <span>500 m</span>
          <span>1000 m</span>
        </div>
      </div>

      <div className="control-info">
        <strong>
          Visualization controls
        </strong>

        <br />

        Select a region, switch between
        temperature and salinity, or move
        through the water column using the
        depth slider.
      </div>
    </aside>
  )
}

export default ControlPanel