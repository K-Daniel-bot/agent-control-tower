'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

interface VoiceRecorderProps {
  readonly onTranscript: (text: string, isFinal: boolean) => void
  readonly isRecording: boolean
  readonly onToggleRecord: () => void
}

interface SpeechRecognitionEvent {
  readonly results: SpeechRecognitionResultList
  readonly resultIndex: number
}

interface SpeechRecognitionErrorEvent {
  readonly error: string
}

function addPunctuation(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return trimmed

  // 이미 구두점으로 끝나면 그대로
  if (/[.!?。]$/.test(trimmed)) return trimmed

  // 의문문 패턴: ~인가요, ~습니까, ~나요
  if (/[인나요습니까까]$/.test(trimmed)) return trimmed + '?'

  // 기본: 마침표
  return trimmed + '.'
}

const BAR_COUNT = 24
const PULSE_KEYFRAMES = `
@keyframes voicePulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 50, 50, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(255, 50, 50, 0); }
}
`

export default function VoiceRecorder({
  onTranscript,
  isRecording,
  onToggleRecord,
}: VoiceRecorderProps) {
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null)
  const [bars, setBars] = useState<readonly number[]>(
    Array.from({ length: BAR_COUNT }, () => 4)
  )
  const [micSupported, setMicSupported] = useState(true)
  const animFrameRef = useRef<number>(0)

  const createRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    if (!SpeechRecognition) {
      setMicSupported(false)
      return null
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new (SpeechRecognition as any)()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'ko-KR'
    return recognition
  }, [])

  useEffect(() => {
    if (!isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch {
          // already stopped
        }
        recognitionRef.current = null
      }
      cancelAnimationFrame(animFrameRef.current)
      setBars(Array.from({ length: BAR_COUNT }, () => 4))
      return
    }

    const recognition = createRecognition()
    if (!recognition) return

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const results = event.results
      for (let i = event.resultIndex; i < results.length; i++) {
        let transcript = results[i][0].transcript
        const isFinal = results[i].isFinal

        // Add punctuation to final transcripts
        if (isFinal) {
          transcript = addPunctuation(transcript)
        }

        onTranscript(transcript, isFinal)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error)
      }
    }

    recognition.onend = () => {
      if (isRecording && recognitionRef.current) {
        try {
          recognition.start()
        } catch {
          // ignore restart errors
        }
      }
    }

    try {
      recognition.start()
      recognitionRef.current = recognition
    } catch {
      // already started
    }

    return () => {
      try {
        recognition.stop()
      } catch {
        // already stopped
      }
      recognitionRef.current = null
    }
  }, [isRecording, onTranscript, createRecognition])

  // Waveform animation
  useEffect(() => {
    if (!isRecording) return

    const animate = () => {
      setBars((prev) =>
        prev.map(() => Math.floor(Math.random() * 28) + 4)
      )
      animFrameRef.current = requestAnimationFrame(() => {
        setTimeout(() => {
          animFrameRef.current = requestAnimationFrame(animate)
        }, 80)
      })
    }
    animFrameRef.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animFrameRef.current)
  }, [isRecording])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <style>{PULSE_KEYFRAMES}</style>

      {/* Record button */}
      <button
        onClick={onToggleRecord}
        disabled={!micSupported}
        style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: isRecording ? '#ff3232' : '#cc2222',
          border: isRecording ? '2px solid #ff6666' : '2px solid #993333',
          cursor: micSupported ? 'pointer' : 'not-allowed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: isRecording ? 'voicePulse 1.5s ease-in-out infinite' : 'none',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
        title={isRecording ? '녹음 중지' : '녹음 시작'}
      >
        {isRecording ? (
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              background: '#ffffff',
            }}
          />
        ) : (
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#ffffff',
            }}
          />
        )}
      </button>

      {/* Mic check */}
      <button
        onClick={() => {
          if (navigator.mediaDevices) {
            navigator.mediaDevices
              .getUserMedia({ audio: true })
              .then((stream) => {
                stream.getTracks().forEach((t) => t.stop())
                setMicSupported(true)
              })
              .catch(() => setMicSupported(false))
          }
        }}
        style={{
          width: 28,
          height: 28,
          borderRadius: 4,
          background: 'transparent',
          border: '1px solid #333333',
          color: micSupported ? '#00ff88' : '#ff4444',
          cursor: 'pointer',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'JetBrains Mono', monospace",
          flexShrink: 0,
        }}
        title="마이크 확인"
      >
        {micSupported ? 'M' : '!'}
      </button>

      {/* Waveform */}
      {isRecording && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            height: 32,
            padding: '0 8px',
          }}
        >
          {bars.map((height, i) => (
            <div
              key={i}
              style={{
                width: 2,
                height,
                background: '#00ff88',
                borderRadius: 1,
                transition: 'height 0.08s ease',
                opacity: 0.7 + (height / 32) * 0.3,
              }}
            />
          ))}
        </div>
      )}

      {!micSupported && (
        <span
          style={{
            fontSize: 10,
            color: '#ff4444',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          마이크 미지원
        </span>
      )}
    </div>
  )
}
