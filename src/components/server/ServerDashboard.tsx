'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { ServerConfig, ServerState } from '@/types/server'
import ServerCard from './ServerCard'
import AddServerModal from './AddServerModal'
import ServerLogViewer from './ServerLogViewer'

const STORAGE_KEY = 'agent-control-tower-servers'
const POLL_INTERVAL = 2000

const DEFAULT_SERVERS: ServerConfig[] = [
  { id: 'nextjs', name: 'Next.js App', port: 3000, command: 'npm run dev' },
  { id: 'terminal', name: 'Terminal Server', port: 3001, command: 'npm run dev:terminal' },
]

function loadConfigs(): ServerConfig[] {
  if (typeof window === 'undefined') return DEFAULT_SERVERS
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as ServerConfig[]
      return parsed.length > 0 ? parsed : DEFAULT_SERVERS
    }
  } catch { /* ignore */ }
  return DEFAULT_SERVERS
}

function saveConfigs(configs: ServerConfig[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(configs))
  } catch { /* ignore */ }
}

export default function ServerDashboard() {
  const [configs, setConfigs] = useState<ServerConfig[]>([])
  const [states, setStates] = useState<Map<string, ServerState>>(new Map())
  const [showAddModal, setShowAddModal] = useState(false)
  const [editTarget, setEditTarget] = useState<ServerConfig | null>(null)
  const [logTarget, setLogTarget] = useState<ServerState | null>(null)
  const mountedRef = useRef(true)

  // Load configs on mount
  useEffect(() => {
    setConfigs(loadConfigs())
    return () => { mountedRef.current = false }
  }, [])

  // Read global project directory from terminal
  const getProjectDir = useCallback((): string | undefined => {
    try {
      return localStorage.getItem('act-project-dir') ?? undefined
    } catch { return undefined }
  }, [])

  // Poll server status
  useEffect(() => {
    if (configs.length === 0) return

    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/servers/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ servers: configs.map((c) => ({ id: c.id, name: c.name, port: c.port })) }),
        })
        const data: ServerState[] = await res.json()
        if (!mountedRef.current) return

        setStates((prev) => {
          const next = new Map(prev)
          for (const s of data) {
            next.set(s.id, s)
          }
          return next
        })
      } catch { /* silent */ }
    }

    fetchStatus()
    const interval = setInterval(fetchStatus, POLL_INTERVAL)
    return () => clearInterval(interval)
  }, [configs])

  // Server actions
  const startServer = useCallback(async (id: string) => {
    const config = configs.find((c) => c.id === id)
    if (!config) return
    const projectDir = getProjectDir()
    const payload = {
      ...config,
      cwd: config.cwd || projectDir,
    }
    try {
      await fetch('/api/servers/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (err) {
      console.error('Failed to start server:', err)
    }
  }, [configs, getProjectDir])

  const stopServer = useCallback(async (id: string) => {
    const config = configs.find((c) => c.id === id)
    if (!config) return
    try {
      await fetch('/api/servers/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: config.id, port: config.port }),
      })
    } catch (err) {
      console.error('Failed to stop server:', err)
    }
  }, [configs])

  const restartServer = useCallback(async (id: string) => {
    await stopServer(id)
    setTimeout(() => startServer(id), 1500)
  }, [stopServer, startServer])

  const healthCheck = useCallback(async (id: string) => {
    const config = configs.find((c) => c.id === id)
    if (!config?.healthCheckUrl) return
    try {
      const res = await fetch('/api/servers/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: config.id, url: config.healthCheckUrl }),
      })
      const data = await res.json()
      if (!mountedRef.current) return

      setStates((prev) => {
        const next = new Map(prev)
        const current = next.get(id)
        if (current) {
          next.set(id, { ...current, lastHealthCheck: data })
        }
        return next
      })
    } catch { /* silent */ }
  }, [configs])

  // Config management
  const handleAddServer = useCallback((config: ServerConfig) => {
    setConfigs((prev) => {
      const exists = prev.findIndex((c) => c.id === config.id)
      const next = exists >= 0
        ? prev.map((c) => (c.id === config.id ? config : c))
        : [...prev, config]
      saveConfigs(next)
      return next
    })
    setShowAddModal(false)
    setEditTarget(null)
  }, [])

  const handleDeleteServer = useCallback((id: string) => {
    setConfigs((prev) => {
      const next = prev.filter((c) => c.id !== id)
      saveConfigs(next)
      return next
    })
    setStates((prev) => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }, [])

  const handleEdit = useCallback((config: ServerConfig) => {
    setEditTarget(config)
    setShowAddModal(true)
  }, [])

  // Aggregate stats
  const totalServers = configs.length
  const runningCount = Array.from(states.values()).filter((s) => s.status === 'running').length
  const failedCount = Array.from(states.values()).filter((s) => s.status === 'failed').length

  const startAll = useCallback(async () => {
    for (const config of configs) {
      const state = states.get(config.id)
      if (!state || state.status === 'idle') {
        await startServer(config.id)
      }
    }
  }, [configs, states, startServer])

  const stopAll = useCallback(async () => {
    for (const config of configs) {
      const state = states.get(config.id)
      if (state && state.status !== 'idle') {
        await stopServer(config.id)
      }
    }
  }, [configs, states, stopServer])

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#000',
        color: '#e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          padding: '14px 24px',
          borderBottom: '1px solid #333333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.02em' }}>
            Server Manager
          </span>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#6b7280' }}>
            <span>
              <span style={{ color: '#00ff88' }}>{runningCount}</span> running
            </span>
            {failedCount > 0 && (
              <span>
                <span style={{ color: '#ef4444' }}>{failedCount}</span> failed
              </span>
            )}
            <span>{totalServers} total</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={startAll}
            style={{
              padding: '6px 14px',
              background: '#10b981',
              border: 'none',
              borderRadius: 4,
              color: '#000',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Start All
          </button>
          <button
            onClick={stopAll}
            style={{
              padding: '6px 14px',
              background: '#ef4444',
              border: 'none',
              borderRadius: 4,
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Stop All
          </button>
          <button
            onClick={() => { setEditTarget(null); setShowAddModal(true) }}
            style={{
              padding: '6px 14px',
              background: '#3b82f6',
              border: 'none',
              borderRadius: 4,
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Add Server
          </button>
        </div>
      </div>

      {/* Server Grid */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: 24,
        }}
      >
        {configs.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 12,
              color: '#555',
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            <span style={{ fontSize: 14 }}>No servers configured</span>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: '8px 16px',
                background: '#3b82f6',
                border: 'none',
                borderRadius: 4,
                color: '#fff',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Add your first server
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              gap: 16,
            }}
          >
            {configs.map((config) => {
              const state = states.get(config.id) ?? {
                id: config.id,
                name: config.name,
                port: config.port,
                status: 'idle' as const,
                logs: [],
              }
              return (
                <ServerCard
                  key={config.id}
                  server={state}
                  config={config}
                  onStart={startServer}
                  onStop={stopServer}
                  onRestart={restartServer}
                  onEdit={handleEdit}
                  onDelete={handleDeleteServer}
                  onViewLogs={setLogTarget}
                  onHealthCheck={healthCheck}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddServerModal
          onClose={() => { setShowAddModal(false); setEditTarget(null) }}
          onAdd={handleAddServer}
          editTarget={editTarget}
        />
      )}

      {logTarget && (
        <ServerLogViewer
          logs={logTarget.logs}
          serverName={logTarget.name}
          onClose={() => setLogTarget(null)}
        />
      )}
    </div>
  )
}
