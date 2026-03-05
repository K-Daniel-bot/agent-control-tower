'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { AgentPin, RegionId } from '@/types/worldmap'
import { REGIONS } from '@/types/worldmap'

const STATUS_COLORS: Record<string, string> = {
  active: '#00ff88',
  working: '#f59e0b',
  spawning: '#3b82f6',
  idle: '#6b7280',
  error: '#ef4444',
  complete: '#555555',
}

// Convert region position (0-1) to spherical coordinates on globe
function regionToSphere(x: number, y: number, radius: number): [number, number, number] {
  const phi = (1 - y) * Math.PI
  const theta = (x - 0.5) * Math.PI * 1.6
  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  ]
}

function GlobeWireframe() {
  const ref = useRef<THREE.Group>(null)

  useFrame((_state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.05
    }
  })

  return (
    <group ref={ref}>
      {/* Wireframe sphere */}
      <mesh>
        <sphereGeometry args={[2, 24, 24]} />
        <meshBasicMaterial color="#1a1a1a" wireframe transparent opacity={0.4} />
      </mesh>

      {/* Solid inner sphere */}
      <mesh>
        <sphereGeometry args={[1.98, 32, 32]} />
        <meshBasicMaterial color="#050505" transparent opacity={0.9} />
      </mesh>

      {/* Equator ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.01, 2.03, 64]} />
        <meshBasicMaterial color="#333" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

interface RegionNodeProps {
  region: (typeof REGIONS)[number]
  agentCount: number
  isSelected: boolean
  onClick: () => void
}

function RegionNode({ region, agentCount, isSelected, onClick }: RegionNodeProps) {
  const ref = useRef<THREE.Mesh>(null)
  const pos = useMemo(
    () => regionToSphere(region.position.x, region.position.y, 2.1),
    [region.position]
  )
  const color = new THREE.Color(region.color)

  useFrame((_state, delta) => {
    if (ref.current && agentCount > 0) {
      ref.current.scale.setScalar(1 + Math.sin(Date.now() * 0.003) * 0.1)
    }
  })

  const size = 0.08 + agentCount * 0.03

  return (
    <group position={pos}>
      {/* Glow */}
      {agentCount > 0 && (
        <mesh>
          <sphereGeometry args={[size + 0.06, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} />
        </mesh>
      )}

      {/* Node */}
      <mesh ref={ref} onClick={onClick}>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial
          color={isSelected ? '#ffffff' : color}
          transparent
          opacity={agentCount > 0 ? 0.9 : 0.4}
        />
      </mesh>

      {/* Selection ring */}
      {isSelected && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[size + 0.04, size + 0.06, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}

interface AgentDotProps {
  agent: AgentPin
  regionPos: { x: number; y: number }
  index: number
  total: number
}

function AgentDot({ agent, regionPos, index, total }: AgentDotProps) {
  const ref = useRef<THREE.Mesh>(null)
  const color = new THREE.Color(STATUS_COLORS[agent.status] ?? '#6b7280')

  const pos = useMemo(() => {
    const angle = (2 * Math.PI * index) / Math.max(total, 1)
    const offset = 0.15
    const base = regionToSphere(regionPos.x, regionPos.y, 2.1)
    return [
      base[0] + Math.cos(angle) * offset,
      base[1] + Math.sin(angle) * offset * 0.5,
      base[2] + Math.sin(angle) * offset,
    ] as [number, number, number]
  }, [regionPos, index, total])

  useFrame(() => {
    if (ref.current && (agent.status === 'active' || agent.status === 'working')) {
      const scale = 1 + Math.sin(Date.now() * 0.005 + index) * 0.2
      ref.current.scale.setScalar(scale)
    }
  })

  return (
    <mesh ref={ref} position={pos}>
      <sphereGeometry args={[0.04, 8, 8]} />
      <meshBasicMaterial color={color} />
    </mesh>
  )
}

interface ConnectionLineProps {
  from: [number, number, number]
  to: [number, number, number]
  active: boolean
}

function ConnectionLine({ from, to, active }: ConnectionLineProps) {
  const lineObj = useMemo(() => {
    const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)]
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: active ? '#00ff88' : '#333333',
      transparent: true,
      opacity: active ? 0.4 : 0.15,
    })
    return new THREE.Line(geometry, material)
  }, [from, to, active])

  return <primitive object={lineObj} />
}

interface GlobeView3DProps {
  agents: AgentPin[]
  selectedRegion: RegionId | null
  onSelectRegion: (id: RegionId | null) => void
}

export default function GlobeView3D({ agents, selectedRegion, onSelectRegion }: GlobeView3DProps) {
  const agentsByRegion = useMemo(() => {
    const map = new Map<RegionId, AgentPin[]>()
    for (const agent of agents) {
      const existing = map.get(agent.regionId) ?? []
      map.set(agent.regionId, [...existing, agent])
    }
    return map
  }, [agents])

  return (
    <div style={{ width: '100%', height: '100%', background: '#000' }}>
      <Canvas camera={{ position: [0, 1.5, 4.5], fov: 45 }}>
        <ambientLight intensity={0.3} />

        <GlobeWireframe />

        {/* Region nodes */}
        {REGIONS.map((region) => (
          <RegionNode
            key={region.id}
            region={region}
            agentCount={(agentsByRegion.get(region.id) ?? []).length}
            isSelected={selectedRegion === region.id}
            onClick={() => onSelectRegion(selectedRegion === region.id ? null : region.id)}
          />
        ))}

        {/* Agent dots */}
        {REGIONS.map((region) => {
          const regionAgents = agentsByRegion.get(region.id) ?? []
          return regionAgents.map((agent, i) => (
            <AgentDot
              key={agent.id}
              agent={agent}
              regionPos={region.position}
              index={i}
              total={regionAgents.length}
            />
          ))
        })}

        {/* Connection lines from communication hub */}
        {REGIONS.filter((r) => r.id !== 'communication').map((region) => {
          const commRegion = REGIONS.find((r) => r.id === 'communication')!
          const from = regionToSphere(commRegion.position.x, commRegion.position.y, 2.1)
          const to = regionToSphere(region.position.x, region.position.y, 2.1)
          const hasActive = (agentsByRegion.get(region.id) ?? []).some(
            (a) => a.status === 'active' || a.status === 'working'
          )
          return (
            <ConnectionLine
              key={`conn-${region.id}`}
              from={from}
              to={to}
              active={hasActive}
            />
          )
        })}

        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={3}
          maxDistance={8}
          autoRotate
          autoRotateSpeed={0.3}
        />
      </Canvas>
    </div>
  )
}
