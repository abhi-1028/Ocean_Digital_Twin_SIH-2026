import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type {
  ArgoFloat,
  OceanVariable,
  ProfilePoint,
  ValidationMetrics,
} from '../types/ocean'

interface AnalyticsPanelProps {
  selectedFloat: ArgoFloat | null
  variable: OceanVariable
  depth: number
  profile: ProfilePoint[]
  metrics: ValidationMetrics
  source: string
  loading?: boolean
}

function getNearestProfilePoint(
  profile: ProfilePoint[],
  depth: number,
): ProfilePoint | null {
  if (!profile.length) return null

  return profile.reduce(
    (nearest, point) =>
      Math.abs(point.depth - depth) <
      Math.abs(nearest.depth - depth)
        ? point
        : nearest,
    profile[0],
  )
}

function AnalyticsPanel({
  selectedFloat,
  variable,
  depth,
  profile,
  metrics,
  source,
  loading = false,
}: AnalyticsPanelProps) {
  const variableLabel =
    variable === 'temperature'
      ? 'Temperature'
      : 'Salinity'

  const unit =
    variable === 'temperature'
      ? '°C'
      : 'PSU'

  const isDemo = source
    .toLowerCase()
    .includes('synthetic')

  const selectedProfilePoint =
    getNearestProfilePoint(
      profile,
      depth,
    )

  const selectedDepthLabel =
    selectedProfilePoint &&
    selectedProfilePoint.depth !== depth
      ? `${depth} m · nearest profile ${selectedProfilePoint.depth} m`
      : `${depth} m`

  return (
    <section className="analytics-panel panel">
      <div className="analytics-header">
        <div>
          <div className="panel-title">
            Analytics
          </div>

          <div className="panel-subtitle">
            Observation & validation
          </div>
        </div>

        <div className="observation-status">
          <span className="live-dot" />

          {isDemo
            ? 'SYNTHETIC DEMO'
            : 'ARGO OBSERVATION'}
        </div>
      </div>

      <div className="float-summary">
        <div className="float-icon">
          ◉
        </div>

        <div className="float-info">
          <strong>
            {selectedFloat?.name ??
              'Select an Argo float'}
          </strong>

          <span>
            {selectedFloat
              ? `${selectedFloat.latitude.toFixed(
                  2,
                )}° · ${selectedFloat.longitude.toFixed(
                  2,
                )}°`
              : 'No float selected'}
          </span>
        </div>

        <div className="float-current">
          <span>Selected depth</span>

          <strong>
            {selectedFloat
              ? `${depth} m`
              : '—'}
          </strong>
        </div>
      </div>

      {selectedProfilePoint && (
        <div className="selected-depth-summary">
          <div>
            <span>
              {variableLabel} at selected depth
            </span>

            <strong>
              {selectedProfilePoint.model.toFixed(
                2,
              )}{' '}
              {unit}
            </strong>
          </div>

          <div>
            <span>ARGO / observation</span>

            <strong>
              {selectedProfilePoint.observation.toFixed(
                2,
              )}{' '}
              {unit}
            </strong>
          </div>

          <div>
            <span>Profile reference</span>

            <strong>
              {selectedDepthLabel}
            </strong>
          </div>
        </div>
      )}

      <div className="analytics-grid">
        <div className="chart-card">
          <div className="chart-title-row">
            <div>
              <strong>
                {variableLabel} profile
              </strong>

              <span>
                Model vs in-situ observation
              </span>
            </div>

            <div className="chart-legend">
              <span>
                <i className="legend-model" />
                Model
              </span>

              <span>
                <i className="legend-observation" />
                Observation
              </span>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <LineChart
                data={profile}
                margin={{
                  top: 10,
                  right: 15,
                  left: -10,
                  bottom: 5,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1d3948"
                />

                <XAxis
                  dataKey="depth"
                  type="number"
                  domain={[
                    'dataMin',
                    'dataMax',
                  ]}
                  tick={{
                    fill: '#7592a2',
                    fontSize: 11,
                  }}
                  label={{
                    value: 'Depth (m)',
                    position:
                      'insideBottom',
                    offset: -2,
                    fill: '#7592a2',
                  }}
                />

                <YAxis
                  tick={{
                    fill: '#7592a2',
                    fontSize: 11,
                  }}
                  width={45}
                />

                <Tooltip
                  contentStyle={{
                    background: '#0a1b25',
                    border: '1px solid #244554',
                    borderRadius: '8px',
                    color: '#ffffff',
                  }}
                  formatter={(
                    value,
                    name,
                  ) => [
                    `${Number(value).toFixed(
                      2,
                    )} ${unit}`,
                    name,
                  ]}
                  labelFormatter={(value) =>
                    `Depth: ${value} m`
                  }
                />

                <ReferenceLine
                  x={depth}
                  stroke="#7be9ff"
                  strokeDasharray="4 4"
                  label={{
                    value: `${depth} m`,
                    fill: '#7be9ff',
                    fontSize: 9,
                    position: 'insideTopRight',
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="model"
                  stroke="#45c8e8"
                  strokeWidth={2}
                  dot={false}
                  name="Model"
                />

                <Line
                  type="monotone"
                  dataKey="observation"
                  stroke="#ffffff"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={{
                    r: 2.5,
                    fill: '#ffffff',
                  }}
                  name="Observation"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="metrics-card">
          <div className="metrics-title">
            Validation metrics
          </div>

          <div className="metric-main">
            <div className="agreement-ring">
              <div>
                <strong>
                  {metrics.agreement.toFixed(
                    1,
                  )}
                  %
                </strong>

                <span>Agreement</span>
              </div>
            </div>
          </div>

          <div className="metric-list">
            <div className="metric-item">
              <span>Bias</span>

              <strong>
                {metrics.bias.toFixed(2)}
              </strong>
            </div>

            <div className="metric-item">
              <span>RMSE</span>

              <strong>
                {metrics.rmse.toFixed(2)}
              </strong>
            </div>

            <div className="metric-item">
              <span>Samples</span>

              <strong>
                {metrics.samples}
              </strong>
            </div>
          </div>

          <div className="validation-note">
            <span>
              {loading
                ? '…'
                : isDemo
                  ? 'i'
                  : '✓'}
            </span>

            <p>
              {loading
                ? 'Loading model-observation comparison.'
                : isDemo
                  ? 'Synthetic fallback data is shown because live regional data is not available.'
                  : 'Model and observation profiles were matched using the backend tolerance rules.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AnalyticsPanel