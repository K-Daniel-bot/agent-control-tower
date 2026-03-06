// AI Remote Control System Types

export type SeverityLevel = 'low' | 'medium' | 'high' | 'blocked'
export type ApprovalStatus = 'pending' | 'approved' | 'denied' | 'expired' | 'auto'
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected'
export type SandboxStatus = 'inactive' | 'initializing' | 'active' | 'error'
export type CursorAction = 'idle' | 'moving' | 'clicking' | 'typing' | 'dragging' | 'scrolling'
export type SecurityLevel = 'normal' | 'elevated' | 'critical'
export type ThreatLevel = 'info' | 'warning' | 'danger'
export type ActionType = 'mouse_move' | 'mouse_click' | 'keyboard' | 'scroll' | 'app_launch' | 'app_close' | 'file_read' | 'file_write' | 'file_delete' | 'browser_navigate' | 'process_control' | 'system_setting' | 'network'

export interface ApprovalRequest {
  readonly id: string
  readonly timestamp: number
  readonly severity: SeverityLevel
  readonly action: ActionType
  readonly description: string
  readonly target: string
  readonly estimatedImpact: string
  readonly status: ApprovalStatus
  readonly voiceMessage: string
}

export interface ApprovalRecord {
  readonly id: string
  readonly request: ApprovalRequest
  readonly respondedAt: number
  readonly decision: 'approved' | 'denied'
  readonly respondedBy: 'voice' | 'ui' | 'auto'
}

export interface AICursorState {
  readonly x: number
  readonly y: number
  readonly action: CursorAction
  readonly targetLabel?: string
}

export interface ScreenStreamState {
  readonly fps: number
  readonly resolution: { readonly width: number; readonly height: number }
  readonly isStreaming: boolean
}

export interface SystemMetrics {
  readonly cpu: number
  readonly ram: { readonly used: number; readonly total: number }
  readonly disk: { readonly used: number; readonly total: number }
  readonly network: { readonly upload: number; readonly download: number }
  readonly temperature?: number
}

export interface ProcessInfo {
  readonly pid: number
  readonly name: string
  readonly cpu: number
  readonly memory: number
  readonly status: 'running' | 'sleeping' | 'stopped' | 'zombie'
  readonly user: string
  readonly startTime: number
  readonly isSuspicious: boolean
}

export interface ThreatAlert {
  readonly id: string
  readonly timestamp: number
  readonly level: ThreatLevel
  readonly category: 'process' | 'network' | 'filesystem' | 'registry' | 'storage' | 'performance'
  readonly title: string
  readonly description: string
  readonly source: string
  readonly resolved: boolean
}

export interface NetworkConnection {
  readonly id: string
  readonly protocol: 'TCP' | 'UDP'
  readonly localAddress: string
  readonly localPort: number
  readonly remoteAddress: string
  readonly remotePort: number
  readonly state: 'ESTABLISHED' | 'LISTEN' | 'CLOSE_WAIT' | 'TIME_WAIT' | 'SYN_SENT'
  readonly process: string
  readonly bytesIn: number
  readonly bytesOut: number
  readonly isSuspicious: boolean
}

export interface ACLRule {
  readonly id: string
  readonly type: 'allow' | 'deny'
  readonly resource: 'file' | 'process' | 'network' | 'registry'
  readonly pattern: string
  readonly description: string
  readonly enabled: boolean
}

export interface AuditEntry {
  readonly id: string
  readonly timestamp: number
  readonly severity: SeverityLevel
  readonly action: string
  readonly target: string
  readonly result: 'success' | 'denied' | 'blocked' | 'error'
  readonly details?: string
}

export interface VoiceState {
  readonly isListening: boolean
  readonly isSpeaking: boolean
  readonly lastMessage: string
  readonly waveform: readonly number[]
}

export interface VoiceEntry {
  readonly id: string
  readonly timestamp: number
  readonly type: 'command' | 'response'
  readonly text: string
}

export interface RemoteState {
  readonly connectionStatus: ConnectionStatus
  readonly sandboxStatus: SandboxStatus
  readonly screenStream: ScreenStreamState
  readonly aiCursor: AICursorState
  readonly approvalQueue: readonly ApprovalRequest[]
  readonly approvalHistory: readonly ApprovalRecord[]
  readonly systemMetrics: SystemMetrics
  readonly threats: readonly ThreatAlert[]
  readonly processes: readonly ProcessInfo[]
  readonly networkConnections: readonly NetworkConnection[]
  readonly voiceState: VoiceState
  readonly securityLevel: SecurityLevel
  readonly auditLog: readonly AuditEntry[]
  readonly accessControlList: readonly ACLRule[]
  readonly executionSpeed: number
  readonly currentAction: string | null
  readonly voiceLog: readonly VoiceEntry[]
  readonly monitoringEnabled: boolean
}
