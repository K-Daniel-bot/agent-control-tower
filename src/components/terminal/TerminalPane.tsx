'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { PaneId, TerminalConfig, ServerMessage } from '@/types/terminal'
import { THEMES } from '@/data/terminalThemes'

interface TerminalPaneProps {
  readonly paneId: PaneId
  readonly isActive: boolean
  readonly isVisible: boolean
  readonly config: TerminalConfig
  readonly showCloseButton: boolean
  readonly onFocus: (paneId: PaneId) => void
  readonly onClose: (paneId: PaneId) => void
  readonly onConnectionChange: (paneId: PaneId, status: 'connected' | 'disconnected' | 'connecting') => void
  readonly registerSendCommand: (paneId: PaneId, sender: (cmd: string) => void) => void
  readonly unregisterSendCommand: (paneId: PaneId) => void
}

export default function TerminalPane({
  paneId,
  isActive,
  isVisible,
  config,
  showCloseButton,
  onFocus,
  onClose,
  onConnectionChange,
  registerSendCommand,
  unregisterSendCommand,
}: TerminalPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const termRef = useRef<import('@xterm/xterm').Terminal | null>(null)
  const fitAddonRef = useRef<import('@xterm/addon-fit').FitAddon | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const resizeObserverRef = useRef<ResizeObserver | null>(null)

  // Stable session ID per pane — persisted in localStorage so refresh reconnects to same PTY
  const sessionId = useRef<string>('')
  if (!sessionId.current && typeof window !== 'undefined') {
    const key = `act-session-${paneId}`
    const stored = localStorage.getItem(key)
    if (stored) {
      sessionId.current = stored
    } else {
      const newId = Math.random().toString(36).slice(2) + Date.now().toString(36)
      localStorage.setItem(key, newId)
      sessionId.current = newId
    }
  }

  const sendResize = useCallback(() => {
    const fit = fitAddonRef.current
    const ws = wsRef.current
    if (!fit || !termRef.current) return
    try {
      fit.fit()
      const { cols, rows } = termRef.current
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'resize', cols, rows }))
      }
    } catch {
      // ignore fit errors
    }
  }, [])

  // Initialize xterm + WebSocket
  useEffect(() => {
    let disposed = false
    let ws: WebSocket | null = null

    async function init() {
      if (!containerRef.current || disposed) return

      const { Terminal } = await import('@xterm/xterm')
      const { FitAddon } = await import('@xterm/addon-fit')
      const { WebLinksAddon } = await import('@xterm/addon-web-links')

      if (disposed) return

      const theme = THEMES[config.themeName]
      const terminal = new Terminal({
        fontSize: config.fontSize,
        fontFamily: config.fontFamily,
        cursorStyle: config.cursorStyle,
        cursorBlink: config.cursorBlink,
        scrollback: config.scrollback,
        theme,
        allowTransparency: true,
        convertEol: true,
      })

      const fitAddon = new FitAddon()
      terminal.loadAddon(fitAddon)
      terminal.loadAddon(new WebLinksAddon())

      terminal.open(containerRef.current!)
      termRef.current = terminal
      fitAddonRef.current = fitAddon

      requestAnimationFrame(() => {
        if (!disposed) {
          try { fitAddon.fit() } catch { /* ignore */ }
        }
      })

      const ro = new ResizeObserver(() => {
        if (!disposed) {
          try { fitAddon.fit() } catch { /* ignore */ }
          const ws2 = wsRef.current
          if (ws2?.readyState === WebSocket.OPEN && terminal) {
            ws2.send(JSON.stringify({ type: 'resize', cols: terminal.cols, rows: terminal.rows }))
          }
        }
      })
      ro.observe(containerRef.current!)
      resizeObserverRef.current = ro

      onConnectionChange(paneId, 'connecting')
      ws = new WebSocket('ws://localhost:3001')
      wsRef.current = ws

      ws.onopen = () => {
        if (disposed) return
        onConnectionChange(paneId, 'connected')
        try {
          // Identify (or create) the server-side PTY session
          ws!.send(JSON.stringify({ type: 'init', sessionId: sessionId.current }))
          fitAddon.fit()
          ws!.send(JSON.stringify({ type: 'resize', cols: terminal.cols, rows: terminal.rows }))
        } catch { /* ignore */ }
      }

      ws.onmessage = (event) => {
        if (disposed) return
        try {
          const msg: ServerMessage = JSON.parse(event.data)
          if (msg.type === 'output' && msg.data) {
            terminal.write(msg.data)
          } else if (msg.type === 'exit') {
            terminal.write('\r\n\x1b[33m[Session ended]\x1b[0m\r\n')
          }
        } catch {
          // ignore parse errors
        }
      }

      ws.onclose = () => {
        if (!disposed) onConnectionChange(paneId, 'disconnected')
      }

      ws.onerror = () => {
        if (!disposed) onConnectionChange(paneId, 'disconnected')
      }

      terminal.onData((data) => {
        const currentWs = wsRef.current
        if (currentWs?.readyState === WebSocket.OPEN) {
          currentWs.send(JSON.stringify({ type: 'input', data }))
        }
      })

      // Register command sender
      registerSendCommand(paneId, (command: string) => {
        const currentWs = wsRef.current
        if (currentWs?.readyState === WebSocket.OPEN) {
          currentWs.send(JSON.stringify({ type: 'command', command }))
        }
      })
    }

    init()

    return () => {
      disposed = true
      unregisterSendCommand(paneId)
      resizeObserverRef.current?.disconnect()
      resizeObserverRef.current = null
      ws?.close()
      wsRef.current = null
      termRef.current?.dispose()
      termRef.current = null
      fitAddonRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Apply config changes
  useEffect(() => {
    const term = termRef.current
    if (!term) return
    const theme = THEMES[config.themeName]
    term.options.fontSize = config.fontSize
    term.options.fontFamily = config.fontFamily
    term.options.cursorStyle = config.cursorStyle
    term.options.cursorBlink = config.cursorBlink
    term.options.scrollback = config.scrollback
    term.options.theme = theme
    sendResize()
  }, [config, sendResize])

  // Re-fit when visibility changes
  useEffect(() => {
    if (isVisible) {
      requestAnimationFrame(() => {
        try { fitAddonRef.current?.fit() } catch { /* ignore */ }
      })
    }
  }, [isVisible])

  const paneNumber = paneId.split('-')[1] ?? '1'

  return (
    <div
      onClick={() => onFocus(paneId)}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: isActive ? '1px solid rgba(0,255,136,0.5)' : '1px solid rgba(42,48,66,0.5)',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'border-color 0.15s',
      }}
    >
      {/* Pane header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          height: 20,
          background: isActive ? 'rgba(0,255,136,0.08)' : 'rgba(16,20,32,0.95)',
          borderBottom: '1px solid rgba(42,48,66,0.5)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 8, color: isActive ? '#00ff88' : '#4b5563', fontFamily: 'monospace' }}>
          PANE {paneNumber}
        </span>
        {showCloseButton && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onClose(paneId)
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#6b7280',
              fontSize: 10,
              cursor: 'pointer',
              padding: '0 2px',
              lineHeight: 1,
            }}
            title="패널 닫기"
          >
            x
          </button>
        )}
      </div>

      {/* Terminal container */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          opacity: config.opacity,
          transition: 'opacity 0.3s',
          minHeight: 0,
        }}
      />
    </div>
  )
}
