'use client'

import { useEffect, useRef } from 'react'
import { NocTheme } from '@/constants/nocTheme'
import { useRemote } from '../context/RemoteContext'

const RESULT_COLORS: Record<string, string> = {
  success: '#10b981', denied: '#f59e0b', blocked: '#ef4444', error: '#ef4444',
}
const SEV_COLORS: Record<string, string> = {
  low: NocTheme.green, medium: NocTheme.orange, high: NocTheme.red, critical: NocTheme.redPink,
}

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

export default function AuditLog() {
  const { state } = useRemote()
  const { auditLog } = state
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [auditLog])

  return (
    <div style={{ background: 'transparent', border: `1px solid ${NocTheme.divider}`, borderRadius: 4, fontFamily: 'monospace', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: `1px solid ${NocTheme.divider}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: NocTheme.red, fontSize: 8 }}>&#9679;</span>
          <span style={{ color: NocTheme.textSecondary, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}>
            감사 로그 (Audit Log)
          </span>
        </div>
        <span style={{ color: NocTheme.textMuted, fontSize: 10, padding: '1px 6px', border: `1px solid ${NocTheme.divider}`, borderRadius: 2 }}>
          {auditLog.length}건
        </span>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '4px 0', minHeight: 0 }}>
        {auditLog.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 60, color: NocTheme.textMuted, fontSize: 10 }}>
            로그 없음
          </div>
        )}
        {auditLog.map((entry, i) => {
          const rc = RESULT_COLORS[entry.result] ?? NocTheme.textTertiary
          const sc = SEV_COLORS[entry.severity] ?? NocTheme.textMuted
          return (
            <div key={`${entry.timestamp}-${i}`} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '3px 12px', fontSize: 10, lineHeight: '16px', borderBottom: `1px solid ${NocTheme.surfaceAlt}`,
            }}>
              <span style={{ color: NocTheme.textTertiary, flexShrink: 0, width: 56, fontSize: 9 }}>
                {fmtTime(entry.timestamp)}
              </span>
              <span style={{ flexShrink: 0, padding: '0 4px', fontSize: 8, fontWeight: 700, color: sc, border: `1px solid ${sc}`, borderRadius: 2, textTransform: 'uppercase', width: 36, textAlign: 'center' }}>
                {entry.severity}
              </span>
              <span style={{ flex: 1, color: NocTheme.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                {entry.action}
              </span>
              <span style={{ flexShrink: 0, color: rc, fontSize: 9, fontWeight: 600 }}>
                {entry.result}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
