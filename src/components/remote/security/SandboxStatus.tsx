'use client'

import { useMemo } from 'react'
import { NocTheme } from '@/constants/nocTheme'
import { useRemote } from '../context/RemoteContext'

const STATUS_CONFIG: Record<string, {
  readonly color: string
  readonly label: string
  readonly animate: boolean
}> = {
  active: { color: '#10b981', label: '활성', animate: true },
  initializing: { color: '#f59e0b', label: '초기화 중', animate: true },
  error: { color: '#ef4444', label: '오류', animate: false },
  inactive: { color: '#6b7280', label: '비활성', animate: false },
}

const ISOLATION_LEVELS: Record<string, string> = {
  active: '완전 격리',
  initializing: '설정 중',
  error: '격리 해제',
  inactive: '미적용',
}

export default function SandboxStatus() {
  const { state } = useRemote()
  const { sandboxStatus } = state

  const config = useMemo(() => {
    return STATUS_CONFIG[sandboxStatus] ?? STATUS_CONFIG.inactive
  }, [sandboxStatus])

  const isolationLevel = ISOLATION_LEVELS[sandboxStatus] ?? '알 수 없음'

  return (
    <div style={{
      background: 'transparent',
      border: `1px solid ${NocTheme.divider}`,
      borderRadius: 4,
      padding: 12,
      fontFamily: 'monospace',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
      }}>
        <span style={{ color: NocTheme.textSecondary, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}>
          샌드박스 (Sandbox)
        </span>
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
      }}>
        <div style={{ position: 'relative', width: 16, height: 16 }}>
          <span style={{
            position: 'absolute',
            top: 4,
            left: 4,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: config.color,
            display: 'block',
          }} />
          {config.animate && (
            <span style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 16,
              height: 16,
              borderRadius: '50%',
              border: `2px solid ${config.color}`,
              opacity: 0.4,
              animation: 'sandboxPulse 2s ease-in-out infinite',
            }} />
          )}
        </div>
        <span style={{ color: config.color, fontSize: 13, fontWeight: 600 }}>
          {config.label}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '4px 8px',
          background: NocTheme.surfaceAlt,
          borderRadius: 3,
        }}>
          <span style={{ color: NocTheme.textTertiary, fontSize: 10 }}>격리 수준</span>
          <span style={{ color: NocTheme.textSecondary, fontSize: 10 }}>{isolationLevel}</span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '4px 8px',
          background: NocTheme.surfaceAlt,
          borderRadius: 3,
        }}>
          <span style={{ color: NocTheme.textTertiary, fontSize: 10 }}>상태</span>
          <span style={{ color: config.color, fontSize: 10, fontWeight: 500 }}>
            {sandboxStatus.toUpperCase()}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes sandboxPulse {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
