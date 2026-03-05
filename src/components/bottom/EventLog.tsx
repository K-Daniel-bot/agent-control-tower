'use client'

type LogLevel = 'CRITICAL' | 'WARNING' | 'INFO'

interface LogEvent {
  id: number
  timestamp: string
  level: LogLevel
  agentName: string
  eventType: string
  message: string
}

const LEVEL_COLORS: Record<LogLevel, { bg: string; text: string; border: string; indicator: string }> = {
  CRITICAL: {
    bg: 'rgba(239, 68, 68, 0.08)',
    text: '#ef4444',
    border: 'rgba(239, 68, 68, 0.15)',
    indicator: '#ef4444',
  },
  WARNING: {
    bg: 'rgba(251, 191, 36, 0.05)',
    text: '#fbbf24',
    border: 'rgba(251, 191, 36, 0.1)',
    indicator: '#fbbf24',
  },
  INFO: {
    bg: 'transparent',
    text: '#9ca3af',
    border: 'rgba(46, 53, 69, 0.4)',
    indicator: '#3b82f6',
  },
}

// 모의 이벤트 데이터 20개
const MOCK_EVENTS: LogEvent[] = [
  {
    id: 20,
    timestamp: '17:12:58',
    level: 'CRITICAL',
    agentName: 'Executor-03',
    eventType: 'Run Failed',
    message: '최대 재시도 횟수 초과 — 워크플로우 강제 종료',
  },
  {
    id: 19,
    timestamp: '17:12:51',
    level: 'WARNING',
    agentName: 'Planner-01',
    eventType: 'Approval Required',
    message: '고위험 작업 감지 — 사람 승인 대기 중',
  },
  {
    id: 18,
    timestamp: '17:12:45',
    level: 'CRITICAL',
    agentName: 'Policy Engine',
    eventType: 'Policy Block',
    message: '보안 정책 위반: 외부 API 무단 호출 차단',
  },
  {
    id: 17,
    timestamp: '17:12:38',
    level: 'INFO',
    agentName: 'Verifier-02',
    eventType: 'Agent Task Started',
    message: '결과 검증 시작 — 출력 무결성 검사 중',
  },
  {
    id: 16,
    timestamp: '17:12:33',
    level: 'INFO',
    agentName: 'Executor-03',
    eventType: 'Tool Call',
    message: 'web_search 도구 호출 완료 (234ms)',
  },
  {
    id: 15,
    timestamp: '17:12:28',
    level: 'WARNING',
    agentName: 'LLM Gateway',
    eventType: 'Run Failed',
    message: 'claude-opus-4 응답 지연 — 타임아웃 임박',
  },
  {
    id: 14,
    timestamp: '17:12:21',
    level: 'INFO',
    agentName: 'Executor-03',
    eventType: 'Tool Call',
    message: 'code_interpreter 실행 완료 (1,240ms)',
  },
  {
    id: 13,
    timestamp: '17:12:15',
    level: 'INFO',
    agentName: 'Planner-01',
    eventType: 'Agent Task Started',
    message: '서브태스크 3/5 할당 — Executor-03 에이전트',
  },
  {
    id: 12,
    timestamp: '17:12:09',
    level: 'WARNING',
    agentName: 'Policy Engine',
    eventType: 'Policy Block',
    message: '레이트 리밋 경고: 분당 50회 초과 예측',
  },
  {
    id: 11,
    timestamp: '17:12:03',
    level: 'INFO',
    agentName: 'Executor-02',
    eventType: 'Tool Call',
    message: 'file_write 도구 호출 완료 (89ms)',
  },
  {
    id: 10,
    timestamp: '17:11:57',
    level: 'INFO',
    agentName: 'Executor-02',
    eventType: 'Agent Task Started',
    message: '서브태스크 2/5 수신 — 실행 준비 완료',
  },
  {
    id: 9,
    timestamp: '17:11:50',
    level: 'INFO',
    agentName: 'Executor-01',
    eventType: 'Tool Call',
    message: 'bash_exec 호출 완료 (521ms) — 종료코드 0',
  },
  {
    id: 8,
    timestamp: '17:11:44',
    level: 'WARNING',
    agentName: 'Verifier-01',
    eventType: 'Approval Required',
    message: '낮은 신뢰도 점수 (0.43) — 재검토 요청',
  },
  {
    id: 7,
    timestamp: '17:11:38',
    level: 'INFO',
    agentName: 'Planner-01',
    eventType: 'Agent Task Started',
    message: '서브태스크 1/5 할당 — Executor-01 에이전트',
  },
  {
    id: 6,
    timestamp: '17:11:31',
    level: 'INFO',
    agentName: 'Planner-01',
    eventType: 'Tool Call',
    message: 'task_decompose 완료 — 5개 서브태스크 생성',
  },
  {
    id: 5,
    timestamp: '17:11:24',
    level: 'INFO',
    agentName: 'Planner-01',
    eventType: 'Agent Task Started',
    message: '신규 워크플로우 수신 — 태스크 분해 시작',
  },
  {
    id: 4,
    timestamp: '17:11:18',
    level: 'CRITICAL',
    agentName: 'Executor-01',
    eventType: 'Run Failed',
    message: 'OOM 오류 — 메모리 한도 초과 (4GB)',
  },
  {
    id: 3,
    timestamp: '17:11:11',
    level: 'INFO',
    agentName: 'Verifier-01',
    eventType: 'Agent Task Started',
    message: '이전 워크플로우 검증 완료 — 신뢰도 0.92',
  },
  {
    id: 2,
    timestamp: '17:11:05',
    level: 'WARNING',
    agentName: 'Policy Engine',
    eventType: 'Policy Block',
    message: 'PII 데이터 감지 — 마스킹 처리 후 계속',
  },
  {
    id: 1,
    timestamp: '17:10:58',
    level: 'INFO',
    agentName: 'Orchestrator',
    eventType: 'Agent Task Started',
    message: '에이전트 제어 타워 초기화 완료 — 모니터링 시작',
  },
]

