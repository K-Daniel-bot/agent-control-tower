'use client'

import { useState, useCallback } from 'react'
import type { LogEntry } from '@/types/logs'
import { LOG_LEVEL_CONFIG, LOG_SOURCE_CONFIG } from '@/types/logs'
import { NocTheme } from '@/constants/nocTheme'

const FONT = "'JetBrains Mono', 'Fira Code', 'Menlo', monospace"

interface LogTableProps {
  readonly logs: readonly LogEntry[]
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
}

function formatDate(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
}

function LevelBadge({ level }: { readonly level: string }) {
  const cfg = LOG_LEVEL_CONFIG[level as keyof typeof LOG_LEVEL_CONFIG]
  if (!cfg) return null
  return (
    <span style={{
      fontSize: 9,
      fontWeight: 700,
      padding: '2px 6px',
      borderRadius: 3,
      background: `${cfg.color}18`,
      color: cfg.color,
      border: `1px solid ${cfg.color}30`,
      letterSpacing: '0.04em',
    }}>
      {cfg.label}
    </span>
  )
}

function SourceBadge({ source }: { readonly source: string }) {
  const cfg = LOG_SOURCE_CONFIG[source as keyof typeof LOG_SOURCE_CONFIG]
  if (!cfg) return null
  return (
    <span style={{
      fontSize: 9,
      padding: '2px 6px',
      borderRadius: 3,
      background: `${cfg.color}12`,
      color: cfg.color,
      border: `1px solid ${cfg.color}25`,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  )
}

function LogRow({ log, isExpanded, onToggle }: {
  readonly log: LogEntry
  readonly isExpanded: boolean
  readonly onToggle: () => void
}) {
  const levelCfg = LOG_LEVEL_CONFIG[log.level]

  return (
    <>
      <tr
        onClick={onToggle}
        style={{
          cursor: 'pointer',
          borderBottom: `1px solid ${NocTheme.border}`,
          transition: 'background 0.1s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = NocTheme.hover }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}
      >
        {/* Time */}
        <td style={{ padding: '7px 10px', fontSize: 10, color: NocTheme.textTertiary, whiteSpace: 'nowrap', width: 100 }}>
          <div>{formatTime(log.timestamp)}</div>
          <div style={{ fontSize: 9, color: NocTheme.textMuted }}>{formatDate(log.timestamp)}</div>
        </td>
        {/* Level */}
        <td style={{ padding: '7px 6px', width: 60 }}>
          <LevelBadge level={log.level} />
        </td>
        {/* Source */}
        <td style={{ padding: '7px 6px', width: 90 }}>
          <SourceBadge source={log.source} />
        </td>
        {/* Message */}
        <td style={{
          padding: '7px 10px', fontSize: 11, color: NocTheme.textPrimary,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          maxWidth: 0,
        }}>
          <span style={{ color: levelCfg?.color ?? NocTheme.textPrimary, opacity: 0.3, marginRight: 6 }}>│</span>
          {log.message}
        </td>
        {/* Target */}
        <td style={{
          padding: '7px 10px', fontSize: 10, color: NocTheme.textMuted,
          maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {log.target ?? '—'}
        </td>
      </tr>

      {/* Expanded details */}
      {isExpanded && (
        <tr>
          <td colSpan={5} style={{
            padding: '8px 10px 8px 120px',
            background: NocTheme.surfaceAlt,
            borderBottom: `1px solid ${NocTheme.border}`,
          }}>
            <div style={{ fontSize: 10, color: NocTheme.textSecondary, lineHeight: 1.8 }}>
              <div><span style={{ color: NocTheme.textMuted }}>ID: </span>{log.id}</div>
              <div><span style={{ color: NocTheme.textMuted }}>카테고리: </span>{log.category}</div>
              <div><span style={{ color: NocTheme.textMuted }}>타겟: </span>{log.target ?? 'N/A'}</div>
              <div><span style={{ color: NocTheme.textMuted }}>시간: </span>{new Date(log.timestamp).toLocaleString('ko-KR')}</div>
              {log.details && (
                <div><span style={{ color: NocTheme.textMuted }}>상세: </span>{log.details}</div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function LogTable({ logs }: LogTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpand = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id)
  }, [])

  return (
    <div style={{
      width: '100%', height: '100%', overflow: 'auto',
      fontFamily: FONT,
    }}>
      <table style={{
        width: '100%', borderCollapse: 'collapse',
        tableLayout: 'fixed',
      }}>
        <thead>
          <tr style={{
            borderBottom: `1px solid ${NocTheme.border}`,
            position: 'sticky', top: 0, zIndex: 2,
            background: NocTheme.background,
          }}>
            <th style={{ ...thStyle, width: 100 }}>시간</th>
            <th style={{ ...thStyle, width: 60 }}>레벨</th>
            <th style={{ ...thStyle, width: 90 }}>소스</th>
            <th style={thStyle}>메시지</th>
            <th style={{ ...thStyle, width: 150 }}>타겟</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan={5} style={{
                padding: 40, textAlign: 'center',
                fontSize: 12, color: NocTheme.textMuted,
              }}>
                필터 조건에 맞는 로그가 없습니다
              </td>
            </tr>
          ) : (
            logs.slice(0, 200).map(log => (
              <LogRow
                key={log.id}
                log={log}
                isExpanded={expandedId === log.id}
                onToggle={() => toggleExpand(log.id)}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '8px 10px',
  fontSize: 10,
  fontWeight: 600,
  color: '#6b7280',
  textAlign: 'left',
  letterSpacing: '0.06em',
  fontFamily: "'JetBrains Mono', monospace",
}
