'use client'

import { useState, useEffect, useCallback } from 'react'
import DirectoryPickerModal from './DirectoryPickerModal'

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

interface DirectoryPanelProps {
  onSelectDirectory: (path: string) => void
}

export default function DirectoryPanel({ onSelectDirectory }: DirectoryPanelProps) {
  const [dir, setDir] = useState<DirResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const loadDir = useCallback(async (dirPath?: string) => {
    setLoading(true)
    try {
      const params = dirPath ? `?path=${encodeURIComponent(dirPath)}` : ''
      const res = await fetch(`/api/fs${params}`)
      const data = await res.json()
      if (!data.error) {
        setDir(data)
      }
    } catch {
      // ignore
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadDir()
  }, [loadDir])

  const handleNavigate = useCallback((entry: DirEntry) => {
    if (entry.isDirectory) {
      loadDir(entry.path)
    }
  }, [loadDir])

  const handleGoUp = useCallback(() => {
    if (dir?.parent) {
      loadDir(dir.parent)
    }
  }, [dir, loadDir])

  const handleSelectProject = useCallback((entry: DirEntry) => {
    onSelectDirectory(entry.path)
  }, [onSelectDirectory])

  const handleModalSelect = useCallback((path: string) => {
    onSelectDirectory(path)
    loadDir(path)
    setShowModal(false)
  }, [onSelectDirectory, loadDir])

  const currentName = dir?.current.split('/').pop() || '~'

  return (
    <>
      <div
        style={{
          width: 220,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'transparent',
          borderRight: '1px solid #333333',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '8px 10px',
            borderBottom: '1px solid #333333',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              프로젝트 디렉토리
            </span>
            <button
              onClick={() => setShowModal(true)}
              title="폴더 선택 창 열기"
              style={{
                padding: '2px 8px',
                background: 'rgba(0,255,136,0.08)',
                border: '1px solid rgba(0,255,136,0.25)',
                borderRadius: 4,
                color: '#00ff88',
                fontSize: 8,
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.15s',
              }}
            >
              📁 업로드
            </button>
          </div>
          <div
            style={{
              fontSize: 8,
              color: '#505661',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={dir?.current}
          >
            {dir?.current}
          </div>
        </div>

        {/* Go up button */}
        <button
          onClick={handleGoUp}
          style={{
            padding: '4px 10px',
            background: 'transparent',
            border: 'none',
            borderBottom: '1px solid #000000',
            color: '#6b7280',
            fontSize: 9,
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            transition: 'background 0.15s',
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 11 }}>{'<'}</span> ../{currentName}
        </button>

        {/* Entries */}
        <div style={{ flex: 1, overflow: 'auto', padding: '2px 0' }}>
          {loading && (
            <div style={{ padding: '12px 10px', fontSize: 9, color: '#505661', textAlign: 'center' }}>
              로딩 중...
            </div>
          )}
          {dir?.entries.map((entry) => (
            <div
              key={entry.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 10px',
                cursor: 'pointer',
                transition: 'background 0.1s',
                borderBottom: '1px solid rgba(42,48,66,0.3)',
              }}
              onClick={() => entry.isDirectory ? handleNavigate(entry) : undefined}
              onDoubleClick={() => entry.isDirectory ? handleSelectProject(entry) : undefined}
            >
              <span style={{ fontSize: 11, flexShrink: 0, opacity: entry.isDirectory ? 1 : 0.5 }}>
                {entry.isDirectory ? '📁' : '📄'}
              </span>
              <span
                style={{
                  fontSize: 9,
                  color: entry.isDirectory ? '#e6edf3' : '#6b7280',
                  flex: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {entry.name}
              </span>
              {entry.isDirectory && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectProject(entry)
                  }}
                  style={{
                    padding: '1px 5px',
                    background: 'rgba(0,255,136,0.06)',
                    border: '1px solid rgba(0,255,136,0.2)',
                    borderRadius: 3,
                    color: '#00ff88',
                    fontSize: 7,
                    cursor: 'pointer',
                    flexShrink: 0,
                    opacity: 0.7,
                    transition: 'opacity 0.15s',
                  }}
                  title="이 프로젝트로 이동"
                >
                  CD
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Quick access */}
        <div
          style={{
            borderTop: '1px solid #333333',
            padding: '6px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 8, color: '#505661', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            바로가기
          </span>
          {['Home', 'Desktop'].map((label) => {
            const homePath = dir?.current.split('/').slice(0, 3).join('/') || ''
            const targetPath = label === 'Home' ? homePath : `${homePath}/Desktop`
            return (
              <button
                key={label}
                onClick={() => loadDir(targetPath)}
                style={{
                  padding: '2px 6px',
                  background: 'rgba(59,130,246,0.06)',
                  border: '1px solid rgba(59,130,246,0.15)',
                  borderRadius: 3,
                  color: '#3b82f6',
                  fontSize: 8,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {showModal && (
        <DirectoryPickerModal
          onSelect={handleModalSelect}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}
