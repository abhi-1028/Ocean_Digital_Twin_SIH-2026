import {
  useMemo,
  useRef,
  useState,
} from 'react'

import type { MutableRefObject } from 'react'

import * as THREE from 'three'

import {
  Canvas,
  useFrame,
} from '@react-three/fiber'

import {
  OrbitControls,
  PerspectiveCamera,
  Text,
} from '@react-three/drei'

import type {
  ArgoFloat,
  OceanPoint,
  OceanVariable,
  Region,
} from '../types/ocean'

interface OceanViewerProps {
  variable: OceanVariable
  depth: number
  floats: ArgoFloat[]
  oceanPoints: OceanPoint[]
  selectedFloat: string | null
  onFloatSelect: (
    floatId: string
  ) => void
  region: Region
}

interface ViewerLayers {
  ocean: boolean
  floats: boolean
  grid: boolean
  data: boolean
}

interface Domain {
  minLat: number
  maxLat: number
  minLon: number
  maxLon: number
}

function getDomain(
  region: Region
): Domain {
  const domains: Record<
    string,
    Domain
  > = {
    'bay-of-bengal': {
      minLat: 5,
      maxLat: 23,
      minLon: 78,
      maxLon: 100,
    },

    'arabian-sea': {
      minLat: 5,
      maxLat: 25,
      minLon: 50,
      maxLon: 75,
    },

    'indian-ocean': {
      minLat: -35,
      maxLat: 5,
      minLon: 35,
      maxLon: 110,
    },

    'north-atlantic': {
      minLat: 15,
      maxLat: 55,
      minLon: -75,
      maxLon: -5,
    },
  }

  return (
    domains[region.id] ??
    domains['bay-of-bengal']
  )
}

function geoToScene(
  latitude: number,
  longitude: number,
  domain: Domain
): [number, number] {
  const latitudeRange =
    domain.maxLat -
    domain.minLat

  const longitudeRange =
    domain.maxLon -
    domain.minLon

  const safeLatRange =
    latitudeRange || 1

  const safeLonRange =
    longitudeRange || 1

  const normalizedLongitude =
    (longitude -
      domain.minLon) /
    safeLonRange

  const normalizedLatitude =
    (latitude -
      domain.minLat) /
    safeLatRange

  const x =
    normalizedLongitude * 12 -
    6

  const z =
    normalizedLatitude * 7 -
    3.5

  return [x, z]
}

function getDataColor(
  point: OceanPoint,
  variable: OceanVariable
): THREE.Color {
  const color =
    new THREE.Color()

  if (
    variable ===
    'temperature'
  ) {
    const normalized =
      Math.max(
        0,
        Math.min(
          1,
          (point.temperature -
            16) /
            14
        )
      )

    color.setHSL(
      0.62 -
        normalized * 0.42,
      0.88,
      0.5
    )
  } else {
    const salinity =
      point.salinity > 0
        ? point.salinity
        : 34

    const normalized =
      Math.max(
        0,
        Math.min(
          1,
          (salinity - 34) /
            2
        )
      )

    color.setHSL(
      0.52 -
        normalized * 0.1,
      0.78,
      0.48
    )
  }

  return color
}

function OceanSurface({
  variable,
  depth,
}: {
  variable: OceanVariable
  depth: number
}) {
  const meshRef =
    useRef<THREE.Mesh>(null)

  const geometry =
    useMemo(() => {
      const geometry =
        new THREE.PlaneGeometry(
          13,
          8,
          42,
          30
        )

      const positions =
        geometry.attributes
          .position

      for (
        let i = 0;
        i < positions.count;
        i++
      ) {
        const x =
          positions.getX(i)

        const y =
          positions.getY(i)

        const wave =
          Math.sin(
            x * 1.4
          ) *
            0.18 +
          Math.cos(
            y * 1.7
          ) *
            0.14 +
          Math.sin(
            (x + y) * 2.2
          ) *
            0.07

        positions.setZ(
          i,
          wave
        )
      }

      positions.needsUpdate =
        true

      geometry.computeVertexNormals()

      return geometry
    }, [])

  const colors =
    useMemo(() => {
      const count =
        geometry.attributes
          .position.count

      const colorArray =
        new Float32Array(
          count * 3
        )

      const color =
        new THREE.Color()

      for (
        let i = 0;
        i < count;
        i++
      ) {
        const y =
          geometry.attributes
            .position.getY(
              i
            )

        const normalized =
          Math.max(
            0,
            Math.min(
              1,
              (y + 4) / 8
            )
          )

        if (
          variable ===
          'temperature'
        ) {
          color.setHSL(
            0.62 -
              normalized *
                0.42,
            0.82,
            0.48
          )
        } else {
          color.setHSL(
            0.52 -
              normalized *
                0.1,
            0.7,
            0.43
          )
        }

        colorArray[i * 3] =
          color.r

        colorArray[
          i * 3 + 1
        ] = color.g

        colorArray[
          i * 3 + 2
        ] = color.b
      }

      return colorArray
    }, [
      geometry,
      variable,
    ])

  useFrame((state) => {
    if (!meshRef.current) {
      return
    }

    meshRef.current.rotation.z =
      Math.sin(
        state.clock.elapsedTime *
          0.12
      ) * 0.008

    meshRef.current.position.y =
      -depth / 1100
  })

  geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(
      colors,
      3
    )
  )

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      rotation={[
        -Math.PI / 2,
        0,
        0,
      ]}
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

