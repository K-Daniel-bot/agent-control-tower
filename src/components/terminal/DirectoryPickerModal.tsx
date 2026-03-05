'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

interface DirEntry {
  name: string
  path: string
  isDirectory: boolean
}

interface DirResponse {
  current: string
  parent: string
  entries: DirEntry[]
}

interface DirectoryPickerModalProps {
  onSelect: (path: string) => void
  onClose: () => void
}

export default function DirectoryPickerModal({ onSelect, onClose }: DirectoryPickerModalProps) {
  const [dir, setDir] = useState<DirResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [manualPath, setManualPath] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const loadDir = useCallback(async (dirPath?: string) => {
    setLoading(true)
    setError('')
    try {
      const params = dirPath ? `?path=${encodeURIComponent(dirPath)}` : ''
      const res = await fetch(`/api/fs${params}`)
      const data = await res.json() as DirResponse & { error?: string }
      if (!data.error) {
        setDir(data)
        setManualPath(data.current)
      } else {
        setError('폴더를 열 수 없습니다')
      }
    } catch {
      setError('서버 오류')
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadDir()
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [loadDir])

  const handleConfirm = useCallback(async (path?: string) => {
    const target = (path ?? manualPath).trim()
    if (!target) return

    try {
      const res = await fetch('/api/fs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: target }),
      })
      const data = await res.json() as { path?: string; error?: string }
      if (res.ok && data.path) {
        onSelect(data.path)
      } else {
        setError(data.error ?? '올바른 폴더 경로가 아닙니다')
      }
    } catch {
      setError('서버 오류가 발생했습니다')
    }
  }, [manualPath, onSelect])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleConfirm()
    if (e.key === 'Escape') onClose()
  }, [handleConfirm, onClose])

  const handleDrop = useCallback((e: React.DragEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.dataTransfer.getData('text/plain')
    if (text) {
      setManualPath(text.trim())
      setError('')
    }
  }, [])

  const currentSegments = (dir?.current ?? '').split('/').filter(Boolean)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        style={{
          width: 500,
          maxHeight: '80vh',
          background: '#000000',
          border: '1px solid #333333',
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
        }}
      >
        {/* Modal header */}
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid #333333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#e6edf3' }}>프로젝트 폴더 선택</div>
            <div style={{ fontSize: 9, color: '#505661', marginTop: 2 }}>
              폴더를 탐색하거나 경로를 직접 입력하세요
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 24, height: 24,
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 4,
              color: '#ef4444',
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {/* Path input */}
        <div style={{ padding: '10px 14px', borderBottom: '1px solid #333333', flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              ref={inputRef}
              type="text"
              value={manualPath}
              onChange={e => { setManualPath(e.target.value); setError('') }}
              onKeyDown={handleKeyDown}
              onDrop={handleDrop}
              onDragOver={e => e.preventDefault()}
              placeholder="/Users/내이름/my-project"
              style={{
                flex: 1,
                padding: '6px 10px',
                background: 'transparent',
                border: `1px solid ${error ? '#ef4444' : '#333333'}`,
                borderRadius: 5,
                color: '#e6edf3',
                fontSize: 11,
                outline: 'none',
                fontFamily: 'monospace',
              }}
            />
            <button
              onClick={() => loadDir(manualPath)}
              style={{
                padding: '6px 12px',
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.3)',
                borderRadius: 5,
                color: '#3b82f6',
                fontSize: 10,
                cursor: 'pointer',
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              이동
            </button>
          </div>
          {error && <div style={{ fontSize: 9, color: '#ef4444', marginTop: 4 }}>{error}</div>}
        </div>

        {/* Breadcrumb */}
        <div
          style={{
            padding: '6px 14px',
            display: 'flex',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
            borderBottom: '1px solid #333333',
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => loadDir('/')}
            style={{ fontSize: 9, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}
          >
            /
          </button>
          {currentSegments.map((seg, i) => {
            const path = '/' + currentSegments.slice(0, i + 1).join('/')
            return (
              <span key={path} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <button
                  onClick={() => loadDir(path)}
                  style={{
                    fontSize: 9,
                    color: i === currentSegments.length - 1 ? '#e6edf3' : '#6b7280',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontWeight: i === currentSegments.length - 1 ? 600 : 400,
                    padding: '0 2px',
                  }}
                >
                  {seg}
                </button>
                {i < currentSegments.length - 1 && (
                  <span style={{ fontSize: 8, color: '#374151' }}>/</span>
                )}
              </span>
            )
          })}
        </div>

        {/* Directory listing */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          {loading && (
            <div style={{ padding: '20px', textAlign: 'center', fontSize: 10, color: '#505661' }}>
              로딩 중...
            </div>
          )}

          {/* Go up */}
          {dir?.parent && (
            <div
              onClick={() => loadDir(dir.parent)}
              style={{
                padding: '8px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                borderBottom: '1px solid #000000',
                color: '#6b7280',
              }}
            >
              <span style={{ fontSize: 14 }}>↑</span>
              <span style={{ fontSize: 10 }}>상위 폴더</span>
            </div>
          )}

          {dir?.entries.filter(e => e.isDirectory).map(entry => (
            <div
              key={entry.path}
              style={{
                padding: '7px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                borderBottom: '1px solid rgba(42,48,66,0.3)',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(59,130,246,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              onClick={() => loadDir(entry.path)}
            >
              <span style={{ fontSize: 14, flexShrink: 0 }}>📁</span>
              <span style={{ fontSize: 10, color: '#e6edf3', flex: 1 }}>{entry.name}</span>
              <button
                onClick={e => { e.stopPropagation(); void handleConfirm(entry.path) }}
                style={{
                  padding: '2px 8px',
                  background: 'rgba(0,255,136,0.08)',
                  border: '1px solid rgba(0,255,136,0.25)',
                  borderRadius: 4,
                  color: '#00ff88',
                  fontSize: 8,
                  cursor: 'pointer',
                  fontWeight: 600,
                  flexShrink: 0,
                  opacity: 0,
                  transition: 'opacity 0.1s',
                }}
                className="select-btn"
              >
                선택
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 14px',
            borderTop: '1px solid #333333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            background: '#000000',
          }}
        >
          <div style={{ fontSize: 9, color: '#505661', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {dir?.current && <span style={{ fontFamily: 'monospace' }}>{dir.current}</span>}
          </div>
          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
            <button
              onClick={onClose}
              style={{
                padding: '6px 14px',
                background: '#000000',
                border: '1px solid #333333',
                borderRadius: 5,
                color: '#6b7280',
                fontSize: 10,
                cursor: 'pointer',
              }}
            >
              취소
            </button>
            <button
              onClick={() => void handleConfirm()}
              style={{
                padding: '6px 14px',
                background: 'rgba(0,255,136,0.12)',
                border: '1px solid rgba(0,255,136,0.35)',
                borderRadius: 5,
                color: '#00ff88',
                fontSize: 10,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              이 폴더 선택
            </button>
          </div>
        </div>
      </div>

      <style>{`
        div:hover .select-btn { opacity: 1 !important; }
      `}</style>
    </div>
  )
}
