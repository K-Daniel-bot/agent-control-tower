import { useMemo } from 'react'
import type { OrchestraState, TopologyAgentType } from '@/types/topology'
import { getDisplayLabel } from '@/data/koreanNamePool'

export interface CyElement {
  group: 'nodes' | 'edges'
  data: Record<string, unknown>
  position?: { x: number; y: number }
}

const AGENT_COLORS: Record<TopologyAgentType | string, string> = {
  orchestrator: '#ffd700',
  planner: '#8b5cf6',
  executor: '#f59e0b',
  tool: '#06b6d4',
  verifier: '#10b981',
  result: '#00ff88',
  hub: '#00ff88',
  browser: '#3b82f6',
  slack: '#e74c3c',
  filesystem: '#f59e0b',
  git: '#f97316',
  shell: '#06b6d4',
  knowledge: '#a855f7',
  policy: '#ef4444',
  verifier_tool: '#10b981',
}

/** Tool/resource nodes that appear around the hub */
const TOOL_NODES = [
  { id: 'tool-browser', label: 'BROWSER', type: 'browser', angle: 0 },
  { id: 'tool-slack', label: 'SLACK', type: 'slack', angle: 45 },
  { id: 'tool-filesystem', label: 'FILESYSTEM', type: 'filesystem', angle: 90 },
  { id: 'tool-git', label: 'GIT', type: 'git', angle: 135 },
  { id: 'tool-shell', label: 'SHELL', type: 'shell', angle: 180 },
  { id: 'tool-knowledge', label: 'KNOWLEDGE', type: 'knowledge', angle: 225 },
  { id: 'tool-policy', label: 'POLICY', type: 'policy', angle: 270 },
  { id: 'tool-verifier', label: 'VERIFIER', type: 'verifier_tool', angle: 315 },
]


export function useCytoscapeElements(state: OrchestraState) {
  return useMemo((): CyElement[] => {
    if (state.agents.length === 0) {
      return []
    }

    const elements: CyElement[] = []

    // Central hub
    elements.push({
      group: 'nodes',
      data: {
        id: 'hub',
        label: 'LLM AGENT\nTEAM',
        nodeType: 'hub',
        color: AGENT_COLORS.hub,
      },
    })

    // Agent nodes — no position, fcose computes
    state.agents.forEach((agent) => {
      elements.push({
        group: 'nodes',
        data: {
          id: agent.identity.id,
          label: getDisplayLabel(agent.identity),
          nodeType: agent.identity.agentType,
          color: AGENT_COLORS[agent.identity.agentType] ?? '#6b7280',
          status: agent.status,
        },
      })

      // Edge from hub to agent
      elements.push({
        group: 'edges',
        data: {
          id: `hub-${agent.identity.id}`,
          source: 'hub',
          target: agent.identity.id,
          color: AGENT_COLORS[agent.identity.agentType] ?? '#6b7280',
        },
      })
    })

    // Tool/resource nodes — no position, fcose computes
    TOOL_NODES.forEach((tool) => {
      elements.push({
        group: 'nodes',
        data: {
          id: tool.id,
          label: tool.label,
          nodeType: tool.type,
          color: AGENT_COLORS[tool.type] ?? '#6b7280',
        },
      })
    })

    // Edges from agents to tools based on dependency links
    for (const link of state.dependencyLinks) {
      if (link.type === 'uses') {
        // Find matching tool node
        const agent = state.agents.find((a) => a.identity.id === link.sourceId)
        if (agent) {
          const toolType = agent.identity.englishRole.toLowerCase()
          const toolNode = TOOL_NODES.find(
            (t) => t.type === toolType || t.label.toLowerCase() === toolType
          )
          if (toolNode) {
            elements.push({
              group: 'edges',
              data: {
                id: `dep-${link.id}`,
                source: agent.identity.id,
                target: toolNode.id,
                color: AGENT_COLORS[agent.identity.agentType] ?? '#6b7280',
              },
            })
          }
        }
      }
    }

    // Connect some tools to hub for visual richness
    TOOL_NODES.forEach((tool) => {
      elements.push({
        group: 'edges',
        data: {
          id: `hub-${tool.id}`,
          source: 'hub',
          target: tool.id,
          color: AGENT_COLORS[tool.type] ?? '#2e3545',
          opacity: 0.3,
        },
      })
    })

    return elements
  }, [state.agents, state.dependencyLinks])
}
