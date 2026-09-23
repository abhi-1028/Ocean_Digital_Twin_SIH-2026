import {
  CartesianGrid,
  Line,
  LineChart,
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
  selectedFloat: ArgoFloat
  variable: OceanVariable
  profile: ProfilePoint[]
  metrics: ValidationMetrics
}

function AnalyticsPanel({
  selectedFloat,
  variable,
  profile,
  metrics,
}: AnalyticsPanelProps) {
  const variableLabel =
    variable ===
    'temperature'
      ? 'Temperature'
      : 'Salinity'

  const unit =
    variable ===
    'temperature'
      ? '°C'
      : 'PSU'

  const hasProfile =
    profile.length > 0

  const hasBackendMetrics =
    metrics.samples ===
      profile.length &&
    profile.length > 0

  return (
    <section className="analytics-panel panel">
      <div className="analytics-header">
        <div>
          <span className="eyebrow">
            PROFILE ANALYSIS
          </span>

          <h2>
            {selectedFloat.name}
          </h2>

          <p>
            {selectedFloat.latitude.toFixed(
              2
            )}
            ° ·{' '}
            {selectedFloat.longitude.toFixed(
              2
            )}
            ° ·{' '}
            {selectedFloat.depth >
            0
              ? `${selectedFloat.depth}m`
              : 'Profile'}
          </p>
        </div>

        <div className="analytics-variable">
          {variableLabel}
        </div>
      </div>

      <div className="chart-heading">
        <div>
          <strong>
            Model vs Observation
          </strong>

          <span>
            {variableLabel}{' '}
            profile
          </span>
        </div>

        <div className="chart-legend">
          <span>
            <i className="legend-line model" />
            Model
          </span>

          <span>
            <i className="legend-line observation" />
            Observation
          </span>
        </div>
      </div>

      {hasProfile ? (
        <div
          className="chart-container"
          style={{
            width: '100%',
            height: 320,
          }}
        >
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <LineChart
              data={profile}
              margin={{
                top: 12,
                right: 20,
                left: 4,
                bottom: 12,
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                strokeOpacity={0.15}
              />

              <XAxis
                dataKey="depth"
                type="number"
                reversed
                tick={{
                  fontSize: 11,
                }}
                label={{
                  value:
                    'Depth (m)',
                  position:
                    'insideBottom',
                  offset: -5,
                }}
              />

              <YAxis
                type="number"
                tick={{
                  fontSize: 11,
                }}
                label={{
                  value: unit,
                  angle: -90,
                  position:
                    'insideLeft',
                }}
              />

              <Tooltip
                formatter={(
                  value,
                  name
                ) => [
                  `${Number(
                    value
                  ).toFixed(
                    2
                  )} ${unit}`,
                  name ===
                  'model'
                    ? 'Model'
                    : 'Observation',
                ]}
                labelFormatter={(
                  value
                ) =>
                  `Depth: ${value} m`
                }
              />

              <Line
                type="monotone"
                dataKey="model"
                name="model"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 4,
                }}
              />

              <Line
                type="monotone"
                dataKey="observation"
                name="observation"
                strokeWidth={2.5}
                strokeDasharray="6 4"
                dot={false}
                activeDot={{
                  r: 4,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="chart-empty">
          No profile data is available
          for this float.
        </div>
      )}

      <div className="validation-section">
        <div className="validation-heading">
          <div>
            <strong>
              Validation Metrics
            </strong>

            <span>
              Model compared with
              in-situ observations
            </span>
          </div>

          {hasBackendMetrics && (
            <span className="observation-chip">
              API DATA
            </span>
          )}
        </div>

        <div className="metrics-grid">
          <div className="metric-card">
            <span>
              AGREEMENT
            </span>

            <strong>
              {metrics.agreement >
              0
                ? `${metrics.agreement.toFixed(
                    1
                  )}%`
                : '—'}
            </strong>

            <small>
              {metrics.agreement >
              0
                ? 'validation score'
                : 'Not provided by API'}
            </small>
          </div>

          <div className="metric-card">
            <span>
              BIAS
            </span>

            <strong>
              {metrics.bias.toFixed(
                3
              )}
            </strong>

            <small>
              {unit}
            </small>
          </div>

          <div className="metric-card">
            <span>
              RMSE
            </span>

            <strong>
              {metrics.rmse.toFixed(
                3
              )}
            </strong>

            <small>
              {unit}
            </small>
          </div>

          <div className="metric-card">
            <span>
              SAMPLES
            </span>

            <strong>
              {metrics.samples}
            </strong>

            <small>
              matched depths
            </small>
          </div>
        </div>

        <div className="validation-note">
          <span>i</span>

          <p>
            Bias and RMSE follow
            the comparison API
            definition. Agreement is
            shown only when an
            explicit agreement value
            is available.
          </p>
        </div>
      </div>
    </section>
  )
}

export default AnalyticsPanel