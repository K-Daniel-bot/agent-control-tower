'use client'

import { useEffect, useRef } from 'react'

interface ServerLogViewerProps {
  logs: string[]
  serverName: string
  onClose: () => void
}

export default function ServerLogViewer({ logs, serverName, onClose }: ServerLogViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

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
          width: '80%',
          maxWidth: 900,
          maxHeight: '80vh',
          background: '#000000',
          border: '1px solid #333',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: '#e5e7eb' }}>
            {serverName} - Logs
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

        <div
          ref={scrollRef}
          style={{
            flex: 1,
            padding: 16,
            fontFamily: 'monospace',
            fontSize: 11,
            lineHeight: 1.6,
            overflowY: 'auto',
            background: '#000000',
            color: '#9ca3af',
            minHeight: 300,
          }}
        >
          {logs.length > 0 ? (
            logs.map((log, idx) => (
              <div key={idx} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                {log}
              </div>
            ))
          ) : (
            <div style={{ color: '#374151' }}>No logs available</div>
          )}
        </div>
      </div>
    </div>
  )
}
