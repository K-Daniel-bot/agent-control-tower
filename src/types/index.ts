// ============================================================
// Agent Control Tower - Shared Type Definitions
// ============================================================

/** Status types for agents and workflows */
export type StatusType = 'active' | 'idle' | 'error' | 'warning' | 'blocked' | 'running' | 'complete'

/** Severity levels for events */
export type SeverityType = 'info' | 'warning' | 'error' | 'critical' | 'success'

// ============================================================
// Left Panel: Traffic Metrics
// ============================================================

/** Workflow traffic metric (replaces "회선 트래픽") */
export interface WorkflowMetric {
  id: string
  name: string
  tokenPerSec: number
  percentage: number
  status: StatusType
  trend: 'up' | 'down' | 'stable'
}

/** Agent traffic metric (replaces "장비 트래픽") */
export interface AgentMetric {
  id: string
  name: string
  tokenPerSec: number
  percentage: number
  status: StatusType
  type: 'planner' | 'executor' | 'verifier' | 'tool' | 'coordinator'
}

/** Overall token usage summary */
export interface TokenUsageSummary {
  totalTokenPerSec: number
  peakTokenPerSec: number
  activeWorkflows: number
  activeAgents: number
  chartData: ChartDataPoint[]
}

// ============================================================
// Center Panel: Topology Map
// ============================================================

/** Node in the agent execution graph */
export interface AgentNode {
  id: string
  type: 'userRequest' | 'planner' | 'executor' | 'tool' | 'verifier' | 'result' | 'coordinator'
  label: string
  status: StatusType
  tokenPerSec?: number
  latencyMs?: number
  position: { x: number; y: number }
  metadata?: Record<string, string | number | boolean>
}

/** Edge connecting nodes in the topology */
export interface AgentEdge {
  id: string
  source: string
  target: string
  label?: string
  animated?: boolean
  status?: StatusType
  dataRate?: number
}

/** Full topology data structure */
export interface TopologyData {
  nodes: AgentNode[]
  edges: AgentEdge[]
}

// ============================================================
// Right Panel: Real-time Charts
// ============================================================

/** Single data point for time-series charts */
export interface ChartDataPoint {
  timestamp: number
  value: number
  label?: string
}

/** A chart series for the right panel */
export interface ChartSeries {
  id: string
  name: string
  data: ChartDataPoint[]
  color: string
  unit: string
  currentValue: number
  minValue: number
  maxValue: number
}

/** Right panel metric group */
export interface MetricChart {
  id: string
  title: string
  series: ChartSeries[]
}

// ============================================================
// Bottom Panel: Event Log
// ============================================================

/** Event log entry (replaces NOC alarm log) */
export interface EventLogEntry {
  id: string
  timestamp: string
  type: 'task_started' | 'tool_call' | 'policy_block' | 'approval_required' | 'run_failed' | 'task_complete' | 'agent_error' | 'workflow_start' | 'workflow_complete'
  severity: SeverityType
  workflowId: string
  agentName: string
  message: string
  details?: string
  duration?: number
}

// ============================================================
// Common / Shared
// ============================================================

/** Generic key-value metric */
export interface KeyValueMetric {
  key: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'stable'
}

/** Dashboard overall state */
export interface DashboardState {
  tokenUsage: TokenUsageSummary
  workflowMetrics: WorkflowMetric[]
  agentMetrics: AgentMetric[]
  topology: TopologyData
  charts: MetricChart[]
  eventLog: EventLogEntry[]
  lastUpdated: number
}
