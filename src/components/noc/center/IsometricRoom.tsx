'use client'

import { memo, useMemo } from 'react'
import IsometricFloor, { FLOOR_GEOMETRY } from './IsometricFloor'
import IsometricAgentPod from './IsometricAgentPod'
import { IsometricCeilingLights } from './IsometricEnvironment'

export interface IsometricAgent {
  readonly agentId: string
  readonly name: string
  readonly agentType: string
  readonly status: string
  readonly isoX: number
  readonly isoY: number
  readonly color: string
  readonly tokenRate: number
}

interface IsometricRoomProps {
  readonly agents: ReadonlyArray<IsometricAgent>
}

// Convert grid-relative coordinates to absolute SVG position on the floor
function gridToFloor(isoX: number, isoY: number): { x: number; y: number } {
  const cx = FLOOR_GEOMETRY.top.x
  const cy = (FLOOR_GEOMETRY.top.y + FLOOR_GEOMETRY.bottom.y) / 2

  return {
    x: cx + isoX,
    y: cy + isoY,
  }
}

function IsometricRoom({ agents }: IsometricRoomProps) {
  const sortedAgents = useMemo(() => {
    return [...agents].sort((a, b) => {
      // Sort by isoY ascending so pods further back render first
      const posA = gridToFloor(a.isoX, a.isoY)
      const posB = gridToFloor(b.isoX, b.isoY)
      return posA.y - posB.y
    })
  }, [agents])

  return (
    <svg
      viewBox="0 0 800 500"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      style={{ display: 'block' }}
    >
      {/* Background */}
      <rect width="800" height="500" fill="#080b14" />

      {/* Ambient glow at center */}
      <defs>
        <radialGradient id="ambientGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0a2a1a" stopOpacity={0.4} />
          <stop offset="100%" stopColor="#080b14" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width="800" height="500" fill="url(#ambientGlow)" />

      {/* Layer 1: Floor and walls */}
      <IsometricFloor />

      {/* Layer 2: Ceiling light effects on floor */}
      <IsometricCeilingLights />

      {/* Layer 3: Agent pods */}
      {sortedAgents.map((agent) => {
        const pos = gridToFloor(agent.isoX, agent.isoY)
        return (
          <IsometricAgentPod
            key={agent.agentId}
            x={pos.x}
            y={pos.y}
            color={agent.color}
            status={agent.status}
            name={agent.name}
            agentType={agent.agentType}
          />
        )
      })}
    </svg>
  )
}

export default memo(IsometricRoom)
