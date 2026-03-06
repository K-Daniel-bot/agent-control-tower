'use client'

import { useMemo } from 'react'
import { NocTheme } from '@/constants/nocTheme'
import { useRemote } from '../context/RemoteContext'

const STATUS_CONFIG: Record<string, {
  readonly color: string
  readonly label: string
}> = {
  listening: { color: '#00ff88', label: '듣는 중...' },
  speaking: { color: '#3b82f6', label: '말하는 중...' },
  idle: { color: '#6b7280', label: '대기 중' },
}

const QUICK_SPEAK_BUTTONS: readonly {
  readonly label: string
  readonly text: string
  readonly color: string
}[] = [
  { label: '인사', text: '주인님, 안녕하세요. 대기 중입니다.', color: '#00ff88' },
  { label: '상태 보고', text: '주인님, 현재 시스템 상태는 정상입니다. CPU 사용률 23%, 메모리 52% 사용 중입니다.', color: '#3b82f6' },
  { label: '위험 경고', text: '주인님! 긴급 상황입니다. 의심스러운 프로세스가 감지되었습니다.', color: '#ef4444' },
]

function getVoiceStatus(isListening: boolean, isSpeaking: boolean): string {
  if (isListening) return 'listening'
  if (isSpeaking) return 'speaking'
  return 'idle'
}

export default function VoiceInterface() {
  const { state, startListening, stopListening, speak } = useRemote()
  const { voiceState } = state

  const status = useMemo(
    () => getVoiceStatus(voiceState.isListening, voiceState.isSpeaking),
    [voiceState.isListening, voiceState.isSpeaking],
  )
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.idle

  const handleMicClick = () => {
    if (voiceState.isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const isAiMessage = voiceState.lastMessage.startsWith('주인님')

  return (
    <div style={{
      background: 'transparent',
      border: `1px solid ${NocTheme.divider}`,
      borderRadius: 4,
      padding: 12,
      fontFamily: 'monospace',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}>
        <span style={{ color: NocTheme.textSecondary, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}>
          음성 인터페이스
        </span>
        <span style={{ color: config.color, fontSize: 10, fontWeight: 500 }}>
          {config.label}
        </span>
      </div>

      {/* Mic Button + Waveform */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
        <button
          onClick={handleMicClick}
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: `2px solid ${config.color}`,
            background: 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            cursor: 'pointer',
            boxShadow: status !== 'idle'
              ? `0 0 16px ${config.color}60, 0 0 32px ${config.color}30`
              : 'none',
            animation: status === 'listening' ? 'pulse-glow 1.5s ease-in-out infinite' : 'none',
            transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
            <rect x="5" y="1" width="6" height="9" rx="3" fill={config.color} />
            <path d="M3 7v1a5 5 0 0010 0V7" stroke={config.color} strokeWidth="1.2" fill="none" />
            <line x1="8" y1="13" x2="8" y2="15" stroke={config.color} strokeWidth="1.2" />
            <line x1="5" y1="15" x2="11" y2="15" stroke={config.color} strokeWidth="1.2" />
          </svg>
        </button>

        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 2,
          height: 32,
        }}>
          {voiceState.waveform.map((value, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                maxWidth: 6,
                height: `${Math.max(4, value * 100)}%`,
                background: config.color,
                borderRadius: 1,
                opacity: status === 'idle' ? 0.15 : 0.85,
                transition: 'height 0.08s ease-out',
              }}
            />
          ))}
        </div>
      </div>

      {/* Last Message */}
      <div style={{
        padding: '8px 10px',
        background: NocTheme.surfaceAlt,
        borderRadius: 3,
        borderLeft: `2px solid ${voiceState.lastMessage ? (isAiMessage ? '#00ff88' : NocTheme.textSecondary) : NocTheme.divider}`,
        marginBottom: 10,
        minHeight: 36,
        display: 'flex',
        alignItems: 'center',
      }}>
        {voiceState.lastMessage ? (
          <span style={{
            color: isAiMessage ? '#00ff88' : NocTheme.textSecondary,
            fontSize: 10,
            lineHeight: '15px',
          }}>
            &quot;{voiceState.lastMessage}&quot;
          </span>
        ) : (
          <span style={{ color: NocTheme.textMuted, fontSize: 10, fontStyle: 'italic' }}>
            마이크를 눌러 음성 명령을 시작하세요
          </span>
        )}
      </div>

      {/* Quick Speak Buttons */}
      <div style={{ display: 'flex', gap: 6 }}>
        {QUICK_SPEAK_BUTTONS.map((btn) => (
          <button
            key={btn.label}
            onClick={() => speak(btn.text)}
            style={{
              flex: 1,
              padding: '5px 0',
              background: 'transparent',
              border: `1px solid ${btn.color}40`,
              borderRadius: 3,
              color: btn.color,
              fontSize: 9,
              fontFamily: 'monospace',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.background = `${btn.color}15` }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'transparent' }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Pulse animation keyframes */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 16px #00ff8860, 0 0 32px #00ff8830; }
          50% { box-shadow: 0 0 24px #00ff8880, 0 0 48px #00ff8850; }
        }
      `}</style>
    </div>
  )
}
