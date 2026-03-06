'use client'

import { useRef, useEffect } from 'react'
import { useRemote } from '../context/RemoteContext'
import { NocTheme } from '@/constants/nocTheme'
import CursorOverlay from './CursorOverlay'
import ActionIndicator from './ActionIndicator'

const FONT_FAMILY = "'JetBrains Mono', 'Fira Code', 'Menlo', monospace"

export default function LiveViewer() {
  const { state, screenMediaStream, startScreenCapture, stopScreenCapture } = useRemote()
  const { connectionStatus, screenStream } = state
  const isConnected = connectionStatus === 'connected'
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (screenMediaStream) {
      video.srcObject = screenMediaStream
    } else {
      video.srcObject = null
    }

    const track = screenMediaStream?.getVideoTracks()[0]
    const handleEnded = () => stopScreenCapture()

    track?.addEventListener('ended', handleEnded)
    return () => {
      track?.removeEventListener('ended', handleEnded)
    }
  }, [screenMediaStream, stopScreenCapture])

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      background: NocTheme.background, fontFamily: FONT_FAMILY,
      color: NocTheme.textPrimary, border: `1px solid ${NocTheme.border}`,
      borderRadius: 8, overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', borderBottom: `1px solid ${NocTheme.border}`, flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>실시간 화면 스트리밍</span>
          <StatusDot connected={isConnected} />
          <span style={{ fontSize: 11, color: isConnected ? '#00ff88' : NocTheme.textTertiary }}>
            {isConnected ? '연결' : '연결 끊김'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <InfoLabel label="FPS" value={String(screenStream.fps)} />
          <InfoLabel label="해상도" value={`${screenStream.resolution.width}x${screenStream.resolution.height}`} />
        </div>
      </div>

      {/* Screen Area */}
      <div style={{ position: 'relative', flex: 1, overflow: 'hidden', background: '#0d1117' }}>
        {screenMediaStream ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%', height: '100%',
                objectFit: 'contain', background: '#000',
              }}
            />
            <button
              onClick={stopScreenCapture}
              style={{
                position: 'absolute', top: 12, right: 12, zIndex: 5,
                padding: '6px 14px', fontSize: 11, fontFamily: FONT_FAMILY,
                background: 'rgba(239,68,68,0.9)', color: '#fff',
                border: 'none', borderRadius: 4, cursor: 'pointer',
              }}
            >
              화면 공유 중지
            </button>
          </>
        ) : (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 20,
          }}>
            <button
              onClick={startScreenCapture}
              style={{
                padding: '14px 32px', fontSize: 15, fontFamily: FONT_FAMILY,
                fontWeight: 600, background: 'transparent', color: '#00ff88',
                border: '2px solid #00ff88', borderRadius: 8, cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = 'rgba(0,255,136,0.1)' }}
              onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = 'transparent' }}
            >
              화면 공유 시작
            </button>
            <span style={{ fontSize: 12, color: NocTheme.textTertiary, textAlign: 'center', maxWidth: 320 }}>
              화면을 공유하면 AI가 실시간으로 화면을 확인합니다
            </span>
          </div>
        )}

        {/* Scanline overlay */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }} />

        {/* Action Indicator */}
        <ActionIndicator />

        {/* AI Cursor Overlay */}
        <CursorOverlay />

        {/* Disconnected overlay */}
        {!isConnected && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.8)', zIndex: 10,
          }}>
            <span style={{ fontSize: 16, color: NocTheme.textTertiary }}>
              화면 스트리밍 연결 대기 중...
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusDot({ connected }: { readonly connected: boolean }) {
  return (
    <span style={{
      width: 8, height: 8, borderRadius: '50%', display: 'inline-block',
      background: connected ? '#00ff88' : NocTheme.red,
      boxShadow: connected ? '0 0 6px rgba(0,255,136,0.6)' : '0 0 6px rgba(239,68,68,0.6)',
    }} />
  )
}

function InfoLabel({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <span style={{ fontSize: 11, color: NocTheme.textSecondary }}>
      <span style={{ color: NocTheme.textTertiary }}>{label}: </span>
      {value}
    </span>
  )
}
