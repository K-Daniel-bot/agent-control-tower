export type ProjectEnvironment = 'development' | 'staging' | 'production'

export type PermissionRole = 'admin' | 'operator' | 'viewer'

export interface ProjectSettings {
  readonly rootPath: string
  readonly environment: ProjectEnvironment
  readonly workspaceName: string
}

export interface AgentArchitectureSettings {
  readonly orchestratorModel: string
  readonly orchestratorMaxTokens: number
  readonly plannerEnabled: boolean
  readonly plannerModel: string
  readonly executorPoolSize: number
  readonly executorConcurrency: number
}

export interface ToolIntegrationItem {
  readonly id: string
  readonly type: 'claude' | 'git' | 'notion' | 'browser' | 'shell'
  readonly label: string
  readonly enabled: boolean
  readonly config: Readonly<Record<string, string>>
}

export interface WidgetConfig {
  readonly id: string
  readonly name: string
  readonly visible: boolean
  readonly position: number
}

export interface DashboardLayoutSettings {
  readonly widgets: readonly WidgetConfig[]
  readonly monitoringPanels: readonly string[]
}

export interface PermissionEntry {
  readonly id: string
  readonly name: string
  readonly role: PermissionRole
  readonly email: string
}

export interface ProjectConfig {
  readonly project: ProjectSettings
  readonly agentArchitecture: AgentArchitectureSettings
  readonly toolIntegrations: readonly ToolIntegrationItem[]
  readonly dashboardLayout: DashboardLayoutSettings
  readonly permissions: readonly PermissionEntry[]
}

export type CustomizeSectionKey =
  | 'project'
  | 'architecture'
  | 'tools'
  | 'layout'
  | 'permissions'
