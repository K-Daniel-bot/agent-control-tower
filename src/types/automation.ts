// Workflow Automation Types

export type WorkflowNodeType = 'trigger' | 'condition' | 'action' | 'parallel'
export type WorkflowStatus = 'draft' | 'active' | 'paused' | 'archived'
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface WorkflowNodeConfig {
  readonly [key: string]: unknown
}

export interface TriggerConfig extends WorkflowNodeConfig {
  readonly triggerType: 'schedule' | 'event' | 'webhook' | 'manual'
  readonly cron?: string
  readonly eventName?: string
  readonly webhookUrl?: string
}

export interface ConditionConfig extends WorkflowNodeConfig {
  readonly operator: 'equals' | 'not_equals' | 'greater' | 'less' | 'contains' | 'not_contains'
  readonly field: string
  readonly value: string
  readonly trueBranch?: string
  readonly falseBranch?: string
}

export interface ActionConfig extends WorkflowNodeConfig {
  readonly actionType: 'http_request' | 'send_message' | 'file_operation' | 'agent_command' | 'delay' | 'script'
  readonly method?: string
  readonly url?: string
  readonly body?: string
  readonly agentId?: string
  readonly command?: string
  readonly delayMs?: number
  readonly script?: string
}

export interface ParallelConfig extends WorkflowNodeConfig {
  readonly maxParallel: number
}

export interface WorkflowNodeData {
  readonly label: string
  readonly nodeType: WorkflowNodeType
  readonly config: WorkflowNodeConfig
  readonly description?: string
  readonly [key: string]: unknown
}

export interface WorkflowDefinition {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly status: WorkflowStatus
  readonly createdAt: number
  readonly updatedAt: number
}

export interface ExecutionLogEntry {
  readonly timestamp: number
  readonly nodeId: string
  readonly nodeName: string
  readonly status: 'started' | 'completed' | 'failed' | 'skipped'
  readonly message: string
  readonly duration?: number
}

export interface WorkflowExecution {
  readonly id: string
  readonly workflowId: string
  readonly status: ExecutionStatus
  readonly startedAt: number
  readonly completedAt?: number
  readonly logs: readonly ExecutionLogEntry[]
  readonly error?: string
}

export const NODE_TYPE_CONFIG: Readonly<Record<WorkflowNodeType, {
  readonly color: string
  readonly label: string
  readonly icon: string
  readonly description: string
}>> = {
  trigger: { color: '#3b82f6', label: '트리거', icon: '⚡', description: '워크플로우 시작점' },
  condition: { color: '#a855f7', label: '조건', icon: '🔀', description: 'IF/ELSE 분기' },
  action: { color: '#00ff88', label: '액션', icon: '▶', description: '작업 실행' },
  parallel: { color: '#f59e0b', label: '병렬', icon: '⫘', description: '동시 실행' },
}