function OceanDataPoints({
  points,
  variable,
  selectedDepth,
  domain,
}: {
  points: OceanPoint[]
  variable: OceanVariable
  selectedDepth: number
  domain: Domain
}) {
  return (
    <group>
      {points.map((point) => {
        const [x, z] =
          geoToScene(
            point.latitude,
            point.longitude,
            domain
          )

        const y =
          0.28 -
          Math.min(
            Math.max(
              point.depth,
              0
            ),
            1000
          ) /
            1100

        const color =
          getDataColor(
            point,
            variable
          )

        const depthDifference =
          Math.abs(
            point.depth -
              selectedDepth
          )

        const isNearDepth =
          depthDifference <=
          175

        const radius =
          isNearDepth
            ? 0.105
            : 0.065

        return (
          <group
            key={point.id}
            position={[
              x,
              y,
              z,
            ]}
          >
            <mesh>
              <sphereGeometry
                args={[
                  radius,
                  12,
                  12,
                ]}
              />

              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={
                  isNearDepth
                    ? 1.25
                    : 0.45
                }
                transparent
                opacity={
                  isNearDepth
                    ? 0.95
                    : 0.55
                }
              />
            </mesh>

            {isNearDepth && (
              <mesh>
                <sphereGeometry
                  args={[
                    radius * 1.8,
                    12,
                    12,
                  ]}
                />

                <meshBasicMaterial
                  color={color}
                  transparent
                  opacity={0.12}
                  wireframe
                />
              </mesh>
            )}
          </group>
        )
      })}
    </group>
  )
}

function OceanGrid({
  visible,
}: {
  visible: boolean
}) {
  if (!visible) {
    return null
  }

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
        -0.18,
        0,
      ]}
    />
  )
}

function DepthLayers() {
  return (
    <>
      <mesh
        position={[
          0,
          -0.65,
          0,
        ]}
      >
        <boxGeometry
          args={[
            12.5,
            0.04,
            7.5,
          ]}
        />

        <meshBasicMaterial
          color="#0b3042"
          transparent
          opacity={0.35}
        />
      </mesh>

      <mesh
        position={[
          0,
          -1.2,
          0,
        ]}
      >
        <boxGeometry
          args={[
            11.5,
            0.04,
            6.5,
          ]}
        />

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
  domain,
}: {
  float: ArgoFloat
  selected: boolean
  onClick: () => void
  domain: Domain
}) {
  const [x, z] =
    geoToScene(
      float.latitude,
      float.longitude,
      domain
    )

  const y =
    selected ? 0.3 : 0.1

  return (
    <group
      position={[
        x,
        y,
        z,
      ]}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
    >
      <mesh>
        <sphereGeometry
          args={[
            selected
              ? 0.17
              : 0.11,
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
            selected
              ? 2.2
              : 0.8
          }
        />
      </mesh>

      {selected && (
        <>
          <mesh>
            <sphereGeometry
              args={[
                0.25,
                20,
                20,
              ]}
            />

            <meshBasicMaterial
              color="#4edfff"
              transparent
              opacity={0.12}
              wireframe
            />
          </mesh>

          <Text
            position={[
              0,
              0.42,
              0,
            ]}
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
  variable,
  depth,
  floats,
  oceanPoints,
  selectedFloat,
  onFloatSelect,
  layers,
  controlsRef,
  region,
}: OceanViewerProps & {
  layers: ViewerLayers
  controlsRef: MutableRefObject<any>
}) {
  const domain =
    useMemo(
      () =>
        getDomain(region),
      [region]
    )

  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[
          0,
          5.8,
          9.5,
        ]}
        fov={48}
      />

      <ambientLight
        intensity={1.1}
      />

      <directionalLight
        position={[
          4,
          8,
          5,
        ]}
        intensity={2.2}
      />

      <pointLight
        position={[
          -5,
          3,
          -4,
        ]}
        intensity={1.4}
        color="#46d8ff"
      />

      {layers.ocean && (
        <OceanSurface
          variable={variable}
          depth={depth}
        />
      )}

      {layers.data && (
        <OceanDataPoints
          points={oceanPoints}
          variable={variable}
          selectedDepth={depth}
          domain={domain}
        />
      )}

      <OceanGrid
        visible={layers.grid}
      />

      <DepthLayers />

      {layers.floats &&
        floats.map((float) => (
          <FloatMarker
            key={float.id}
            float={float}
            selected={
              selectedFloat ===
              float.id
            }
            domain={domain}
            onClick={() =>
              onFloatSelect(
                float.id
              )
            }
          />
        ))}

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.06}
        minDistance={5}
        maxDistance={18}
        maxPolarAngle={
          Math.PI / 2.05
        }
      />
    </>
  )
}

