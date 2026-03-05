'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ---------------------------------------------------------------------------
// Types (local — no external imports)
// ---------------------------------------------------------------------------

interface FinancialTicker {
  readonly symbol: string
  readonly name: string
  readonly price: number
  readonly change: number
  readonly changePercent: number
  readonly section?: string
}

interface TickerWithHistory {
  readonly ticker: FinancialTicker
  readonly history: readonly number[]
}

// ---------------------------------------------------------------------------
// Seed data
// ---------------------------------------------------------------------------

const INITIAL_TICKERS: readonly FinancialTicker[] = [
  // Crypto
  { symbol: 'BTC', name: '비트코인', price: 97_432.18, change: 1_283.45, changePercent: 1.34, section: 'CRYPTO' },
  { symbol: 'ETH', name: '이더리움', price: 3_812.56, change: -47.32, changePercent: -1.23 },
  { symbol: 'SOL', name: '솔라나', price: 187.43, change: 5.67, changePercent: 3.12 },
  { symbol: 'XRP', name: '리플', price: 2.34, change: 0.08, changePercent: 3.54 },
  { symbol: 'BNB', name: '바이낸스코인', price: 612.80, change: -4.21, changePercent: -0.68 },
  // US Market
  { symbol: 'SPX', name: 'S&P 500', price: 5_987.32, change: 23.18, changePercent: 0.39, section: 'US MARKET' },
  { symbol: 'DJI', name: 'Dow Jones', price: 43_856.12, change: 187.45, changePercent: 0.43 },
  { symbol: 'IXIC', name: 'NASDAQ', price: 19_234.67, change: -52.31, changePercent: -0.27 },
  { symbol: 'NVDA', name: '엔비디아', price: 142.87, change: 3.21, changePercent: 2.30 },
  { symbol: 'AAPL', name: '애플', price: 231.54, change: -1.87, changePercent: -0.80 },
  { symbol: 'MSFT', name: '마이크로소프트', price: 448.92, change: 6.34, changePercent: 1.43 },
  { symbol: 'TSLA', name: '테슬라', price: 312.76, change: -8.45, changePercent: -2.63 },
  { symbol: 'GOOGL', name: '알파벳', price: 178.23, change: 2.15, changePercent: 1.22 },
  { symbol: 'AMZN', name: '아마존', price: 198.47, change: -0.93, changePercent: -0.47 },
  { symbol: 'META', name: '메타', price: 587.31, change: 12.67, changePercent: 2.20 },
  // Korean Market
  { symbol: 'KOSPI', name: '코스피', price: 2_687.41, change: -12.34, changePercent: -0.46, section: 'KOREAN MARKET' },
  { symbol: 'KOSDAQ', name: '코스닥', price: 872.15, change: 4.23, changePercent: 0.49 },
  { symbol: '005930', name: '삼성전자', price: 72_300, change: 500, changePercent: 0.70 },
  { symbol: '000660', name: 'SK하이닉스', price: 198_500, change: 3_500, changePercent: 1.79 },
  { symbol: '373220', name: 'LG에너지솔루션', price: 368_000, change: -5_000, changePercent: -1.34 },
  { symbol: '005380', name: '현대자동차', price: 231_500, change: 1_500, changePercent: 0.65 },
  { symbol: '035420', name: '네이버', price: 214_000, change: -2_000, changePercent: -0.93 },
  { symbol: '035720', name: '카카오', price: 42_650, change: 350, changePercent: 0.83 },
  // Global Indices
  { symbol: 'FTSE', name: 'FTSE 100', price: 8_432.67, change: 34.12, changePercent: 0.41, section: 'GLOBAL INDICES' },
  { symbol: 'DAX', name: 'DAX', price: 18_765.43, change: -89.21, changePercent: -0.47 },
  { symbol: 'N225', name: 'Nikkei 225', price: 38_912.56, change: 245.78, changePercent: 0.64 },
  { symbol: 'HSI', name: 'Hang Seng', price: 17_634.21, change: -123.45, changePercent: -0.70 },
  { symbol: 'SSEC', name: 'Shanghai Comp', price: 3_087.92, change: 8.34, changePercent: 0.27 },
]

const HISTORY_LENGTH = 10

// ---------------------------------------------------------------------------
// Helpers (pure functions)
// ---------------------------------------------------------------------------

function randomDelta(base: number): number {
  const volatility = base * 0.003
  return (Math.random() - 0.48) * volatility
}

function applyTickerUpdate(item: TickerWithHistory): TickerWithHistory {
  const delta = randomDelta(item.ticker.price)
  const newPrice = Math.max(0.01, item.ticker.price + delta)
  const newChange = item.ticker.change + delta
  const newPercent = (newChange / (newPrice - newChange)) * 100

  const updatedTicker: FinancialTicker = {
    ...item.ticker,
    price: newPrice,
    change: newChange,
    changePercent: newPercent,
  }

  const updatedHistory =
    item.history.length >= HISTORY_LENGTH
      ? [...item.history.slice(1), newPrice]
      : [...item.history, newPrice]

  return { ticker: updatedTicker, history: updatedHistory }
}

