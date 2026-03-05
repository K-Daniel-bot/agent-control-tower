'use client'

import { useMemo } from 'react'
import { NocTheme } from '@/constants/nocTheme'
import type { ExecutionEdge } from '@/types/topology'
import { deriveChannelStatus } from '@/utils/nocDataTransform'

interface CommunicationChannelCardsProps {
  readonly edges: ReadonlyArray<ExecutionEdge>
}

const cardStyle: React.CSSProperties = {
  minWidth: 115,
  height: '100%',
  background: 'transparent',
  border: `1px solid ${NocTheme.divider}`,
  borderRadius: 3,
  padding: '8px 10px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  flexShrink: 0,
  justifyContent: 'center',
}

const iconStyle: React.CSSProperties = {
  fontSize: 16,
  color: NocTheme.blue,
}

const nameStyle: React.CSSProperties = {
  fontSize: 9,
  color: NocTheme.textTertiary,
  textAlign: 'center',
  whiteSpace: 'nowrap',
}

const trafficStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: NocTheme.textPrimary,
  letterSpacing: '0.02em',
}

const rateRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  fontSize: 9,
  color: NocTheme.textTertiary,
}

const ICONS = ['◈', '◆', '▣', '▤', '◉', '◇']

function formatRate(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1)} k`
  return `${v.toFixed(0)}`
}

export default function CommunicationChannelCards({ edges }: CommunicationChannelCardsProps) {
  const channels = useMemo(() => deriveChannelStatus(edges), [edges])

  if (channels.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: NocTheme.textMuted, fontSize: 11 }}>
        채널 대기 중...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 6, padding: '6px 8px', overflowX: 'auto', height: '100%', background: 'transparent', alignItems: 'center' }}>
      {channels.map((ch, idx) => {
        const total = ch.inRate + ch.outRate
        return (
          <div key={ch.id} style={cardStyle}>
            <span style={iconStyle}>{ICONS[idx % ICONS.length]}</span>
            <span style={nameStyle}>{ch.label}</span>
            <span style={trafficStyle}>{formatRate(total)}</span>
            <div style={rateRowStyle}>
              <span>
                <span style={{ color: NocTheme.green }}>▲</span> {formatRate(ch.inRate)}
              </span>
              <span>
                <span style={{ color: NocTheme.red }}>▼</span> {formatRate(ch.outRate)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