const EVENT_TYPE_LABELS: Record<string, string> = {
  'Run Failed': '실행 실패',
  'Approval Required': '승인 필요',
  'Policy Block': '정책 차단',
  'Agent Task Started': '태스크 시작',
  'Tool Call': '툴 호출',
}

export default function EventLog() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 테이블 헤더 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '68px 80px 110px 110px 1fr',
          padding: '4px 12px',
          borderBottom: '1px solid #333333',
          backgroundColor: '#000000',
          flexShrink: 0,
        }}
      >
        {['시간', '등급', '에이전트', '이벤트 타입', '상세 메시지'].map((col) => (
          <span
            key={col}
            style={{
              fontSize: '9px',
              color: '#505661',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
            }}
          >
            {col}
          </span>
        ))}
      </div>

      {/* 이벤트 행 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
        }}
      >
        {MOCK_EVENTS.map((event) => {
          const style = LEVEL_COLORS[event.level]
          return (
            <div
              key={event.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '68px 80px 110px 110px 1fr',
                padding: '3px 12px',
                borderBottom: `1px solid ${style.border}`,
                backgroundColor: style.bg,
                alignItems: 'center',
                position: 'relative',
                transition: 'background 0.15s',
              }}
            >
              {/* 왼쪽 색상 인디케이터 */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '3px',
                  backgroundColor: style.indicator,
                }}
              />

              {/* 시간 */}
              <span style={{ fontSize: '11px', color: '#6b7280', fontFamily: 'monospace' }}>
                {event.timestamp}
              </span>

              {/* 등급 배지 */}
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 700,
                  color: style.text,
                  letterSpacing: '0.04em',
                  background:
                    event.level === 'CRITICAL'
                      ? 'rgba(239, 68, 68, 0.15)'
                      : event.level === 'WARNING'
                      ? 'rgba(251, 191, 36, 0.12)'
                      : 'rgba(59, 130, 246, 0.12)',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  display: 'inline-block',
                  maxWidth: 'fit-content',
                }}
              >
                {event.level}
              </span>

              {/* 에이전트명 */}
              <span
                style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {event.agentName}
              </span>

              {/* 이벤트 타입 */}
              <span
                style={{
                  fontSize: '11px',
                  color: '#8b95a5',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
              </span>

              {/* 상세 메시지 */}
              <span
                style={{
                  fontSize: '11px',
                  color: event.level === 'CRITICAL' ? '#fca5a5' : event.level === 'WARNING' ? '#fde68a' : '#9ca3af',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {event.message}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
