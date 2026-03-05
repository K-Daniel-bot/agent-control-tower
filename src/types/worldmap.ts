import type { AgentStatus } from './topology'

export type RegionId =
  | 'codebase'
  | 'api_gateway'
  | 'filesystem'
  | 'database'
  | 'cloud'
  | 'local_tools'
  | 'communication'

export interface Region {
  readonly id: RegionId
  readonly label: string
  readonly description: string
  readonly color: string
  readonly icon: string
  readonly position: { readonly x: number; readonly y: number }
}

export interface AgentPin {
  readonly id: string
  readonly name: string
  readonly regionId: RegionId
  readonly status: AgentStatus
  readonly tokenRate: number
  readonly role: string
  readonly avatar: string
}

export interface ActivityEntry {
  readonly id: string
  readonly agentId: string
  readonly agentName: string
  readonly regionId: RegionId
  readonly action: string
  readonly timestamp: number
  readonly detail?: string
}

export type WorldMapViewMode = '2d' | 'globe'

export type BottomTabType = 'agents' | 'activity' | 'region'

export const REGIONS: readonly Region[] = [
  { id: 'codebase', label: 'Codebase', description: 'Source code read/write/analysis', color: '#3b82f6', icon: '{ }', position: { x: 0.2, y: 0.3 } },
  { id: 'api_gateway', label: 'API Gateway', description: 'External API calls & integrations', color: '#8b5cf6', icon: '\u21C4', position: { x: 0.5, y: 0.2 } },
  { id: 'filesystem', label: 'File System', description: 'File search, glob, grep operations', color: '#06b6d4', icon: '\u2603', position: { x: 0.8, y: 0.3 } },
  { id: 'database', label: 'Database', description: 'SQL queries, schema management', color: '#f59e0b', icon: '\u229E', position: { x: 0.2, y: 0.7 } },
  { id: 'cloud', label: 'Cloud Services', description: 'AWS, GCP, MCP server connections', color: '#ec4899', icon: '\u2601', position: { x: 0.5, y: 0.8 } },
  { id: 'local_tools', label: 'Local Tools', description: 'Bash, terminal, npm, shell commands', color: '#10b981', icon: '>', position: { x: 0.8, y: 0.7 } },
  { id: 'communication', label: 'Communication', description: 'Agent-to-agent messaging & events', color: '#ef4444', icon: '\u2B50', position: { x: 0.5, y: 0.5 } },
] as const
