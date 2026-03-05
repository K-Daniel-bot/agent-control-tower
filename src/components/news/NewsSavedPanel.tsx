'use client'

import type { NewsArticle } from '@/types/news'
import NewsCard from './NewsCard'

interface NewsSavedPanelProps {
  articles: readonly NewsArticle[]
  onRemove: (article: NewsArticle) => void
}

export default function NewsSavedPanel({ articles, onRemove }: NewsSavedPanelProps) {
  if (articles.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#333', fontSize: 12 }}>
        저장된 뉴스가 없습니다
        <div style={{ fontSize: 10, color: '#555', marginTop: 6 }}>
          관심 있는 뉴스의 별표를 클릭해 저장하세요
        </div>
      </div>
    )
  }

  return (
    <div style={{ overflow: 'auto', height: '100%' }}>
      {articles.map((article) => (
        <NewsCard
          key={article.id}
          article={{ ...article, saved: true }}
          onSave={onRemove}
        />
      ))}
    </div>
  )
}
