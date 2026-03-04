import { useMemo } from 'react'
import type { AgentState, TopologyAgentType } from '@/types/topology'

export interface IsometricPodPosition {
  agentId: string
  name: string
  agentType: TopologyAgentType
  status: string
  gridX: number
  gridY: number
  isoX: number
  isoY: number
  color: string
  tokenRate: number
}

const TYPE_COLORS: Record<TopologyAgentType, string> = {
  orchestrator: '#ffd700',
  planner: '#8b5cf6',
  executor: '#3b82f6',
  tool: '#06b6d4',
  verifier: '#10b981',
  result: '#00ff88',
}

const COLS = 4
const TILE_W = 80
const TILE_H = 50
const GAP = 12

function toIso(gx: number, gy: number): { x: number; y: number } {
  return {
    x: (gx - gy) * (TILE_W + GAP) * 0.5,
    y: (gx + gy) * (TILE_H + GAP) * 0.25,
  }
}

export function useIsometricLayout(agents: ReadonlyArray<AgentState>): ReadonlyArray<IsometricPodPosition> {
  return useMemo(() => {
    const activeAgents = agents.filter(a => a.status !== 'complete')
    return activeAgents.map((agent, i) => {
      const col = i % COLS
      const row = Math.floor(i / COLS)
      const iso = toIso(col, row)
      return {
        agentId: agent.identity.id,
        name: agent.identity.englishRole,
        agentType: agent.identity.agentType,
        status: agent.status,
        gridX: col,
        gridY: row,
        isoX: iso.x,
        isoY: iso.y,
        color: TYPE_COLORS[agent.identity.agentType] ?? '#6b7280',
        tokenRate: agent.tokenRate,
      }
    })
  }, [agents])
}
