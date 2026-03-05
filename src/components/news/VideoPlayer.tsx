'use client'

import { useState, useMemo, useCallback } from 'react'
import type { NewsArticle, EventCategory } from '@/types/news'
import { CATEGORY_COLORS } from '@/types/news'

interface VideoPlayerProps {
  readonly articles: readonly NewsArticle[]
}

function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }

  return null
}

function getEmbedUrl(videoUrl: string, articleIndex: number = 0): string | null {
  const youtubeId = extractYouTubeId(videoUrl)
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&t=${articleIndex}`
  }
  return null
}

function CategoryTag({ category }: { readonly category: EventCategory }) {
  const color = CATEGORY_COLORS[category]

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '1px 6px',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.5px',
        color,
        border: `1px solid ${color}`,
        borderRadius: '2px',
        textTransform: 'uppercase',
        lineHeight: '16px',
      }}
    >
      {category}
    </span>
  )
}

function PlayIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="23" stroke="#555" strokeWidth="2" />
      <path d="M19 14L35 24L19 34V14Z" fill="#555" />
    </svg>
  )
}

function VideoCard({
  article,
  isActive,
  onSelect,
}: {
  readonly article: NewsArticle
  readonly isActive: boolean
  readonly onSelect: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)
  const color = CATEGORY_COLORS[article.category]

  return (
    <button
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: 'flex',
        gap: '10px',
        padding: '8px',
        background: isActive
          ? 'rgba(255,255,255,0.08)'
          : isHovered
            ? 'rgba(255,255,255,0.04)'
            : 'transparent',
        border: isActive ? `1px solid ${color}` : '1px solid #333333',
        borderRadius: '4px',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        transition: 'all 0.15s ease',
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: '72px',
          height: '48px',
          background: '#111',
          border: '1px solid #333333',
          borderRadius: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M7 4L17 10L7 16V4Z" fill="#666" />
        </svg>
        <div
          style={{
            position: 'absolute',
            bottom: '2px',
            right: '2px',
            background: 'rgba(0,0,0,0.7)',
            padding: '0 3px',
            borderRadius: '1px',
            fontSize: '8px',
            color: '#999',
            fontFamily: 'monospace',
          }}
        >
          VIDEO
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: '4px' }}>
          <CategoryTag category={article.category} />
        </div>
        <div
          style={{
            fontSize: '11px',
            color: '#e0e0e0',
            lineHeight: '1.3',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: 500,
          }}
        >
          {article.title}
        </div>
        <div
          style={{
            fontSize: '9px',
            color: '#777',
            marginTop: '2px',
            display: 'flex',
            gap: '8px',
            fontFamily: 'monospace',
          }}
        >
          <span>{article.source}</span>
          <span>{article.location.country}</span>
        </div>
      </div>
    </button>
  )
}

export default function VideoPlayer({ articles }: VideoPlayerProps) {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null)

  const videoArticles = useMemo(
    () => articles.filter((a) => Boolean(a.videoUrl)),
    [articles],
  )

  const selectedArticle = useMemo(
    () => videoArticles.find((a) => a.id === selectedArticleId) ?? null,
    [videoArticles, selectedArticleId],
  )

  const handleSelect = useCallback((id: string) => {
    setSelectedArticleId(id)
  }, [])

  const selectedArticleIndex = useMemo(
    () => videoArticles.findIndex((a) => a.id === selectedArticleId),
    [videoArticles, selectedArticleId],
  )

  const embedUrl = selectedArticle?.videoUrl
    ? getEmbedUrl(selectedArticle.videoUrl, selectedArticleIndex)
    : null

  return (
    <div
      style={{
        background: '#000000',
        border: '1px solid #333333',
        borderRadius: '4px',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderBottom: '1px solid #333333',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#ef4444',
            boxShadow: '0 0 6px #ef4444',
            animation: 'recBlink 1.5s ease-in-out infinite',
          }}
        />
        <span
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#e0e0e0',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontFamily: 'monospace',
          }}
        >
          TV
        </span>
        <span
          style={{
            fontSize: '9px',
            color: '#666',
            fontFamily: 'monospace',
            marginLeft: 'auto',
          }}
        >
          {videoArticles.length} CH
        </span>
      </div>

      {/* Video Area */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          background: '#0a0a0a',
          borderBottom: '1px solid #333333',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {videoArticles.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <PlayIcon />
            <span
              style={{
                fontSize: '12px',
                color: '#555',
                fontFamily: 'monospace',
              }}
            >
              {"// \uB3D9\uC601\uC0C1 \uC5C6\uC74C"}
            </span>
          </div>
        ) : selectedArticle === null ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <PlayIcon />
            <span
              style={{
                fontSize: '12px',
                color: '#666',
                fontFamily: 'monospace',
              }}
            >
              {"\uCC44\uB110\uC744 \uC120\uD0DD\uD558\uC138\uC694"}
            </span>
          </div>
        ) : embedUrl ? (
          <iframe
            key={selectedArticle.id}
            src={embedUrl}
            title={selectedArticle.title}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <PlayIcon />
            <span
              style={{
                fontSize: '11px',
                color: '#666',
                fontFamily: 'monospace',
              }}
            >
              {"\uC9C0\uC6D0\uB418\uC9C0 \uC54A\uB294 \uD615\uC2DD"}
            </span>
          </div>
        )}

        {/* Scanline overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            background:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
          }}
        />
      </div>

      {/* Now Playing Bar */}
      {selectedArticle && (
        <div
          style={{
            padding: '6px 12px',
            borderBottom: '1px solid #333333',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255,255,255,0.02)',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: CATEGORY_COLORS[selectedArticle.category],
              boxShadow: `0 0 4px ${CATEGORY_COLORS[selectedArticle.category]}`,
            }}
          />
          <span
            style={{
              fontSize: '10px',
              color: '#ccc',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
              fontFamily: 'monospace',
            }}
          >
            {selectedArticle.title}
          </span>
          <CategoryTag category={selectedArticle.category} />
        </div>
      )}

      {/* Video List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {videoArticles.map((article) => (
          <VideoCard
            key={article.id}
            article={article}
            isActive={article.id === selectedArticleId}
            onSelect={() => handleSelect(article.id)}
          />
        ))}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes recBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  )
}
