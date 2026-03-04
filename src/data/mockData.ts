import type {
  WorkflowMetric,
  AgentMetric,
  TokenUsageSummary,
  TopologyData,
  MetricChart,
  EventLogEntry,
  ChartDataPoint,
  DashboardState,
} from '@/types'

// ============================================================
// Helper: generate time-series data
// ============================================================
function generateTimeSeries(
  points: number,
  baseValue: number,
  variance: number,
  offsetMs = 0
): ChartDataPoint[] {
  const now = Date.now() + offsetMs
  return Array.from({ length: points }, (_, i) => ({
    timestamp: now - (points - 1 - i) * 3000,
    value: Math.max(0, baseValue + (Math.random() - 0.5) * variance * 2),
    label: new Date(now - (points - 1 - i) * 3000).toLocaleTimeString('ko-KR'),
  }))
}

// ============================================================
// Left Panel: Workflow Traffic TOP5
// ============================================================
export const workflowMetrics: WorkflowMetric[] = [
  {
    id: 'wf-001',
    name: '문서 요약 워크플로우',
    tokenPerSec: 4823,
    percentage: 92,
    status: 'warning',
    trend: 'up',
  },
  {
    id: 'wf-002',
    name: '코드 리뷰 워크플로우',
    tokenPerSec: 3156,
    percentage: 61,
    status: 'active',
    trend: 'stable',
  },
  {
    id: 'wf-003',
    name: '데이터 분석 파이프라인',
    tokenPerSec: 2891,
    percentage: 55,
    status: 'active',
    trend: 'up',
  },
  {
    id: 'wf-004',
    name: '고객 지원 에이전트',
    tokenPerSec: 2104,
    percentage: 40,
    status: 'active',
    trend: 'down',
  },
  {
    id: 'wf-005',
    name: '보고서 생성 워크플로우',
    tokenPerSec: 1437,
    percentage: 28,
    status: 'idle',
    trend: 'stable',
  },
]

// ============================================================
// Left Panel: Agent Traffic TOP5
// ============================================================
export const agentMetrics: AgentMetric[] = [
  {
    id: 'ag-001',
    name: 'Planner Agent',
    tokenPerSec: 3912,
    percentage: 85,
    status: 'active',
    type: 'planner',
  },
  {
    id: 'ag-002',
    name: 'Executor Agent',
    tokenPerSec: 2788,
    percentage: 61,
    status: 'running',
    type: 'executor',
  },
  {
    id: 'ag-003',
    name: 'Verifier Agent',
    tokenPerSec: 1934,
    percentage: 42,
    status: 'active',
    type: 'verifier',
  },
  {
    id: 'ag-004',
    name: 'Tool Coordinator',
    tokenPerSec: 1245,
    percentage: 27,
    status: 'active',
    type: 'coordinator',
  },
  {
    id: 'ag-005',
    name: 'Code Tool Agent',
    tokenPerSec: 876,
    percentage: 19,
    status: 'idle',
    type: 'tool',
  },
]

// ============================================================
// Left Panel: Token Usage Summary
// ============================================================
export const tokenUsageSummary: TokenUsageSummary = {
  totalTokenPerSec: 14523,
  peakTokenPerSec: 18200,
  activeWorkflows: 4,
  activeAgents: 12,
  chartData: generateTimeSeries(20, 14500, 3000),
}

