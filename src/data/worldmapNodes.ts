import type { NeuralNode, NeuralEdge } from '@/types/worldmap'

export const NEURAL_NODES: readonly NeuralNode[] = [
  // INGEST
  { id: 'file-watcher', type: 'tool', label: 'File Watcher', shortLabel: 'FW', health: 'ok', layer: 'ingest', metrics: { cpu: 5, tokenRate: 0, latency: 12, queueDepth: 0 } },
  { id: 'git-hook', type: 'automation', label: 'Git Hook', shortLabel: 'GH', health: 'ok', layer: 'ingest', metrics: { cpu: 2, tokenRate: 0, latency: 8, queueDepth: 0 } },
  { id: 'api-listener', type: 'service', label: 'API Listener', shortLabel: 'AL', health: 'ok', layer: 'ingest', metrics: { cpu: 8, tokenRate: 0, latency: 45, queueDepth: 3 } },
  // CONTEXT
  { id: 'context-builder', type: 'orchestrator', label: 'Context Builder', shortLabel: 'CB', health: 'ok', layer: 'context', metrics: { cpu: 25, tokenRate: 12, latency: 120, queueDepth: 2 } },
  { id: 'memory-store', type: 'database', label: 'Memory Store', shortLabel: 'MS', health: 'ok', layer: 'context', metrics: { cpu: 15, tokenRate: 0, latency: 35, queueDepth: 5 } },
  { id: 'vector-index', type: 'database', label: 'Vector Index', shortLabel: 'VI', health: 'ok', layer: 'context', metrics: { cpu: 30, tokenRate: 0, latency: 25, queueDepth: 8 } },
  // PLAN
  { id: 'orchestrator', type: 'orchestrator', label: 'Orchestrator', shortLabel: 'OR', health: 'ok', layer: 'plan', metrics: { cpu: 40, tokenRate: 28, latency: 200, queueDepth: 1 } },
  { id: 'planner', type: 'planner', label: 'Planner', shortLabel: 'PL', health: 'ok', layer: 'plan', metrics: { cpu: 35, tokenRate: 22, latency: 180, queueDepth: 2 } },
  { id: 'prioritizer', type: 'planner', label: 'Prioritizer', shortLabel: 'PR', health: 'ok', layer: 'plan', metrics: { cpu: 20, tokenRate: 15, latency: 90, queueDepth: 0 } },
  // EXECUTE
  { id: 'code-executor', type: 'executor', label: 'Code Executor', shortLabel: 'CE', health: 'ok', layer: 'execute', metrics: { cpu: 60, tokenRate: 35, latency: 300, queueDepth: 4 } },
  { id: 'shell-runner', type: 'executor', label: 'Shell Runner', shortLabel: 'SR', health: 'ok', layer: 'execute', metrics: { cpu: 45, tokenRate: 5, latency: 150, queueDepth: 2 } },
  { id: 'api-agent', type: 'executor', label: 'API Agent', shortLabel: 'AA', health: 'ok', layer: 'execute', metrics: { cpu: 30, tokenRate: 18, latency: 250, queueDepth: 3 } },
  { id: 'notion-sync', type: 'external', label: 'Notion Sync', shortLabel: 'NS', health: 'idle', layer: 'execute', metrics: { cpu: 5, tokenRate: 0, latency: 500, queueDepth: 0 } },
  // VERIFY
  { id: 'test-runner', type: 'tool', label: 'Test Runner', shortLabel: 'TR', health: 'ok', layer: 'verify', metrics: { cpu: 55, tokenRate: 8, latency: 400, queueDepth: 1 } },
  { id: 'code-reviewer', type: 'planner', label: 'Code Reviewer', shortLabel: 'CR', health: 'ok', layer: 'verify', metrics: { cpu: 40, tokenRate: 25, latency: 350, queueDepth: 2 } },
  { id: 'security-scan', type: 'tool', label: 'Security Scan', shortLabel: 'SS', health: 'warn', layer: 'verify', metrics: { cpu: 35, tokenRate: 10, latency: 280, queueDepth: 0 } },
  // DOCUMENT
  { id: 'doc-writer', type: 'automation', label: 'Doc Writer', shortLabel: 'DW', health: 'ok', layer: 'document', metrics: { cpu: 25, tokenRate: 20, latency: 150, queueDepth: 1 } },
  { id: 'changelog-gen', type: 'automation', label: 'Changelog Gen', shortLabel: 'CG', health: 'ok', layer: 'document', metrics: { cpu: 15, tokenRate: 12, latency: 100, queueDepth: 0 } },
  { id: 'report-builder', type: 'service', label: 'Report Builder', shortLabel: 'RB', health: 'idle', layer: 'document', metrics: { cpu: 8, tokenRate: 5, latency: 80, queueDepth: 0 } },
  // OBSERVE
  { id: 'metrics-collector', type: 'tool', label: 'Metrics', shortLabel: 'MC', health: 'ok', layer: 'observe', metrics: { cpu: 10, tokenRate: 0, latency: 20, queueDepth: 0 } },
  { id: 'alert-manager', type: 'service', label: 'Alert Mgr', shortLabel: 'AM', health: 'ok', layer: 'observe', metrics: { cpu: 8, tokenRate: 0, latency: 15, queueDepth: 1 } },
  { id: 'log-aggregator', type: 'service', label: 'Log Agg', shortLabel: 'LA', health: 'ok', layer: 'observe', metrics: { cpu: 12, tokenRate: 0, latency: 30, queueDepth: 2 } },
]

