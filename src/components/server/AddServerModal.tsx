'use client'

import { useState } from 'react'
import type { ServerConfig } from '@/types/server'

interface AddServerModalProps {
  onClose: () => void
  onAdd: (config: ServerConfig) => void
  editTarget?: ServerConfig | null
}

function getGlobalProjectDir(): string {
  try {
    return localStorage.getItem('act-project-dir') ?? ''
  } catch { return '' }
}

export default function AddServerModal({ onClose, onAdd, editTarget }: AddServerModalProps) {
  const [name, setName] = useState(editTarget?.name ?? '')
  const [port, setPort] = useState(editTarget?.port?.toString() ?? '')
  const [command, setCommand] = useState(editTarget?.command ?? '')
  const [cwd, setCwd] = useState(editTarget?.cwd ?? getGlobalProjectDir())
  const [healthCheckUrl, setHealthCheckUrl] = useState(editTarget?.healthCheckUrl ?? '')

  const handleSubmit = () => {
    const portNum = parseInt(port, 10)
    if (!name.trim() || isNaN(portNum) || !command.trim()) return

    const config: ServerConfig = {
      id: editTarget?.id ?? `server-${Date.now()}`,
      name: name.trim(),
      port: portNum,
      command: command.trim(),
      cwd: cwd.trim() || undefined,
      healthCheckUrl: healthCheckUrl.trim() || undefined,
    }
    onAdd(config)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    background: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: 4,
    color: '#e5e7eb',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
    display: 'block',
  }

  const isValid = name.trim() && port && !isNaN(parseInt(port, 10)) && command.trim()

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: 480,
          background: '#000000',
          border: '1px solid #333',
          borderRadius: 8,
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: '#e5e7eb' }}>
            {editTarget ? 'Edit Server' : 'Add Server'}
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: 18,
              padding: '2px 8px',
            }}
          >
            x
          </button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={labelStyle}>Server Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Auth API"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Port *</label>
            <input
              value={port}
              onChange={(e) => setPort(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 8080"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Start Command *</label>
            <input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="e.g. npm run dev or node server.js"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Working Directory</label>
            <input
              value={cwd}
              onChange={(e) => setCwd(e.target.value)}
              placeholder="e.g. /Users/daniel/project (optional)"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Health Check URL</label>
            <input
              value={healthCheckUrl}
              onChange={(e) => setHealthCheckUrl(e.target.value)}
              placeholder="e.g. http://localhost:8080/health (optional)"
              style={inputStyle}
            />
          </div>
        </div>

        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid #333',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: '#333333',
              border: '1px solid #333',
              borderRadius: 4,
              color: '#9ca3af',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            style={{
              padding: '8px 16px',
              background: isValid ? '#3b82f6' : '#1e3a5f',
              border: 'none',
              borderRadius: 4,
              color: isValid ? '#fff' : '#6b7280',
              fontSize: 13,
              fontWeight: 600,
              cursor: isValid ? 'pointer' : 'not-allowed',
            }}
          >
            {editTarget ? 'Save' : 'Add Server'}
          </button>
        </div>
      </div>
    </div>
  )
}
