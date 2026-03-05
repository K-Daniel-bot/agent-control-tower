'use client'

import { useState, useEffect } from 'react'

interface Note {
  readonly id: string
  readonly title: string
  readonly content: string
  readonly tags: readonly string[]
  readonly createdAt: number
  readonly updatedAt: number
}

interface AINotePanelProps {
  readonly onSendCommand: (cmd: string) => void
}

const STORAGE_KEY = 'act-notes'

function extractTags(content: string): readonly string[] {
  const matches = content.match(/#([a-zA-Z0-9가-힣_-]+)/g) ?? []
  const unique = Array.from(new Set(matches.map((m) => m.slice(1).toLowerCase())))
  return unique
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  return `${days}일 전`
}

function loadNotesFromStorage(): readonly Note[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed as Note[]
  } catch {
    return []
  }
}

function saveNotesToStorage(notes: readonly Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  } catch {
    // ignore storage errors
  }
}

function buildSendCommand(title: string, content: string): string {
  const safeTitle = title.replace(/"/g, '\\"')
  const lines = content.split('\n')
  const echoLines = lines
    .map((line) => `echo "${line.replace(/"/g, '\\"').replace(/\$/g, '\\$').replace(/`/g, '\\`')}"`)
    .join(' && ')
  return `echo "=== 프로젝트 노트: ${safeTitle} ===" && ${echoLines}`
}

