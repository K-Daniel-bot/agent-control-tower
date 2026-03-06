'use client'

import { NocTheme } from '@/constants/nocTheme'
import { useLogAggregation } from '@/hooks/useLogAggregation'
import LogTable from './LogTable'
import LogFilterPanel from './LogFilterPanel'
import LogStatsPanel from './LogStatsPanel'

const FONT = "'JetBrains Mono', 'Fira Code', 'Menlo', monospace"

function ToolbarButton({
  label, onClick, color, active,
}: {
  readonly label: string
  readonly onClick: () => void
  readonly color: string
  readonly active?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '5px 14px',
        fontSize: 11,
        fontWeight: 500,
        fontFamily: FONT,
        background: active ? `${color}18` : 'transparent',
        border: `1px solid ${active ? `${color}40` : NocTheme.border}`,
        borderRadius: 4,
        color: active ? color : NocTheme.textSecondary,
        cursor: 'pointer',
        transition: 'all 0.12s',
      }}
    >
      {label}
    </button>
  )
}

export default function LogsDashboard() {
  const {
    logs, filter, stats, isPaused,
    updateFilter, toggleSource, toggleLevel,
    togglePause, clearLogs,
  } = useLogAggregation()

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      height: '100%',
      background: NocTheme.background,
      fontFamily: FONT,
      color: NocTheme.textPrimary,
      overflow: 'hidden',
    }}>
      {/* Top Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 16px',
        borderBottom: `1px solid ${NocTheme.border}`,
        height: 44,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.04em' }}>
            통합 로그 시스템
          </span>
          <span style={{
            fontSize: 10, color: NocTheme.textMuted,
            padding: '2px 8px',
            background: NocTheme.surfaceAlt,
            border: `1px solid ${NocTheme.border}`,
            borderRadius: 10,
          }}>
            {stats.totalCount.toLocaleString()} 건
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ToolbarButton
            label={isPaused ? '▶ 재개' : '⏸ 일시정지'}
            onClick={togglePause}
            color={isPaused ? NocTheme.green : NocTheme.orange}
            active={isPaused}
          />
          <ToolbarButton
            label="🗑 초기화"
            onClick={clearLogs}
            color={NocTheme.red}
          />
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        {/* Left: Filter Panel */}
        <div style={{
          width: 200,
          flexShrink: 0,
          borderRight: `1px solid ${NocTheme.border}`,
          padding: '12px 10px',
          overflow: 'auto',
        }}>
          <LogFilterPanel
            filter={filter}
            onToggleSource={toggleSource}
            onToggleLevel={toggleLevel}
            onUpdateFilter={updateFilter}
          />
        </div>

        {/* Center: Log Table */}
        <div style={{
          flex: 1,
          overflow: 'hidden',
          minWidth: 0,
        }}>
          <LogTable logs={logs} />
        </div>

        {/* Right: Stats Panel */}
        <div style={{
          width: 220,
          flexShrink: 0,
          borderLeft: `1px solid ${NocTheme.border}`,
          padding: '12px 10px',
          overflow: 'auto',
        }}>
          <LogStatsPanel stats={stats} isPaused={isPaused} />
        </div>
      </div>
    </div>
  )
}
