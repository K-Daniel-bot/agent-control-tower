import { useMemo } from 'react'
import type { Node, Edge } from '@xyflow/react'
import type { AgentState, OrchestraState } from '@/types/topology'
import { getDisplayLabel } from '@/data/koreanNamePool'

const COL_GAP = 180
const ROW_GAP = 100
const NODE_W = 100
const NODE_H = 70

const COL_MAP: Record<string, number> = {
  orchestrator: 0,
  planner: 1,
  executor: 2,
  tool: 3,
  verifier: 4,
  result: 5,
}

function cy(row: number, totalRows: number): number {
  const totalHeight = (totalRows - 1) * ROW_GAP
  return row * ROW_GAP - totalHeight / 2
}

function groupByCol(agents: ReadonlyArray<AgentState>): Map<number, AgentState[]> {
  const groups = new Map<number, AgentState[]>()
  for (const agent of agents) {
    const col = COL_MAP[agent.identity.agentType] ?? 2
    const existing = groups.get(col) ?? []
    groups.set(col, [...existing, agent])
  }
  return groups
}

function formatLatency(ms: number): string {
  if (ms < 1000) return `p95: ${ms}ms`
  return `p95: ${(ms / 1000).toFixed(1)}s`
}

/** Stable per-agent position jitter derived from agent ID */
function hashInt(str: string): number {
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = (h * 33 + str.charCodeAt(i)) & 0x7fffffff
  }
  return h
}

function posJitter(id: string, axis: 'x' | 'y'): number {
  const h = hashInt(id + axis)
  return ((h % 1000) / 1000 - 0.5) * 70 // ±35px
}

export function useExecutionFlowLayout(state: OrchestraState) {
  return useMemo(() => {
    if (state.agents.length === 0) {
      return { nodes: [] as Node[], edges: [] as Edge[] }
    }

    const groups = groupByCol(state.agents)
    const nodes: Node[] = []
    const agentNodeMap = new Map<string, Node>()

    for (const [col, agents] of groups) {
      const totalRows = agents.length
      agents.forEach((agent, row) => {
        const node: Node = {
          id: agent.identity.id,
          type: 'agentNode',
          position: {
            x: col * COL_GAP + posJitter(agent.identity.id, 'x'),
            y: cy(row, totalRows) + posJitter(agent.identity.id, 'y'),
          },
          data: {
            label: getDisplayLabel(agent.identity),
            koreanName: agent.identity.koreanName,
            title: agent.identity.title,
            englishRole: agent.identity.englishRole,
            agentType: agent.identity.agentType,
            status: agent.status,
            tokenRate: agent.tokenRate,
            latencyMs: agent.latencyMs,
          },
          width: NODE_W,
          height: NODE_H,
        }
        nodes.push(node)
        agentNodeMap.set(agent.identity.id, node)
      })
    }

    // USER REQUEST static node — leftmost position
    const minCol = Math.min(...groups.keys())
    const firstColAgents = groups.get(minCol) ?? []
    const midIdx = Math.floor(firstColAgents.length / 2)
    const userY = firstColAgents.length > 0 ? cy(midIdx, firstColAgents.length) : 0

    nodes.push({
      id: 'user-request',
      type: 'userRequestNode',
      position: { x: minCol * COL_GAP - 240, y: userY - 1 },
      data: { label: 'USER REQUEST' },
      width: 82,
      height: 52,
    })

    // WARNING nodes for error-status agents
    for (const agent of state.agents) {
      if (agent.status === 'error') {
        const agentNode = agentNodeMap.get(agent.identity.id)
        if (agentNode) {
          nodes.push({
            id: `warning-${agent.identity.id}`,
            type: 'warningNode',
            position: {
              x: agentNode.position.x + 140,
              y: agentNode.position.y + 20,
            },
            data: { label: 'LLM timeout' },
            width: 90,
            height: 70,
          })
        }
      }
    }

    // Agent lookup for latency labels
    const agentById = new Map<string, AgentState>()
    for (const agent of state.agents) {
      agentById.set(agent.identity.id, agent)
    }

    const edges: Edge[] = []

    // USER REQUEST → middle agent of first column
    const firstAgent = firstColAgents[midIdx]
    if (firstAgent) {
      edges.push({
        id: 'edge-user-request',
        source: 'user-request',
        target: firstAgent.identity.id,
        type: 'customEdge',
        data: { status: 'normal', dataRate: 0, latencyLabel: '' },
      })
    }

    for (const edge of state.executionEdges) {
      const targetAgent = agentById.get(edge.targetId)
      const latencyLabel =
        targetAgent && targetAgent.latencyMs > 0
          ? formatLatency(targetAgent.latencyMs)
          : ''
      edges.push({
        id: edge.id,
        source: edge.sourceId,
        target: edge.targetId,
        type: 'customEdge',
        data: {
          status: edge.status,
          dataRate: edge.dataRate,
          latencyLabel,
        },
      })
    }

    return { nodes, edges }
  }, [state.agents, state.executionEdges])
}
