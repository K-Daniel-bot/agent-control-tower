'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  NewsArticle,
  CATEGORY_COLORS,
  SEVERITY_COLORS,
  EventCategory,
  NewsSeverity,
} from '@/types/news'

interface ArticleDetailPopupProps {
  readonly article: NewsArticle | null
  readonly onClose: () => void
  readonly onSave: (article: NewsArticle) => void
}

const SEVERITY_LABELS: Record<NewsSeverity, string> = {
  critical: 'CRITICAL',
  high: 'HIGH',
  medium: 'MEDIUM',
  low: 'LOW',
}

const SENTIMENT_LABELS: Record<string, { text: string; color: string; icon: string }> = {
  positive: { text: '긍정적', color: '#00ff88', icon: '▲' },
  negative: { text: '부정적', color: '#ef4444', icon: '▼' },
  neutral: { text: '중립', color: '#6b7280', icon: '●' },
}

const IMPACT_LABELS: Record<NewsSeverity, string> = {
  critical: '극심',
  high: '높음',
  medium: '보통',
  low: '낮음',
}

function getTimeAgo(dateString: string): string {
  const now = new Date()
  const published = new Date(dateString)
  const diffMs = now.getTime() - published.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) return '방금 전'
  if (diffMinutes < 60) return `${diffMinutes}분 전`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}시간 전`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}일 전`

  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 4) return `${diffWeeks}주 전`

  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths}개월 전`
}

function generateMockAnalysis(): {
  sentiment: 'positive' | 'negative' | 'neutral'
  impact: NewsSeverity
  keywords: readonly string[]
} {
  const sentiments = ['positive', 'negative', 'neutral'] as const
  const impacts: readonly NewsSeverity[] = ['critical', 'high', 'medium', 'low']
  const keywordPool = [
    '지정학적 리스크', '기술 혁신', '시장 변동성', '공급망',
    '규제 변화', '인프라', 'AI 영향', '사이버 위협',
    '기후 정책', '외교 관계', '경제 전망', '에너지 전환',
  ]

  const selectedKeywords = keywordPool
    .sort(() => Math.random() - 0.5)
    .slice(0, 3 + Math.floor(Math.random() * 3))

  return {
    sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
    impact: impacts[Math.floor(Math.random() * impacts.length)],
    keywords: selectedKeywords,
  }
}

export default function ArticleDetailPopup({
  article,
  onClose,
  onSave,
}: ArticleDetailPopupProps) {
  const [analysisState, setAnalysisState] = useState<'idle' | 'loading' | 'complete'>('idle')
  const [analysis, setAnalysis] = useState<{
    sentiment: 'positive' | 'negative' | 'neutral'
    impact: NewsSeverity
    keywords: readonly string[]
  } | null>(null)

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose],
  )

  useEffect(() => {
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('keydown', handleEscape)
    }
  }, [handleEscape])

  useEffect(() => {
    setAnalysisState('idle')
    setAnalysis(null)
  }, [article?.id])

  const handleAnalysisRequest = useCallback(() => {
    if (analysisState !== 'idle') return
    setAnalysisState('loading')

    const timer = setTimeout(() => {
      setAnalysis(generateMockAnalysis())
      setAnalysisState('complete')
    }, 2000)

    return () => clearTimeout(timer)
  }, [analysisState])

  const handleSave = useCallback(() => {
    if (!article) return
    onSave(article)
  }, [article, onSave])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose],
  )

  if (!article) return null

  const categoryColor = CATEGORY_COLORS[article.category]
  const severityColor = SEVERITY_COLORS[article.severity]

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 700,
          maxHeight: '80vh',
          backgroundColor: '#000000',
          border: '1px solid #333333',
          borderRadius: 4,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* CLASSIFIED watermark */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-35deg)',
            fontSize: 72,
            fontWeight: 900,
            color: 'rgba(255, 255, 255, 0.03)',
            letterSpacing: 16,
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            zIndex: 0,
          }}
        >
          CLASSIFIED
        </div>

        {/* Header bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid #333333',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: '#000',
                backgroundColor: severityColor,
                padding: '2px 8px',
                borderRadius: 2,
                letterSpacing: 1,
                fontFamily: 'monospace',
              }}
            >
              {SEVERITY_LABELS[article.severity]}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                color: categoryColor,
                border: `1px solid ${categoryColor}`,
                padding: '2px 8px',
                borderRadius: 2,
                letterSpacing: 1,
                fontFamily: 'monospace',
              }}
            >
              {article.category}
            </span>
            <span
              style={{
                fontSize: 10,
                color: '#555',
                fontFamily: 'monospace',
                letterSpacing: 1,
              }}
            >
              DOC-{article.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Save button */}
            <button
              onClick={handleSave}
              style={{
                background: 'none',
                border: '1px solid #333333',
                borderRadius: 2,
                padding: '4px 8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                color: article.saved ? '#f59e0b' : '#666',
                fontSize: 14,
                transition: 'color 0.2s',
              }}
              title={article.saved ? '저장 해제' : '저장'}
            >
              <span style={{ fontSize: 16 }}>
                {article.saved ? '\u2605' : '\u2606'}
              </span>
              <span style={{ fontSize: 10, fontFamily: 'monospace' }}>
                {article.saved ? '저장됨' : '저장'}
              </span>
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: '1px solid #333333',
                borderRadius: 2,
                color: '#888',
                cursor: 'pointer',
                fontSize: 18,
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1,
                transition: 'color 0.2s',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 24px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Title */}
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: '#e0e0e0',
              margin: '0 0 12px 0',
              lineHeight: 1.4,
              letterSpacing: -0.3,
            }}
          >
            {article.title}
          </h2>

          {/* Meta: source, location, time */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 20,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: '#00ff88',
                fontFamily: 'monospace',
                fontWeight: 600,
              }}
            >
              {article.source}
            </span>
            <span style={{ fontSize: 11, color: '#555' }}>|</span>
            <span
              style={{
                fontSize: 11,
                color: '#888',
                fontFamily: 'monospace',
              }}
            >
              {article.location.country}
              {article.location.city ? ` / ${article.location.city}` : ''}
            </span>
            <span style={{ fontSize: 11, color: '#555' }}>|</span>
            <span
              style={{
                fontSize: 11,
                color: '#666',
                fontFamily: 'monospace',
              }}
            >
              {getTimeAgo(article.publishedAt)}
            </span>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              backgroundColor: '#333333',
              margin: '0 0 16px 0',
            }}
          />

          {/* Summary */}
          <div
            style={{
              fontSize: 13,
              color: '#aaa',
              lineHeight: 1.8,
              marginBottom: 20,
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
            }}
          >
            {article.summary}
          </div>

          {/* Video embed */}
          {article.videoUrl ? (
            <div
              style={{
                marginBottom: 20,
                border: '1px solid #333333',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderBottom: '1px solid #333333',
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    color: '#555',
                    fontFamily: 'monospace',
                    letterSpacing: 1,
                  }}
                >
                  VIDEO FEED
                </span>
              </div>
              <div style={{ position: 'relative', paddingBottom: '56.25%' }}>
                <iframe
                  src={article.videoUrl}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                  allowFullScreen
                  title="Video embed"
                />
              </div>
            </div>
          ) : null}

          {/* Tags */}
          {article.tags.length > 0 ? (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                marginBottom: 24,
              }}
            >
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 10,
                    color: '#888',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid #2a2a2a',
                    borderRadius: 2,
                    padding: '3px 10px',
                    fontFamily: 'monospace',
                    letterSpacing: 0.5,
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          {/* Agent analysis section */}
          <div
            style={{
              borderTop: '1px solid #333333',
              paddingTop: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: '#555',
                  fontFamily: 'monospace',
                  letterSpacing: 2,
                  fontWeight: 700,
                }}
              >
                AGENT ANALYSIS
              </span>

              {analysisState === 'idle' ? (
                <button
                  onClick={handleAnalysisRequest}
                  style={{
                    background: 'none',
                    border: '1px solid #00ff88',
                    borderRadius: 2,
                    color: '#00ff88',
                    fontSize: 11,
                    fontFamily: 'monospace',
                    padding: '5px 14px',
                    cursor: 'pointer',
                    letterSpacing: 0.5,
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.target as HTMLButtonElement).style.backgroundColor =
                      'rgba(0, 255, 136, 0.1)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.target as HTMLButtonElement).style.backgroundColor = 'transparent'
                  }}
                >
                  에이전트 분석 요청
                </button>
              ) : null}

              {analysisState === 'loading' ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      border: '2px solid #333',
                      borderTop: '2px solid #00ff88',
                      borderRadius: '50%',
                      animation: 'agent-spin 0.8s linear infinite',
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: '#666',
                      fontFamily: 'monospace',
                    }}
                  >
                    분석 중...
                  </span>
                  <style>{`
                    @keyframes agent-spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}</style>
                </div>
              ) : null}

              {analysisState === 'complete' ? (
                <span
                  style={{
                    fontSize: 11,
                    color: '#00ff88',
                    fontFamily: 'monospace',
                    letterSpacing: 0.5,
                  }}
                >
                  ✓ 분석 완료
                </span>
              ) : null}
            </div>

            {/* Analysis results */}
            {analysis !== null && analysisState === 'complete' ? (
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid #2a2a2a',
                  borderRadius: 2,
                  padding: 16,
                }}
              >
                {/* Sentiment */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: '#555',
                      fontFamily: 'monospace',
                      letterSpacing: 1,
                      width: 60,
                    }}
                  >
                    SENTIMENT
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      color: SENTIMENT_LABELS[analysis.sentiment].color,
                      fontFamily: 'monospace',
                      fontWeight: 600,
                    }}
                  >
                    {SENTIMENT_LABELS[analysis.sentiment].icon}{' '}
                    {SENTIMENT_LABELS[analysis.sentiment].text}
                  </span>
                </div>

                {/* Impact */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: '#555',
                      fontFamily: 'monospace',
                      letterSpacing: 1,
                      width: 60,
                    }}
                  >
                    IMPACT
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#000',
                      backgroundColor: SEVERITY_COLORS[analysis.impact],
                      padding: '1px 8px',
                      borderRadius: 2,
                      fontFamily: 'monospace',
                      letterSpacing: 0.5,
                    }}
                  >
                    {IMPACT_LABELS[analysis.impact]}
                  </span>
                </div>

                {/* Keywords */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                  }}
                >
                  <span
                    style={{
                      fontSize: 10,
                      color: '#555',
                      fontFamily: 'monospace',
                      letterSpacing: 1,
                      width: 60,
                      flexShrink: 0,
                      paddingTop: 2,
                    }}
                  >
                    KEYWORDS
                  </span>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                    }}
                  >
                    {analysis.keywords.map((keyword) => (
                      <span
                        key={keyword}
                        style={{
                          fontSize: 10,
                          color: '#00ff88',
                          border: '1px solid rgba(0, 255, 136, 0.2)',
                          backgroundColor: 'rgba(0, 255, 136, 0.05)',
                          borderRadius: 2,
                          padding: '2px 8px',
                          fontFamily: 'monospace',
                        }}
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {/* Idle state placeholder */}
            {analysisState === 'idle' ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '16px 0',
                  color: '#333',
                  fontSize: 11,
                  fontFamily: 'monospace',
                  fontStyle: 'italic',
                }}
              >
                에이전트 분석 데이터 없음
              </div>
            ) : null}
          </div>
        </div>

        {/* Footer bar */}
        <div
          style={{
            padding: '8px 16px',
            borderTop: '1px solid #333333',
            backgroundColor: 'rgba(255, 255, 255, 0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <span
            style={{
              fontSize: 9,
              color: '#333',
              fontFamily: 'monospace',
              letterSpacing: 1,
            }}
          >
            AGENT CONTROL TOWER // INTELLIGENCE DIVISION
          </span>
          <span
            style={{
              fontSize: 9,
              color: '#333',
              fontFamily: 'monospace',
              letterSpacing: 1,
            }}
          >
            ESC 닫기
          </span>
        </div>
      </div>
    </div>
  )
}
