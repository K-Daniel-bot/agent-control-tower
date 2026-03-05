'use client'

import { useEffect, useRef, useCallback } from 'react'

interface ShareMenuProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly onShare: (type: string) => void
}

const SHARE_OPTIONS = [
  { type: 'notion', label: '\uB178\uC158\uC5D0 \uC800\uC7A5\uD558\uAE30', icon: 'N' },
  { type: 'slack', label: '\uC2AC\uB799\uC73C\uB85C \uACF5\uC720\uD558\uAE30', icon: 'S' },
  { type: 'pdf', label: 'PDF \uB0B4\uBCF4\uB0B4\uAE30', icon: 'D' },
  { type: 'email', label: '\uC774\uBA54\uC77C\uB85C \uB0B4\uBCF4\uB0B4\uAE30', icon: 'M' },
  { type: 'link', label: '\uB9C1\uD06C \uBCF5\uC0AC', icon: 'L' },
] as const

export default function ShareMenu({ isOpen, onClose, onShare }: ShareMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, handleClickOutside])

  if (!isOpen) return null

  return (
    <div
      ref={menuRef}
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: 4,
        background: '#111111',
        border: '1px solid #333333',
        borderRadius: 6,
        padding: 4,
        minWidth: 200,
        zIndex: 100,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      {SHARE_OPTIONS.map((option) => (
        <button
          key={option.type}
          onClick={() => onShare(option.type)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '8px 12px',
            background: 'transparent',
            border: 'none',
            color: '#e5e7eb',
            fontSize: 12,
            fontFamily: 'inherit',
            cursor: 'pointer',
            borderRadius: 4,
            textAlign: 'left',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = '#222222'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          }}
        >
          <span
            style={{
              width: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#333333',
              borderRadius: 4,
              fontSize: 11,
              fontWeight: 700,
              color: '#00ff88',
            }}
          >
            {option.icon}
          </span>
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  )
}
