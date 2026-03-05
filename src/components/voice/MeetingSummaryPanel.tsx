'use client'

import { useState } from 'react'

interface MeetingSummaryPanelProps {
  title: string
  summary: string
  topics: readonly string[]
  actionItems: readonly string[]
  sentiment: string
  duration: string
  onClose: () => void
}

export default function MeetingSummaryPanel({
  title,
  summary,
  topics,
  actionItems,
  sentiment,
  duration,
  onClose,
}: MeetingSummaryPanelProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('summary')

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const sentimentColor =
    sentiment === '긍정적' ? '#00ff88' : sentiment === '부정적' ? '#ff6b6b' : '#ffaa00'

  return (
    <div
      style={{
        marginTop: 16,
        padding: '16px',
        background: 'rgba(0, 255, 136, 0.05)',
        border: '1px solid rgba(0, 255, 136, 0.2)',
        borderRadius: 6,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#00ff88', fontWeight: 600 }}>
            📋 회의 정리
          </span>
          <span
            style={{
              fontSize: 10,
              color: sentimentColor,
              padding: '2px 6px',
              background: `rgba(255, 255, 255, 0.05)`,
              borderRadius: 4,
              border: `1px solid ${sentimentColor}`,
            }}
          >
            {sentiment}
          </span>
          <span style={{ fontSize: 10, color: '#666666' }}>{duration}</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#666666',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'inherit',
            padding: 0,
          }}
        >
          ✕
        </button>
      </div>

      {/* Summary Section */}
      <div style={{ marginBottom: 8 }}>
        <button
          onClick={() => toggleSection('summary')}
          style={{
            width: '100%',
            padding: '8px 12px',
            background: expandedSection === 'summary' ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
            border: '1px solid rgba(0, 255, 136, 0.15)',
            borderRadius: 4,
            color: '#d4d4d4',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {expandedSection === 'summary' ? '▼' : '▶'} 요약
        </button>
        {expandedSection === 'summary' && (
          <div
            style={{
              marginTop: 6,
              padding: '8px 12px',
              background: 'rgba(0, 255, 136, 0.03)',
              borderRadius: 4,
              fontSize: 11,
              color: '#aaaaaa',
              lineHeight: 1.6,
            }}
          >
            {summary}
          </div>
        )}
      </div>

      {/* Topics Section */}
      {topics.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <button
            onClick={() => toggleSection('topics')}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: expandedSection === 'topics' ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
              border: '1px solid rgba(0, 255, 136, 0.15)',
              borderRadius: 4,
              color: '#d4d4d4',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {expandedSection === 'topics' ? '▼' : '▶'} 주요 주제 ({topics.length})
          </button>
          {expandedSection === 'topics' && (
            <div
              style={{
                marginTop: 6,
                padding: '8px 12px',
                background: 'rgba(0, 255, 136, 0.03)',
                borderRadius: 4,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
              }}
            >
              {topics.map((topic, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 10,
                    color: '#00ff88',
                    background: 'rgba(0, 255, 136, 0.1)',
                    padding: '2px 8px',
                    borderRadius: 3,
                    border: '1px solid rgba(0, 255, 136, 0.2)',
                  }}
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Items Section */}
      {actionItems.length > 0 && (
        <div>
          <button
            onClick={() => toggleSection('actions')}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: expandedSection === 'actions' ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
              border: '1px solid rgba(0, 255, 136, 0.15)',
              borderRadius: 4,
              color: '#d4d4d4',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {expandedSection === 'actions' ? '▼' : '▶'} 액션 아이템 ({actionItems.length})
          </button>
          {expandedSection === 'actions' && (
            <div
              style={{
                marginTop: 6,
                padding: '8px 12px',
                background: 'rgba(0, 255, 136, 0.03)',
                borderRadius: 4,
              }}
            >
              {actionItems.map((item, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 10,
                    color: '#aaaaaa',
                    marginBottom: i < actionItems.length - 1 ? 6 : 0,
                    paddingLeft: 12,
                    borderLeft: '2px solid #00ff88',
                    paddingTop: i === 0 ? 0 : 6,
                  }}
                >
                  {item.trim()}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
