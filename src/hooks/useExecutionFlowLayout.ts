import { useMemo } from 'react'
import type { Node, Edge } from '@xyflow/react'
import type { AgentState, OrchestraState } from '@/types/topology'
import { getDisplayLabel } from '@/data/koreanNamePool'

const COL_GAP = 180  // horizontal spacing between columns (agent type groups)
const ROW_GAP = 100  // vertical spacing between agents in same column
const NODE_W = 100
const NODE_H = 70

/** Column order for each agent type (left → right) */
const COL_MAP: Record<string, number> = {
  orchestrator: 0,
  planner: 1,
  executor: 2,
  tool: 3,
  verifier: 4,
  result: 5,
}

/** Center-align rows in a column */
function cy(row: number, totalRows: number): number {
  const totalHeight = (totalRows - 1) * ROW_GAP
  return row * ROW_GAP - totalHeight / 2
}

/** Group agents by their type column */
function groupByCol(agents: ReadonlyArray<AgentState>): Map<number, AgentState[]> {
  const groups = new Map<number, AgentState[]>()
  for (const agent of agents) {
    const col = COL_MAP[agent.identity.agentType] ?? 2
    const existing = groups.get(col) ?? []
    groups.set(col, [...existing, agent])
  }
  return groups
}

export function useExecutionFlowLayout(state: OrchestraState) {
  return useMemo(() => {
    if (state.agents.length === 0) {
      return { nodes: [] as Node[], edges: [] as Edge[] }
    }

    const groups = groupByCol(state.agents)
    const nodes: Node[] = []

    for (const [col, agents] of groups) {
      const totalRows = agents.length
      agents.forEach((agent, row) => {
        nodes.push({
          id: agent.identity.id,
          type: 'agentNode',
          position: {
            x: col * COL_GAP,
            y: cy(row, totalRows),
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
        })
      })
    }

    const edges: Edge[] = state.executionEdges.map((edge) => ({
      id: edge.id,
      source: edge.sourceId,
      target: edge.targetId,
      type: 'customEdge',
      data: {
        status: edge.status,
        dataRate: edge.dataRate,
      },
    }))

    return { nodes, edges }
  }, [state.agents, state.executionEdges])
}
