'use client'

import { useState, useEffect, useCallback } from 'react'
import type { NewsArticle, EventCategory } from '@/types/news'
import { CATEGORY_COLORS, EVENT_CATEGORIES, SEVERITY_COLORS } from '@/types/news'
import NewsWorldMap from './NewsWorldMap'
import EventStreamPanel from './EventStreamPanel'
import FinancialPanel from './FinancialPanel'
import PredictionPanel from './PredictionPanel'
import VideoPlayer from './VideoPlayer'
import ArticleDetailPopup from './ArticleDetailPopup'

type LeftTab = 'events' | 'tv' | 'finance' | 'prediction'

export default function NewsDashboard() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [savedArticles, setSavedArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [leftTab, setLeftTab] = useState<LeftTab>('events')
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number } | null>(null)
  const [lastUpdated, setLastUpdated] = useState('')

  const fetchNews = useCallback(() => {
    fetch('/api/news')
      .then((r) => r.json())
      .then((data) => {
        setArticles(data.articles ?? [])
        setLastUpdated(data.lastUpdated ?? '')
        setLoading(false)
      })
      .catch(() => { setLoading(false) })

    fetch('/api/news/save')
      .then((r) => r.json())
      .then((data) => { setSavedArticles(data.savedArticles ?? []) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetchNews()
    const interval = setInterval(fetchNews, 120000)
    return () => clearInterval(interval)
  }, [fetchNews])

  const handleSelectEvent = useCallback((article: NewsArticle) => {
    setSelectedEventId(article.id)
    setFlyTo({ lat: article.location.lat, lng: article.location.lng })
    // Clear flyTo after animation
    setTimeout(() => setFlyTo(null), 1500)
  }, [])

  const handleOpenArticle = useCallback((article: NewsArticle) => {
    setSelectedArticle(article)
  }, [])

  const handleSave = useCallback(async (article: NewsArticle) => {
    const action = article.saved ? 'remove' : 'save'
    try {
      const res = await fetch('/api/news/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article, action }),
      })
      const data = await res.json()
      setSavedArticles(data.savedArticles ?? [])
      setArticles((prev) =>
        prev.map((a) => (a.id === article.id ? { ...a, saved: !a.saved } : a))
      )
    } catch {
      // silent
    }
  }, [])

  // Stats
  const criticalCount = articles.filter((a) => a.severity === 'critical').length
  const catCounts: Partial<Record<EventCategory, number>> = {}
  for (const a of articles) {
    catCounts[a.category] = (catCounts[a.category] ?? 0) + 1
  }

  const LEFT_TABS: readonly { key: LeftTab; label: string; icon: string }[] = [
    { key: 'events', label: '이벤트', icon: '\u25C9' },
    { key: 'tv', label: 'TV', icon: '\u25B6' },
    { key: 'finance', label: '금융', icon: '\u25B2' },
    { key: 'prediction', label: '예측', icon: '\u25C8' },
  ]

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#000000',
        color: '#e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: "'JetBrains Mono', 'Fira Code', 'Menlo', monospace",
      }}
    >
      {/* Top status bar - intelligence style */}
      <div
        style={{
          padding: '6px 16px',
          borderBottom: '1px solid #1a2a3a',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
          background: '#000508',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 10px #00ff88', animation: 'pulse 2s infinite' }} />
            <span
              style={{
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: '0.1em',
                background: 'linear-gradient(90deg, #00ff88 0%, #06b6d4 25%, #3b82f6 50%, #8b5cf6 75%, #ef4444 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              GLOBAL EVENT MONITOR
            </span>
          </div>
          <div style={{ width: 1, height: 16, background: '#1a2a3a' }} />
          <span style={{ fontSize: 10, color: '#4a5568' }}>CLASSIFIED // LEVEL 5 ACCESS</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Category mini-stats */}
          <div style={{ display: 'flex', gap: 8 }}>
            {EVENT_CATEGORIES.slice(0, 6).map((cat) => (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: CATEGORY_COLORS[cat] }} />
                <span style={{ fontSize: 8, color: '#4a5568' }}>{cat}</span>
                <span style={{ fontSize: 8, color: CATEGORY_COLORS[cat], fontWeight: 700 }}>{catCounts[cat] ?? 0}</span>
              </div>
            ))}
          </div>

          <div style={{ width: 1, height: 16, background: '#1a2a3a' }} />

          {/* Critical alert */}
          {criticalCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444', animation: 'pulse 1s infinite' }} />
              <span style={{ fontSize: 9, color: '#ef4444', fontWeight: 700 }}>{criticalCount} CRITICAL</span>
            </div>
          )}

          <span style={{ fontSize: 9, color: '#4a5568' }}>
            {articles.length} EVENTS TRACKED
          </span>

          {lastUpdated && (
            <span style={{ fontSize: 9, color: '#333' }}>
              {new Date(lastUpdated).toLocaleTimeString('ko-KR', { hour12: false })}
            </span>
          )}

          <button
            onClick={fetchNews}
            style={{
              padding: '3px 10px',
              background: 'transparent',
              border: '1px solid #1a2a3a',
              borderRadius: 3,
              color: '#4a5568',
              fontSize: 9,
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            REFRESH
          </button>
        </div>
      </div>

      {/* Main content */}
      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#00ff88', marginBottom: 8, letterSpacing: '0.1em' }}>INITIALIZING...</div>
            <div style={{ fontSize: 10, color: '#333' }}>글로벌 이벤트 스트림 연결 중</div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Left panel */}
          <div
            style={{
              width: 340,
              display: 'flex',
              flexDirection: 'column',
              borderRight: '1px solid #1a2a3a',
              flexShrink: 0,
              overflow: 'hidden',
              background: '#000508',
            }}
          >
            {/* Left panel tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #1a2a3a', flexShrink: 0 }}>
              {LEFT_TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setLeftTab(tab.key)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    background: leftTab === tab.key ? '#0a1020' : 'transparent',
                    border: 'none',
                    borderBottom: leftTab === tab.key ? '2px solid #00ff88' : '2px solid transparent',
                    color: leftTab === tab.key ? '#00ff88' : '#333',
                    fontSize: 9,
                    fontWeight: 700,
                    cursor: 'pointer',
                    letterSpacing: '0.05em',
                    fontFamily: 'inherit',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <span style={{ fontSize: 12 }}>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Left panel content */}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              {leftTab === 'events' && (
                <EventStreamPanel
                  articles={articles}
                  onSelectEvent={handleSelectEvent}
                  selectedId={selectedEventId}
                />
              )}
              {leftTab === 'tv' && <VideoPlayer articles={articles} />}
              {leftTab === 'finance' && <FinancialPanel />}
              {leftTab === 'prediction' && <PredictionPanel />}
            </div>
          </div>

          {/* Center: World Map */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <NewsWorldMap
              articles={articles}
              onSelectArticle={handleOpenArticle}
              onFlyTo={flyTo}
            />
          </div>
        </div>
      )}

      {/* Article detail popup */}
      {selectedArticle && (
        <ArticleDetailPopup
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onSave={handleSave}
        />
      )}

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
