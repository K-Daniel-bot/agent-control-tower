'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import { useTerminalConfig } from '@/hooks/useTerminalConfig'
import { usePaneManager } from '@/hooks/usePaneManager'
import { countLeaves } from '@/utils/splitTreeUtils'
import type { PaneId, ConnectionStatus } from '@/types/terminal'
import SplitContainer from './SplitContainer'
import TerminalCustomizer from './TerminalCustomizer'
import DirectoryPanel from './DirectoryPanel'
import ToolbarCommandButtons from './ToolbarCommandButtons'

const STATUS_MAP: Record<ConnectionStatus, { color: string; label: string }> = {
  connected: { color: '#00ff88', label: '연결됨' },
  disconnected: { color: '#ef4444', label: '연결 끊김' },
  connecting: { color: '#f59e0b', label: '연결 중...' },
}

interface TerminalDashboardProps {
  readonly isVisible?: boolean
}

export default function TerminalDashboard({ isVisible = true }: TerminalDashboardProps) {
  const { config, dispatch } = useTerminalConfig()
  const { paneState, paneDispatch } = usePaneManager()
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [connStatuses, setConnStatuses] = useState<ReadonlyMap<PaneId, ConnectionStatus>>(new Map())
  const commandSendersRef = useRef<Map<PaneId, (cmd: string) => void>>(new Map())

  const paneCount = useMemo(() => countLeaves(paneState.root), [paneState.root])

  // Aggregate connection status: connected if any, connecting if any pending, else disconnected
  const aggregateStatus = useMemo((): ConnectionStatus => {
    const statuses = Array.from(connStatuses.values())
    if (statuses.some((s) => s === 'connected')) return 'connected'
    if (statuses.some((s) => s === 'connecting')) return 'connecting'
    return 'disconnected'
  }, [connStatuses])

  const status = STATUS_MAP[aggregateStatus]

  const handleConnectionChange = useCallback((paneId: PaneId, newStatus: ConnectionStatus) => {
    setConnStatuses((prev) => {
      const next = new Map(prev)
      next.set(paneId, newStatus)
      return next
    })
  }, [])

  const registerSendCommand = useCallback((paneId: PaneId, sender: (cmd: string) => void) => {
    commandSendersRef.current.set(paneId, sender)
  }, [])

  const unregisterSendCommand = useCallback((paneId: PaneId) => {
    commandSendersRef.current.delete(paneId)
  }, [])

  const sendToActivePane = useCallback((command: string) => {
    const sender = commandSendersRef.current.get(paneState.activePaneId)
    if (sender) sender(command)
  }, [paneState.activePaneId])

  const handleGoHome = useCallback(() => {
    paneDispatch({ type: 'RESET_ALL' })
    setConnStatuses(new Map())
    commandSendersRef.current.clear()
  }, [paneDispatch])

  const handleSelectDirectory = useCallback((dirPath: string) => {
    sendToActivePane(`cd ${JSON.stringify(dirPath)}`)
  }, [sendToActivePane])

  const handleSplitH = useCallback(() => {
    paneDispatch({ type: 'SPLIT_PANE', paneId: paneState.activePaneId, direction: 'horizontal' })
  }, [paneDispatch, paneState.activePaneId])

  const handleSplitV = useCallback(() => {
    paneDispatch({ type: 'SPLIT_PANE', paneId: paneState.activePaneId, direction: 'vertical' })
  }, [paneDispatch, paneState.activePaneId])

  const handleClosePane = useCallback((paneId: PaneId) => {
    paneDispatch({ type: 'CLOSE_PANE', paneId })
    setConnStatuses((prev) => {
      const next = new Map(prev)
      next.delete(paneId)
      return next
    })
  }, [paneDispatch])

  const handlePaneClick = useCallback((paneId: PaneId) => {
    paneDispatch({ type: 'SET_ACTIVE_PANE', paneId })
  }, [paneDispatch])

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: '#0a0e1a',
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 12px',
          borderBottom: '1px solid #2a3042',
          background: 'rgba(16,20,32,0.9)',
          flexShrink: 0,
          height: 32,
        }}
      >
        {/* Left: status + label + command buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: status.color,
                boxShadow: `0 0 4px ${status.color}`,
                animation: aggregateStatus === 'connecting' ? 'pulse-dot 1s ease-in-out infinite' : 'none',
              }}
            />
            <span style={{ fontSize: 9, color: '#6b7280' }}>{status.label}</span>
          </div>

          {/* Separator */}
          <div style={{ width: 1, height: 16, background: '#2a3042' }} />

          <ToolbarCommandButtons
            onSendCommand={sendToActivePane}
            onSplitHorizontal={handleSplitH}
            onSplitVertical={handleSplitV}
            paneCount={paneCount}
          />
        </div>

        {/* Right: buttons */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={handleGoHome}
            style={{
              padding: '3px 10px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 4,
              color: '#ef4444',
              fontSize: 9,
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.15s',
            }}
          >
            되돌아가기
          </button>
          <button
            onClick={() => setShowCustomizer((v) => !v)}
            style={{
              padding: '3px 10px',
              background: showCustomizer ? 'rgba(0,255,136,0.15)' : 'rgba(0,255,136,0.06)',
              border: `1px solid ${showCustomizer ? 'rgba(0,255,136,0.4)' : 'rgba(0,255,136,0.2)'}`,
              borderRadius: 4,
              color: '#00ff88',
              fontSize: 9,
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'all 0.15s',
            }}
          >
            설정
          </button>
        </div>
      </div>

      {/* Main area: directory panel + split terminals + optional customizer */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <DirectoryPanel onSelectDirectory={handleSelectDirectory} />

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <SplitContainer
            node={paneState.root}
            activePaneId={paneState.activePaneId}
            isVisible={isVisible}
            config={config}
            totalLeaves={paneCount}
            onPaneClick={handlePaneClick}
            onClosePane={handleClosePane}
            onConnectionChange={handleConnectionChange}
            registerSendCommand={registerSendCommand}
            unregisterSendCommand={unregisterSendCommand}
          />
        </div>

        {showCustomizer && (
          <TerminalCustomizer
            config={config}
            dispatch={dispatch}
            onClose={() => setShowCustomizer(false)}
          />
        )}
      </div>
    </div>
  )
}