export default function AINotesPanel({ onSendCommand }: AINotePanelProps) {
  const [notes, setNotes] = useState<readonly Note[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')

  // Hydrate from localStorage on mount only
  useEffect(() => {
    const stored = loadNotesFromStorage()
    setNotes(stored)
  }, [])

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null

  function handleSelectNote(noteId: string) {
    const note = notes.find((n) => n.id === noteId)
    if (!note) return
    setSelectedId(noteId)
    setEditTitle(note.title)
    setEditContent(note.content)
  }

  function handleNewNote() {
    const newNote: Note = {
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      title: '새 노트',
      content: '',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    const updated = [...notes, newNote]
    setNotes(updated)
    saveNotesToStorage(updated)
    setSelectedId(newNote.id)
    setEditTitle(newNote.title)
    setEditContent(newNote.content)
  }

  function handleSave() {
    if (!selectedId) return
    const tags = extractTags(editContent)
    const updated = notes.map((n) =>
      n.id === selectedId
        ? { ...n, title: editTitle, content: editContent, tags, updatedAt: Date.now() }
        : n
    )
    setNotes(updated)
    saveNotesToStorage(updated)
  }

  function handleDelete() {
    if (!selectedId) return
    const updated = notes.filter((n) => n.id !== selectedId)
    setNotes(updated)
    saveNotesToStorage(updated)
    setSelectedId(null)
    setEditTitle('')
    setEditContent('')
  }

  function handleSendToTerminal() {
    if (!selectedId) return
    const cmd = buildSendCommand(editTitle, editContent)
    onSendCommand(cmd)
  }

  const liveTagsFromEdit = selectedId ? extractTags(editContent) : []

  const containerStyle: React.CSSProperties = {
    width: 320,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: 'transparent',
    borderLeft: '1px solid #333333',
    overflow: 'hidden',
    flexShrink: 0,
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 10px',
    borderBottom: '1px solid #333333',
    flexShrink: 0,
  }

  const noteListStyle: React.CSSProperties = {
    maxHeight: 200,
    overflowY: 'auto',
    borderBottom: '1px solid #333333',
    flexShrink: 0,
  }

  const editorAreaStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    minHeight: 0,
  }

  const inputBaseStyle: React.CSSProperties = {
    background: 'transparent',
    border: '1px solid #333333',
    borderRadius: 4,
    color: '#e6edf3',
    fontSize: 11,
    outline: 'none',
    padding: '4px 8px',
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            AI 노트
          </span>
          <span
            style={{
              fontSize: 8,
              color: '#00ff88',
              background: 'rgba(0,255,136,0.1)',
              border: '1px solid rgba(0,255,136,0.25)',
              borderRadius: 8,
              padding: '0 5px',
            }}
          >
            {notes.length}
          </span>
        </div>
        <button
          onClick={handleNewNote}
          style={{
            width: 22,
            height: 22,
            background: 'rgba(0,255,136,0.08)',
            border: '1px solid rgba(0,255,136,0.3)',
            borderRadius: 4,
            color: '#00ff88',
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
          title="새 노트 추가"
        >
          +
        </button>
      </div>

      {/* Note list */}
      <div style={noteListStyle}>
        {notes.length === 0 && (
          <div
            style={{
              padding: '12px 10px',
              fontSize: 10,
              color: '#6b7280',
              textAlign: 'center',
            }}
          >
            + 버튼으로 노트를 추가하세요
          </div>
        )}
        {notes.map((note) => {
          const isSelected = note.id === selectedId
          return (
            <div
              key={note.id}
              onClick={() => handleSelectNote(note.id)}
              style={{
                padding: '6px 10px',
                borderBottom: '1px solid #000000',
                cursor: 'pointer',
                background: isSelected ? 'rgba(0,255,136,0.05)' : 'transparent',
                borderLeft: isSelected ? '2px solid #00ff88' : '2px solid transparent',
                transition: 'background 0.1s',
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: isSelected ? '#e6edf3' : '#9ca3af',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {note.title || '(제목 없음)'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                  {note.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 7,
                        color: '#00ff88',
                        background: 'rgba(0,255,136,0.08)',
                        border: '1px solid rgba(0,255,136,0.2)',
                        borderRadius: 3,
                        padding: '0 3px',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: 7, color: '#505661', flexShrink: 0, marginLeft: 4 }}>
                  {formatRelativeTime(note.updatedAt)}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Editor area */}
      <div style={editorAreaStyle}>
        {!selectedNote && (
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              color: '#505661',
              padding: 12,
              textAlign: 'center',
            }}
          >
            노트를 선택하거나 새 노트를 추가하세요
          </div>
        )}

        {selectedNote && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 10, gap: 8, overflow: 'hidden', minHeight: 0 }}>
            {/* Title input */}
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="노트 제목"
              style={{
                ...inputBaseStyle,
                width: '100%',
                boxSizing: 'border-box',
                fontWeight: 600,
                flexShrink: 0,
              }}
            />

            {/* Content textarea */}
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="#태그 를 사용하여 태그를 추가하세요&#10;&#10;예: #프로젝트 #메모"
              style={{
                ...inputBaseStyle,
                flex: 1,
                resize: 'none',
                fontFamily: 'monospace',
                fontSize: 10,
                lineHeight: 1.5,
                minHeight: 0,
              }}
            />

            {/* Live tag chips */}
            {liveTagsFromEdit.length > 0 && (
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', flexShrink: 0 }}>
                {liveTagsFromEdit.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontSize: 8,
                      color: '#00ff88',
                      background: 'rgba(0,255,136,0.1)',
                      border: '1px solid rgba(0,255,136,0.3)',
                      borderRadius: 10,
                      padding: '1px 6px',
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
              <button
                onClick={handleSave}
                style={{
                  flex: 1,
                  padding: '4px 0',
                  background: 'rgba(0,255,136,0.1)',
                  border: '1px solid rgba(0,255,136,0.35)',
                  borderRadius: 4,
                  color: '#00ff88',
                  fontSize: 9,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                저장
              </button>
              <button
                onClick={handleSendToTerminal}
                style={{
                  flex: 1,
                  padding: '4px 0',
                  background: 'rgba(59,130,246,0.1)',
                  border: '1px solid rgba(59,130,246,0.35)',
                  borderRadius: 4,
                  color: '#3b82f6',
                  fontSize: 9,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                터미널 전송
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: '4px 8px',
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  borderRadius: 4,
                  color: '#ef4444',
                  fontSize: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                  lineHeight: 1,
                  transition: 'all 0.15s',
                }}
                title="노트 삭제"
              >
                x
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
