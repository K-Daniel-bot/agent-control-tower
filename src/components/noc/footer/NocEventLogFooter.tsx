'use client'

interface EventEntry {
  id: string
  severity: 'critical' | 'warning' | 'caution' | 'info'
  timestamp: string
  source: string
  target: string
  description: string
}

const SEVERITY_COLORS: Record<EventEntry['severity'], string> = {
  critical: '#ef4444',
  warning: '#ff6b35',
  caution: '#f59e0b',
  info: '#a855f7',
}

const MOCK_EVENTS: EventEntry[] = [
  {
    id: '1',
    severity: 'critical',
    timestamp: '2026-03-05 14:22:27',
    source: 'Orchestrator',
    target: 'Planner',
    description: '[발생] 태스크 할당: Plan implementation for auth module',
  },
  {
    id: '2',
    severity: 'warning',
    timestamp: '2026-03-05 14:21:15',
    source: 'Executor',
    target: 'ToolAgent',
    description: '[발생] 토큰 임계치 초과 (85%): Context window approaching limit',
  },
  {
    id: '3',
    severity: 'caution',
    timestamp: '2026-03-05 14:20:03',
    source: 'Security',
    target: 'Reviewer',
    description: '[경고] 취약점 탐지: Potential SQL injection in query builder',
  },
  {
    id: '4',
    severity: 'info',
    timestamp: '2026-03-05 14:18:44',
    source: 'Planner',
    target: 'Executor',
    description: '[완료] 실행 계획 생성: 3-phase rollout strategy approved',
  },
  {
    id: '5',
    severity: 'critical',
    timestamp: '2026-03-05 14:17:30',
    source: 'ToolAgent',
    target: 'Shell',
    description: '[발생] 빌드 실패: TypeScript compilation error in utils/parser.ts',
  },
  {
    id: '6',
    severity: 'caution',
    timestamp: '2026-03-05 14:16:12',
    source: 'Reviewer',
    target: 'Orchestrator',
    description: '[경고] 코드 리뷰 이슈: 3 HIGH severity findings in PR #42',
  },
]

const containerStyle: React.CSSProperties = {
  height: 120,
  background: 'rgba(8,12,22,0.95)',
  borderTop: '1px solid #1e2535',
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
}

const headerStyle: React.CSSProperties = {
  height: 26,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 10px',
  borderBottom: '1px solid #1e2535',
  background: 'rgba(15,20,35,0.95)',
  flexShrink: 0,
}

const titleStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
}

const listStyle: React.CSSProperties = {
  flex: 1,
  minHeight: 0,
  overflowY: 'auto',
  padding: '4px 0',
}

const eventRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  padding: '2px 10px',
  fontSize: 11,
  lineHeight: '18px',
}

const timestampStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 11,
  color: '#6b7280',
  flexShrink: 0,
}

const sourceTargetStyle: React.CSSProperties = {
  color: '#9ca3af',
  fontWeight: 500,
  flexShrink: 0,
}

const arrowStyle: React.CSSProperties = {
  color: '#4b5563',
  flexShrink: 0,
}

const descStyle: React.CSSProperties = {
  color: '#d1d5db',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  minWidth: 0,
}

export default function NocEventLogFooter() {
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>
          <span style={{ color: '#ef4444', fontSize: 10 }}>&#9679;</span>
          <span style={{ color: '#9ca3af', fontSize: 11, fontWeight: 500, letterSpacing: '0.02em' }}>
            이벤트 목록
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, color: '#4b5563', fontSize: 10, cursor: 'default' }}>
          <span>&#9633;</span>
          <span>&#10005;</span>
        </div>
      </div>
      <div style={listStyle}>
        {MOCK_EVENTS.map((event) => (
          <div key={event.id} style={eventRowStyle}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: SEVERITY_COLORS[event.severity],
                flexShrink: 0,
                display: 'inline-block',
              }}
            />
            <span style={timestampStyle}>{event.timestamp}</span>
            <span style={sourceTargetStyle}>{event.source}</span>
            <span style={arrowStyle}>&gt;</span>
            <span style={sourceTargetStyle}>{event.target}</span>
            <span style={descStyle}>{event.description}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
