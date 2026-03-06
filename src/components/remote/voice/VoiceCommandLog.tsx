'use client'

import { useEffect, useRef } from 'react'
import { NocTheme } from '@/constants/nocTheme'
import { useRemote } from '../context/RemoteContext'

const TYPE_CFG = {
  command: { color: NocTheme.textSecondary, label: '명령', arrow: '▶' },
  response: { color: '#00ff88', label: '응답', arrow: '◀' },
} as const

function fmtTime(ts: number): string {
  return new Date(ts).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

export default function VoiceCommandLog() {
  const { state } = useRemote()
  const entries = state.voiceLog
  const recent = entries.slice(-20)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [entries.length])

  return (
    <div style={{ background: 'transparent', border: `1px solid ${NocTheme.divider}`, borderRadius: 4, fontFamily: 'monospace', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderBottom: `1px solid ${NocTheme.divider}`, flexShrink: 0 }}>
        <span style={{ color: NocTheme.textSecondary, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}>
          음성 명령 기록
        </span>
        <span style={{ color: NocTheme.textMuted, fontSize: 10 }}>{entries.length}건</span>
      </div>

      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '4px 0', minHeight: 0, maxHeight: 200 }}>
        {recent.length === 0 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 48, color: NocTheme.textMuted, fontSize: 10 }}>
            음성 명령을 시작하면 기록이 표시됩니다
          </div>
        )}
        {recent.map((entry) => {
          const cfg = TYPE_CFG[entry.type]
          return (
            <div key={entry.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 12px', borderBottom: `1px solid ${NocTheme.surfaceAlt}` }}>
              <span style={{ color: NocTheme.textTertiary, fontSize: 9, flexShrink: 0, width: 52, paddingTop: 1 }}>
                {fmtTime(entry.timestamp)}
              </span>
              <span style={{ fontSize: 8, fontWeight: 700, color: cfg.color, border: `1px solid ${cfg.color}`, borderRadius: 2, padding: '0 4px', flexShrink: 0, width: 28, textAlign: 'center' }}>
                {cfg.label}
              </span>
              <span style={{ color: cfg.color, fontSize: 10, flexShrink: 0 }}>
                {cfg.arrow}
              </span>
              <span style={{ color: cfg.color, fontSize: 10, lineHeight: '14px', flex: 1, minWidth: 0, wordBreak: 'break-word' }}>
                {entry.text}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
