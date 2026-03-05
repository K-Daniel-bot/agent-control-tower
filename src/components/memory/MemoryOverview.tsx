'use client'

import type { MemoryDashboardData } from '@/types/memory'

interface MemoryOverviewProps {
  data: MemoryDashboardData
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const statBox: React.CSSProperties = {
  flex: 1,
  padding: '10px 14px',
  background: '#000000',
  border: '1px solid #333333',
  borderRadius: 6,
}

export default function MemoryOverview({ data }: MemoryOverviewProps) {
  const projectsWithMemory = data.projects.filter((p) => p.files.length > 0).length

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={statBox}>
        <div style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>프로젝트</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#e5e7eb' }}>{data.projects.length}</div>
        <div style={{ fontSize: 10, color: '#6b7280' }}>{projectsWithMemory}개 메모리 보유</div>
      </div>
      <div style={statBox}>
        <div style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>메모리 파일</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#00ff88' }}>{data.totalMemoryFiles}</div>
        <div style={{ fontSize: 10, color: '#6b7280' }}>{formatBytes(data.totalSizeBytes)}</div>
      </div>
      <div style={statBox}>
        <div style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>세션</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#f59e0b' }}>{data.totalSessions}</div>
        <div style={{ fontSize: 10, color: '#6b7280' }}>{data.sessions.filter((s) => s.writeCount > 0).length}개 쓰기 작업</div>
      </div>
      <div style={statBox}>
        <div style={{ fontSize: 10, color: '#555', marginBottom: 4 }}>총 쓰기 횟수</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6' }}>{data.sessions.reduce((sum, s) => sum + s.writeCount, 0)}</div>
        <div style={{ fontSize: 10, color: '#6b7280' }}>전체 세션 합산</div>
      </div>
    </div>
  )
}
