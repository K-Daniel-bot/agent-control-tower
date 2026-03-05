'use client'

import { useState, useEffect, useCallback } from 'react'

interface Prediction {
  readonly id: string
  readonly question: string
  readonly probability: number
  readonly volume: string
  readonly category: string
}

type ProbabilityLevel = 'high' | 'mid' | 'low'

const PROBABILITY_COLORS: Record<ProbabilityLevel, string> = {
  high: '#00ff88',
  mid: '#ffcc00',
  low: '#ff4444',
}

const CATEGORY_TAG_COLORS: Record<string, string> = {
  'AI': '#00bfff',
  '금융': '#ffa500',
  '정치': '#ff6b6b',
  '기술': '#a855f7',
  '지정학': '#ef4444',
  '법률': '#22d3ee',
}

const INITIAL_PREDICTIONS: readonly Prediction[] = [
  { id: 'gpt5', question: 'GPT-5가 2026년 내 출시될 확률?', probability: 78, volume: '₩2.4B', category: 'AI' },
  { id: 'btc200k', question: 'Bitcoin $200K 달성 확률?', probability: 34, volume: '₩8.1B', category: '금융' },
  { id: 'euai', question: 'EU AI Act 수정안 통과?', probability: 62, volume: '₩980M', category: '정치' },
  { id: 'agi2030', question: 'AGI 2030년 전 달성?', probability: 23, volume: '₩5.6B', category: 'AI' },
  { id: 'mideast', question: '중동 전쟁 6개월 내 휴전?', probability: 41, volume: '₩1.7B', category: '지정학' },
  { id: 'nvda10t', question: 'NVIDIA 시총 10조 달러?', probability: 29, volume: '₩3.2B', category: '금융' },
  { id: 'krailaw', question: '한국 AI 기본법 시행?', probability: 71, volume: '₩620M', category: '법률' },
  { id: 'quantum28', question: '양자컴퓨터 상용화 2028?', probability: 18, volume: '₩1.1B', category: '기술' },
]

function getProbabilityLevel(prob: number): ProbabilityLevel {
  if (prob > 70) return 'high'
  if (prob >= 40) return 'mid'
  return 'low'
}

function clampProbability(value: number): number {
  return Math.max(1, Math.min(99, value))
}

function applyRandomWalk(predictions: readonly Prediction[]): readonly Prediction[] {
  return predictions.map((pred) => {
    const delta = Math.floor(Math.random() * 5) - 2 // -2 to +2
    const shift = delta === 0 ? (Math.random() > 0.5 ? 1 : -1) : delta
    return {
      ...pred,
      probability: clampProbability(pred.probability + shift),
    }
  })
}

export default function PredictionPanel() {
  const [predictions, setPredictions] = useState<readonly Prediction[]>(INITIAL_PREDICTIONS)

  const tick = useCallback(() => {
    setPredictions((prev) => applyRandomWalk(prev))
  }, [])

  useEffect(() => {
    const interval = setInterval(tick, 5000)
    return () => clearInterval(interval)
  }, [tick])

  return (
    <div
      style={{
        background: '#000000',
        border: '1px solid #333333',
        borderRadius: 4,
        padding: 16,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
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
          paddingBottom: 8,
          borderBottom: '1px solid #333333',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#00ff88', fontSize: 10 }}>◆</span>
          <span
            style={{
              color: '#cccccc',
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            예측 시장
          </span>
        </div>
        <span style={{ color: '#555555', fontSize: 9 }}>LIVE</span>
      </div>

      {/* Prediction List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {predictions.map((pred) => {
          const level = getProbabilityLevel(pred.probability)
          const color = PROBABILITY_COLORS[level]
          const tagColor = CATEGORY_TAG_COLORS[pred.category] ?? '#888888'

          return (
            <div
              key={pred.id}
              style={{
                padding: '8px 10px',
                borderBottom: '1px solid #1a1a1a',
              }}
            >
              {/* Top row: question + category */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span
                  style={{
                    color: '#aaaaaa',
                    fontSize: 11,
                    lineHeight: 1.4,
                    flex: 1,
                  }}
                >
                  {pred.question}
                </span>
                <span
                  style={{
                    fontSize: 8,
                    padding: '2px 5px',
                    background: `${tagColor}15`,
                    color: tagColor,
                    border: `1px solid ${tagColor}33`,
                    borderRadius: 3,
                    flexShrink: 0,
                    marginTop: 1,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {pred.category}
                </span>
              </div>

              {/* Probability bar row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {/* Bar background */}
                <div
                  style={{
                    flex: 1,
                    height: 6,
                    background: '#1a1a1a',
                    borderRadius: 3,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${pred.probability}%`,
                      height: '100%',
                      background: color,
                      borderRadius: 3,
                      transition: 'width 0.8s ease, background 0.8s ease',
                      opacity: 0.85,
                    }}
                  />
                </div>

                {/* Probability number */}
                <span
                  style={{
                    color,
                    fontSize: 12,
                    fontWeight: 700,
                    minWidth: 36,
                    textAlign: 'right',
                    fontVariantNumeric: 'tabular-nums',
                    transition: 'color 0.8s ease',
                  }}
                >
                  {pred.probability}%
                </span>
              </div>

              {/* Volume */}
              <div
                style={{
                  marginTop: 4,
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <span style={{ color: '#444444', fontSize: 9 }}>
                  거래량 {pred.volume}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: 8,
          paddingTop: 6,
          borderTop: '1px solid #333333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ color: '#333333', fontSize: 8 }}>
          PREDICTION MARKET v1.0
        </span>
        <span style={{ color: '#333333', fontSize: 8 }}>
          {predictions.length}개 항목
        </span>
      </div>
    </div>
  )
}