// ============================================================
// Center Panel: Topology Data
// ============================================================
export const topologyData: TopologyData = {
  nodes: [
    {
      id: 'user-request',
      type: 'userRequest',
      label: 'User Request',
      status: 'active',
      tokenPerSec: 0,
      position: { x: 400, y: 40 },
    },
    {
      id: 'planner-main',
      type: 'planner',
      label: 'Planner Agent',
      status: 'active',
      tokenPerSec: 3912,
      latencyMs: 245,
      position: { x: 400, y: 160 },
    },
    {
      id: 'executor-1',
      type: 'executor',
      label: 'Executor Agent A',
      status: 'running',
      tokenPerSec: 1544,
      latencyMs: 180,
      position: { x: 200, y: 280 },
    },
    {
      id: 'executor-2',
      type: 'executor',
      label: 'Executor Agent B',
      status: 'active',
      tokenPerSec: 1244,
      latencyMs: 165,
      position: { x: 600, y: 280 },
    },
    {
      id: 'tool-search',
      type: 'tool',
      label: '검색 도구',
      status: 'active',
      tokenPerSec: 420,
      latencyMs: 90,
      position: { x: 80, y: 400 },
    },
    {
      id: 'tool-code',
      type: 'tool',
      label: '코드 실행',
      status: 'running',
      tokenPerSec: 650,
      latencyMs: 320,
      position: { x: 320, y: 400 },
    },
    {
      id: 'tool-api',
      type: 'tool',
      label: 'API 호출',
      status: 'warning',
      tokenPerSec: 280,
      latencyMs: 450,
      position: { x: 520, y: 400 },
    },
    {
      id: 'tool-db',
      type: 'tool',
      label: 'DB 조회',
      status: 'active',
      tokenPerSec: 195,
      latencyMs: 75,
      position: { x: 720, y: 400 },
    },
    {
      id: 'verifier',
      type: 'verifier',
      label: 'Verifier Agent',
      status: 'active',
      tokenPerSec: 1934,
      latencyMs: 210,
      position: { x: 400, y: 520 },
    },
    {
      id: 'result',
      type: 'result',
      label: 'Result',
      status: 'complete',
      tokenPerSec: 0,
      position: { x: 400, y: 640 },
    },
  ],
  edges: [
    { id: 'e1', source: 'user-request', target: 'planner-main', animated: true, status: 'active', dataRate: 3912 },
    { id: 'e2', source: 'planner-main', target: 'executor-1', animated: true, status: 'active', dataRate: 1544 },
    { id: 'e3', source: 'planner-main', target: 'executor-2', animated: true, status: 'active', dataRate: 1244 },
    { id: 'e4', source: 'executor-1', target: 'tool-search', animated: true, status: 'active', dataRate: 420 },
    { id: 'e5', source: 'executor-1', target: 'tool-code', animated: true, status: 'running', dataRate: 650 },
    { id: 'e6', source: 'executor-2', target: 'tool-api', animated: true, status: 'warning', dataRate: 280 },
    { id: 'e7', source: 'executor-2', target: 'tool-db', animated: true, status: 'active', dataRate: 195 },
    { id: 'e8', source: 'tool-search', target: 'verifier', status: 'active', dataRate: 420 },
    { id: 'e9', source: 'tool-code', target: 'verifier', status: 'active', dataRate: 650 },
    { id: 'e10', source: 'tool-api', target: 'verifier', status: 'warning', dataRate: 280 },
    { id: 'e11', source: 'tool-db', target: 'verifier', status: 'active', dataRate: 195 },
    { id: 'e12', source: 'verifier', target: 'result', animated: true, status: 'active', dataRate: 1934 },
  ],
}

