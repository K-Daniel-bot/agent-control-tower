'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { MemoryDashboardData } from '@/types/memory'
import MemoryOverview from './MemoryOverview'
import MemoryFileList from './MemoryFileList'
import MemoryViewer from './MemoryViewer'
import SessionHistory from './SessionHistory'

type RightTab = 'viewer' | 'sessions'

const EMPTY_DATA: MemoryDashboardData = {
  projects: [],
  sessions: [],
  totalMemoryFiles: 0,
  totalSessions: 0,
  totalSizeBytes: 0,
}

export default function MemoryDashboard() {
  const [data, setData] = useState<MemoryDashboardData>(EMPTY_DATA)
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [selectedFileName, setSelectedFileName] = useState('')
  const [rightTab, setRightTab] = useState<RightTab>('viewer')
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => { mountedRef.current = false }
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/memory')
      const json = await res.json()
      if (!mountedRef.current) return
      setData(json)
      setLoading(false)
    } catch {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleSelectFile = useCallback((filePath: string) => {
    setSelectedFile(filePath)
    setRightTab('viewer')
    const parts = filePath.split('/')
    setSelectedFileName(parts[parts.length - 1] ?? filePath)
  }, [])

  const handleSelectProject = useCallback((projectDir: string) => {
    setSelectedProject((prev) => (prev === projectDir ? null : projectDir))
  }, [])

  const selectedProjectName = selectedProject
    ? data.projects.find((p) => p.projectDir === selectedProject)?.projectName ?? null
    : null

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#000000',
        color: '#e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* 상단 툴바 */}
      <div
        style={{
          padding: '10px 20px',
          borderBottom: '1px solid #333333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.02em' }}>
            에이전트 메모리
          </span>
          <div style={{ fontSize: 11, color: '#6b7280' }}>
            CLI 에이전트 메모리 저장소
          </div>
        </div>
        <button
          onClick={fetchData}
          style={{
            padding: '6px 12px',
            background: '#000000',
            border: '1px solid #333333',
            borderRadius: 4,
            color: '#9ca3af',
            fontSize: 11,
            cursor: 'pointer',
          }}
        >
          새로고침
        </button>
      </div>

      {/* 통계 개요 */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #333333', flexShrink: 0 }}>
        {loading ? (
          <div style={{ fontSize: 12, color: '#555', padding: 8 }}>에이전트 메모리 스캔 중...</div>
        ) : (
          <MemoryOverview data={data} />
        )}
      </div>

      {/* 메인: 좌측 프로젝트 목록 + 우측 뷰어 */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* 좌측: 프로젝트/파일 목록 */}
        <div
          style={{
            width: 360,
            borderRight: '1px solid #333333',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '8px 14px',
              borderBottom: '1px solid #333333',
              fontSize: 10,
              color: '#555',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            프로젝트 & 메모리 파일
          </div>
          <div style={{ flex: 1, overflow: 'auto' }}>
            {loading ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#555', fontSize: 12 }}>
                로딩 중...
              </div>
            ) : (
              <MemoryFileList
                projects={data.projects}
                selectedProject={selectedProject}
                selectedFile={selectedFile}
                onSelectProject={handleSelectProject}
                onSelectFile={handleSelectFile}
              />
            )}
          </div>
        </div>

        {/* 우측: 뷰어 또는 세션 이력 */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* 우측 탭 */}
          <div style={{ display: 'flex', borderBottom: '1px solid #333333', flexShrink: 0 }}>
            {([
              { key: 'viewer' as const, label: '메모리 뷰어' },
              { key: 'sessions' as const, label: `세션 이력${selectedProjectName ? ` (${selectedProjectName})` : ''}` },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setRightTab(tab.key)}
                style={{
                  padding: '8px 20px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: rightTab === tab.key ? '2px solid #f59e0b' : '2px solid transparent',
                  color: rightTab === tab.key ? '#e5e7eb' : '#555',
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  letterSpacing: '0.03em',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: 'hidden' }}>
            {rightTab === 'viewer' ? (
              <MemoryViewer filePath={selectedFile} fileName={selectedFileName} />
            ) : (
              <SessionHistory
                sessions={data.sessions}
                filterProject={selectedProjectName}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
