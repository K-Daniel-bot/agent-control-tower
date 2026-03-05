'use client'

import { useState, useMemo, useCallback } from 'react'
import type { NewsArticle, EventCategory, NewsSeverity } from '@/types/news'
import {
  EVENT_CATEGORIES,
  CATEGORY_COLORS,
  SEVERITY_COLORS,
  CATEGORY_ICONS,
} from '@/types/news'

interface EventStreamPanelProps {
  readonly articles: readonly NewsArticle[]
  readonly onSelectEvent: (article: NewsArticle) => void
  readonly selectedId: string | null
}

const ALL_SEVERITIES: readonly NewsSeverity[] = ['critical', 'high', 'medium', 'low']

const SEVERITY_LABELS: Record<NewsSeverity, string> = {
  critical: '긴급',
  high: '높음',
  medium: '보통',
  low: '낮음',
}

const COUNTRY_FLAGS: Record<string, string> = {
  US: '\u{1F1FA}\u{1F1F8}',
  KR: '\u{1F1F0}\u{1F1F7}',
  CN: '\u{1F1E8}\u{1F1F3}',
  JP: '\u{1F1EF}\u{1F1F5}',
  GB: '\u{1F1EC}\u{1F1E7}',
  DE: '\u{1F1E9}\u{1F1EA}',
  FR: '\u{1F1EB}\u{1F1F7}',
  RU: '\u{1F1F7}\u{1F1FA}',
  IN: '\u{1F1EE}\u{1F1F3}',
  TW: '\u{1F1F9}\u{1F1FC}',
  IL: '\u{1F1EE}\u{1F1F1}',
  UA: '\u{1F1FA}\u{1F1E6}',
  SA: '\u{1F1F8}\u{1F1E6}',
  BR: '\u{1F1E7}\u{1F1F7}',
  AU: '\u{1F1E6}\u{1F1FA}',
  CA: '\u{1F1E8}\u{1F1E6}',
}

function getCountryFlag(countryCode: string): string {
  return COUNTRY_FLAGS[countryCode] ?? countryCode
}

function timeAgo(dateString: string): string {
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diffSeconds = Math.floor((now - then) / 1000)

  if (diffSeconds < 60) return `${diffSeconds}초 전`
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes}분 전`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}시간 전`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}일 전`
  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths}개월 전`
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

