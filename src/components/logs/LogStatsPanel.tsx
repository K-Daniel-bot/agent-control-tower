'use client'

import type { LogStats, LogSource } from '@/types/logs'
import { LOG_LEVEL_CONFIG, LOG_SOURCE_CONFIG } from '@/types/logs'
import { NocTheme } from '@/constants/nocTheme'

const FONT = "'JetBrains Mono', 'Fira Code', 'Menlo', monospace"

interface LogStatsPanelProps {
  readonly stats: LogStats
  readonly isPaused: boolean
}

function StatCard({ label, value, color, sub }: {
  readonly label: string
  readonly value: string | number
  readonly color: string
  readonly sub?: string
}) {
  return (
    <div style={{
      padding: '10px 12px',
      background: `${color}08`,
      border: `1px solid ${color}20`,
      borderRadius: 6,
    }}>
      <div style={{ fontSize: 9, color: NocTheme.textMuted, letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 9, color: NocTheme.textMuted, marginTop: 4 }}>{sub}</div>
      )}
    </div>
  )
}

function MiniBar({ label, value, maxValue, color }: {
  readonly label: string
  readonly value: number
  readonly maxValue: number
  readonly color: string
}) {
  const pct = maxValue > 0 ? Math.min(100, (value / maxValue) * 100) : 0
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
        <span style={{ fontSize: 10, color: NocTheme.textSecondary }}>{label}</span>
        <span style={{ fontSize: 10, color: NocTheme.textMuted }}>{value}</span>
      </div>
      <div style={{
        height: 4, background: NocTheme.border, borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: color, borderRadius: 2,
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  )
}

export default function LogStatsPanel({ stats, isPaused }: LogStatsPanelProps) {
  const sourceEntries = Object.entries(LOG_SOURCE_CONFIG) as [LogSource, typeof LOG_SOURCE_CONFIG[LogSource]][]
  const maxSourceCount = Math.max(1, ...Object.values(stats.countBySource))

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      fontFamily: FONT, color: NocTheme.textPrimary,
      overflow: 'auto', gap: 12,
    }}>
      {/* Status indicator */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 10px',
        background: isPaused ? `${NocTheme.orange}10` : `${NocTheme.green}10`,
        border: `1px solid ${isPaused ? `${NocTheme.orange}30` : `${NocTheme.green}30`}`,
        borderRadius: 4,
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: isPaused ? NocTheme.orange : NocTheme.green,
          boxShadow: `0 0 6px ${isPaused ? NocTheme.orange : NocTheme.green}`,
          animation: isPaused ? 'none' : undefined,
        }} />
        <span style={{ fontSize: 10, color: isPaused ? NocTheme.orange : NocTheme.green }}>
          {isPaused ? '일시정지' : '실시간 수집 중'}
        </span>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <StatCard label="전체 로그" value={stats.totalCount} color={NocTheme.blue} />
        <StatCard
          label="에러율"
          value={`${stats.errorRate}%`}
          color={stats.errorRate > 10 ? NocTheme.red : NocTheme.green}
        />
        <StatCard
          label="최근 1분"
          value={stats.recentPerMinute}
          color={NocTheme.cyan}
          sub="건/분"
        />
        <StatCard
          label="오류 수"
          value={stats.countByLevel.error + stats.countByLevel.critical}
          color={NocTheme.red}
        />
      </div>

      {/* Level distribution */}
      <div>
        <div style={{
          fontSize: 10, fontWeight: 700, color: NocTheme.textTertiary,
          letterSpacing: '0.08em', marginBottom: 8,
        }}>
          심각도 분포
        </div>
        {Object.entries(LOG_LEVEL_CONFIG).map(([key, cfg]) => (
          <MiniBar
            key={key}
            label={cfg.label}
            value={stats.countByLevel[key as keyof typeof stats.countByLevel] ?? 0}
            maxValue={stats.totalCount}
            color={cfg.color}
          />
        ))}
      </div>

      {/* Source distribution */}
      <div>
        <div style={{
          fontSize: 10, fontWeight: 700, color: NocTheme.textTertiary,
          letterSpacing: '0.08em', marginBottom: 8,
        }}>
          소스별 분포
        </div>
        {sourceEntries.map(([key, cfg]) => (
          <MiniBar
            key={key}
            label={`${cfg.icon} ${cfg.label}`}
            value={stats.countBySource[key] ?? 0}
            maxValue={maxSourceCount}
            color={cfg.color}
          />
        ))}
      </div>
    </div>
  )
}
