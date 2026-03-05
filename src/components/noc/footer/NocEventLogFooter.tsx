'use client'

import { useMemo } from 'react'
import { NocTheme } from '@/constants/nocTheme'
import type { AgentMessage } from '@/types/topology'

interface NocEventLogFooterProps {
  readonly messages: ReadonlyArray<AgentMessage>
}

const SEVERITY_COLORS: Record<string, string> = {
  error: NocTheme.red,
  task: NocTheme.orangeBright,
  system: NocTheme.orange,
  result: NocTheme.purple,
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function getSeverity(type: string): string {
  if (type === 'error') return 'critical'
  if (type === 'task') return 'warning'
  if (type === 'system') return 'caution'
  return 'info'
}

export default function NocEventLogFooter({ messages }: NocEventLogFooterProps) {
  const recentEvents = useMemo(() => {
    return [...messages].reverse().slice(0, 8)
  }, [messages])

  return (
    <div style={{ height: 120, background: 'transparent', borderTop: `1px solid ${NocTheme.divider}`, display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
      <div style={{ height: 26, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px', borderBottom: `1px solid ${NocTheme.divider}`, background: 'transparent', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: NocTheme.red, fontSize: 10 }}>&#9679;</span>
          <span style={{ color: NocTheme.textSecondary, fontSize: 11, fontWeight: 500, letterSpacing: '0.02em' }}>
            이벤트 목록
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, color: NocTheme.textMuted, fontSize: 10, cursor: 'default' }}>
          <span>&#9633;</span>
          <span>&#10005;</span>
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '4px 0', background: 'transparent' }}>
        {recentEvents.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: NocTheme.textMuted, fontSize: 11 }}>
            이벤트 대기 중...
          </div>
        )}
        {recentEvents.map((event) => {
          const severity = getSeverity(event.type)
          const color = SEVERITY_COLORS[event.type] || NocTheme.purple
          return (
            <div key={event.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 10px', fontSize: 11, lineHeight: '18px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontFamily: 'monospace', fontSize: 11, color: NocTheme.textTertiary, flexShrink: 0 }}>
                {formatTimestamp(event.timestamp)}
              </span>
              <span style={{ color: NocTheme.textSecondary, fontWeight: 500, flexShrink: 0 }}>{event.fromLabel}</span>
              <span style={{ color: NocTheme.textMuted, flexShrink: 0 }}>&gt;</span>
              <span style={{ color: NocTheme.textSecondary, fontWeight: 500, flexShrink: 0 }}>{event.toLabel}</span>
              <span style={{ color: NocTheme.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>
                [{severity}] {event.message}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