export default function EventStreamPanel({
  articles,
  onSelectEvent,
  selectedId,
}: EventStreamPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<EventCategory | 'ALL'>('ALL')
  const [activeSeverities, setActiveSeverities] = useState<ReadonlySet<NewsSeverity>>(
    new Set(ALL_SEVERITIES)
  )

  const handleSeverityToggle = useCallback((severity: NewsSeverity) => {
    setActiveSeverities((prev) => {
      const next = new Set(prev)
      if (next.has(severity)) {
        next.delete(severity)
      } else {
        next.add(severity)
      }
      return next
    })
  }, [])

  const handleCategorySelect = useCallback((category: EventCategory | 'ALL') => {
    setActiveCategory(category)
  }, [])

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value)
    },
    []
  )

  const filteredArticles = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()

    const filtered = articles.filter((article) => {
      if (activeCategory !== 'ALL' && article.category !== activeCategory) return false
      if (!activeSeverities.has(article.severity)) return false
      if (query) {
        const matchesTitle = article.title.toLowerCase().includes(query)
        const matchesTags = article.tags.some((tag) =>
          tag.toLowerCase().includes(query)
        )
        if (!matchesTitle && !matchesTags) return false
      }
      return true
    })

    return [...filtered].sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
  }, [articles, activeCategory, activeSeverities, searchQuery])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: articles.length }
    for (const article of articles) {
      counts[article.category] = (counts[article.category] ?? 0) + 1
    }
    return counts
  }, [articles])

  return (
    <div
      style={{
        background: '#000000',
        border: '1px solid #333333',
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Scanline overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,70,0.015) 2px, rgba(0,255,70,0.015) 4px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Header */}
      <div
        style={{
          padding: '10px 12px 6px',
          borderBottom: '1px solid #333333',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#00ff46',
              boxShadow: '0 0 6px #00ff46',
              display: 'inline-block',
            }}
          />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#00ff46',
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            EVENT STREAM
          </span>
          <span
            style={{
              fontSize: 9,
              color: '#555',
              marginLeft: 'auto',
            }}
          >
            {filteredArticles.length}/{articles.length} 이벤트
          </span>
        </div>

        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="이벤트 검색 (제목/태그)..."
          style={{
            width: '100%',
            padding: '5px 8px',
            fontSize: 10,
            fontFamily: 'inherit',
            background: '#0a0a0a',
            border: '1px solid #333333',
            borderRadius: 3,
            color: '#9ca3af',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />

        {/* Category filter tabs */}
        <div
          style={{
            display: 'flex',
            gap: 3,
            flexWrap: 'wrap',
            marginTop: 8,
          }}
        >
          <button
            onClick={() => handleCategorySelect('ALL')}
            style={{
              padding: '2px 8px',
              fontSize: 9,
              fontWeight: 600,
              fontFamily: 'inherit',
              background: activeCategory === 'ALL' ? '#1a1a1a' : 'transparent',
              border: `1px solid ${activeCategory === 'ALL' ? '#00ff46' : '#333333'}`,
              borderRadius: 2,
              color: activeCategory === 'ALL' ? '#00ff46' : '#555',
              cursor: 'pointer',
            }}
          >
            ALL ({categoryCounts['ALL'] ?? 0})
          </button>
          {EVENT_CATEGORIES.map((cat) => {
            const color = CATEGORY_COLORS[cat]
            const isActive = activeCategory === cat
            return (
              <button
                key={cat}
                onClick={() => handleCategorySelect(cat)}
                style={{
                  padding: '2px 8px',
                  fontSize: 9,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  background: isActive ? `${color}15` : 'transparent',
                  border: `1px solid ${isActive ? color : '#333333'}`,
                  borderRadius: 2,
                  color: isActive ? color : '#555',
                  cursor: 'pointer',
                }}
              >
                {CATEGORY_ICONS[cat]} {cat}
                {categoryCounts[cat] ? ` (${categoryCounts[cat]})` : ''}
              </button>
            )
          })}
        </div>

        {/* Severity toggles */}
        <div
          style={{
            display: 'flex',
            gap: 4,
            marginTop: 6,
          }}
        >
          {ALL_SEVERITIES.map((sev) => {
            const isActive = activeSeverities.has(sev)
            const color = SEVERITY_COLORS[sev]
            return (
              <button
                key={sev}
                onClick={() => handleSeverityToggle(sev)}
                style={{
                  padding: '2px 7px',
                  fontSize: 9,
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  background: isActive ? `${color}20` : 'transparent',
                  border: `1px solid ${isActive ? color : '#222'}`,
                  borderRadius: 2,
                  color: isActive ? color : '#444',
                  cursor: 'pointer',
                  opacity: isActive ? 1 : 0.5,
                  textDecoration: isActive ? 'none' : 'line-through',
                }}
              >
                {SEVERITY_LABELS[sev]}
              </button>
            )
          })}
        </div>
      </div>

      {/* Event list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {filteredArticles.length === 0 && (
          <div
            style={{
              padding: 24,
              textAlign: 'center',
              color: '#444',
              fontSize: 10,
            }}
          >
            일치하는 이벤트 없음
          </div>
        )}

        {filteredArticles.map((article) => {
          const isSelected = article.id === selectedId
          const isCritical = article.severity === 'critical'
          const categoryColor = CATEGORY_COLORS[article.category]
          const severityColor = SEVERITY_COLORS[article.severity]

          return (
            <button
              key={article.id}
              onClick={() => onSelectEvent(article)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '7px 12px',
                background: isSelected ? '#0d1117' : 'transparent',
                borderLeft: isSelected
                  ? `3px solid ${categoryColor}`
                  : '3px solid transparent',
                borderTop: 'none',
                borderRight: 'none',
                borderBottom: '1px solid #1a1a1a',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLElement).style.background = '#0a0f0a'
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                }
              }}
            >
              {/* Severity dot */}
              <span
                style={{
                  width: 6,
                  height: 6,
                  minWidth: 6,
                  borderRadius: '50%',
                  background: severityColor,
                  boxShadow: isCritical ? `0 0 6px ${severityColor}` : 'none',
                  animation: isCritical ? 'criticalBlink 1s infinite' : 'none',
                }}
              />

              {/* Category icon */}
              <span
                style={{
                  fontSize: 10,
                  color: categoryColor,
                  minWidth: 14,
                  textAlign: 'center',
                }}
              >
                {CATEGORY_ICONS[article.category]}
              </span>

              {/* Timestamp */}
              <span
                style={{
                  fontSize: 9,
                  color: '#555',
                  minWidth: 52,
                  whiteSpace: 'nowrap',
                }}
              >
                {timeAgo(article.publishedAt)}
              </span>

              {/* Title */}
              <span
                style={{
                  fontSize: 10,
                  color: isSelected ? '#e5e7eb' : '#9ca3af',
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  lineHeight: 1.3,
                }}
              >
                {truncate(article.title, 60)}
              </span>

              {/* Country flag */}
              <span
                style={{
                  fontSize: 10,
                  minWidth: 20,
                  textAlign: 'center',
                }}
              >
                {getCountryFlag(article.location.countryCode)}
              </span>
            </button>
          )
        })}
      </div>

      {/* Critical blink animation */}
      <style>{`
        @keyframes criticalBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
