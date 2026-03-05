'use client'

import { useState, useCallback } from 'react'
import type { Participant } from '@/types/voice'

interface ParticipantManagerProps {
  readonly participants: readonly Participant[]
  readonly onAdd: (name: string) => void
  readonly onSelect: (id: string) => void
  readonly activeId?: string
}

export default function ParticipantManager({
  participants,
  onAdd,
  onSelect,
  activeId,
}: ParticipantManagerProps) {
  const [inputValue, setInputValue] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = useCallback(() => {
    const trimmed = inputValue.trim()
    if (trimmed.length === 0) return
    onAdd(trimmed)
    setInputValue('')
    setIsAdding(false)
  }, [inputValue, onAdd])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleAdd()
      } else if (e.key === 'Escape') {
        setIsAdding(false)
        setInputValue('')
      }
    },
    [handleAdd]
  )

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
        padding: '8px 0',
      }}
    >
      {participants.map((p) => (
        <button
          key={p.id}
          onClick={() => onSelect(p.id)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            padding: '3px 10px',
            background: activeId === p.id ? p.color : 'transparent',
            border: `1px solid ${p.color}`,
            borderRadius: 12,
            color: activeId === p.id ? '#000000' : p.color,
            fontSize: 11,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: activeId === p.id ? '#000000' : p.color,
            }}
          />
          {p.name}
        </button>
      ))}

      {isAdding ? (
        <input
          autoFocus
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleAdd}
          placeholder="\uC774\uB984 \uC785\uB825"
          style={{
            padding: '3px 8px',
            background: '#111111',
            border: '1px solid #333333',
            borderRadius: 12,
            color: '#e5e7eb',
            fontSize: 11,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            outline: 'none',
            width: 80,
          }}
        />
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            background: 'transparent',
            border: '1px dashed #555555',
            borderRadius: '50%',
            color: '#888888',
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          +
        </button>
      )}
    </div>
  )
}
