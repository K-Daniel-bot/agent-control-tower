'use client'

import { RemoteProvider, useRemote } from './context/RemoteContext'
import { NocTheme } from '@/constants/nocTheme'
import LiveViewer from './live/LiveViewer'
import SpeedController from './live/SpeedController'
import ApprovalPanel from './approval/ApprovalPanel'
import SystemMonitor from './monitor/SystemMonitor'
import AuditLog from './security/AuditLog'
import VoiceInterface from './voice/VoiceInterface'
import VoiceCommandLog from './voice/VoiceCommandLog'
import SecurityDashboard from './security/SecurityDashboard'

const FONT = "'JetBrains Mono', 'Fira Code', 'Menlo', monospace"

function RemoteContent() {
  const { state, approveRequest, denyRequest, toggleConnection } = useRemote()

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
      {/* Row 1: Top Bar - fixed 44px */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 16px',
        borderBottom: `1px solid ${NocTheme.border}`,
        height: 44,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.04em' }}>
            AI 원격 제어 시스템
          </span>
          <ConnectionBadge
            status={state.connectionStatus}
            onToggle={toggleConnection}
          />
        </div>
        <SpeedController />
      </div>

      {/* Row 2: Main content area - takes remaining space */}
      <div style={{
        flex: 1,
        display: 'flex',
        overflow: 'hidden',
        minHeight: 0,
      }}>
        {/* Left: Live Viewer - 62% */}
        <div style={{
          width: '62%',
          flexShrink: 0,
          borderRight: `1px solid ${NocTheme.border}`,
          overflow: 'hidden',
        }}>
          <LiveViewer />
        </div>

        {/* Right: Scrollable panel - 38% */}
        <div style={{
          width: '38%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
        }}>
          {/* Approval Panel - flex grow, scrollable */}
          <div style={{
            flex: '1 1 40%',
            overflow: 'auto',
            padding: 10,
            borderBottom: `1px solid ${NocTheme.border}`,
            minHeight: 120,
          }}>
            <ApprovalPanel
              queue={state.approvalQueue}
              history={state.approvalHistory}
              onApprove={approveRequest}
              onDeny={denyRequest}
            />
          </div>

          {/* Voice Interface - fixed height */}
          <div style={{
            flexShrink: 0,
            padding: 10,
            borderBottom: `1px solid ${NocTheme.border}`,
            maxHeight: 180,
            overflow: 'hidden',
          }}>
            <VoiceInterface />
          </div>

          {/* Voice Command Log - fixed height, internal scroll */}
          <div style={{
            flexShrink: 0,
            height: 140,
            borderBottom: `1px solid ${NocTheme.border}`,
            overflow: 'hidden',
          }}>
            <VoiceCommandLog />
          </div>

          {/* Security Dashboard - fixed, compact */}
          <div style={{
            flexShrink: 0,
            padding: 10,
            overflow: 'auto',
          }}>
            <SecurityDashboard />
          </div>
        </div>
      </div>

      {/* Row 3: System Monitor Bar */}
      <div style={{
        minHeight: 56,
        flexShrink: 0,
        borderTop: `1px solid ${NocTheme.border}`,
      }}>
        <SystemMonitor />
      </div>

      {/* Row 4: Audit Log Footer - fixed 150px */}
      <div style={{
        height: 150,
        flexShrink: 0,
        borderTop: `1px solid ${NocTheme.border}`,
        overflow: 'hidden',
      }}>
        <AuditLog />
      </div>
    </div>
  )
}

function ConnectionBadge({
  status,
  onToggle,
}: {
  readonly status: string
  readonly onToggle: () => void
}) {
  const isConnected = status === 'connected'
  const isConnecting = status === 'connecting'
  const color = isConnected ? '#00ff88' : isConnecting ? '#f59e0b' : '#ef4444'
  const label = isConnected ? '연결됨' : isConnecting ? '연결 중...' : '연결 끊김'

  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px',
        background: `${color}15`,
        border: `1px solid ${color}40`,
        borderRadius: 16,
        cursor: 'pointer',
        fontFamily: FONT,
      }}
    >
      <span style={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 6px ${color}`,
      }} />
      <span style={{ fontSize: 11, color, fontWeight: 500 }}>
        {label}
      </span>
    </button>
  )
}

export default function RemoteDashboard() {
  return (
    <RemoteProvider>
      <RemoteContent />
    </RemoteProvider>
  )
}
