'use client'

import { useMemo } from 'react'
import { NocTheme } from '@/constants/nocTheme'
import { useRemote } from '../context/RemoteContext'

const STATUS_MAP: Record<string, {
  readonly color: string
  readonly label: string
}> = {
  listening: { color: '#00ff88', label: '듣는 중' },
  speaking: { color: '#3b82f6', label: '말하는 중' },
  idle: { color: '#6b7280', label: '대기 중' },
}

function resolveStatus(state: { readonly isListening: boolean; readonly isSpeaking: boolean }): string {
  if (state.isListening) return 'listening'
  if (state.isSpeaking) return 'speaking'
  return 'idle'
}

export default function VoiceStatus() {
  const { state } = useRemote()
  const { voiceState } = state

  const status = useMemo(() => resolveStatus(voiceState), [voiceState.isListening, voiceState.isSpeaking])
  const info = STATUS_MAP[status] ?? STATUS_MAP.idle

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      fontFamily: 'monospace',
      padding: '4px 8px',
    }}>
      <div style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        border: `1.5px solid ${info.color}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
          <rect x="5" y="1" width="6" height="9" rx="3" fill={info.color} />
          <path d="M3 7v1a5 5 0 0010 0V7" stroke={info.color} strokeWidth="1.5" fill="none" />
          <line x1="8" y1="13" x2="8" y2="15" stroke={info.color} strokeWidth="1.5" />
        </svg>
      </div>

      <span style={{
        color: info.color,
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: '0.02em',
      }}>
        {info.label}
      </span>

      {status !== 'idle' && (
        <span style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: info.color,
          animation: 'voicePulse 1.5s ease-in-out infinite',
          flexShrink: 0,
        }} />
      )}

      <style>{`
        @keyframes voicePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
