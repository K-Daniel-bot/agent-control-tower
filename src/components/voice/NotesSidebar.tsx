'use client'

import { useState, useCallback } from 'react'
import type { MeetingNote } from '@/types/voice'

interface NotesSidebarProps {
  readonly notes: readonly MeetingNote[]
  readonly activeNoteId: string | null
  readonly onSelectNote: (id: string) => void
  readonly onDeleteNote: (id: string) => void
  readonly onNewNote: () => void
  readonly onRenameNote?: (id: string, newTitle: string) => void
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export default function NotesSidebar({
  notes,
  activeNoteId,
  onSelectNote,
  onDeleteNote,
  onNewNote,
  onRenameNote,
}: NotesSidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')

  const handleDelete = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      onDeleteNote(id)
    },
    [onDeleteNote]
  )

  const handleStartEdit = useCallback(
    (e: React.MouseEvent, id: string, currentTitle: string) => {
      e.stopPropagation()
      setEditingId(id)
      setEditingTitle(currentTitle)
    },
    []
  )

  const handleSaveEdit = useCallback(
    (id: string) => {
      if (onRenameNote && editingTitle.trim().length > 0) {
        onRenameNote(id, editingTitle.trim())
      }
      setEditingId(null)
      setEditingTitle('')
    },
    [editingTitle, onRenameNote]
  )

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditingTitle('')
  }, [])

  return (
    <div
      style={{
        width: 240,
        height: '100%',
        background: '#080808',
        borderRight: '1px solid #333333',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid #222222',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 12, color: '#888888', fontWeight: 600 }}>
          회의 노트
        </span>
        <button
          onClick={onNewNote}
          style={{
            padding: '4px 10px',
            background: 'transparent',
            border: '1px solid #333333',
            borderRadius: 4,
            color: '#00ff88',
            fontSize: 10,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          + \uC0C8 \uB178\uD2B8
        </button>
      </div>

      {/* Notes list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 0',
        }}
      >
        {notes.length === 0 && (
          <div
            style={{
              padding: '24px 16px',
              textAlign: 'center',
              color: '#555555',
              fontSize: 11,
            }}
          >
            저장된 노트가 없습니다
          </div>
        )}

        {notes.map((note) => (
          <div
            key={note.id}
            onClick={() => onSelectNote(note.id)}
            onMouseEnter={() => setHoveredId(note.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              padding: '10px 16px',
              cursor: 'pointer',
              background:
                activeNoteId === note.id
                  ? 'rgba(0, 255, 136, 0.06)'
                  : hoveredId === note.id
                    ? '#111111'
                    : 'transparent',
              borderLeft:
                activeNoteId === note.id
                  ? '2px solid #00ff88'
                  : '2px solid transparent',
              transition: 'all 0.15s ease',
              position: 'relative',
            }}
          >
            {editingId === note.id ? (
              <input
                autoFocus
                value={editingTitle}
                onChange={(e) => setEditingTitle(e.target.value)}
                onBlur={() => handleSaveEdit(note.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSaveEdit(note.id)
                  } else if (e.key === 'Escape') {
                    handleCancelEdit()
                  }
                }}
                style={{
                  width: '100%',
                  padding: '2px 4px',
                  background: '#1a1a1a',
                  border: '1px solid #00ff88',
                  borderRadius: 2,
                  color: '#e5e7eb',
                  fontSize: 12,
                  fontFamily: 'inherit',
                  outline: 'none',
                  marginBottom: 4,
                }}
              />
            ) : (
              <div
                onDoubleClick={(e) => handleStartEdit(e, note.id, note.title || '')}
                style={{
                  fontSize: 12,
                  color: activeNoteId === note.id ? '#e5e7eb' : '#aaaaaa',
                  marginBottom: 4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  paddingRight: 20,
                  cursor: 'text',
                }}
              >
                {note.title || '제목 없음'}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 10,
                color: '#666666',
              }}
            >
              <span>{formatDate(note.createdAt)}</span>
              <span>{note.paragraphs.length}개 문단</span>
            </div>

            {/* Delete button on hover */}
            {hoveredId === note.id && (
              <button
                onClick={(e) => handleDelete(e, note.id)}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  width: 18,
                  height: 18,
                  background: 'transparent',
                  border: '1px solid #444444',
                  borderRadius: 3,
                  color: '#888888',
                  fontSize: 10,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'inherit',
                }}
                title="\uC0AD\uC81C"
              >
                x
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
