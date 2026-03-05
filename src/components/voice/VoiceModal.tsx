'use client'

import { useCallback, useEffect } from 'react'
import VoiceMeetingDashboard from './VoiceMeetingDashboard'

interface VoiceModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function VoiceModal({ isOpen, onClose }: VoiceModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      {/* Modal container */}
      <div
        style={{
          width: '90vw',
          height: '85vh',
          maxWidth: 1200,
          background: '#000000',
          border: '1px solid #333333',
          borderRadius: 8,
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 28,
            height: 28,
            background: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid #333333',
            borderRadius: 4,
            color: '#888888',
            fontSize: 16,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10001,
          }}
        >
          ✕
        </button>

        {/* Dashboard */}
        <VoiceMeetingDashboard />
      </div>
    </div>
  )
}
