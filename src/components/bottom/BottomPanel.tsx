'use client'

import EventLog from './EventLog'

const TOTAL_EVENTS = 20
const CRITICAL_COUNT = 3
const WARNING_COUNT = 4

export default function BottomPanel() {
  return (
    <footer
      style={{
        height: '170px',
        minHeight: '150px',
        maxHeight: '180px',
        background: 'rgba(8, 12, 22, 0.9)',
        borderTop: '1px solid #1e2a3a',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 패널 헤더 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 14px',
          borderBottom: '1px solid #1e2a3a',
          flexShrink: 0,
          background: 'rgba(10, 14, 26, 0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#e2e8f0',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            이벤트 스트림
          </span>

          {/* 이벤트 건수 배지 */}
          <span
            style={{
              fontSize: '9px',
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#93c5fd',
              padding: '1px 6px',
              borderRadius: '10px',
              fontWeight: 600,
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}
          >
            총 {TOTAL_EVENTS}건
          </span>
        </div>

        {/* 심각도별 요약 배지 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              fontSize: '9px',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              padding: '1px 6px',
              borderRadius: '10px',
              fontWeight: 700,
              border: '1px solid rgba(239, 68, 68, 0.25)',
            }}
          >
            CRITICAL {CRITICAL_COUNT}
          </span>
          <span
            style={{
              fontSize: '9px',
              background: 'rgba(251, 191, 36, 0.12)',
              color: '#fbbf24',
              padding: '1px 6px',
              borderRadius: '10px',
              fontWeight: 700,
              border: '1px solid rgba(251, 191, 36, 0.2)',
            }}
          >
            WARNING {WARNING_COUNT}
          </span>
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#00ff88',
              boxShadow: '0 0 5px #00ff88',
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: '9px', color: '#00ff88' }}>LIVE</span>
        </div>
      </div>

      {/* EventLog 컴포넌트 */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <EventLog />
      </div>
    </footer>
  )
}
