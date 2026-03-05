'use client'

import MetricsChart from './MetricsChart'

// 30개 시계열 데이터 생성 유틸
function generateTimeSeries(
  baseValue: number,
  variance: number,
  count: number = 30
): Array<{ time: string; value: number }> {
  const now = Date.now()
  return Array.from({ length: count }, (_, i) => {
    const t = new Date(now - (count - i) * 10000)
    const hh = t.getHours().toString().padStart(2, '0')
    const mm = t.getMinutes().toString().padStart(2, '0')
    const ss = t.getSeconds().toString().padStart(2, '0')
    return {
      time: `${hh}:${mm}:${ss}`,
      value: Math.max(0, baseValue + (Math.random() - 0.5) * variance),
    }
  })
}

// 모의 시계열 데이터
const agentLatencyData = generateTimeSeries(320, 200)
const llmResponseData = generateTimeSeries(1200, 600)
const toolLatencyData = generateTimeSeries(180, 120)
const workflowDurationData = generateTimeSeries(4500, 2000)

export default function RightPanel() {
  return (
    <aside
      style={{
        width: '260px',
        minWidth: '240px',
        maxWidth: '280px',
        height: '100%',
        background: 'transparent',
        borderLeft: '1px solid #333333',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 패널 헤더 */}
      <div
        style={{
          padding: '10px 12px 8px',
          borderBottom: '1px solid #333333',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#00ff88',
            boxShadow: '0 0 6px #00ff88',
            display: 'inline-block',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#e6edf3',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          실시간 모니터링
        </span>
      </div>

      {/* 차트 목록 */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '4px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0px',
        }}
      >
        {/* Agent Latency */}
        <MetricsChart
          title="에이전트 지연시간 (Agent Latency)"
          data={agentLatencyData}
          color="#00ff88"
          type="area"
          unit="ms"
        />

        <div style={{ height: '1px', background: '#333333', margin: '2px 0' }} />

        {/* LLM Response Time */}
        <MetricsChart
          title="LLM 응답 시간 (LLM Response Time)"
          data={llmResponseData}
          color="#3b82f6"
          type="line"
          unit="ms"
        />

        <div style={{ height: '1px', background: '#333333', margin: '2px 0' }} />

        {/* Tool Latency */}
        <MetricsChart
          title="툴 실행 지연 (Tool Latency)"
          data={toolLatencyData}
          color="#ff6b35"
          type="bar"
          unit="ms"
        />

        <div style={{ height: '1px', background: '#333333', margin: '2px 0' }} />

        {/* Workflow Duration */}
        <MetricsChart
          title="워크플로우 소요시간 (Workflow Duration)"
          data={workflowDurationData}
          color="#00ff88"
          type="area"
          unit="ms"
        />
      </div>

      {/* 하단 상태 표시 */}
      <div
        style={{
          padding: '6px 12px',
          borderTop: '1px solid #333333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '9px', color: '#505661' }}>갱신 주기: 10초</span>
        <span style={{ fontSize: '9px', color: '#00ff88' }}>● LIVE</span>
      </div>
    </aside>
  )
}
