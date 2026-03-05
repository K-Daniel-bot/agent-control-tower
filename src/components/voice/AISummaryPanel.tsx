'use client'

import { useEffect, useState, useRef } from 'react'

interface AISummaryPanelProps {
  readonly text: string
  readonly onSummaryGenerated: (summary: string) => void
}

const MOCK_PREFIXES = [
  '\uD575\uC2EC \uB0B4\uC6A9: ',
  '\uC694\uC57D: ',
  '\uC8FC\uC694 \uD3EC\uC778\uD2B8: ',
  '\uACB0\uC815 \uC0AC\uD56D: ',
  '\uB17C\uC758 \uC694\uC810: ',
] as const

function generateMockSummary(text: string): string {
  const prefix = MOCK_PREFIXES[Math.floor(Math.random() * MOCK_PREFIXES.length)]
  const words = text.split(' ')
  const shortened =
    words.length > 8
      ? words.slice(0, 8).join(' ') + '...'
      : text
  return `${prefix}${shortened} \uC5D0 \uB300\uD55C \uB17C\uC758\uAC00 \uC9C4\uD589\uB428.`
}

export default function AISummaryPanel({ text, onSummaryGenerated }: AISummaryPanelProps) {
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const hasGenerated = useRef(false)

  useEffect(() => {
    if (hasGenerated.current) return
    hasGenerated.current = true

    const timer = setTimeout(() => {
      const generated = generateMockSummary(text)
      setSummary(generated)
      setIsLoading(false)
      onSummaryGenerated(generated)
    }, 1500)

    return () => clearTimeout(timer)
  }, [text, onSummaryGenerated])

  return (
    <div
      style={{
        marginTop: 6,
        padding: '8px 12px',
        borderLeft: '2px solid #00ff88',
        background: 'rgba(0, 255, 136, 0.03)',
        borderRadius: '0 4px 4px 0',
      }}
    >
      {isLoading ? (
        <span
          style={{
            fontSize: 11,
            color: '#888888',
            fontStyle: 'italic',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          AI \uC694\uC57D \uC0DD\uC131 \uC911...
        </span>
      ) : (
        <span
          style={{
            fontSize: 11,
            color: '#aaaaaa',
            fontStyle: 'italic',
            fontFamily: "'JetBrains Mono', monospace",
            lineHeight: 1.5,
          }}
        >
          {summary}
        </span>
      )}
    </div>
  )
}
