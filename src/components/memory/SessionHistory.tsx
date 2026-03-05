'use client'

import type { SessionRecord } from '@/types/memory'

interface SessionHistoryProps {
  sessions: readonly SessionRecord[]
  filterProject: string | null
}

function formatTime(dateStr: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleTimeString('ko-KR', { hour12: false, hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(Date.now() - 86400000)
  if (d.toDateString() === today.toDateString()) return '오늘'
  if (d.toDateString() === yesterday.toDateString()) return '어제'
  return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

function duration(start: string, end?: string): string {
  if (!start || !end) return '-'
  const diff = new Date(end).getTime() - new Date(start).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '1분 미만'
  if (mins < 60) return `${mins}분`
  const hours = Math.floor(mins / 60)
  return `${hours}시간 ${mins % 60}분`
}

const PROJECT_COLORS: Record<string, string> = {
  'agent control tower': '#3b82f6',
  'MyHome': '#10b981',
  'Test': '#f59e0b',
  'Notion Orchestration Tool': '#8b5cf6',
  'claude-forge': '#ef4444',
  'daniel': '#6b7280',
}

function getProjectColor(name: string): string {
  return PROJECT_COLORS[name] ?? '#6b7280'
}

export default function SessionHistory({ sessions, filterProject }: SessionHistoryProps) {
  const filtered = filterProject
    ? sessions.filter((s) => s.projectName === filterProject)
    : sessions

  if (filtered.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#333', fontSize: 12 }}>
        세션을 찾을 수 없습니다
      </div>
    )
  }

  const groups = new Map<string, SessionRecord[]>()
  for (const s of filtered) {
    const dateKey = formatDate(s.startedAt)
    const existing = groups.get(dateKey) ?? []
    groups.set(dateKey, [...existing, s])
  }

  return (
    <div style={{ overflow: 'auto', height: '100%' }}>
      {Array.from(groups.entries()).map(([date, dateSessions]) => (
        <div key={date}>
          <div style={{ padding: '6px 14px', fontSize: 10, color: '#555', fontWeight: 600, letterSpacing: '0.05em', background: '#0a0a0a' }}>
            {date}
          </div>
          {dateSessions.map((session) => {
            const pColor = getProjectColor(session.projectName)
            const toolNames = [...new Set(session.toolUses.map((t) => t.toolName))].filter(Boolean)

            return (
              <div key={session.sessionId} style={{ padding: '8px 14px', borderBottom: '1px solid #1a1a1a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 9, padding: '1px 6px', background: `${pColor}15`, color: pColor, border: `1px solid ${pColor}33`, borderRadius: 3 }}>
                      {session.projectName}
                    </span>
                    {session.writeCount > 0 && (
                      <span style={{ fontSize: 9, color: '#f59e0b' }}>{session.writeCount}회 쓰기</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, fontSize: 10, color: '#555' }}>
                    <span>{formatTime(session.startedAt)}</span>
                    <span>{duration(session.startedAt, session.endedAt)}</span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>
                  {session.prompt || '(프롬프트 없음)'}
                </div>
                {toolNames.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {toolNames.slice(0, 8).map((tool) => (
                      <span key={tool} style={{ fontSize: 9, padding: '1px 5px', background: '#111111', border: '1px solid #333333', borderRadius: 2, color: '#6b7280' }}>
                        {tool}
                      </span>
                    ))}
                    {toolNames.length > 8 && <span style={{ fontSize: 9, color: '#555' }}>+{toolNames.length - 8}</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
