'use client'

import { useState, useEffect, useCallback } from 'react'

interface ServerStatus {
  name: string
  port?: number
  status: 'idle' | 'running' | 'starting' | 'failed'
  uptime?: number
  logs: string[]
}

const SERVERS = [
  { name: 'Next.js App', port: 3000, command: 'dev' },
  { name: 'Terminal Server', port: 3001, command: 'dev:terminal' },
]

export default function ServersPage() {
  const [servers, setServers] = useState<ServerStatus[]>([])
  const [allRunning, setAllRunning] = useState(false)

  useEffect(() => {
    // Initialize servers
    setServers(
      SERVERS.map((s) => ({
        name: s.name,
        port: s.port,
        status: 'idle' as const,
        uptime: 0,
        logs: [],
      }))
    )

    // Fetch server status
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/servers/status')
        const data = await res.json()
        setServers(data)
        setAllRunning(data.every((s: ServerStatus) => s.status === 'running'))
      } catch (err) {
        console.error('Failed to fetch server status:', err)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const startServer = useCallback(async (name: string) => {
    try {
      await fetch('/api/servers/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
    } catch (err) {
      console.error('Failed to start server:', err)
    }
  }, [])

  const stopServer = useCallback(async (name: string) => {
    try {
      await fetch('/api/servers/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
    } catch (err) {
      console.error('Failed to stop server:', err)
    }
  }, [])

  const startAll = useCallback(async () => {
    for (const server of servers) {
      if (server.status === 'idle') {
        await startServer(server.name)
      }
    }
  }, [servers, startServer])

  const stopAll = useCallback(async () => {
    for (const server of servers) {
      if (server.status !== 'idle') {
        await stopServer(server.name)
      }
    }
  }, [servers, stopServer])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return '#00ff88'
      case 'failed':
        return '#ef4444'
      case 'starting':
        return '#f59e0b'
      default:
        return '#6b7280'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return '✓'
      case 'failed':
        return '✗'
      case 'starting':
        return '⟳'
      default:
        return '○'
    }
  }

  const formatUptime = (seconds?: number) => {
    if (!seconds) return '-'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h}h ${m}m ${s}s`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000000', color: '#e5e7eb' }}>
      {/* Header */}
      <div
        style={{
          borderBottom: '1px solid #333333',
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1 style={{ margin: '0 0 4px 0', fontSize: 28, fontWeight: 700 }}>
            🖥️ Server Control Panel
          </h1>
          <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>
            All servers status: {allRunning ? '✓ Online' : '○ Mixed'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={startAll}
            style={{
              padding: '8px 16px',
              background: '#10b981',
              border: 'none',
              borderRadius: 6,
              color: '#000',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            ▶ Start All
          </button>
          <button
            onClick={stopAll}
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            ⏹ Stop All
          </button>
        </div>
      </div>

      {/* Servers Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: 20,
          padding: 40,
        }}
      >
        {servers.map((server) => (
          <div
            key={server.name}
            style={{
              background: '#0a0a0a',
              border: `1px solid ${getStatusColor(server.status)}33`,
              borderRadius: 8,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Server Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #333333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 600 }}>
                  {server.name}
                </h2>
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    fontSize: 12,
                    color: '#9ca3af',
                  }}
                >
                  <span>
                    <span style={{ color: getStatusColor(server.status) }}>
                      {getStatusIcon(server.status)}
                    </span>
                    {' ' + server.status}
                  </span>
                  {server.port && <span>port {server.port}</span>}
                  {server.uptime !== undefined && <span>uptime {formatUptime(server.uptime)}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => startServer(server.name)}
                  disabled={server.status !== 'idle'}
                  style={{
                    padding: '6px 12px',
                    background:
                      server.status === 'idle' ? '#10b981' : '#4b5563',
                    border: 'none',
                    borderRadius: 4,
                    color: server.status === 'idle' ? '#000' : '#9ca3af',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: server.status === 'idle' ? 'pointer' : 'not-allowed',
                  }}
                >
                  Start
                </button>
                <button
                  onClick={() => stopServer(server.name)}
                  disabled={server.status === 'idle'}
                  style={{
                    padding: '6px 12px',
                    background:
                      server.status !== 'idle' ? '#ef4444' : '#4b5563',
                    border: 'none',
                    borderRadius: 4,
                    color: server.status !== 'idle' ? '#fff' : '#9ca3af',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: server.status !== 'idle' ? 'pointer' : 'not-allowed',
                  }}
                >
                  Stop
                </button>
              </div>
            </div>

            {/* Logs */}
            <div
              style={{
                flex: 1,
                padding: 16,
                fontFamily: 'monospace',
                fontSize: 11,
                maxHeight: 300,
                overflowY: 'auto',
                background: '#050505',
              }}
            >
              {server.logs.length > 0 ? (
                server.logs.map((log, idx) => (
                  <div key={idx} style={{ color: '#6b7280', marginBottom: 4 }}>
                    {log}
                  </div>
                ))
              ) : (
                <div style={{ color: '#374151' }}>No logs yet...</div>
              )}
            </div>

            {/* Quick Links */}
            {server.port && server.status === 'running' && (
              <div
                style={{
                  padding: '12px 16px',
                  borderTop: '1px solid #333333',
                  background: '#0a0a0a',
                }}
              >
                <a
                  href={`http://localhost:${server.port}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 12,
                    color: '#3b82f6',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  🔗 Open http://localhost:{server.port}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Footer */}
      <div
        style={{
          borderTop: '1px solid #333333',
          padding: '16px 40px',
          fontSize: 12,
          color: '#6b7280',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>
          📋 Status updates every 1 second • Click server links to open in browser
        </div>
        <div>
          Agent Control Tower v0.1.0 • Built with Next.js
        </div>
      </div>
    </div>
  )
}
