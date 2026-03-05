'use client'

import { useState, useCallback, useRef, useMemo } from 'react'
import { useTerminalConfig } from '@/hooks/useTerminalConfig'
import { usePaneManager } from '@/hooks/usePaneManager'
import { countLeaves, collectLeafIds } from '@/utils/splitTreeUtils'
import type { PaneId, ConnectionStatus, RightPanelTab } from '@/types/terminal'
import SplitContainer from './SplitContainer'
import TerminalCustomizer from './TerminalCustomizer'
import DirectoryPanel from './DirectoryPanel'
import ToolbarCommandButtons from './ToolbarCommandButtons'
import SkillPanel from './SkillPanel'
import AINotesPanel from './AINotesPanel'
import NoteGraphPanel from './NoteGraphPanel'

const STATUS_MAP: Record<ConnectionStatus, { color: string; label: string }> = {
  connected: { color: '#00ff88', label: '연결됨' },
  disconnected: { color: '#ef4444', label: '연결 끊김' },
  connecting: { color: '#f59e0b', label: '연결 중...' },
}

interface TerminalDashboardProps {
  readonly isVisible?: boolean
  readonly rightPanel?: RightPanelTab
  readonly onTogglePanel?: (tab: 'skill' | 'note' | 'graph') => void
}

export default function TerminalDashboard({ isVisible = true, rightPanel = null, onTogglePanel }: TerminalDashboardProps) {
  const { config, dispatch } = useTerminalConfig()
  const { paneState, paneDispatch } = usePaneManager()
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [connStatuses, setConnStatuses] = useState<ReadonlyMap<PaneId, ConnectionStatus>>(new Map())
  const [savedProjectDir, setSavedProjectDir] = useState<string | null>(null)
  const commandSendersRef = useRef<Map<PaneId, (cmd: string) => void>>(new Map())

  const paneCount = useMemo(() => countLeaves(paneState.root), [paneState.root])

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
    collectLeafIds(paneState.root).forEach((id) => {
      try { localStorage.removeItem(`act-session-${id}`) } catch { /* ignore */ }
    })
    paneDispatch({ type: 'RESET_ALL' })
    setConnStatuses(new Map())
    commandSendersRef.current.clear()
  }, [paneDispatch, paneState.root])

  const handleSelectDirectory = useCallback((dirPath: string) => {
    setSavedProjectDir(dirPath)
    try {
      localStorage.setItem('act-project-dir', dirPath)
    } catch { /* ignore */ }
    sendToActivePane(`cd ${JSON.stringify(dirPath)}`)
  }, [sendToActivePane])

  const handleToolbarCommand = useCallback((command: string) => {
    if (command === 'claude') {
      const claudeCmd = savedProjectDir
        ? `cd ${JSON.stringify(savedProjectDir)} && env -u CLAUDECODE claude`
        : 'env -u CLAUDECODE claude'
      sendToActivePane(claudeCmd)
    } else {
      sendToActivePane(command)
    }
  }, [sendToActivePane, savedProjectDir])

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

  const togglePanel = useCallback((tab: 'skill' | 'note' | 'graph') => {
    onTogglePanel?.(tab)
  }, [onTogglePanel])

  const panelBtnStyle = (tab: 'skill' | 'note' | 'graph', color: string) => ({
    padding: '3px 10px',
    background: rightPanel === tab ? `${color}25` : `${color}0a`,
    border: `1px solid ${rightPanel === tab ? `${color}66` : `${color}33`}`,
    borderRadius: 4,
    color,
    fontSize: 9,
    cursor: 'pointer' as const,
    fontWeight: 600 as const,
    transition: 'all 0.15s',
  })

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'transparent',
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
          borderBottom: '1px solid #333333',
          background: 'transparent',
          flexShrink: 0,
          height: 32,
        }}
      >
        {/* Left: status + command buttons */}
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
          <div style={{ width: 1, height: 16, background: '#333333' }} />
          <ToolbarCommandButtons
            onSendCommand={handleToolbarCommand}
            onSplitHorizontal={handleSplitH}
            onSplitVertical={handleSplitV}
            paneCount={paneCount}
          />
        </div>

        {/* Right: panel toggle buttons */}
        <div style={{ display: 'flex', gap: 5 }}>
          <button onClick={() => togglePanel('skill')} style={panelBtnStyle('skill', '#a855f7')}>
            스킬
          </button>
          <button onClick={() => togglePanel('note')} style={panelBtnStyle('note', '#3b82f6')}>
            AI노트
          </button>
          <button onClick={() => togglePanel('graph')} style={panelBtnStyle('graph', '#06b6d4')}>
            그래프뷰
          </button>
          <div style={{ width: 1, height: 16, background: '#333333', alignSelf: 'center' }} />
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
            전체삭제
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

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <DirectoryPanel onSelectDirectory={handleSelectDirectory} />

        {/* Terminal */}
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

        {/* Modal: Skill Panel */}
        {rightPanel === 'skill' && (
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
              zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={() => togglePanel('skill')}
          >
            <div
              style={{
                width: '80vw', maxWidth: 900, height: '80vh',
                background: '#000000', border: '1px solid #333333', borderRadius: 8,
                overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 16px', borderBottom: '1px solid #333333',
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#a855f7' }}>스킬</span>
                <button
                  onClick={() => togglePanel('skill')}
                  style={{
                    background: 'none', border: '1px solid #333', borderRadius: 4,
                    color: '#6b7280', fontSize: 11, padding: '2px 8px', cursor: 'pointer',
                  }}
                >
                  ESC
                </button>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <SkillPanel onSendCommand={sendToActivePane} projectDir={savedProjectDir} />
              </div>
            </div>
          </div>
        )}

        {/* Modal: AI Notes Panel */}
        {rightPanel === 'note' && (
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
              zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={() => togglePanel('note')}
          >
            <div
              style={{
                width: '80vw', maxWidth: 900, height: '80vh',
                background: '#000000', border: '1px solid #333333', borderRadius: 8,
                overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 16px', borderBottom: '1px solid #333333',
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#3b82f6' }}>AI 노트</span>
                <button
                  onClick={() => togglePanel('note')}
                  style={{
                    background: 'none', border: '1px solid #333', borderRadius: 4,
                    color: '#6b7280', fontSize: 11, padding: '2px 8px', cursor: 'pointer',
                  }}
                >
                  ESC
                </button>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <AINotesPanel onSendCommand={sendToActivePane} />
              </div>
            </div>
          </div>
        )}

        {/* Modal: Graph View */}
        {rightPanel === 'graph' && (
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
              zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onClick={() => togglePanel('graph')}
          >
            <div
              style={{
                width: '85vw', maxWidth: 1100, height: '80vh',
                background: '#000000', border: '1px solid #333333', borderRadius: 8,
                overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 16px', borderBottom: '1px solid #333333',
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#06b6d4' }}>그래프 뷰</span>
                <button
                  onClick={() => togglePanel('graph')}
                  style={{
                    background: 'none', border: '1px solid #333', borderRadius: 4,
                    color: '#6b7280', fontSize: 11, padding: '2px 8px', cursor: 'pointer',
                  }}
                >
                  ESC
                </button>
              </div>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <NoteGraphPanel />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
