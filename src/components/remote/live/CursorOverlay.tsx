'use client'

import { useRemote } from '../context/RemoteContext'

const RESOLUTION = { width: 1920, height: 1080 }

const ACTION_COLORS: Record<string, string> = {
  idle: '#00ff88',
  moving: '#f59e0b',
  clicking: '#ef4444',
  typing: '#3b82f6',
  dragging: '#a855f7',
  scrolling: '#06b6d4',
}

const ACTION_LABELS: Record<string, string> = {
  idle: '대기',
  moving: '이동 중',
  clicking: '클릭',
  typing: '입력 중',
  dragging: '드래그',
  scrolling: '스크롤',
}

export default function CursorOverlay() {
  const { state } = useRemote()
  const { aiCursor } = state

  const xPercent = (aiCursor.x / RESOLUTION.width) * 100
  const yPercent = (aiCursor.y / RESOLUTION.height) * 100
  const color = ACTION_COLORS[aiCursor.action] ?? ACTION_COLORS.idle
  const label = ACTION_LABELS[aiCursor.action] ?? '대기'
  const isClicking = aiCursor.action === 'clicking'

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 5,
        overflow: 'hidden',
      }}
    >
      {/* Cursor */}
      <div
        style={{
          position: 'absolute',
          left: `${xPercent}%`,
          top: `${yPercent}%`,
          transition: 'left 0.15s ease-out, top 0.15s ease-out',
          zIndex: 6,
        }}
      >
        {/* Click pulse ring */}
        {isClicking && (
          <div
            style={{
              position: 'absolute',
              top: -12,
              left: -12,
              width: 24,
              height: 24,
              borderRadius: '50%',
              border: `2px solid ${color}`,
              animation: 'cursor-pulse 0.6s ease-out infinite',
            }}
          />
        )}

        {/* Arrow shape via CSS borders */}
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: `8px solid ${color}`,
            borderRight: '8px solid transparent',
            borderBottom: '14px solid transparent',
            borderTop: `14px solid ${color}`,
            filter: `drop-shadow(0 0 4px ${color})`,
            transform: 'rotate(-5deg)',
          }}
        />

        {/* Cursor trail dot */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: color,
            opacity: 0.4,
            filter: `blur(2px)`,
          }}
        />

        {/* Action label */}
        <div
          style={{
            position: 'absolute',
            top: 22,
            left: 14,
            whiteSpace: 'nowrap',
            fontSize: 10,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Menlo', monospace",
            color: '#000',
            background: color,
            padding: '2px 6px',
            borderRadius: 3,
            fontWeight: 600,
            boxShadow: `0 0 8px ${color}40`,
          }}
        >
          {label}
        </div>
      </div>

      {/* Keyframe animation for click pulse */}
      <style>{`
        @keyframes cursor-pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}
