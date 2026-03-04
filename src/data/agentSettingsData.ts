// ============================================================
// Agent Settings - Mock Data & In-Memory Store
// ============================================================

export interface AgentConfig {
  id: string
  name: string
  englishRole: string
  model: string
  status: 'active' | 'inactive' | 'error'
  maxTokens: number
  temperature: number
  systemPrompt: string
  tools: string[]
  createdAt: string
  updatedAt: string
}

export interface AgentMetric {
  agentId: string
  name: string
  cpuUsage: number
  memUsage: number
  tokenPerSec: number
  requestCount: number
}

export interface AgentEvent {
  id: string
  timestamp: string
  agentName: string
  type: 'started' | 'completed' | 'error' | 'tool_call'
  message: string
  severity: 'info' | 'warning' | 'error' | 'critical'
}

// ─── Default Agents ────────────────────────────────────────
const DEFAULT_AGENTS: AgentConfig[] = [
  {
    id: 'agent-001',
    name: '강다니엘/CEO',
    englishRole: 'Orchestrator',
    model: 'claude-opus-4-6',
    status: 'active',
    maxTokens: 8192,
    temperature: 0.7,
    systemPrompt: '프로젝트 전체를 총괄하는 오케스트레이터입니다.',
    tools: ['planner', 'executor', 'verifier', 'browser', 'shell'],
    createdAt: '2026-03-01T09:00:00Z',
    updatedAt: '2026-03-04T10:30:00Z',
  },
  {
    id: 'agent-002',
    name: '박지민/부사장',
    englishRole: 'Planner',
    model: 'claude-opus-4-6',
    status: 'active',
    maxTokens: 4096,
    temperature: 0.5,
    systemPrompt: '구현 계획을 수립하고 작업을 분배합니다.',
    tools: ['planner', 'browser'],
    createdAt: '2026-03-01T09:05:00Z',
    updatedAt: '2026-03-04T10:00:00Z',
  },
  {
    id: 'agent-003',
    name: '김서연/전무',
    englishRole: 'Executor A',
    model: 'claude-sonnet-4-6',
    status: 'active',
    maxTokens: 4096,
    temperature: 0.3,
    systemPrompt: '프론트엔드 코드를 구현합니다.',
    tools: ['shell', 'browser', 'filesystem'],
    createdAt: '2026-03-01T09:10:00Z',
    updatedAt: '2026-03-04T09:45:00Z',
  },
  {
    id: 'agent-004',
    name: '이준혁/상무',
    englishRole: 'Executor B',
    model: 'claude-sonnet-4-6',
    status: 'active',
    maxTokens: 4096,
    temperature: 0.3,
    systemPrompt: '백엔드 API를 구현합니다.',
    tools: ['shell', 'git', 'database'],
    createdAt: '2026-03-02T10:00:00Z',
    updatedAt: '2026-03-04T11:00:00Z',
  },
  {
    id: 'agent-005',
    name: '홍길동/팀장',
    englishRole: 'Verifier',
    model: 'claude-sonnet-4-6',
    status: 'active',
    maxTokens: 2048,
    temperature: 0.2,
    systemPrompt: '코드 리뷰와 검증을 담당합니다.',
    tools: ['shell', 'git'],
    createdAt: '2026-03-02T10:30:00Z',
    updatedAt: '2026-03-04T08:00:00Z',
  },
  {
    id: 'agent-006',
    name: '윤서아/과장',
    englishRole: 'Security Reviewer',
    model: 'claude-opus-4-6',
    status: 'inactive',
    maxTokens: 4096,
    temperature: 0.2,
    systemPrompt: '보안 취약점을 분석합니다.',
    tools: ['shell', 'browser'],
    createdAt: '2026-03-03T14:00:00Z',
    updatedAt: '2026-03-03T14:00:00Z',
  },
  {
    id: 'agent-007',
    name: '임채원/대리',
    englishRole: 'Doc Updater',
    model: 'claude-haiku-4-5',
    status: 'error',
    maxTokens: 2048,
    temperature: 0.5,
    systemPrompt: '문서를 업데이트합니다.',
    tools: ['filesystem', 'git'],
    createdAt: '2026-03-03T15:00:00Z',
    updatedAt: '2026-03-04T07:30:00Z',
  },
]

