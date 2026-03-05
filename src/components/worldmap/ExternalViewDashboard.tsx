'use client'

import { useState, useEffect, useRef } from 'react'
import AIFaceCanvas from './AIFaceCanvas'
import InfraCityCanvas from './InfraCityCanvas'

interface MetricCard {
  readonly label: string
  readonly value: string
  readonly sub: string
  readonly color: string
}

const AGENT_METRICS: readonly MetricCard[] = [
  { label: 'Active Agents', value: '18', sub: '/22 total', color: '#00ff88' },
  { label: 'Task Queue', value: '8', sub: 'pending', color: '#f59e0b' },
  { label: 'Token Rate', value: '142', sub: 'tok/s', color: '#00d4ff' },
  { label: 'Uptime', value: '99.7%', sub: 'last 24h', color: '#a855f7' },
]

const SERVER_METRICS: readonly MetricCard[] = [
  { label: 'CPU Load', value: '34%', sub: 'avg', color: '#3b82f6' },
  { label: 'Memory', value: '62%', sub: '11.2GB used', color: '#ec4899' },
  { label: 'Network I/O', value: '1.2', sub: 'Gbps', color: '#00d4ff' },
  { label: 'Disk', value: '48%', sub: '240GB used', color: '#f59e0b' },
]

function MetricOverlay({ metrics, position }: {
  readonly metrics: readonly MetricCard[]
  readonly position: 'bottom-left' | 'bottom-right'
}) {
  return (
    <div style={{
      position: 'absolute',
      bottom: 8,
      ...(position === 'bottom-left' ? { left: 8 } : { right: 8 }),
      display: 'flex',
      gap: 6,
      zIndex: 2,
    }}>
      {metrics.map(m => (
        <div key={m.label} style={{
          background: 'rgba(6,10,18,0.85)',
          border: `1px solid ${m.color}22`,
          borderRadius: 4,
          padding: '5px 8px',
          minWidth: 72,
        }}>
          <div style={{ fontSize: 7, color: m.color + '66', letterSpacing: '0.05em', marginBottom: 2 }}>
            {m.label.toUpperCase()}
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: m.color, fontFamily: 'monospace' }}>
            {m.value}
          </div>
          <div style={{ fontSize: 7, color: '#3a4a60' }}>{m.sub}</div>
        </div>
      ))}
    </div>
  )
}

export default function ExternalViewDashboard() {
  const [leftSize, setLeftSize] = useState({ w: 300, h: 600 })
  const [mainSize, setMainSize] = useState({ w: 800, h: 600 })
  const leftRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observe = (el: HTMLElement | null, setter: (s: { w: number; h: number }) => void) => {
      if (!el) return () => {}
      const ro = new ResizeObserver(entries => {
        const e = entries[0]
        if (e) setter({ w: e.contentRect.width, h: e.contentRect.height })
      })
      ro.observe(el)
      return () => ro.disconnect()
    }
    const c1 = observe(leftRef.current, setLeftSize)
    const c2 = observe(mainRef.current, setMainSize)
    return () => { c1(); c2() }
  }, [])

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', overflow: 'hidden',
      background: '#060a12', position: 'relative',
    }}>
      {/* Left: AI Face + Circuit (25%) */}
      <div
        ref={leftRef}
        style={{
          flex: '0 0 25%', borderRight: '1px solid #0e1822',
          overflow: 'hidden', position: 'relative',
        }}
      >
        <AIFaceCanvas width={leftSize.w} height={leftSize.h} />
        {/* Overlay label */}
        <div style={{
          position: 'absolute', top: 8, left: 10,
          fontSize: 9, color: '#00d4ff33', fontFamily: 'monospace', fontWeight: 700,
          letterSpacing: '0.08em',
        }}>
          AI NEURAL CORE
        </div>
      </div>

      {/* Main: Infrastructure City (75%) */}
      <div
        ref={mainRef}
        style={{ flex: 1, overflow: 'hidden', position: 'relative' }}
      >
        <InfraCityCanvas width={mainSize.w} height={mainSize.h} />

        {/* Metric overlays */}
        <MetricOverlay metrics={SERVER_METRICS} position="bottom-left" />
        <MetricOverlay metrics={AGENT_METRICS} position="bottom-right" />

        {/* Top status bar overlay */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 28,
          background: 'rgba(6,10,18,0.7)', display: 'flex', alignItems: 'center',
          padding: '0 12px', gap: 16, fontSize: 9, fontFamily: 'monospace',
          borderBottom: '1px solid #0e182280',
        }}>
          <span style={{ color: '#1e3050', fontWeight: 700, letterSpacing: '0.08em' }}>
            EXTERNAL INFRASTRUCTURE VIEW
          </span>
          <span style={{ color: '#00ff8855' }}>{'\u25CF'} Systems Online</span>
          <span style={{ color: '#00d4ff44' }}>6 Zones Active</span>
          <div style={{ flex: 1 }} />
          <span style={{ color: '#1e305066' }}>Real-time Monitoring</span>
        </div>
      </div>
    </div>
  )
}