export const NEURAL_EDGES: readonly NeuralEdge[] = [
  // Ingest -> Context
  { source: 'file-watcher', target: 'context-builder', kind: 'dataflow', rate: 15, active: true },
  { source: 'file-watcher', target: 'memory-store', kind: 'dataflow', rate: 8, active: true },
  { source: 'file-watcher', target: 'vector-index', kind: 'dataflow', rate: 4, active: false },
  { source: 'git-hook', target: 'context-builder', kind: 'trigger', rate: 5, active: true },
  { source: 'git-hook', target: 'vector-index', kind: 'dataflow', rate: 3, active: false },
  { source: 'git-hook', target: 'memory-store', kind: 'dataflow', rate: 6, active: true },
  { source: 'api-listener', target: 'context-builder', kind: 'dataflow', rate: 20, active: true },
  { source: 'api-listener', target: 'memory-store', kind: 'dataflow', rate: 10, active: true },
  { source: 'api-listener', target: 'vector-index', kind: 'dataflow', rate: 5, active: false },
  // Context -> Plan
  { source: 'context-builder', target: 'orchestrator', kind: 'call', rate: 25, active: true },
  { source: 'context-builder', target: 'planner', kind: 'call', rate: 20, active: true },
  { source: 'context-builder', target: 'prioritizer', kind: 'call', rate: 10, active: false },
  { source: 'memory-store', target: 'orchestrator', kind: 'depends', rate: 10, active: true },
  { source: 'memory-store', target: 'planner', kind: 'depends', rate: 12, active: true },
  { source: 'memory-store', target: 'prioritizer', kind: 'depends', rate: 8, active: false },
  { source: 'vector-index', target: 'planner', kind: 'depends', rate: 15, active: true },
  { source: 'vector-index', target: 'prioritizer', kind: 'depends', rate: 10, active: true },
  { source: 'vector-index', target: 'orchestrator', kind: 'depends', rate: 6, active: false },
  // Plan -> Execute
  { source: 'orchestrator', target: 'code-executor', kind: 'call', rate: 30, active: true },
  { source: 'orchestrator', target: 'shell-runner', kind: 'call', rate: 15, active: true },
  { source: 'orchestrator', target: 'api-agent', kind: 'call', rate: 12, active: true },
  { source: 'orchestrator', target: 'notion-sync', kind: 'trigger', rate: 3, active: false },
  { source: 'planner', target: 'code-executor', kind: 'call', rate: 25, active: true },
  { source: 'planner', target: 'api-agent', kind: 'call', rate: 10, active: true },
  { source: 'planner', target: 'shell-runner', kind: 'call', rate: 8, active: false },
  { source: 'planner', target: 'notion-sync', kind: 'trigger', rate: 5, active: false },
  { source: 'prioritizer', target: 'code-executor', kind: 'depends', rate: 8, active: true },
  { source: 'prioritizer', target: 'shell-runner', kind: 'depends', rate: 6, active: false },
  { source: 'prioritizer', target: 'api-agent', kind: 'depends', rate: 4, active: false },
  // Execute -> Verify
  { source: 'code-executor', target: 'test-runner', kind: 'trigger', rate: 20, active: true },
  { source: 'code-executor', target: 'code-reviewer', kind: 'call', rate: 18, active: true },
  { source: 'code-executor', target: 'security-scan', kind: 'trigger', rate: 10, active: true },
  { source: 'shell-runner', target: 'test-runner', kind: 'trigger', rate: 12, active: true },
  { source: 'shell-runner', target: 'security-scan', kind: 'depends', rate: 5, active: false },
  { source: 'shell-runner', target: 'code-reviewer', kind: 'call', rate: 6, active: false },
  { source: 'api-agent', target: 'code-reviewer', kind: 'call', rate: 8, active: true },
  { source: 'api-agent', target: 'security-scan', kind: 'depends', rate: 4, active: false },
  { source: 'notion-sync', target: 'code-reviewer', kind: 'depends', rate: 2, active: false },
  // Verify -> Document
  { source: 'test-runner', target: 'doc-writer', kind: 'trigger', rate: 12, active: true },
  { source: 'test-runner', target: 'changelog-gen', kind: 'trigger', rate: 8, active: true },
  { source: 'test-runner', target: 'report-builder', kind: 'dataflow', rate: 5, active: false },
  { source: 'code-reviewer', target: 'doc-writer', kind: 'trigger', rate: 15, active: true },
  { source: 'code-reviewer', target: 'changelog-gen', kind: 'trigger', rate: 10, active: true },
  { source: 'code-reviewer', target: 'report-builder', kind: 'dataflow', rate: 8, active: true },
  { source: 'security-scan', target: 'report-builder', kind: 'dataflow', rate: 6, active: true },
  { source: 'security-scan', target: 'doc-writer', kind: 'trigger', rate: 4, active: false },
  { source: 'security-scan', target: 'changelog-gen', kind: 'trigger', rate: 3, active: false },
  // Document -> Observe
  { source: 'doc-writer', target: 'metrics-collector', kind: 'dataflow', rate: 10, active: true },
  { source: 'doc-writer', target: 'log-aggregator', kind: 'dataflow', rate: 8, active: true },
  { source: 'doc-writer', target: 'alert-manager', kind: 'trigger', rate: 4, active: false },
  { source: 'changelog-gen', target: 'metrics-collector', kind: 'dataflow', rate: 6, active: true },
  { source: 'changelog-gen', target: 'alert-manager', kind: 'trigger', rate: 3, active: false },
  { source: 'changelog-gen', target: 'log-aggregator', kind: 'dataflow', rate: 5, active: false },
  { source: 'report-builder', target: 'alert-manager', kind: 'trigger', rate: 5, active: true },
  { source: 'report-builder', target: 'log-aggregator', kind: 'dataflow', rate: 12, active: true },
  { source: 'report-builder', target: 'metrics-collector', kind: 'dataflow', rate: 8, active: false },
]

