import { useMemo } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import {
  OrbitControls,
  PerspectiveCamera,
  Text,
} from '@react-three/drei'

import type {
  ArgoFloat,
  OceanPoint,
  OceanVariable,
} from '../types/ocean'

interface OceanViewerProps {
  variable: OceanVariable
  depth: number
  points: OceanPoint[]
  floats: ArgoFloat[]
  selectedFloat: string | null
  onFloatSelect: (floatId: string) => void
  selectedTime?: string | null
}

interface CoordinateBounds {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
  latRange: number
  lonRange: number
}

const FIELD_WIDTH = 11.5
const FIELD_DEPTH = 6.8
const MAX_VISUAL_DEPTH = 1000
const SURFACE_Y = 0.35
const BOTTOM_Y = -3.15

function depthToSceneY(depth: number): number {
  const normalizedDepth = Math.max(
    0,
    Math.min(1, depth / MAX_VISUAL_DEPTH),
  )

  return (
    SURFACE_Y +
    (BOTTOM_Y - SURFACE_Y) * normalizedDepth
  )
}

function getBounds(
  points: OceanPoint[],
): CoordinateBounds | null {
  if (!points.length) {
    return null
  }

  const latitudes = points.map(
    (point) => point.latitude,
  )

  const longitudes = points.map(
    (point) => point.longitude,
  )

  const minLat = Math.min(...latitudes)
  const maxLat = Math.max(...latitudes)
  const minLon = Math.min(...longitudes)
  const maxLon = Math.max(...longitudes)

  return {
    minLat,
    maxLat,
    minLon,
    maxLon,
    latRange: Math.max(
      maxLat - minLat,
      0.001,
    ),
    lonRange: Math.max(
      maxLon - minLon,
      0.001,
    ),
  }
}

function geographicToScene(
  latitude: number,
  longitude: number,
  bounds: CoordinateBounds,
) {
  const x =
    ((longitude - bounds.minLon) /
      bounds.lonRange -
      0.5) *
    FIELD_WIDTH

  const z =
    ((latitude - bounds.minLat) /
      bounds.latRange -
      0.5) *
    FIELD_DEPTH

  return { x, z }
}

