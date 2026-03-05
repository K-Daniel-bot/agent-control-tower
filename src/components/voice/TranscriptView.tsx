'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import type { Paragraph } from '@/types/voice'
import AISummaryPanel from './AISummaryPanel'

interface TranscriptViewProps {
  readonly paragraphs: readonly Paragraph[]
  readonly currentText: string
  readonly onSummaryGenerated?: (paragraphId: string, summary: string) => void
}

const CURSOR_KEYFRAMES = `
@keyframes blinkCursor {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
`

function formatTimestamp(ts: string): string {
  try {
    const d = new Date(ts)
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return ts
  }
}

export default function TranscriptView({
  paragraphs,
  currentText,
  onSummaryGenerated,
}: TranscriptViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [expandedIds, setExpandedIds] = useState<ReadonlySet<string>>(new Set())

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [paragraphs, currentText])

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleSummary = useCallback(
    (paragraphId: string, summary: string) => {
      if (onSummaryGenerated) {
        onSummaryGenerated(paragraphId, summary)
      }
    },
    [onSummaryGenerated]
  )

  const isEmpty = paragraphs.length === 0 && currentText.length === 0

  return (
    <div
      ref={scrollRef}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 20px',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      <style>{CURSOR_KEYFRAMES}</style>

      {isEmpty && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: '#555555',
            fontSize: 13,
          }}
        >
          녹음을 시작하면 여기에 텍스트가 표시됩니다
        </div>
      )}

      {paragraphs.map((p) => (
        <div key={p.id} style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            {/* Green left border for completed paragraphs */}
            <div
              style={{
                width: 3,
                minHeight: 20,
                alignSelf: 'stretch',
                background: '#00ff88',
                borderRadius: 2,
                opacity: 0.5,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              {/* Header: timestamp + speaker */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 4,
                }}
              >
                <span style={{ fontSize: 10, color: '#666666' }}>
                  {formatTimestamp(p.timestamp)}
                </span>
                {p.speaker && (
                  <span
                    style={{
                      fontSize: 10,
                      color: '#00ff88',
                      background: 'rgba(0, 255, 136, 0.08)',
                      padding: '1px 6px',
                      borderRadius: 8,
                    }}
                  >
                    {p.speaker}
                  </span>
                )}
                <button
                  onClick={() => toggleExpand(p.id)}
                  style={{
                    marginLeft: 'auto',
                    background: 'transparent',
                    border: 'none',
                    color: '#666666',
                    fontSize: 10,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    padding: '2px 6px',
                  }}
                >
                  {expandedIds.has(p.id) ? 'AI [-]' : 'AI [+]'}
                </button>
              </div>

              {/* Paragraph text */}
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: '#d4d4d4',
                  lineHeight: 1.7,
                  wordBreak: 'break-word',
                }}
              >
                {p.text}
              </p>

              {/* AI Summary */}
              {expandedIds.has(p.id) && (
                p.aiSummary ? (
                  <div
                    style={{
                      marginTop: 6,
                      padding: '8px 12px',
                      borderLeft: '2px solid #00ff88',
                      background: 'rgba(0, 255, 136, 0.03)',
                      borderRadius: '0 4px 4px 0',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: '#aaaaaa',
                        fontStyle: 'italic',
                        fontFamily: "'JetBrains Mono', monospace",
                        lineHeight: 1.5,
                      }}
                    >
                      {p.aiSummary}
                    </span>
                  </div>
                ) : (
                  <AISummaryPanel
                    text={p.text}
                    onSummaryGenerated={(summary) => handleSummary(p.id, summary)}
                  />
                )
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Current in-progress text */}
      {currentText.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 3,
                minHeight: 20,
                alignSelf: 'stretch',
                background: '#ffaa00',
                borderRadius: 2,
                opacity: 0.5,
                flexShrink: 0,
              }}
            />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 10, color: '#666666' }}>
                현재 입력 중...
              </span>
              <p
                style={{
                  margin: '4px 0 0 0',
                  fontSize: 13,
                  color: '#999999',
                  lineHeight: 1.7,
                  wordBreak: 'break-word',
                }}
              >
                {currentText}
                <span
                  style={{
                    display: 'inline-block',
                    width: 2,
                    height: 14,
                    background: '#00ff88',
                    marginLeft: 2,
                    verticalAlign: 'text-bottom',
                    animation: 'blinkCursor 1s step-end infinite',
                  }}
                />
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
