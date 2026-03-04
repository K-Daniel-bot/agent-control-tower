// ============================================================
// Topology Map - Type Definitions
// ============================================================

/** Agent types for the execution flow */
export type TopologyAgentType =
  | 'orchestrator'
  | 'planner'
  | 'executor'
  | 'tool'
  | 'verifier'
  | 'result'

/** Agent lifecycle status */
export type AgentStatus =
  | 'spawning'
  | 'active'
  | 'working'
  | 'idle'
  | 'error'
  | 'complete'

/** Korean identity for each agent */
export interface AgentIdentity {
  id: string
  koreanName: string
  title: string
  englishRole: string
  agentType: TopologyAgentType
  icon?: string
}

/** Runtime state of an agent */
export interface AgentState {
  identity: AgentIdentity
  status: AgentStatus
  tokenRate: number
  latencyMs: number
  spawnedAt: number
  completedAt?: number
}

/** Edge in the execution flow (React Flow) */
export interface ExecutionEdge {
  id: string
  sourceId: string
  targetId: string
  status: 'normal' | 'warning' | 'error'
  dataRate: number
}

/** Link in the dependency graph (Cytoscape) */
export interface DependencyLink {
  id: string
  sourceId: string
  targetId: string
  type: 'uses' | 'depends' | 'communicates'
}

/** Tool/resource node for Cytoscape dependency graph */
export type ToolNodeType =
  | 'browser'
  | 'slack'
  | 'filesystem'
  | 'git'
  | 'shell'
  | 'knowledge'
  | 'policy'
  | 'verifier_tool'

/** A message exchanged between agents (for conversation log) */
export interface AgentMessage {
  id: string
  fromId: string
  toId: string
  fromLabel: string
  toLabel: string
  message: string
  timestamp: number
  type: 'task' | 'result' | 'error' | 'system'
}

/** Global orchestra state */
export interface OrchestraState {
  readonly agents: ReadonlyArray<AgentState>
  readonly executionEdges: ReadonlyArray<ExecutionEdge>
  readonly dependencyLinks: ReadonlyArray<DependencyLink>
  readonly messages: ReadonlyArray<AgentMessage>
  readonly phase: 'idle' | 'running' | 'complete'
}

/** Orchestra mode */
export type OrchestraMode = 'auto' | 'manual'

/** Actions for the orchestra reducer */
export type OrchestraAction =
  | { type: 'SPAWN_AGENT'; payload: AgentIdentity }
  | { type: 'UPDATE_AGENT_STATUS'; payload: { id: string; status: AgentStatus; tokenRate?: number; latencyMs?: number } }
  | { type: 'COMPLETE_AGENT'; payload: { id: string } }
  | { type: 'REMOVE_AGENT'; payload: { id: string } }
  | { type: 'ADD_EXECUTION_EDGE'; payload: ExecutionEdge }
  | { type: 'ADD_DEPENDENCY_LINK'; payload: DependencyLink }
  | { type: 'ADD_AGENT_MESSAGE'; payload: AgentMessage }
  | { type: 'SET_PHASE'; payload: OrchestraState['phase'] }
  | { type: 'RESET' }

/** Legend entry for the graph legend */
export interface LegendEntry {
  label: string
  color: string
  type: TopologyAgentType | ToolNodeType | 'hub'
}
