export type NeuralNodeType =
  | 'orchestrator'
  | 'planner'
  | 'executor'
  | 'tool'
  | 'service'
  | 'database'
  | 'external'
  | 'automation'

export type NodeHealth = 'ok' | 'warn' | 'error' | 'idle'

export type LayerName = 'ingest' | 'context' | 'plan' | 'execute' | 'verify' | 'document' | 'observe'

export type EdgeKind = 'call' | 'depends' | 'dataflow' | 'trigger'

export interface NeuralNode {
  readonly id: string
  readonly type: NeuralNodeType
  readonly label: string
  readonly shortLabel: string
  readonly health: NodeHealth
  readonly layer: LayerName
  readonly metrics: {
    readonly cpu: number
    readonly tokenRate: number
    readonly latency: number
    readonly queueDepth: number
  }
}

export interface NeuralEdge {
  readonly source: string
  readonly target: string
  readonly kind: EdgeKind
  readonly rate: number
  readonly active: boolean
}

export interface NeuralEvent {
  readonly id: string
  readonly type: string
  readonly label: string
  readonly timestamp: number
  readonly nodeIds: readonly string[]
}

export const LAYERS: readonly LayerName[] = [
  'ingest', 'context', 'plan', 'execute', 'verify', 'document', 'observe',
]

export const LAYER_LABELS: Record<LayerName, string> = {
  ingest: 'INGEST',
  context: 'CONTEXT',
  plan: 'PLAN',
  execute: 'EXECUTE',
  verify: 'VERIFY',
  document: 'DOCUMENT',
  observe: 'OBSERVE',
}

export const NODE_TYPE_COLORS: Record<NeuralNodeType, string> = {
  orchestrator: '#ffcc00',
  planner: '#00d4ff',
  executor: '#00ff88',
  tool: '#8b5cf6',
  service: '#06b6d4',
  database: '#f59e0b',
  external: '#ec4899',
  automation: '#3b82f6',
}
