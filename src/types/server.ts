export type ServerStatus = 'idle' | 'running' | 'starting' | 'stopping' | 'failed'

export interface ServerConfig {
  id: string
  name: string
  port: number
  command: string
  cwd?: string
  healthCheckUrl?: string
  autoRestart?: boolean
  env?: Record<string, string>
}

export interface ServerState {
  id: string
  name: string
  port: number
  status: ServerStatus
  uptime?: number
  healthCheckUrl?: string
  lastHealthCheck?: {
    ok: boolean
    statusCode?: number
    latencyMs?: number
    checkedAt: string
  }
  logs: string[]
}

export interface ServerActionResponse {
  message: string
  status: ServerStatus
  error?: string
}
