'use client'

import { useMemo, useCallback } from 'react'
import type { Region, AgentPin as AgentPinType, RegionId } from '@/types/worldmap'
import { REGIONS } from '@/types/worldmap'
import AgentPinComponent from './AgentPin'

interface TerritoryMap2DProps {
  agents: AgentPinType[]
  selectedAgent: string | null
  selectedRegion: RegionId | null
  onSelectAgent: (id: string | null) => void
  onSelectRegion: (id: RegionId | null) => void
  width: number
  height: number
}

// Hexagon path generator
function hexPath(cx: number, cy: number, r: number): string {
  const points: string[] = []
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6
    points.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
  }
  return `M${points.join('L')}Z`
}

// Connection lines between regions
const CONNECTIONS: readonly [RegionId, RegionId][] = [
  ['codebase', 'communication'],
  ['api_gateway', 'communication'],
  ['filesystem', 'communication'],
  ['database', 'communication'],
  ['cloud', 'communication'],
  ['local_tools', 'communication'],
  ['codebase', 'api_gateway'],
  ['filesystem', 'local_tools'],
  ['api_gateway', 'cloud'],
  ['database', 'cloud'],
]

export default function TerritoryMap2D({
  agents,
  selectedAgent,
  selectedRegion,
  onSelectAgent,
  onSelectRegion,
  width,
  height,
}: TerritoryMap2DProps) {
  const hexRadius = Math.min(width, height) * 0.13
  const padding = 60

  const regionPositions = useMemo(() => {
    const mapW = width - padding * 2
    const mapH = height - padding * 2
    return REGIONS.map((r) => ({
      ...r,
      cx: padding + r.position.x * mapW,
      cy: padding + r.position.y * mapH,
    }))
  }, [width, height])

  const agentsByRegion = useMemo(() => {
    const map = new Map<RegionId, AgentPinType[]>()
    for (const agent of agents) {
      const existing = map.get(agent.regionId) ?? []
      map.set(agent.regionId, [...existing, agent])
    }
    return map
  }, [agents])

  const getRegionIntensity = useCallback(
    (regionId: RegionId) => {
      const regionAgents = agentsByRegion.get(regionId) ?? []
      const activeCount = regionAgents.filter(
        (a) => a.status === 'active' || a.status === 'working'
      ).length
      return Math.min(1, activeCount * 0.3 + (regionAgents.length > 0 ? 0.15 : 0))
    },
    [agentsByRegion]
  )

  const getRegionPos = useCallback(
    (id: RegionId) => regionPositions.find((r) => r.id === id),
    [regionPositions]
  )

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ background: 'transparent' }}
    >
      {/* Grid dots background */}
      <defs>
        <pattern id="grid-dots" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="0.5" fill="#333333" />
        </pattern>
        {REGIONS.map((r) => (
          <radialGradient key={`glow-${r.id}`} id={`glow-${r.id}`}>
            <stop offset="0%" stopColor={r.color} stopOpacity={getRegionIntensity(r.id) * 0.3} />
            <stop offset="100%" stopColor={r.color} stopOpacity="0" />
          </radialGradient>
        ))}
      </defs>

      <rect width={width} height={height} fill="url(#grid-dots)" />

      {/* Connection lines */}
      {CONNECTIONS.map(([a, b]) => {
        const pa = getRegionPos(a)
        const pb = getRegionPos(b)
        if (!pa || !pb) return null

        const hasActiveTraffic =
          (agentsByRegion.get(a) ?? []).some((ag) => ag.status === 'active' || ag.status === 'working') ||
          (agentsByRegion.get(b) ?? []).some((ag) => ag.status === 'active' || ag.status === 'working')

        return (
          <line
            key={`${a}-${b}`}
            x1={pa.cx}
            y1={pa.cy}
            x2={pb.cx}
            y2={pb.cy}
            stroke={hasActiveTraffic ? '#00ff8840' : '#333333'}
            strokeWidth={hasActiveTraffic ? 1.5 : 0.5}
            strokeDasharray={hasActiveTraffic ? 'none' : '4 4'}
          />
        )
      })}

      {/* Region hexagons */}
      {regionPositions.map((region) => {
        const count = (agentsByRegion.get(region.id) ?? []).length
        const isSelected = selectedRegion === region.id
        const intensity = getRegionIntensity(region.id)

        return (
          <g key={region.id}>
            {/* Glow */}
            <circle
              cx={region.cx}
              cy={region.cy}
              r={hexRadius * 1.8}
              fill={`url(#glow-${region.id})`}
            />

            {/* Hexagon */}
            <path
              d={hexPath(region.cx, region.cy, hexRadius)}
              fill={isSelected ? `${region.color}15` : `${region.color}08`}
              stroke={isSelected ? region.color : `${region.color}${intensity > 0 ? '66' : '33'}`}
              strokeWidth={isSelected ? 2 : 1}
              onClick={() => onSelectRegion(isSelected ? null : region.id)}
              style={{ cursor: 'pointer', transition: 'all 0.3s' }}
            />

            {/* Icon */}
            <text
              x={region.cx}
              y={region.cy - 14}
              textAnchor="middle"
              dominantBaseline="central"
              fill={region.color}
              fontSize="18"
              fontFamily="monospace"
              opacity={0.8}
            >
              {region.icon}
            </text>

            {/* Label */}
            <text
              x={region.cx}
              y={region.cy + 6}
              textAnchor="middle"
              fill="#e5e7eb"
              fontSize="11"
              fontWeight="600"
            >
              {region.label}
            </text>

            {/* Agent count badge */}
            <text
              x={region.cx}
              y={region.cy + 22}
              textAnchor="middle"
              fill="#6b7280"
              fontSize="10"
            >
              {count > 0 ? `${count} agent${count > 1 ? 's' : ''}` : 'empty'}
            </text>
          </g>
        )
      })}

      {/* Agent pins */}
      {regionPositions.map((region) => {
        const regionAgents = agentsByRegion.get(region.id) ?? []
        return regionAgents.map((agent, i) => {
          const angle = (2 * Math.PI * i) / Math.max(regionAgents.length, 1)
          const orbitR = hexRadius * 0.55
          const ax = region.cx + orbitR * Math.cos(angle - Math.PI / 2)
          const ay = region.cy + orbitR * Math.sin(angle - Math.PI / 2)

          return (
            <g key={agent.id} transform={`translate(${ax}, ${ay})`}>
              <AgentPinComponent
                agent={agent}
                selected={selectedAgent === agent.id}
                onClick={onSelectAgent}
              />
            </g>
          )
        })
      })}
    </svg>
  )
}