function ModelField({
  points,
  depth,
}: {
  points: OceanPoint[]
  depth: number
}) {
  const bounds = useMemo(
    () => getBounds(points),
    [points],
  )

  const { surfaceGeometry, pointGeometry } =
    useMemo(() => {
      const surface = new THREE.BufferGeometry()
      const pointGeometry =
        new THREE.BufferGeometry()

      if (!points.length || !bounds) {
        return {
          surfaceGeometry: surface,
          pointGeometry,
        }
      }

      const minValue = Math.min(
        ...points.map((point) => point.value),
      )

      const maxValue = Math.max(
        ...points.map((point) => point.value),
      )

      const valueRange =
        maxValue - minValue || 1

      const GRID_SIZE = 24

      const positions: number[] = []
      const colors: number[] = []
      const indices: number[] = []

      const sampleValue = (
        latitude: number,
        longitude: number,
      ) => {
        let weightedValue = 0
        let totalWeight = 0

        points.forEach((point) => {
          const latDistance =
            (latitude - point.latitude) /
            Math.max(
              bounds.latRange,
              0.0001,
            )

          const lonDistance =
            (longitude - point.longitude) /
            Math.max(
              bounds.lonRange,
              0.0001,
            )

          const distanceSquared =
            latDistance * latDistance +
            lonDistance * lonDistance

          const weight =
            1 /
            (distanceSquared + 0.0008)

          weightedValue +=
            point.value * weight

          totalWeight += weight
        })

        return totalWeight > 0
          ? weightedValue / totalWeight
          : minValue
      }

      const baseY = depthToSceneY(depth)

      for (
        let row = 0;
        row < GRID_SIZE;
        row += 1
      ) {
        const lat =
          bounds.minLat +
          (row / (GRID_SIZE - 1)) *
            bounds.latRange

        for (
          let col = 0;
          col < GRID_SIZE;
          col += 1
        ) {
          const lon =
            bounds.minLon +
            (col / (GRID_SIZE - 1)) *
              bounds.lonRange

          const value = sampleValue(
            lat,
            lon,
          )

          const normalized = Math.max(
            0,
            Math.min(
              1,
              (value - minValue) /
                valueRange,
            ),
          )

          const scene =
            geographicToScene(
              lat,
              lon,
              bounds,
            )

          const edgeDistance =
            Math.min(
              row,
              col,
              GRID_SIZE - 1 - row,
              GRID_SIZE - 1 - col,
            ) /
            ((GRID_SIZE - 1) / 2)

          const verticalRelief =
            normalized * 0.28 +
            edgeDistance * 0.025

          const y =
            baseY + verticalRelief

          positions.push(
            scene.x,
            y,
            scene.z,
          )

          const color =
            new THREE.Color()

          color.setHSL(
            0.62 - normalized * 0.55,
            0.86,
            0.48 +
              normalized * 0.08,
          )

          colors.push(
            color.r,
            color.g,
            color.b,
          )
        }
      }

      for (
        let row = 0;
        row < GRID_SIZE - 1;
        row += 1
      ) {
        for (
          let col = 0;
          col < GRID_SIZE - 1;
          col += 1
        ) {
          const a =
            row * GRID_SIZE + col

          const b = a + 1

          const c =
            (row + 1) * GRID_SIZE + col

          const d = c + 1

          indices.push(a, b, d)
          indices.push(a, d, c)
        }
      }

      surface.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(
          positions,
          3,
        ),
      )

      surface.setAttribute(
        'color',
        new THREE.Float32BufferAttribute(
          colors,
          3,
        ),
      )

      surface.setIndex(indices)
      surface.computeVertexNormals()

      const modelPositions: number[] = []
      const modelColors: number[] = []

      points.forEach((point) => {
        const scene =
          geographicToScene(
            point.latitude,
            point.longitude,
            bounds,
          )

        const normalized = Math.max(
          0,
          Math.min(
            1,
            (point.value - minValue) /
              valueRange,
          ),
        )

        const y =
          baseY +
          normalized * 0.28

        modelPositions.push(
          scene.x,
          y,
          scene.z,
        )

        const color =
          new THREE.Color()

        color.setHSL(
          0.62 - normalized * 0.55,
          0.86,
          0.6,
        )

        modelColors.push(
          color.r,
          color.g,
          color.b,
        )
      })

      pointGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute(
          modelPositions,
          3,
        ),
      )

      pointGeometry.setAttribute(
        'color',
        new THREE.Float32BufferAttribute(
          modelColors,
          3,
        ),
      )

      return {
        surfaceGeometry: surface,
        pointGeometry,
      }
    }, [points, bounds, depth])

  if (!points.length || !bounds) {
    return null
  }

  return (
    <group>
      <mesh geometry={surfaceGeometry}>
        <meshStandardMaterial
          vertexColors
          transparent
          opacity={0.78}
          roughness={0.9}
          metalness={0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh geometry={surfaceGeometry}>
        <meshBasicMaterial
          vertexColors
          transparent
          opacity={0.2}
          wireframe
          side={THREE.DoubleSide}
        />
      </mesh>

      <points geometry={pointGeometry}>
        <pointsMaterial
          vertexColors
          size={0.28}
          sizeAttenuation
          transparent
          opacity={1}
        />
      </points>
    </group>
  )
}

function OceanGrid({
  depth,
}: {
  depth: number
}) {
  return (
    <gridHelper
      args={[
        14,
        28,
        '#31566b',
        '#173344',
      ]}
      position={[
        0,
        depthToSceneY(depth) - 0.12,
        0,
      ]}
    />
  )
}

function DepthLayers() {
  const layers = [0, 250, 500, 750, 1000]

  return (
    <group>
      {layers.map((layerDepth) => (
        <mesh
          key={layerDepth}
          position={[
            0,
            depthToSceneY(layerDepth),
            0,
          ]}
        >
          <boxGeometry
            args={[12.5, 0.025, 7.5]}
          />

          <meshBasicMaterial
            color={
              layerDepth === 0
                ? '#174a60'
                : '#0b3042'
            }
            transparent
            opacity={
              layerDepth === 0
                ? 0.18
                : 0.08
            }
          />
        </mesh>
      ))}
    </group>
  )
}

