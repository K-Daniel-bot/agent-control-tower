'use client'

import type { ProjectMemory } from '@/types/memory'

interface MemoryFileListProps {
  projects: readonly ProjectMemory[]
  selectedProject: string | null
  selectedFile: string | null
  onSelectProject: (projectDir: string) => void
  onSelectFile: (filePath: string) => void
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return '-'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  return `${days}일 전`
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  return `${(bytes / 1024).toFixed(1)}KB`
}

export default function MemoryFileList({
  projects,
  selectedProject,
  selectedFile,
  onSelectProject,
  onSelectFile,
}: MemoryFileListProps) {
  if (projects.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#333', fontSize: 12 }}>
        프로젝트를 찾을 수 없습니다
      </div>
    )
  }

  return (
    <div style={{ overflow: 'auto', height: '100%' }}>
      {projects.map((project) => {
        const isOpen = selectedProject === project.projectDir
        const hasMemory = project.files.length > 0

        return (
          <div key={project.projectDir}>
            <div
              onClick={() => onSelectProject(isOpen ? '' : project.projectDir)}
              style={{
                padding: '10px 14px',
                borderBottom: '1px solid #333333',
                cursor: 'pointer',
                background: isOpen ? '#0a0a0a' : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, color: isOpen ? '#e5e7eb' : '#555' }}>
                    {isOpen ? '\u25BE' : '\u25B8'}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#e5e7eb' }}>
                    {project.projectName}
                  </span>
                  {hasMemory && (
                    <span
                      style={{
                        fontSize: 9,
                        padding: '1px 6px',
                        background: '#00ff8815',
                        color: '#00ff88',
                        border: '1px solid #00ff8833',
                        borderRadius: 3,
                      }}
                    >
                      {project.files.length}개 파일
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 10, fontSize: 10, color: '#555' }}>
                  <span>{project.sessionCount}개 세션</span>
                  <span>{timeAgo(project.lastActivity)}</span>
                </div>
              </div>
              <div style={{ fontSize: 10, color: '#444', marginTop: 2, fontFamily: 'monospace' }}>
                {project.projectPath}
              </div>
            </div>

            {isOpen && (
              <div style={{ background: '#000000' }}>
                {project.files.length === 0 ? (
                  <div style={{ padding: '10px 14px 10px 36px', fontSize: 11, color: '#444' }}>
                    메모리 파일 없음 - 세션 로그만 존재
                  </div>
                ) : (
                  project.files.map((file) => (
                    <div
                      key={file.path}
                      onClick={() => onSelectFile(file.path)}
                      style={{
                        padding: '8px 14px 8px 36px',
                        borderBottom: '1px solid #1a1a1a',
                        cursor: 'pointer',
                        background: selectedFile === file.path ? '#111111' : 'transparent',
                        borderLeft: selectedFile === file.path ? '2px solid #3b82f6' : '2px solid transparent',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#e5e7eb', fontWeight: 500 }}>
                          {file.name}
                        </span>
                        <div style={{ display: 'flex', gap: 8, fontSize: 10, color: '#555' }}>
                          <span>{formatBytes(file.sizeBytes)}</span>
                          <span>{timeAgo(file.modifiedAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
