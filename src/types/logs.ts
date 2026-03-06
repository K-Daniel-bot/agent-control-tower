// Unified Log System Types

export type LogLevel = 'debug' | 'info' | 'warning' | 'error' | 'critical'
export type LogSource = 'agent_event' | 'audit' | 'remote_action' | 'system' | 'security' | 'voice' | 'workflow'

export interface LogEntry {
  readonly id: string
  readonly timestamp: number
  readonly level: LogLevel
  readonly source: LogSource
  readonly category: string
  readonly message: string
  readonly target?: string
  readonly details?: string
  readonly metadata?: Readonly<Record<string, unknown>>
}

export interface LogFilter {
  readonly sources: readonly LogSource[]
  readonly levels: readonly LogLevel[]
  readonly searchQuery: string
  readonly timeRange: TimeRange
}

export type TimeRange = '1h' | '6h' | '24h' | '7d' | 'all'

export interface LogStats {
  readonly totalCount: number
  readonly countByLevel: Readonly<Record<LogLevel, number>>
  readonly countBySource: Readonly<Record<LogSource, number>>
  readonly errorRate: number
  readonly recentPerMinute: number
}

export const LOG_LEVEL_CONFIG: Readonly<Record<LogLevel, { readonly color: string; readonly label: string; readonly priority: number }>> = {
  debug: { color: '#6b7280', label: 'DEBUG', priority: 0 },
  info: { color: '#3b82f6', label: 'INFO', priority: 1 },
  warning: { color: '#f59e0b', label: 'WARN', priority: 2 },
  error: { color: '#ef4444', label: 'ERROR', priority: 3 },
  critical: { color: '#dc2626', label: 'CRIT', priority: 4 },
}

export const LOG_SOURCE_CONFIG: Readonly<Record<LogSource, { readonly color: string; readonly label: string; readonly icon: string }>> = {
  agent_event: { color: '#00ff88', label: '에이전트', icon: '🤖' },
  audit: { color: '#a855f7', label: '감사', icon: '📋' },
  remote_action: { color: '#06b6d4', label: '원격', icon: '🖥️' },
  system: { color: '#6b7280', label: '시스템', icon: '⚙️' },
  security: { color: '#ef4444', label: '보안', icon: '🛡️' },
  voice: { color: '#ec4899', label: '음성', icon: '🎙️' },
  workflow: { color: '#f59e0b', label: '워크플로우', icon: '⚡' },
}

export const DEFAULT_LOG_FILTER: LogFilter = {
  sources: ['agent_event', 'audit', 'remote_action', 'system', 'security', 'voice', 'workflow'],
  levels: ['info', 'warning', 'error', 'critical'],
  searchQuery: '',
  timeRange: '24h',
}

export const TIME_RANGE_MS: Readonly<Record<TimeRange, number>> = {
  '1h': 3_600_000,
  '6h': 21_600_000,
  '24h': 86_400_000,
  '7d': 604_800_000,
  'all': Infinity,
}