// ============================================================
// Right Panel: Chart Data
// ============================================================
export const metricCharts: MetricChart[] = [
  {
    id: 'agent-latency',
    title: 'Agent Latency',
    series: [
      {
        id: 'planner-latency',
        name: 'Planner',
        data: generateTimeSeries(30, 245, 80),
        color: '#00ff88',
        unit: 'ms',
        currentValue: 245,
        minValue: 100,
        maxValue: 600,
      },
      {
        id: 'executor-latency',
        name: 'Executor',
        data: generateTimeSeries(30, 180, 60),
        color: '#3b82f6',
        unit: 'ms',
        currentValue: 180,
        minValue: 80,
        maxValue: 500,
      },
    ],
  },
  {
    id: 'llm-response',
    title: 'LLM Response Time',
    series: [
      {
        id: 'llm-claude',
        name: 'Claude',
        data: generateTimeSeries(30, 1200, 400),
        color: '#a855f7',
        unit: 'ms',
        currentValue: 1200,
        minValue: 500,
        maxValue: 3000,
      },
    ],
  },
  {
    id: 'tool-latency',
    title: 'Tool Latency',
    series: [
      {
        id: 'tool-search-lat',
        name: '검색',
        data: generateTimeSeries(30, 90, 40),
        color: '#f59e0b',
        unit: 'ms',
        currentValue: 90,
        minValue: 30,
        maxValue: 300,
      },
      {
        id: 'tool-code-lat',
        name: '코드 실행',
        data: generateTimeSeries(30, 320, 120),
        color: '#ff6b35',
        unit: 'ms',
        currentValue: 320,
        minValue: 100,
        maxValue: 800,
      },
    ],
  },
  {
    id: 'workflow-duration',
    title: 'Workflow Duration',
    series: [
      {
        id: 'workflow-dur',
        name: '전체 소요시간',
        data: generateTimeSeries(30, 8500, 3000),
        color: '#60a5fa',
        unit: 'ms',
        currentValue: 8500,
        minValue: 2000,
        maxValue: 20000,
      },
    ],
  },
]

