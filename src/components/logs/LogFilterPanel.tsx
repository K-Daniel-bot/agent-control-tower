'use client'

import type { LogFilter, LogLevel, LogSource, TimeRange } from '@/types/logs'
import { LOG_LEVEL_CONFIG, LOG_SOURCE_CONFIG } from '@/types/logs'
import { NocTheme } from '@/constants/nocTheme'

const FONT = "'JetBrains Mono', 'Fira Code', 'Menlo', monospace"

interface LogFilterPanelProps {
  readonly filter: LogFilter
  readonly onToggleSource: (source: LogSource) => void
  readonly onToggleLevel: (level: LogLevel) => void
  readonly onUpdateFilter: (partial: Partial<LogFilter>) => void
}

const TIME_RANGES: readonly { key: TimeRange; label: string }[] = [
  { key: '1h', label: '1시간' },
  { key: '6h', label: '6시간' },
  { key: '24h', label: '24시간' },
  { key: '7d', label: '7일' },
  { key: 'all', label: '전체' },
]

function SectionTitle({ children }: { readonly children: string }) {
  return (
    <div style={{
      fontSize: 10, fontWeight: 700, color: NocTheme.textTertiary,
      letterSpacing: '0.08em', textTransform: 'uppercase',
      marginBottom: 8, marginTop: 16,
    }}>
      {children}
    </div>
  )
}

function CheckButton({
  active, color, label, count, onClick,
}: {
  readonly active: boolean
  readonly color: string
  readonly label: string
  readonly count?: number
  readonly onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        padding: '5px 8px',
        background: active ? `${color}12` : 'transparent',
        border: `1px solid ${active ? `${color}40` : 'transparent'}`,
        borderRadius: 4,
        cursor: 'pointer',
        fontFamily: FONT,
        transition: 'all 0.12s',
      }}
    >
      <span style={{
        width: 8, height: 8, borderRadius: 2,
        background: active ? color : NocTheme.textMuted,
        flexShrink: 0,
      }} />
      <span style={{
        fontSize: 11, color: active ? NocTheme.textPrimary : NocTheme.textTertiary,
        flex: 1, textAlign: 'left',
      }}>
        {label}
      </span>
      {count !== undefined && (
        <span style={{ fontSize: 10, color: NocTheme.textMuted }}>{count}</span>
      )}
    </button>
  )
}

export default function LogFilterPanel({
  filter, onToggleSource, onToggleLevel, onUpdateFilter,
}: LogFilterPanelProps) {
  const sourceEntries = Object.entries(LOG_SOURCE_CONFIG) as [LogSource, typeof LOG_SOURCE_CONFIG[LogSource]][]
  const levelEntries = Object.entries(LOG_LEVEL_CONFIG) as [LogLevel, typeof LOG_LEVEL_CONFIG[LogLevel]][]

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      fontFamily: FONT, color: NocTheme.textPrimary,
      overflow: 'auto',
    }}>
      {/* Search */}
      <div style={{ padding: '0 0 8px 0' }}>
        <input
          type="text"
          placeholder="검색..."
          value={filter.searchQuery}
          onChange={e => onUpdateFilter({ searchQuery: e.target.value })}
          style={{
            width: '100%',
            padding: '8px 10px',
            background: NocTheme.surfaceAlt,
            border: `1px solid ${NocTheme.border}`,
            borderRadius: 4,
            color: NocTheme.textPrimary,
            fontSize: 11,
            fontFamily: FONT,
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Time Range */}
      <SectionTitle>시간 범위</SectionTitle>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {TIME_RANGES.map(tr => (
          <button
            key={tr.key}
            type="button"
            onClick={() => onUpdateFilter({ timeRange: tr.key })}
            style={{
              padding: '4px 10px',
              fontSize: 10,
              fontFamily: FONT,
              background: filter.timeRange === tr.key ? `${NocTheme.blue}20` : 'transparent',
              border: `1px solid ${filter.timeRange === tr.key ? `${NocTheme.blue}50` : NocTheme.border}`,
              borderRadius: 4,
              color: filter.timeRange === tr.key ? NocTheme.blue : NocTheme.textTertiary,
              cursor: 'pointer',
              transition: 'all 0.12s',
            }}
          >
            {tr.label}
          </button>
        ))}
      </div>

      {/* Sources */}
      <SectionTitle>소스</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {sourceEntries.map(([key, cfg]) => (
          <CheckButton
            key={key}
            active={filter.sources.includes(key)}
            color={cfg.color}
            label={`${cfg.icon} ${cfg.label}`}
            onClick={() => onToggleSource(key)}
          />
        ))}
      </div>

      {/* Levels */}
      <SectionTitle>심각도</SectionTitle>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {levelEntries.map(([key, cfg]) => (
          <CheckButton
            key={key}
            active={filter.levels.includes(key)}
            color={cfg.color}
            label={cfg.label}
            onClick={() => onToggleLevel(key)}
          />
        ))}
      </div>
    </div>
  )
}
