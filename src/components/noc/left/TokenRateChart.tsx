'use client'

import { useRef, useEffect, useCallback } from 'react'
import * as echarts from 'echarts'
import { NocTheme } from '@/constants/nocTheme'
import type { AgentState } from '@/types/topology'

interface TokenRateChartProps {
  readonly agents: ReadonlyArray<AgentState>
}

const SERIES_CONFIG = [
  { name: '[Orchestrator]', color: NocTheme.greenBright, type: 'orchestrator' },
  { name: '[Planner]', color: NocTheme.blue, type: 'planner' },
  { name: '[Executor]', color: NocTheme.orange, type: 'executor' },
  { name: '[Tool Agent]', color: NocTheme.red, type: 'tool' },
] as const

const POINT_COUNT = 30
const UPDATE_INTERVAL = 2000

function generateTimeLabels(): string[] {
  const now = Date.now()
  return Array.from({ length: POINT_COUNT }, (_, i) => {
    const d = new Date(now - (POINT_COUNT - 1 - i) * UPDATE_INTERVAL)
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  })
}

function buildOption(times: string[], seriesData: number[][]): echarts.EChartsOption {
  return {
    backgroundColor: 'transparent',
    animation: false,
    grid: { top: 30, right: 10, bottom: 20, left: 40, containLabel: false },
    legend: {
      show: true,
      top: 4,
      right: 8,
      textStyle: { color: NocTheme.textSecondary, fontSize: 9 },
      itemWidth: 12,
      itemHeight: 2,
      itemGap: 8,
    },
    xAxis: {
      type: 'category',
      data: times,
      axisLabel: { fontSize: 8, color: NocTheme.textMuted, interval: 9 },
      axisLine: { lineStyle: { color: NocTheme.divider } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitNumber: 3,
      axisLabel: { fontSize: 8, color: NocTheme.textMuted, formatter: (v: number) => `${Math.round(v)}` },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: NocTheme.divider, width: 1 } },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'transparent',
      borderColor: NocTheme.divider,
      borderWidth: 1,
      textStyle: { fontSize: 9, color: NocTheme.textPrimary },
      axisPointer: { lineStyle: { color: NocTheme.divider } },
    },
    series: SERIES_CONFIG.map((cfg, idx) => ({
      name: cfg.name,
      type: 'line' as const,
      data: seriesData[idx],
      smooth: true,
      symbol: 'none',
      lineStyle: { color: cfg.color, width: 1.2 },
      itemStyle: { color: cfg.color },
    })),
  }
}

function getTokenRateByType(agents: ReadonlyArray<AgentState>, agentType: string): number {
  const matching = agents.filter(a => a.identity.agentType === agentType && a.status !== 'complete')
  if (matching.length === 0) return 0
  return matching.reduce((sum, a) => sum + a.tokenRate, 0) / matching.length
}

export default function TokenRateChart({ agents }: TokenRateChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)
  const dataRef = useRef<{ times: string[]; series: number[][] }>({
    times: generateTimeLabels(),
    series: SERIES_CONFIG.map(() => Array.from({ length: POINT_COUNT }, () => 0)),
  })

  const updateChart = useCallback(() => {
    if (!chartRef.current) return
    const { times, series } = dataRef.current
    chartRef.current.setOption(buildOption(times, series))
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (!chartRef.current) {
      chartRef.current = echarts.init(el, null, { renderer: 'canvas' })
    }
    updateChart()

    const timer = setInterval(() => {
      const now = new Date()
      const label = now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      const prev = dataRef.current
      dataRef.current = {
        times: [...prev.times.slice(1), label],
        series: SERIES_CONFIG.map((cfg, idx) => {
          const liveValue = getTokenRateByType(agents, cfg.type)
          const prevSeries = prev.series[idx]
          return [...prevSeries.slice(1), liveValue]
        }),
      }
      updateChart()
    }, UPDATE_INTERVAL)

    return () => clearInterval(timer)
  }, [updateChart, agents])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(() => chartRef.current?.resize())
    observer.observe(el)
    return () => {
      observer.disconnect()
      chartRef.current?.dispose()
      chartRef.current = null
    }
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'transparent' }}>
      <div
        style={{
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          borderBottom: `1px solid ${NocTheme.divider}`,
          background: 'transparent',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={NocTheme.orange} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10" />
            <path d="M12 12l4-8" />
            <circle cx="12" cy="12" r="1.5" fill={NocTheme.orange} />
          </svg>
          <span style={{ color: NocTheme.textSecondary, fontSize: 11, fontWeight: 500, letterSpacing: '0.02em' }}>
            실시간 성능 차트 (Agent Token Rate)
          </span>
        </div>
        <span style={{ color: NocTheme.textMuted, fontSize: 12, cursor: 'default' }}>&#10005;</span>
      </div>
      <div ref={containerRef} style={{ flex: 1, minHeight: 0 }} />
    </div>
  )
}
