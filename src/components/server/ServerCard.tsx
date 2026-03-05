'use client'

import { useCallback } from 'react'
import type { ServerState, ServerConfig } from '@/types/server'

interface ServerCardProps {
  server: ServerState
  config: ServerConfig
  onStart: (id: string) => void
  onStop: (id: string) => void
  onRestart: (id: string) => void
  onEdit: (config: ServerConfig) => void
  onDelete: (id: string) => void
  onViewLogs: (server: ServerState) => void
  onHealthCheck: (id: string) => void
}

const STATUS_COLORS: Record<string, string> = {
  running: '#00ff88',
  starting: '#f59e0b',
  stopping: '#f59e0b',
  failed: '#ef4444',
  idle: '#6b7280',
}

const STATUS_ICONS: Record<string, string> = {
  running: '\u25CF',
  starting: '\u25CB',
  stopping: '\u25CB',
  failed: '\u2716',
  idle: '\u25CB',
}

function formatUptime(seconds?: number): string {
  if (!seconds) return '-'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

export default function ServerCard({
  server,
  config,
  onStart,
  onStop,
  onRestart,
  onEdit,
  onDelete,
  onViewLogs,
  onHealthCheck,
}: ServerCardProps) {
  const statusColor = STATUS_COLORS[server.status] ?? '#6b7280'
  const statusIcon = STATUS_ICONS[server.status] ?? '\u25CB'
  const isRunning = server.status === 'running'
  const isIdle = server.status === 'idle'
  const isBusy = server.status === 'starting' || server.status === 'stopping'

  const handleStart = useCallback(() => onStart(server.id), [onStart, server.id])
  const handleStop = useCallback(() => onStop(server.id), [onStop, server.id])
  const handleRestart = useCallback(() => onRestart(server.id), [onRestart, server.id])

  const controlBtnStyle = (active: boolean, color: string): React.CSSProperties => ({
    padding: '5px 10px',
    background: active ? color : '#333333',
    border: active ? 'none' : '1px solid #333',
    borderRadius: 4,
    color: active ? (color === '#ef4444' ? '#fff' : '#000') : '#555',
    fontSize: 11,
    fontWeight: 600,
    cursor: active ? 'pointer' : 'not-allowed',
    transition: 'all 0.15s',
  })

  const iconBtnStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: 13,
    padding: '4px 6px',
  }

  return (
    <div
      style={{
        background: '#000000',
        border: `1px solid ${statusColor}33`,
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'border-color 0.3s',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid #333333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ color: statusColor, fontSize: 10 }}>{statusIcon}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#e5e7eb' }}>{server.name}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#6b7280' }}>
            <span>:{server.port}</span>
            <span>{server.status}</span>
            {isRunning && <span>uptime {formatUptime(server.uptime)}</span>}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 2 }}>
          <button onClick={() => onEdit(config)} style={iconBtnStyle} title="Edit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button onClick={() => onDelete(server.id)} style={iconBtnStyle} title="Delete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Command */}
      <div style={{ padding: '8px 16px', borderBottom: '1px solid #333333' }}>
        <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>COMMAND</div>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 11,
            color: '#9ca3af',
            background: '#000000',
            padding: '4px 8px',
            borderRadius: 3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {config.command}
        </div>
      </div>

      {/* Health Check */}
      {config.healthCheckUrl && (
        <div style={{ padding: '8px 16px', borderBottom: '1px solid #333333' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 10, color: '#555', marginBottom: 2 }}>HEALTH CHECK</div>
              <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#6b7280' }}>
                {config.healthCheckUrl}
              </div>
            </div>
            {server.lastHealthCheck && (
              <div
                style={{
                  padding: '2px 8px',
                  borderRadius: 10,
                  fontSize: 10,
                  fontWeight: 600,
                  background: server.lastHealthCheck.ok ? '#00ff8815' : '#ef444415',
                  color: server.lastHealthCheck.ok ? '#00ff88' : '#ef4444',
                  border: `1px solid ${server.lastHealthCheck.ok ? '#00ff8833' : '#ef444433'}`,
                }}
              >
                {server.lastHealthCheck.ok
                  ? `${server.lastHealthCheck.statusCode} - ${server.lastHealthCheck.latencyMs}ms`
                  : 'FAIL'}
              </div>
            )}
          </div>
          {isRunning && (
            <button
              onClick={() => onHealthCheck(server.id)}
              style={{
                marginTop: 6,
                padding: '3px 8px',
                background: '#333333',
                border: '1px solid #333',
                borderRadius: 3,
                color: '#9ca3af',
                fontSize: 10,
                cursor: 'pointer',
              }}
            >
              Check Now
            </button>
          )}
        </div>
      )}

      {/* Controls */}
      <div
        style={{
          padding: '10px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={handleStart}
            disabled={!isIdle}
            style={controlBtnStyle(isIdle, '#10b981')}
          >
            Start
          </button>
          <button
            onClick={handleStop}
            disabled={!isRunning}
            style={controlBtnStyle(isRunning, '#ef4444')}
          >
            Stop
          </button>
          <button
            onClick={handleRestart}
            disabled={isBusy || isIdle}
            style={controlBtnStyle(isRunning, '#f59e0b')}
          >
            Restart
          </button>
        </div>

        <button
          onClick={() => onViewLogs(server)}
          style={{
            padding: '5px 10px',
            background: '#333333',
            border: '1px solid #333',
            borderRadius: 4,
            color: '#9ca3af',
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          Logs
        </button>
      </div>
    </div>
  )
}
