export type AgentRank = 'Junior' | 'Mid-Level' | 'Senior' | 'Lead' | 'Principal' | 'Staff' | 'Fellow'

export type AgentRoleType =
  | 'orchestrator' | 'planner' | 'executor' | 'coder'
  | 'tool' | 'verifier' | 'researcher' | 'analyst'
  | 'reviewer' | 'tester' | 'documenter' | 'security'

export type AgentSkill =
  | 'coding' | 'web_search' | 'file_mgmt' | 'git'
  | 'database' | 'api' | 'messaging' | 'code_review'
  | 'testing' | 'documentation' | 'security_analysis' | 'data_analysis'
  | 'browser' | 'shell'

export interface SavedAgent {
  readonly id: string
  readonly name: string
  readonly rank: AgentRank
  readonly roleType: AgentRoleType
  readonly roleDescription: string
  readonly inferredSummary: string
  readonly skills: readonly AgentSkill[]
  readonly icon?: string
  readonly path?: string
  readonly createdAt: number
}