function FloatMarker({
  float,
  bounds,
  depth,
  selected,
  onClick,
}: {
  float: ArgoFloat
  bounds: CoordinateBounds | null
  depth: number
  selected: boolean
  onClick: () => void
}) {
  if (!bounds) {
    return null
  }

  const { x, z } =
    geographicToScene(
      float.latitude,
      float.longitude,
      bounds,
    )

  const y =
    depthToSceneY(depth) + 0.35

  return (
    <group
      position={[x, y, z]}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
    >
      <mesh>
        <sphereGeometry
          args={[
            selected ? 0.18 : 0.12,
            20,
            20,
          ]}
        />

        <meshStandardMaterial
          color={
            selected
              ? '#ffffff'
              : '#8ff5ff'
          }
          emissive={
            selected
              ? '#48dfff'
              : '#087d99'
          }
          emissiveIntensity={
            selected ? 2 : 0.8
          }
        />
      </mesh>

      {selected && (
        <>
          <mesh
            position={[0, -0.35, 0]}
          >
            <cylinderGeometry
              args={[
                0.012,
                0.012,
                0.7,
                8,
              ]}
            />

            <meshBasicMaterial
              color="#4edfff"
              transparent
              opacity={0.55}
            />
          </mesh>

          <Text
            position={[0, 0.35, 0]}
            fontSize={0.22}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {float.name}
          </Text>
        </>
      )}
    </group>
  )
}

function Scene({
  depth,
  points,
  floats,
  selectedFloat,
  onFloatSelect,
  selectedTime,
}: OceanViewerProps) {
  const bounds = useMemo(
    () => getBounds(points),
    [points],
  )

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 5.8, 9.5]}
        fov={48}
      />

      <ambientLight intensity={1.15} />

      <directionalLight
        position={[4, 8, 5]}
        intensity={2.2}
      />

      <pointLight
        position={[-5, 3, -4]}
        intensity={1.4}
        color="#46d8ff"
      />

      <ModelField
        key={`${selectedTime ?? 'latest'}-${depth}-${points.length}`}
        points={points}
        depth={depth}
      />

      <OceanGrid depth={depth} />

      <DepthLayers />

      {floats.map((float) => (
        <FloatMarker
          key={float.id}
          float={float}
          bounds={bounds}
          depth={depth}
          selected={
            selectedFloat === float.id
          }
          onClick={() =>
            onFloatSelect(float.id)
          }
        />
      ))}

      <OrbitControls
        enableDamping
        dampingFactor={0.06}
        minDistance={5}
        maxDistance={18}
        maxPolarAngle={Math.PI / 2.05}
      />
    </>
  )
}

function OceanViewer({
  variable,
  depth,
  points,
  floats,
  selectedFloat,
  onFloatSelect,
  selectedTime,
}: OceanViewerProps) {
  return (
    <section className="viewer-panel panel">
      <div className="viewer-header">
        <div>
          <div className="panel-title">
            Ocean Visualization
          </div>

          <div className="panel-subtitle">
            Interactive 3D model field
          </div>
        </div>

        <div className="viewer-tags">
          <span className="viewer-tag">
            MODEL FIELD
          </span>

          <span className="viewer-tag highlight">
            {variable === 'temperature'
              ? 'Temperature'
              : 'Salinity'}
          </span>

          <span className="viewer-tag">
            {depth} m
          </span>

          {selectedTime && (
            <span className="viewer-tag">
              {new Date(
                selectedTime,
              ).toLocaleDateString(
                'en-US',
                {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                },
              )}
            </span>
          )}
        </div>
      </div>

      <div className="canvas-wrapper">
        <Canvas
          dpr={[1, 2]}
          gl={{
            antialias: true,
            alpha: false,
          }}
        >
          <color
            attach="background"
            args={['#06151e']}
          />

          <fog
            attach="fog"
            args={[
              '#06151e',
              8,
              18,
            ]}
          />

          <Scene
            variable={variable}
            depth={depth}
            points={points}
            floats={floats}
            selectedFloat={selectedFloat}
            onFloatSelect={onFloatSelect}
            selectedTime={selectedTime}
          />
        </Canvas>

        <div className="viewer-overlay">
          <div className="legend-title">
            {variable === 'temperature'
              ? 'TEMPERATURE'
              : 'SALINITY'}
          </div>

          <div className="legend-scale">
            <span>Low</span>

            <div className="legend-gradient" />

            <span>High</span>
          </div>
        </div>

        <div className="viewer-depth-indicator">
          MODEL SLICE · {depth} m
        </div>

        <div className="viewer-help">
          Drag to rotate · Scroll to zoom · Click a float
        </div>
      </div>
    </section>
  )
}

export default OceanViewer