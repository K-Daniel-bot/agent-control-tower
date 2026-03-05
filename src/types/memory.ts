export interface ProjectMemory {
  readonly projectName: string
  readonly projectPath: string
  readonly projectDir: string
  readonly files: readonly MemoryFile[]
  readonly sessionCount: number
  readonly lastActivity: string
}

export interface MemoryFile {
  readonly path: string
  readonly name: string
  readonly sizeBytes: number
  readonly modifiedAt: string
  readonly content?: string
}

export interface SessionRecord {
  readonly sessionId: string
  readonly projectName: string
  readonly cwd: string
  readonly prompt: string
  readonly startedAt: string
  readonly endedAt?: string
  readonly toolUses: readonly ToolUseRecord[]
  readonly writeCount: number
}

export interface ToolUseRecord {
  readonly toolName: string
  readonly timestamp: string
  readonly isMcp: boolean
  readonly mcpServer?: string
}

export interface MemoryDashboardData {
  readonly projects: readonly ProjectMemory[]
  readonly sessions: readonly SessionRecord[]
  readonly totalMemoryFiles: number
  readonly totalSessions: number
  readonly totalSizeBytes: number
}
