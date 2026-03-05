'use client'

import { useReducer, useEffect, useRef } from 'react'
import type {
  ProjectConfig,
  ProjectSettings,
  AgentArchitectureSettings,
  ToolIntegrationItem,
  DashboardLayoutSettings,
  PermissionEntry,
} from '@/types/customize'

const STORAGE_KEY = 'act-project-config'

const DEFAULT_TOOLS: readonly ToolIntegrationItem[] = [
  { id: 'claude', type: 'claude', label: 'Claude API', enabled: false, config: { model: 'claude-sonnet-4-6', envKey: 'ANTHROPIC_API_KEY' } },
  { id: 'git', type: 'git', label: 'Git', enabled: true, config: { repoUrl: '', branch: 'main' } },
  { id: 'notion', type: 'notion', label: 'Notion', enabled: false, config: { workspaceId: '', envKey: 'NOTION_API_KEY' } },
  { id: 'browser', type: 'browser', label: 'Browser', enabled: false, config: { headless: 'true' } },
  { id: 'shell', type: 'shell', label: 'Shell', enabled: true, config: { allowedCommands: 'npm,node,git,python3' } },
]

const DEFAULT_WIDGETS = [
  { id: 'ems', name: 'EMS Dashboard', visible: true, position: 0 },
  { id: 'terminal', name: 'Terminal', visible: true, position: 1 },
  { id: 'server', name: 'Server', visible: true, position: 2 },
  { id: 'worldmap', name: 'World Map', visible: true, position: 3 },
  { id: 'news', name: 'News', visible: true, position: 4 },
  { id: 'memory', name: 'Memory', visible: true, position: 5 },
]

const DEFAULT_CONFIG: ProjectConfig = {
  project: {
    rootPath: '',
    environment: 'development',
    workspaceName: '',
  },
  agentArchitecture: {
    orchestratorModel: 'claude-sonnet-4-6',
    orchestratorMaxTokens: 8192,
    plannerEnabled: true,
    plannerModel: 'claude-opus-4-6',
    executorPoolSize: 3,
    executorConcurrency: 2,
  },
  toolIntegrations: DEFAULT_TOOLS,
  dashboardLayout: {
    widgets: DEFAULT_WIDGETS,
    monitoringPanels: ['agents', 'tokens', 'events'],
  },
  permissions: [],
}

type Action =
  | { type: 'SET_PROJECT'; payload: ProjectSettings }
  | { type: 'SET_ARCHITECTURE'; payload: AgentArchitectureSettings }
  | { type: 'SET_TOOLS'; payload: readonly ToolIntegrationItem[] }
  | { type: 'SET_LAYOUT'; payload: DashboardLayoutSettings }
  | { type: 'SET_PERMISSIONS'; payload: readonly PermissionEntry[] }
  | { type: 'RESET' }

function reducer(state: ProjectConfig, action: Action): ProjectConfig {
  switch (action.type) {
    case 'SET_PROJECT':
      return { ...state, project: action.payload }
    case 'SET_ARCHITECTURE':
      return { ...state, agentArchitecture: action.payload }
    case 'SET_TOOLS':
      return { ...state, toolIntegrations: action.payload }
    case 'SET_LAYOUT':
      return { ...state, dashboardLayout: action.payload }
    case 'SET_PERMISSIONS':
      return { ...state, permissions: action.payload }
    case 'RESET':
      return { ...DEFAULT_CONFIG }
    default:
      return state
  }
}

function loadConfig(): ProjectConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CONFIG
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_CONFIG
  }
}

export function useProjectConfig() {
  const [config, dispatch] = useReducer(reducer, DEFAULT_CONFIG, loadConfig)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    } catch {
      // storage full or unavailable
    }
  }, [config])

  return { config, dispatch }
}
