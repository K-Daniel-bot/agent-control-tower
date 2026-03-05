'use client'

import type { NewsArticle } from '@/types/news'
import { CATEGORY_COLORS } from '@/types/news'

interface NewsTickerBarProps {
  articles: readonly NewsArticle[]
}

export default function NewsTickerBar({ articles }: NewsTickerBarProps) {
  const breaking = articles.slice(0, 8)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 16px',
        borderBottom: '1px solid #333333',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          fontSize: 9,
          fontWeight: 700,
          padding: '2px 8px',
          background: '#ef444420',
          color: '#ef4444',
          border: '1px solid #ef444440',
          borderRadius: 3,
          flexShrink: 0,
          letterSpacing: '0.05em',
        }}
      >
        BREAKING
      </span>
      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          gap: 24,
        }}
      >
        {breaking.map((article) => (
          <span key={article.id} style={{ fontSize: 10, color: '#9ca3af', flexShrink: 0 }}>
            <span style={{ color: CATEGORY_COLORS[article.category], marginRight: 4 }}>[{article.category}]</span>
            {article.title}
          </span>
        ))}
      </div>
    </div>
  )
}