// Flow diagram steps for bottom-right panel
export const FLOW_STEPS = [
  { id: 'f1', label: 'Git Commit', group: 0 },
  { id: 'f2', label: 'File Detect', group: 0 },
  { id: 'f3', label: 'Context Asm', group: 1 },
  { id: 'f4', label: 'Vec Search', group: 1 },
  { id: 'f5', label: 'Plan Gen', group: 2 },
  { id: 'f6', label: 'Priority Q', group: 2 },
  { id: 'f7', label: 'Code Exec', group: 3 },
  { id: 'f8', label: 'Shell Run', group: 3 },
  { id: 'f9', label: 'API Call', group: 3 },
  { id: 'f10', label: 'Test Run', group: 4 },
  { id: 'f11', label: 'Review', group: 4 },
  { id: 'f12', label: 'Doc Gen', group: 5 },
  { id: 'f13', label: 'Changelog', group: 5 },
  { id: 'f14', label: 'Deploy', group: 6 },
  { id: 'f15', label: 'Notify', group: 6 },
]

export const FLOW_CONNECTIONS: readonly [string, string][] = [
  ['f1', 'f3'], ['f2', 'f3'], ['f2', 'f4'],
  ['f3', 'f5'], ['f4', 'f5'], ['f4', 'f6'],
  ['f5', 'f7'], ['f5', 'f8'], ['f6', 'f9'],
  ['f7', 'f10'], ['f8', 'f10'], ['f7', 'f11'], ['f9', 'f11'],
  ['f10', 'f12'], ['f11', 'f12'], ['f11', 'f13'],
  ['f12', 'f14'], ['f13', 'f14'], ['f12', 'f15'],
]
