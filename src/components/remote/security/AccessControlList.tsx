'use client'

import { NocTheme } from '@/constants/nocTheme'
import { useRemote } from '../context/RemoteContext'

const TYPE_CFG: Record<string, { readonly color: string; readonly icon: string }> = {
  allow: { color: '#10b981', icon: '\u2713' },
  deny: { color: '#ef4444', icon: '\u2717' },
}

export default function AccessControlList() {
  const { state: { accessControlList } } = useRemote()

  return (
    <div style={{ background: 'transparent', border: `1px solid ${NocTheme.divider}`, borderRadius: 4, padding: 12, fontFamily: 'monospace' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <span style={{ color: NocTheme.textSecondary, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em' }}>
          접근 제어 (ACL)
        </span>
        <span style={{ color: NocTheme.textMuted, fontSize: 10 }}>{accessControlList.length}개 규칙</span>
      </div>

      <div style={{ display: 'flex', gap: 6, padding: '4px 8px', borderBottom: `1px solid ${NocTheme.divider}`, marginBottom: 4 }}>
        <span style={{ color: NocTheme.textMuted, fontSize: 9, width: 28, flexShrink: 0 }}>유형</span>
        <span style={{ color: NocTheme.textMuted, fontSize: 9, flex: 1 }}>리소스</span>
        <span style={{ color: NocTheme.textMuted, fontSize: 9, width: 60, flexShrink: 0 }}>패턴</span>
        <span style={{ color: NocTheme.textMuted, fontSize: 9, width: 30, flexShrink: 0, textAlign: 'center' }}>상태</span>
      </div>

      <div style={{ maxHeight: 160, overflowY: 'auto' }}>
        {accessControlList.length === 0 && (
          <div style={{ padding: 12, textAlign: 'center', color: NocTheme.textMuted, fontSize: 10 }}>규칙 없음</div>
        )}
        {accessControlList.map((rule, index) => {
          const t = TYPE_CFG[rule.type] ?? TYPE_CFG.deny
          return (
            <div key={`${rule.resource}-${rule.pattern}-${index}`} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '4px 8px',
              borderBottom: `1px solid ${NocTheme.surfaceAlt}`, opacity: rule.enabled ? 1 : 0.4,
            }}>
              <span style={{ width: 28, flexShrink: 0, color: t.color, fontSize: 11, fontWeight: 700, textAlign: 'center' }}>
                {t.icon}
              </span>
              <span style={{ flex: 1, color: NocTheme.textSecondary, fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {rule.resource}
              </span>
              <span style={{ width: 60, flexShrink: 0, color: NocTheme.textTertiary, fontSize: 9, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {rule.pattern}
              </span>
              <div style={{ width: 30, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: 22, height: 12, borderRadius: 6, background: rule.enabled ? '#10b981' : NocTheme.textMuted, position: 'relative' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: rule.enabled ? 12 : 2 }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
