'use client'

import { useMemo } from 'react'
import { NocTheme, withAlpha } from '@/constants/nocTheme'
import type { ExecutionEdge } from '@/types/topology'
import { deriveChannelStatus } from '@/utils/nocDataTransform'

interface CommunicationChannelCardsProps {
  readonly edges: ReadonlyArray<ExecutionEdge>
}

const CHANNEL_COLORS = ['#06b6d4', '#3b82f6', '#00ff88', '#a855f7', '#f59e0b', '#ec4899']

function formatRate(v: number): string {
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`
  return `${v.toFixed(0)}`
}

function getHealthColor(total: number): string {
  if (total > 800) return '#00ff88'
  if (total > 400) return '#06b6d4'
  return '#4a5568'
}

export default function CommunicationChannelCards({ edges }: CommunicationChannelCardsProps) {
  const channels = useMemo(() => deriveChannelStatus(edges), [edges])

  if (channels.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#333', fontSize: 9, letterSpacing: '0.1em' }}>
        SCANNING COMMUNICATION CHANNELS...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 6, padding: '8px 10px', overflowX: 'auto', height: '100%', alignItems: 'center' }}>
      {channels.map((ch, idx) => {
        const total = ch.inRate + ch.outRate
        const accentColor = CHANNEL_COLORS[idx % CHANNEL_COLORS.length]
        const healthColor = getHealthColor(total)
        const barPercent = Math.min((total / 1500) * 100, 100)

        return (
          <div
            key={ch.id}
            style={{
              minWidth: 120,
              height: '100%',
              background: withAlpha(accentColor, 0.03),
              border: `1px solid ${withAlpha(accentColor, 0.15)}`,
              borderRadius: 4,
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              flexShrink: 0,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top accent line */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
              }}
            />

            {/* Channel label */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: '100%' }}>
              <div
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: healthColor,
                  boxShadow: `0 0 6px ${healthColor}`,
                }}
              />
              <span style={{ fontSize: 8, color: '#6b7280', letterSpacing: '0.05em', fontWeight: 600 }}>
                {ch.label}
              </span>
            </div>

            {/* Total traffic - big number */}
            <div style={{ textAlign: 'center' }}>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: accentColor,
                  letterSpacing: '-0.02em',
                  lineHeight: 1,
                }}
              >
                {formatRate(total)}
              </span>
              <div style={{ fontSize: 7, color: '#4a5568', marginTop: 2, letterSpacing: '0.08em' }}>MSG/SEC</div>
            </div>

            {/* Traffic bar */}
            <div style={{ width: '100%', height: 3, background: '#1a1a1a', borderRadius: 2 }}>
              <div
                style={{
                  width: `${barPercent}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${accentColor}, ${withAlpha(accentColor, 0.4)})`,
                  borderRadius: 2,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>

            {/* In/Out rates */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: 8 }}>
              <span style={{ color: '#00ff88' }}>
                <span style={{ fontSize: 6 }}>IN</span> {formatRate(ch.inRate)}
              </span>
              <span style={{ color: '#ef4444' }}>
                <span style={{ fontSize: 6 }}>OUT</span> {formatRate(ch.outRate)}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