// ============================================================
// Bottom Panel: Event Log (20 entries)
// ============================================================
export const eventLogEntries: EventLogEntry[] = [
  {
    id: 'ev-001',
    timestamp: '2026-03-04 17:13:58',
    type: 'workflow_start',
    severity: 'info',
    workflowId: 'wf-001',
    agentName: 'Orchestrator',
    message: '문서 요약 워크플로우 시작',
    details: 'workflow_id=wf-001, trigger=user_request',
  },
  {
    id: 'ev-002',
    timestamp: '2026-03-04 17:13:59',
    type: 'task_started',
    severity: 'info',
    workflowId: 'wf-001',
    agentName: 'Planner Agent',
    message: '계획 수립 태스크 시작',
    duration: 245,
  },
  {
    id: 'ev-003',
    timestamp: '2026-03-04 17:14:02',
    type: 'tool_call',
    severity: 'info',
    workflowId: 'wf-001',
    agentName: 'Executor Agent A',
    message: '검색 도구 호출',
    details: 'query="문서 분석 기법", max_results=10',
    duration: 90,
  },
  {
    id: 'ev-004',
    timestamp: '2026-03-04 17:14:05',
    type: 'tool_call',
    severity: 'info',
    workflowId: 'wf-002',
    agentName: 'Executor Agent B',
    message: '코드 실행 도구 호출',
    details: 'language=python, timeout=30s',
    duration: 320,
  },
  {
    id: 'ev-005',
    timestamp: '2026-03-04 17:14:08',
    type: 'policy_block',
    severity: 'warning',
    workflowId: 'wf-003',
    agentName: 'Verifier Agent',
    message: '정책 위반으로 요청 차단',
    details: 'policy=content_safety, reason=unsafe_content_detected',
  },
  {
    id: 'ev-006',
    timestamp: '2026-03-04 17:14:10',
    type: 'approval_required',
    severity: 'warning',
    workflowId: 'wf-001',
    agentName: 'Executor Agent A',
    message: '외부 API 호출 승인 요청',
    details: 'api=external_payment_api, requires_human_approval=true',
  },
  {
    id: 'ev-007',
    timestamp: '2026-03-04 17:14:12',
    type: 'task_complete',
    severity: 'success',
    workflowId: 'wf-004',
    agentName: 'Planner Agent',
    message: '계획 수립 완료',
    duration: 1240,
  },
  {
    id: 'ev-008',
    timestamp: '2026-03-04 17:14:15',
    type: 'run_failed',
    severity: 'error',
    workflowId: 'wf-002',
    agentName: 'Executor Agent B',
    message: '코드 실행 실패',
    details: 'error=TimeoutError, timeout=30s exceeded',
    duration: 30000,
  },
  {
    id: 'ev-009',
    timestamp: '2026-03-04 17:14:18',
    type: 'tool_call',
    severity: 'info',
    workflowId: 'wf-001',
    agentName: 'Executor Agent A',
    message: 'DB 조회 실행',
    details: 'table=documents, rows_returned=47',
    duration: 75,
  },
  {
    id: 'ev-010',
    timestamp: '2026-03-04 17:14:20',
    type: 'agent_error',
    severity: 'error',
    workflowId: 'wf-003',
    agentName: 'Verifier Agent',
    message: '에이전트 오류 발생',
    details: 'error=ConnectionRefused, retry_count=3',
  },
  {
    id: 'ev-011',
    timestamp: '2026-03-04 17:14:22',
    type: 'task_started',
    severity: 'info',
    workflowId: 'wf-005',
    agentName: 'Executor Agent B',
    message: '보고서 생성 태스크 시작',
    duration: 0,
  },
  {
    id: 'ev-012',
    timestamp: '2026-03-04 17:14:25',
    type: 'tool_call',
    severity: 'info',
    workflowId: 'wf-005',
    agentName: 'Executor Agent B',
    message: 'API 호출 완료',
    details: 'api=report_service, status=200',
    duration: 180,
  },
  {
    id: 'ev-013',
    timestamp: '2026-03-04 17:14:28',
    type: 'policy_block',
    severity: 'critical',
    workflowId: 'wf-002',
    agentName: 'Planner Agent',
    message: '보안 정책 위반 — 중요 차단',
    details: 'policy=data_exfiltration, threat_level=high',
  },
  {
    id: 'ev-014',
    timestamp: '2026-03-04 17:14:30',
    type: 'task_complete',
    severity: 'success',
    workflowId: 'wf-001',
    agentName: 'Executor Agent A',
    message: '검색 및 분석 태스크 완료',
    duration: 3420,
  },
  {
    id: 'ev-015',
    timestamp: '2026-03-04 17:14:32',
    type: 'approval_required',
    severity: 'warning',
    workflowId: 'wf-003',
    agentName: 'Coordinator',
    message: '민감 데이터 접근 승인 필요',
    details: 'data_class=PII, requires_manager_approval=true',
  },
  {
    id: 'ev-016',
    timestamp: '2026-03-04 17:14:35',
    type: 'workflow_complete',
    severity: 'success',
    workflowId: 'wf-004',
    agentName: 'Orchestrator',
    message: '고객 지원 워크플로우 완료',
    duration: 8750,
  },
  {
    id: 'ev-017',
    timestamp: '2026-03-04 17:14:38',
    type: 'tool_call',
    severity: 'info',
    workflowId: 'wf-001',
    agentName: 'Executor Agent A',
    message: '문서 요약 도구 호출',
    details: 'doc_count=5, max_tokens=2000',
    duration: 1200,
  },
  {
    id: 'ev-018',
    timestamp: '2026-03-04 17:14:41',
    type: 'run_failed',
    severity: 'error',
    workflowId: 'wf-005',
    agentName: 'Verifier Agent',
    message: '검증 실패 — 품질 기준 미달',
    details: 'quality_score=0.42, threshold=0.75',
    duration: 890,
  },
  {
    id: 'ev-019',
    timestamp: '2026-03-04 17:14:44',
    type: 'task_started',
    severity: 'info',
    workflowId: 'wf-001',
    agentName: 'Verifier Agent',
    message: '최종 검증 태스크 시작',
    duration: 0,
  },
  {
    id: 'ev-020',
    timestamp: '2026-03-04 17:14:47',
    type: 'workflow_complete',
    severity: 'success',
    workflowId: 'wf-001',
    agentName: 'Orchestrator',
    message: '문서 요약 워크플로우 성공적으로 완료',
    duration: 52000,
  },
]

// ============================================================
// Dashboard State (aggregated)
// ============================================================
export const initialDashboardState: DashboardState = {
  tokenUsage: tokenUsageSummary,
  workflowMetrics,
  agentMetrics,
  topology: topologyData,
  charts: metricCharts,
  eventLog: eventLogEntries,
  lastUpdated: Date.now(),
}
