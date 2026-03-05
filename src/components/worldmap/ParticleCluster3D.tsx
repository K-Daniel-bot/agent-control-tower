'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// Generate points in a box distribution
function generatePoints(count: number, spread: number): Float32Array {
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    arr[i * 3] = (Math.random() - 0.5) * spread
    arr[i * 3 + 1] = (Math.random() - 0.5) * spread
    arr[i * 3 + 2] = (Math.random() - 0.5) * spread
  }
  return arr
}

function generateColors(count: number): Float32Array {
  const arr = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const t = Math.random()
    // Blue to purple gradient
    arr[i * 3] = 0.15 + t * 0.35        // R
    arr[i * 3 + 1] = 0.2 + t * 0.15     // G
    arr[i * 3 + 2] = 0.7 + t * 0.3      // B
  }
  return arr
}

// Build connection lines between nearby points
function buildConnections(positions: Float32Array, count: number, maxDist: number): Float32Array {
  const lines: number[] = []
  for (let i = 0; i < count; i++) {
    const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2
    for (let j = i + 1; j < count; j++) {
      const jx = j * 3, jy = j * 3 + 1, jz = j * 3 + 2
      const dx = positions[ix] - positions[jx]
      const dy = positions[iy] - positions[jy]
      const dz = positions[iz] - positions[jz]
      if (dx * dx + dy * dy + dz * dz < maxDist * maxDist) {
        lines.push(positions[ix], positions[iy], positions[iz])
        lines.push(positions[jx], positions[jy], positions[jz])
      }
    }
  }
  return new Float32Array(lines)
}

const POINT_COUNT = 280
const SPREAD = 3.2
const CONNECT_DIST = 0.65

function ParticleCloud() {
  const groupRef = useRef<THREE.Group>(null)

  const { pointPositions, pointColors, linePositions } = useMemo(() => {
    const pp = generatePoints(POINT_COUNT, SPREAD)
    const pc = generateColors(POINT_COUNT)
    const lp = buildConnections(pp, POINT_COUNT, CONNECT_DIST)
    return { pointPositions: pp, pointColors: pc, linePositions: lp }
  }, [])

  useFrame((_s, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.08
      groupRef.current.rotation.x += delta * 0.02
    }
  })

  const lineGeometry = useMemo(() => {
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(linePositions, 3))
    return g
  }, [linePositions])

  return (
    <group ref={groupRef}>
      {/* Points */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[pointPositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[pointColors, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.04} vertexColors transparent opacity={0.9} sizeAttenuation />
      </points>

      {/* Connection lines */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial color="#3355aa" transparent opacity={0.12} />
      </lineSegments>

      {/* Ambient glow sphere */}
      <mesh>
        <sphereGeometry args={[1.8, 16, 16]} />
        <meshBasicMaterial color="#1a2a55" transparent opacity={0.04} side={THREE.BackSide} />
      </mesh>
    </group>
  )
}

export default function ParticleCluster3D() {
  return (
    <div style={{ width: '100%', height: '100%', background: '#060a12', position: 'relative' }}>
      {/* Corner brackets */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <svg width="100%" height="100%" style={{ position: 'absolute' }}>
          <line x1="6" y1="6" x2="26" y2="6" stroke="#1a2a40" strokeWidth="1" />
          <line x1="6" y1="6" x2="6" y2="26" stroke="#1a2a40" strokeWidth="1" />
          <line x1="100%" y1="6" x2="100%" y2="26" stroke="#1a2a40" strokeWidth="1" transform="translate(-6,0)" />
          <line x1="100%" y1="6" x2="100%" y2="6" stroke="#1a2a40" strokeWidth="1" transform="translate(-26,0)" />
          <line x1="6" y1="100%" x2="6" y2="100%" stroke="#1a2a40" strokeWidth="1" transform="translate(0,-26)" />
          <line x1="6" y1="100%" x2="26" y2="100%" stroke="#1a2a40" strokeWidth="1" transform="translate(0,-6)" />
        </svg>
        <div style={{
          position: 'absolute', top: 8, right: 12,
          fontSize: 9, color: '#1e3050', fontFamily: 'monospace',
        }}>
          3D CLUSTER VIEW
        </div>
        <div style={{
          position: 'absolute', bottom: 8, left: 12,
          fontSize: 9, color: '#1e3050', fontFamily: 'monospace',
        }}>
          {POINT_COUNT} PARTICLES
        </div>
      </div>

      <Canvas camera={{ position: [0, 0, 4.5], fov: 50 }}>
        <ambientLight intensity={0.2} />
        <ParticleCloud />
        <OrbitControls enablePan={false} enableZoom autoRotate={false} minDistance={3} maxDistance={8} />
      </Canvas>
    </div>
  )
}
