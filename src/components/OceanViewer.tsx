import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  OrbitControls,
  PerspectiveCamera,
  Text,
} from '@react-three/drei'
import type { ArgoFloat, OceanVariable } from '../types/ocean'

interface OceanViewerProps {
  variable: OceanVariable
  depth: number
  floats: ArgoFloat[]
  selectedFloat: string | null
  onFloatSelect: (floatId: string) => void
}

function OceanSurface({
  variable,
  depth,
}: {
  variable: OceanVariable
  depth: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  const geometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(
      13,
      8,
      36,
      26
    )

    const positions = geometry.attributes.position

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)

      const wave =
        Math.sin(x * 1.4) * 0.18 +
        Math.cos(y * 1.7) * 0.14 +
        Math.sin((x + y) * 2.2) * 0.07

      positions.setZ(i, wave)
    }

    positions.needsUpdate = true
    geometry.computeVertexNormals()

    return geometry
  }, [])

  const colors = useMemo(() => {
    const count = geometry.attributes.position.count
    const colorArray = new Float32Array(count * 3)
    const color = new THREE.Color()

    for (let i = 0; i < count; i++) {
      const y = geometry.attributes.position.getY(i)

      const normalized =
        Math.max(0, Math.min(1, (y + 4) / 8))

      if (variable === 'temperature') {
        color.setHSL(
          0.62 - normalized * 0.42,
          0.82,
          0.48
        )
      } else {
        color.setHSL(
          0.52 - normalized * 0.1,
          0.7,
          0.43
        )
      }

      colorArray[i * 3] = color.r
      colorArray[i * 3 + 1] = color.g
      colorArray[i * 3 + 2] = color.b
    }

    return colorArray
  }, [geometry, variable])

  useFrame((state) => {
    if (!meshRef.current) return

    meshRef.current.rotation.z =
      Math.sin(state.clock.elapsedTime * 0.12) * 0.008

    meshRef.current.position.y =
      -depth / 1100
  })

  geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(colors, 3)
  )

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <meshStandardMaterial
        vertexColors
        roughness={0.65}
        metalness={0.05}
        side={THREE.DoubleSide}
        transparent
        opacity={0.96}
      />
    </mesh>
  )
}

function OceanGrid() {
  return (
    <gridHelper
      args={[14, 28, '#31566b', '#173344']}
      rotation={[0, 0, 0]}
      position={[0, -0.18, 0]}
    />
  )
}

function DepthLayers() {
  return (
    <>
      <mesh position={[0, -0.65, 0]}>
        <boxGeometry args={[12.5, 0.04, 7.5]} />
        <meshBasicMaterial
          color="#0b3042"
          transparent
          opacity={0.35}
        />
      </mesh>

      <mesh position={[0, -1.2, 0]}>
        <boxGeometry args={[11.5, 0.04, 6.5]} />
        <meshBasicMaterial
          color="#09283a"
          transparent
          opacity={0.22}
        />
      </mesh>
    </>
  )
}

function FloatMarker({
  float,
  selected,
  onClick,
}: {
  float: ArgoFloat
  selected: boolean
  onClick: () => void
}) {
  const x =
    ((float.longitude - 88) / 8) * 5.5

  const z =
    ((float.latitude - 15) / 8) * 3.5

  const y = selected ? 0.25 : 0.08

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
          args={[selected ? 0.16 : 0.11, 20, 20]}
        />

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
  floats,
  selectedFloat,
  onFloatSelect,
}: OceanViewerProps) {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 5.8, 9.5]}
        fov={48}
      />

      <ambientLight intensity={1.1} />

      <directionalLight
        position={[4, 8, 5]}
        intensity={2.2}
      />

      <pointLight
        position={[-5, 3, -4]}
        intensity={1.4}
        color="#46d8ff"
      />

      <OceanSurface
        variable={variable}
        depth={depth}
      />

      <OceanGrid />

      <DepthLayers />

      {floats.map((float) => (
        <FloatMarker
          key={float.id}
          float={float}
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
  floats,
  selectedFloat,
  onFloatSelect,
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
            args={['#06151e', 8, 18]}
          />

          <Scene
            variable={variable}
            depth={depth}
            floats={floats}
            selectedFloat={selectedFloat}
            onFloatSelect={onFloatSelect}
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

        <div className="viewer-help">
          Drag to rotate · Scroll to zoom · Click a float
        </div>
      </div>
    </section>
  )
}

export default OceanViewer