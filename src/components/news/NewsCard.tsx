'use client'

import type { NewsArticle } from '@/types/news'
import { CATEGORY_COLORS } from '@/types/news'

interface NewsCardProps {
  article: NewsArticle
  onSave: (article: NewsArticle) => void
  compact?: boolean
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  return `${days}일 전`
}

export default function NewsCard({ article, onSave, compact = false }: NewsCardProps) {
  const catColor = CATEGORY_COLORS[article.category]

  if (compact) {
    return (
      <div
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #1a1a1a',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 8,
            padding: '2px 5px',
            background: `${catColor}15`,
            color: catColor,
            border: `1px solid ${catColor}33`,
            borderRadius: 3,
            flexShrink: 0,
            marginTop: 2,
          }}
        >
          {article.category}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 11,
              color: '#e5e7eb',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {article.title}
          </div>
          <div style={{ fontSize: 9, color: '#555', marginTop: 2 }}>
            {article.source} · {timeAgo(article.publishedAt)}
          </div>
        </div>
        <button
          onClick={() => onSave(article)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: article.saved ? '#f59e0b' : '#333',
            fontSize: 14,
            padding: 0,
            flexShrink: 0,
          }}
          title={article.saved ? '저장 해제' : '저장'}
        >
          {article.saved ? '\u2605' : '\u2606'}
        </button>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '14px 16px',
        borderBottom: '1px solid #333333',
        transition: 'background 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 9,
              padding: '2px 6px',
              background: `${catColor}15`,
              color: catColor,
              border: `1px solid ${catColor}33`,
              borderRadius: 3,
            }}
          >
            {article.category}
          </span>
          <span style={{ fontSize: 10, color: '#555' }}>{article.source}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, color: '#555' }}>{timeAgo(article.publishedAt)}</span>
          <button
            onClick={() => onSave(article)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: article.saved ? '#f59e0b' : '#444',
              fontSize: 16,
              padding: 0,
              lineHeight: 1,
            }}
            title={article.saved ? '저장 해제' : '저장'}
          >
            {article.saved ? '\u2605' : '\u2606'}
          </button>
        </div>
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#e5e7eb',
          marginBottom: 6,
          lineHeight: 1.4,
        }}
      >
        {article.title}
      </div>
      <div
        style={{
          fontSize: 11,
          color: '#6b7280',
          lineHeight: 1.5,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}
      >
        {article.summary}
      </div>
    </div>
  )
}
