import type {
  AgentState,
  AgentMessage,
  ExecutionEdge,
  DependencyLink,
  TopologyAgentType,
} from '@/types/topology'

export interface DataPoint {
  time: string
  value: number
}

export interface EventCountCell {
  type: TopologyAgentType
  label: string
  caution: number
  danger: number
  urgent: number
  sustained: number
  total: number
}

export interface AgentStatusSummary {
  id: string
  name: string
  type: TopologyAgentType
  status: string
  cpuUsage: number
  memUsage: number
  tokenRate: number
  latencyMs: number
}

export interface ChannelStatusSummary {
  id: string
  label: string
  inRate: number
  outRate: number
  status: 'normal' | 'warning' | 'error'
}

export interface ToolStatusSummary {
  name: string
  usage: number
  status: 'active' | 'idle' | 'error'
}

const AGENT_TYPE_LABELS: Record<TopologyAgentType, string> = {
  orchestrator: 'Orchestrator',
  planner: 'Planner',
  executor: 'Executor',
  tool: 'Tool',
  verifier: 'Verifier',
  result: 'Result',
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  const hh = d.getHours().toString().padStart(2, '0')
  const mm = d.getMinutes().toString().padStart(2, '0')
  const ss = d.getSeconds().toString().padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

export function deriveTokenRatePoint(agents: ReadonlyArray<AgentState>): DataPoint {
  const total = agents.reduce((sum, a) => sum + a.tokenRate, 0)
  return { time: formatTime(Date.now()), value: total }
}

export function deriveContextUsagePoint(agents: ReadonlyArray<AgentState>): DataPoint {
  const activeCount = agents.filter(a => a.status === 'working' || a.status === 'active').length
  const usage = activeCount * (15 + Math.random() * 10)
  return { time: formatTime(Date.now()), value: Math.min(100, usage) }
}

export function deriveCommunicationTrafficPoint(messages: ReadonlyArray<AgentMessage>): DataPoint {
  const now = Date.now()
  const recentCount = messages.filter(m => now - m.timestamp < 10000).length
  return { time: formatTime(now), value: recentCount * 5 + Math.random() * 3 }
}

export function deriveEventCountGrid(
  agents: ReadonlyArray<AgentState>,
  messages: ReadonlyArray<AgentMessage>,
): ReadonlyArray<EventCountCell> {
  const types: TopologyAgentType[] = ['orchestrator', 'planner', 'executor', 'tool', 'verifier']
  const agentTypeMap = new Map<string, TopologyAgentType>()
  for (const a of agents) {
    agentTypeMap.set(a.identity.id, a.identity.agentType)
  }

  return types.map(type => {
    const typeMessages = messages.filter(m => agentTypeMap.get(m.fromId) === type)
    const caution = typeMessages.filter(m => m.type === 'system').length
    const danger = typeMessages.filter(m => m.type === 'task').length
    const urgent = typeMessages.filter(m => m.type === 'error').length
    const sustained = agents.filter(a => a.identity.agentType === type && a.status === 'error').length
    return {
      type,
      label: AGENT_TYPE_LABELS[type],
      caution,
      danger,
      urgent,
      sustained,
      total: caution + danger + urgent + sustained,
    }
  })
}

export function deriveAgentStatusSummary(
  agents: ReadonlyArray<AgentState>,
): ReadonlyArray<AgentStatusSummary> {
  return agents
    .filter(a => a.status !== 'complete')
    .slice(0, 6)
    .map(a => ({
      id: a.identity.id,
      name: a.identity.englishRole,
      type: a.identity.agentType,
      status: a.status,
      cpuUsage: Math.min(100, a.tokenRate * 0.8 + Math.random() * 20),
      memUsage: Math.min(100, 30 + Math.random() * 40),
      tokenRate: a.tokenRate,
      latencyMs: a.latencyMs,
    }))
}

export function deriveChannelStatus(
  edges: ReadonlyArray<ExecutionEdge>,
): ReadonlyArray<ChannelStatusSummary> {
  const channels = edges.slice(0, 6).map(e => ({
    id: e.id,
    label: `${e.sourceId.slice(0, 6)}→${e.targetId.slice(0, 6)}`,
    inRate: e.dataRate,
    outRate: e.dataRate * (0.5 + Math.random() * 0.5),
    status: e.status,
  }))
  if (channels.length === 0) {
    return [
      { id: 'ch-1', label: 'PlanBot Simulator', inRate: 0, outRate: 0, status: 'normal' },
      { id: 'ch-2', label: 'Athon', inRate: 0, outRate: 0, status: 'normal' },
      { id: 'ch-3', label: 'MainSwitch-2', inRate: 0, outRate: 0, status: 'normal' },
    ]
  }
  return channels
}

export function deriveToolStatus(
  agents: ReadonlyArray<AgentState>,
  links: ReadonlyArray<DependencyLink>,
): ReadonlyArray<ToolStatusSummary> {
  const toolNames = ['Claude API', 'File System', 'Git', 'Browser', 'Shell']
  const activeTools = new Set(links.map(l => l.targetId))
  const hasErrors = agents.some(a => a.status === 'error')

  return toolNames.map(name => ({
    name,
    usage: activeTools.size > 0 ? 30 + Math.random() * 50 : 0,
    status: hasErrors && Math.random() > 0.7 ? 'error' as const : activeTools.size > 0 ? 'active' as const : 'idle' as const,
  }))
}
