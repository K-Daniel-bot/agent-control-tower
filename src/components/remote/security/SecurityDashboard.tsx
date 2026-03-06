'use client'

import { useMemo } from 'react'
import { NocTheme } from '@/constants/nocTheme'
import { useRemote } from '../context/RemoteContext'

const LEVEL_CONFIG: Record<string, { readonly color: string; readonly label: string }> = {
  normal: { color: NocTheme.green, label: '정상' },
  elevated: { color: NocTheme.orange, label: '주의' },
  critical: { color: NocTheme.red, label: '위험' },
}

const SANDBOX_LABELS: Record<string, string> = {
  inactive: '비활성',
  initializing: '초기화 중',
  active: '활성',
  error: '오류',
}

export default function SecurityDashboard() {
  const { state } = useRemote()
  const { securityLevel, sandboxStatus, accessControlList } = state

  const levelInfo = useMemo(() => {
    return LEVEL_CONFIG[securityLevel] ?? LEVEL_CONFIG.normal
  }, [securityLevel])

  const activeRules = useMemo(() => {
    return accessControlList.filter((rule) => rule.enabled).length
  }, [accessControlList])

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
        marginBottom: 12,
      }}>
        <span style={{ color: NocTheme.textSecondary, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}>
          보안 상태 (Security)
        </span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: levelInfo.color,
            display: 'inline-block',
            boxShadow: `0 0 6px ${levelInfo.color}`,
          }} />
          <span style={{ color: levelInfo.color, fontSize: 11, fontWeight: 600 }}>
            {levelInfo.label}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 8px',
          background: NocTheme.surfaceAlt,
          borderRadius: 3,
        }}>
          <span style={{ color: NocTheme.textTertiary, fontSize: 10 }}>샌드박스</span>
          <span style={{
            color: sandboxStatus === 'active' ? NocTheme.green : NocTheme.textMuted,
            fontSize: 10,
            fontWeight: 500,
          }}>
            {SANDBOX_LABELS[sandboxStatus] ?? sandboxStatus}
          </span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 8px',
          background: NocTheme.surfaceAlt,
          borderRadius: 3,
        }}>
          <span style={{ color: NocTheme.textTertiary, fontSize: 10 }}>ACL 규칙</span>
          <span style={{ color: NocTheme.textSecondary, fontSize: 10, fontWeight: 500 }}>
            {activeRules} / {accessControlList.length} 활성
          </span>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 8px',
          background: NocTheme.surfaceAlt,
          borderRadius: 3,
        }}>
          <span style={{ color: NocTheme.textTertiary, fontSize: 10 }}>보안 수준</span>
          <span style={{
            color: levelInfo.color,
            fontSize: 10,
            fontWeight: 600,
            padding: '1px 6px',
            border: `1px solid ${levelInfo.color}`,
            borderRadius: 2,
          }}>
            {securityLevel.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  )
}