function OceanViewer({
  variable,
  depth,
  floats,
  oceanPoints,
  selectedFloat,
  onFloatSelect,
  region,
}: OceanViewerProps) {
  const controlsRef =
    useRef<any>(null)

  const [layers, setLayers] =
    useState<ViewerLayers>({
      ocean: true,
      floats: true,
      grid: true,
      data: true,
    })

  const resetCamera = () => {
    if (!controlsRef.current) {
      return
    }

    controlsRef.current.reset()
  }

  const toggleLayer = (
    layer: keyof ViewerLayers
  ) => {
    setLayers((current) => ({
      ...current,
      [layer]:
        !current[layer],
    }))
  }

  return (
    <section className="viewer-panel panel">
      <div className="viewer-header">
        <div>
          <div className="panel-title">
            Ocean Visualization
          </div>

          <div className="panel-subtitle">
            Interactive 3D numerical
            model field
          </div>
        </div>

        <div className="viewer-tags">
          <span className="viewer-tag">
            MODEL FIELD
          </span>

          <span className="viewer-tag highlight">
            {variable ===
            'temperature'
              ? 'Temperature'
              : 'Salinity'}
          </span>

          <span className="viewer-tag">
            {depth} m
          </span>

          <span className="viewer-tag">
            {region.name}
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
            args={[
              '#06151e',
            ]}
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
            floats={floats}
            oceanPoints={
              oceanPoints
            }
            selectedFloat={
              selectedFloat
            }
            onFloatSelect={
              onFloatSelect
            }
            layers={layers}
            controlsRef={
              controlsRef
            }
            region={region}
          />
        </Canvas>

        <div className="viewer-toolbar">
          <button
            className={
              layers.ocean
                ? 'viewer-tool active'
                : 'viewer-tool'
            }
            onClick={() =>
              toggleLayer(
                'ocean'
              )
            }
          >
            Ocean
          </button>

          <button
            className={
              layers.data
                ? 'viewer-tool active'
                : 'viewer-tool'
            }
            onClick={() =>
              toggleLayer(
                'data'
              )
            }
          >
            Data
          </button>

          <button
            className={
              layers.floats
                ? 'viewer-tool active'
                : 'viewer-tool'
            }
            onClick={() =>
              toggleLayer(
                'floats'
              )
            }
          >
            Floats
          </button>

          <button
            className={
              layers.grid
                ? 'viewer-tool active'
                : 'viewer-tool'
            }
            onClick={() =>
              toggleLayer(
                'grid'
              )
            }
          >
            Grid
          </button>

          <button
            className="viewer-tool"
            onClick={
              resetCamera
            }
          >
            Reset View
          </button>
        </div>

        <div className="viewer-overlay">
          <div className="legend-title">
            {variable ===
            'temperature'
              ? 'TEMPERATURE'
              : 'SALINITY'}
          </div>

          <div className="legend-scale">
            <span>
              {variable ===
              'temperature'
                ? '16°C'
                : '34 PSU'}
            </span>

            <div className="legend-gradient" />

            <span>
              {variable ===
              'temperature'
                ? '30°C'
                : '36 PSU'}
            </span>
          </div>
        </div>

        <div className="viewer-help">
          Drag to rotate · Scroll
          to zoom · Click a float
        </div>
      </div>
    </section>
  )
}

export default OceanViewer