// ─── Metrics Mock ──────────────────────────────────────────
const DEFAULT_METRICS: AgentMetric[] = [
  { agentId: 'agent-001', name: '강다니엘/CEO', cpuUsage: 72.7, memUsage: 68.3, tokenPerSec: 156, requestCount: 342 },
  { agentId: 'agent-002', name: '박지민/부사장', cpuUsage: 47.9, memUsage: 52.1, tokenPerSec: 105, requestCount: 218 },
  { agentId: 'agent-003', name: '김서연/전무', cpuUsage: 65.2, memUsage: 71.8, tokenPerSec: 92, requestCount: 187 },
  { agentId: 'agent-004', name: '이준혁/상무', cpuUsage: 58.4, memUsage: 45.6, tokenPerSec: 78, requestCount: 156 },
  { agentId: 'agent-005', name: '홍길동/팀장', cpuUsage: 33.1, memUsage: 29.4, tokenPerSec: 45, requestCount: 98 },
  { agentId: 'agent-006', name: '윤서아/과장', cpuUsage: 0, memUsage: 0, tokenPerSec: 0, requestCount: 0 },
  { agentId: 'agent-007', name: '임채원/대리', cpuUsage: 12.5, memUsage: 18.2, tokenPerSec: 0, requestCount: 15 },
]

// ─── Events Mock ───────────────────────────────────────────
const DEFAULT_EVENTS: AgentEvent[] = [
  { id: 'evt-001', timestamp: '2026-03-04 13:03:52', agentName: '강다니엘/CEO', type: 'started', message: '프로젝트 빌드 오케스트레이션 시작', severity: 'info' },
  { id: 'evt-002', timestamp: '2026-03-04 13:03:48', agentName: '박지민/부사장', type: 'tool_call', message: 'planner 도구 호출 — 구현 계획 수립', severity: 'info' },
  { id: 'evt-003', timestamp: '2026-03-04 13:03:45', agentName: '김서연/전무', type: 'completed', message: 'TopologyMap 컴포넌트 구현 완료', severity: 'info' },
  { id: 'evt-004', timestamp: '2026-03-04 13:03:40', agentName: '이준혁/상무', type: 'tool_call', message: 'database 스키마 마이그레이션 실행', severity: 'warning' },
  { id: 'evt-005', timestamp: '2026-03-04 13:03:35', agentName: '임채원/대리', type: 'error', message: 'git push 실패 — 권한 거부', severity: 'critical' },
  { id: 'evt-006', timestamp: '2026-03-04 13:03:30', agentName: '홍길동/팀장', type: 'completed', message: '코드 리뷰 완료 — 이슈 2건 발견', severity: 'warning' },
  { id: 'evt-007', timestamp: '2026-03-04 13:03:25', agentName: '강다니엘/CEO', type: 'tool_call', message: 'shell 도구 호출 — npm run build 실행', severity: 'info' },
  { id: 'evt-008', timestamp: '2026-03-04 13:03:20', agentName: '김서연/전무', type: 'started', message: 'AgentSettingsPage 컴포넌트 작업 시작', severity: 'info' },
]

// ─── In-Memory Store ───────────────────────────────────────
let agents: AgentConfig[] = [...DEFAULT_AGENTS]

export function getAgents(): AgentConfig[] {
  return [...agents]
}

export function getAgentById(id: string): AgentConfig | undefined {
  return agents.find((a) => a.id === id)
}

export function createAgent(data: Omit<AgentConfig, 'id' | 'createdAt' | 'updatedAt'>): AgentConfig {
  const now = new Date().toISOString()
  const newAgent: AgentConfig = {
    ...data,
    id: `agent-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
  }
  agents = [...agents, newAgent]
  return newAgent
}

export function updateAgent(id: string, data: Partial<AgentConfig>): AgentConfig | null {
  const index = agents.findIndex((a) => a.id === id)
  if (index === -1) return null
  const updated: AgentConfig = {
    ...agents[index],
    ...data,
    id: agents[index].id,
    createdAt: agents[index].createdAt,
    updatedAt: new Date().toISOString(),
  }
  agents = agents.map((a, i) => (i === index ? updated : a))
  return updated
}

export function deleteAgent(id: string): boolean {
  const len = agents.length
  agents = agents.filter((a) => a.id !== id)
  return agents.length < len
}

export function getMetrics(): AgentMetric[] {
  return [...DEFAULT_METRICS]
}

export function getEvents(): AgentEvent[] {
  return [...DEFAULT_EVENTS]
}
