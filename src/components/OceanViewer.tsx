import { useMemo } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei'

import type { ArgoFloat, OceanPoint, OceanVariable } from '../types/ocean'

interface OceanViewerProps {
  variable: OceanVariable
  depth: number
  points: OceanPoint[]
  floats: ArgoFloat[]
  selectedFloat: string | null
  onFloatSelect: (floatId: string) => void
}

function ModelField({
  points,
  variable,
  depth,
}: {
  points: OceanPoint[]
  variable: OceanVariable
  depth: number
}) {
  const geometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    if (!points.length) return geometry

    const latitudes = points.map((point) => point.latitude)
    const longitudes = points.map((point) => point.longitude)
    const values = points.map((point) => point.value)

    const minLat = Math.min(...latitudes)
    const maxLat = Math.max(...latitudes)
    const minLon = Math.min(...longitudes)
    const maxLon = Math.max(...longitudes)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    const latRange = Math.max(maxLat - minLat, 0.001)
    const lonRange = Math.max(maxLon - minLon, 0.001)
    const valueRange = Math.max(maxValue - minValue, 0.001)

    const positions: number[] = []
    const colors: number[] = []
    const color = new THREE.Color()

    points.forEach((point) => {
      const x = ((point.longitude - minLon) / lonRange - 0.5) * 11.5
      const z = ((point.latitude - minLat) / latRange - 0.5) * 6.8
      const normalized = (point.value - minValue) / valueRange
      const y = normalized * 0.55 - depth / 2200

      positions.push(x, y, z)

      if (variable === 'temperature') {
        color.setHSL(0.66 - normalized * 0.52, 0.82, 0.5)
      } else {
        color.setHSL(0.54 - normalized * 0.12, 0.72, 0.45)
      }
      colors.push(color.r, color.g, color.b)
    })

    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3),
    )
    geometry.setAttribute(
      'color',
      new THREE.Float32BufferAttribute(colors, 3),
    )

    return geometry
  }, [points, variable, depth])

  return (
    <points geometry={geometry}>
      <pointsMaterial
        vertexColors
        size={0.36}
        sizeAttenuation
        transparent
        opacity={0.95}
      />
    </points>
  )
}

function OceanGrid() {
  return (
    <gridHelper
      args={[14, 28, '#31566b', '#173344']}
      position={[0, -0.18, 0]}
    />
  )
}

function DepthLayers() {
  return (
    <>
      <mesh position={[0, -0.65, 0]}>
        <boxGeometry args={[12.5, 0.04, 7.5]} />
        <meshBasicMaterial color="#0b3042" transparent opacity={0.35} />
      </mesh>
      <mesh position={[0, -1.2, 0]}>
        <boxGeometry args={[11.5, 0.04, 6.5]} />
        <meshBasicMaterial color="#09283a" transparent opacity={0.22} />
      </mesh>
    </>
  )
}

function FloatMarker({
  float,
  floats,
  selected,
  onClick,
}: {
  float: ArgoFloat
  floats: ArgoFloat[]
  selected: boolean
  onClick: () => void
}) {
  const latitudes = floats.map((item) => item.latitude)
  const longitudes = floats.map((item) => item.longitude)
  const minLat = Math.min(...latitudes)
  const maxLat = Math.max(...latitudes)
  const minLon = Math.min(...longitudes)
  const maxLon = Math.max(...longitudes)
  const latRange = Math.max(maxLat - minLat, 0.001)
  const lonRange = Math.max(maxLon - minLon, 0.001)

  const x = ((float.longitude - minLon) / lonRange - 0.5) * 11.5
  const z = ((float.latitude - minLat) / latRange - 0.5) * 6.8
  const y = selected ? 0.45 : 0.18

  return (
    <group
      position={[x, y, z]}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
    >
      <mesh>
        <sphereGeometry args={[selected ? 0.18 : 0.12, 20, 20]} />
        <meshStandardMaterial
          color={selected ? '#ffffff' : '#8ff5ff'}
          emissive={selected ? '#48dfff' : '#087d99'}
          emissiveIntensity={selected ? 2 : 0.8}
        />
      </mesh>

      {selected && (
        <Text
          position={[0, 0.35, 0]}
          fontSize={0.22}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {float.name}
        </Text>
      )}
    </group>
  )
}

function Scene({
  variable,
  depth,
  points,
  floats,
  selectedFloat,
  onFloatSelect,
}: OceanViewerProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 5.8, 9.5]} fov={48} />
      <ambientLight intensity={1.1} />
      <directionalLight position={[4, 8, 5]} intensity={2.2} />
      <pointLight position={[-5, 3, -4]} intensity={1.4} color="#46d8ff" />

      <ModelField points={points} variable={variable} depth={depth} />
      <OceanGrid />
      <DepthLayers />

      {floats.map((float) => (
        <FloatMarker
          key={float.id}
          float={float}
          floats={floats}
          selected={selectedFloat === float.id}
          onClick={() => onFloatSelect(float.id)}
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
}: OceanViewerProps) {
  return (
    <section className="viewer-panel panel">
      <div className="viewer-header">
        <div>
          <div className="panel-title">Ocean Visualization</div>
          <div className="panel-subtitle">Interactive 3D model field</div>
        </div>

        <div className="viewer-tags">
          <span className="viewer-tag">MODEL FIELD</span>
          <span className="viewer-tag highlight">
            {variable === 'temperature' ? 'Temperature' : 'Salinity'}
          </span>
          <span className="viewer-tag">{depth} m</span>
        </div>
      </div>

      <div className="canvas-wrapper">
        <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
          <color attach="background" args={['#06151e']} />
          <fog attach="fog" args={['#06151e', 8, 18]} />
          <Scene
            variable={variable}
            depth={depth}
            points={points}
            floats={floats}
            selectedFloat={selectedFloat}
            onFloatSelect={onFloatSelect}
          />
        </Canvas>

        <div className="viewer-overlay">
          <div className="legend-title">
            {variable === 'temperature' ? 'TEMPERATURE' : 'SALINITY'}
          </div>
          <div className="legend-scale">
            <span>Low</span>
            <div className="legend-gradient" />
            <span>High</span>
          </div>
        </div>

        <div className="viewer-help">
          Drag to rotate · Scroll to zoom · Click a float
        </div>
      </div>
    </section>
  )
}

export default OceanViewer