function formatPrice(price: number): string {
  if (price >= 10_000) return price.toLocaleString('ko-KR', { maximumFractionDigits: 0 })
  if (price >= 100) return price.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return price.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatChange(value: number): string {
  const sign = value >= 0 ? '+' : ''
  if (Math.abs(value) >= 100) return `${sign}${value.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}`
  return `${sign}${value.toFixed(2)}`
}

function buildInitialState(): readonly TickerWithHistory[] {
  return INITIAL_TICKERS.map((ticker) => ({
    ticker,
    history: [ticker.price],
  }))
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MiniSparkline({ history, positive }: { readonly history: readonly number[]; readonly positive: boolean }) {
  if (history.length < 2) return null

  const min = Math.min(...history)
  const max = Math.max(...history)
  const range = max - min || 1

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 1,
        height: 16,
        width: 40,
        flexShrink: 0,
      }}
    >
      {history.map((value, idx) => {
        const normalized = ((value - min) / range) * 14 + 2
        return (
          <div
            key={idx}
            style={{
              width: 3,
              height: normalized,
              borderRadius: 1,
              background: positive ? '#00ff8880' : '#ef444480',
              opacity: 0.4 + (idx / history.length) * 0.6,
            }}
          />
        )
      })}
    </div>
  )
}

function BlinkingDot() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: '#00ff88',
        marginRight: 6,
        animation: 'financial-blink 1.4s ease-in-out infinite',
      }}
    />
  )
}

function SectionHeader({ name }: { readonly name: string }) {
  return (
    <div
      style={{
        padding: '4px 10px',
        fontSize: 9,
        color: '#555',
        letterSpacing: '0.08em',
        fontWeight: 700,
        borderBottom: '1px solid #1a1a1a',
        background: '#050505',
        textTransform: 'uppercase',
        fontFamily: 'monospace',
      }}
    >
      {name}
    </div>
  )
}

function TickerRow({ item }: { readonly item: TickerWithHistory }) {
  const { ticker, history } = item
  const positive = ticker.change >= 0
  const color = positive ? '#00ff88' : '#ef4444'

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '62px 1fr 100px 80px 60px 44px',
        alignItems: 'center',
        gap: 4,
        padding: '5px 10px',
        borderBottom: '1px solid #1a1a1a',
        fontSize: 11,
        fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
        transition: 'background 0.2s',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.background = '#111111'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.background = 'transparent'
      }}
    >
      {/* Symbol */}
      <span style={{ color: '#e0e0e0', fontWeight: 700, letterSpacing: 0.5 }}>
        {ticker.symbol}
      </span>

      {/* Name */}
      <span style={{ color: '#888888', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {ticker.name}
      </span>

      {/* Price */}
      <span style={{ color: '#e0e0e0', textAlign: 'right', fontWeight: 600 }}>
        {formatPrice(ticker.price)}
      </span>

      {/* Change */}
      <span style={{ color, textAlign: 'right', fontSize: 10 }}>
        {formatChange(ticker.change)}
      </span>

      {/* Change % */}
      <span
        style={{
          color,
          textAlign: 'right',
          fontSize: 10,
          fontWeight: 600,
        }}
      >
        {ticker.changePercent >= 0 ? '+' : ''}
        {ticker.changePercent.toFixed(2)}%
      </span>

      {/* Sparkline */}
      <MiniSparkline history={history} positive={positive} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function FinancialPanel() {
  const [data, setData] = useState<readonly TickerWithHistory[]>(buildInitialState)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const tick = useCallback(() => {
    setData((prev) => prev.map(applyTickerUpdate))
  }, [])

  useEffect(() => {
    intervalRef.current = setInterval(tick, 3_000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [tick])

  return (
    <div
      style={{
        background: '#000000',
        border: '1px solid #333333',
        borderRadius: 4,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Blink keyframes */}
      <style>{`
        @keyframes financial-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderBottom: '1px solid #333333',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <BlinkingDot />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#e0e0e0',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            금융 시장
          </span>
        </div>
        <span style={{ fontSize: 9, color: '#555555', fontFamily: 'monospace' }}>
          LIVE · 3s
        </span>
      </div>

      {/* Column headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '62px 1fr 100px 80px 60px 44px',
          gap: 4,
          padding: '4px 10px',
          fontSize: 9,
          color: '#555555',
          fontFamily: 'monospace',
          borderBottom: '1px solid #222222',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}
      >
        <span>심볼</span>
        <span>종목</span>
        <span style={{ textAlign: 'right' }}>현재가</span>
        <span style={{ textAlign: 'right' }}>변동</span>
        <span style={{ textAlign: 'right' }}>등락률</span>
        <span style={{ textAlign: 'right' }}>추세</span>
      </div>

      {/* Ticker rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {data.map((item) => (
          <div key={item.ticker.symbol}>
            {item.ticker.section && <SectionHeader name={item.ticker.section} />}
            <TickerRow item={item} />
          </div>
        ))}
      </div>
    </div>
  )
}
