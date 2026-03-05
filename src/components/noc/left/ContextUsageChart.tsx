'use client'

import { useRef, useEffect, useCallback } from 'react'
import * as echarts from 'echarts'
import { NocTheme } from '@/constants/nocTheme'
import type { AgentState } from '@/types/topology'

interface ContextUsageChartProps {
  readonly agents: ReadonlyArray<AgentState>
}

const SERIES_CONFIG = [
  { name: '[Orchestrator]', color: NocTheme.blue, type: 'orchestrator' },
  { name: '[Planner]', color: NocTheme.purpleLight, type: 'planner' },
  { name: '[Executor]', color: NocTheme.cyan, type: 'executor' },
  { name: '[Tool Agent]', color: NocTheme.green, type: 'tool' },
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
      min: 0,
      max: 100,
      splitNumber: 4,
      axisLabel: { fontSize: 8, color: NocTheme.textMuted, formatter: (v: number) => `${Math.round(v)}%` },
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
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: cfg.color + '30' },
          { offset: 1, color: cfg.color + '05' },
        ]),
      },
    })),
  }
}

function getContextUsageByType(agents: ReadonlyArray<AgentState>, agentType: string): number {
  const matching = agents.filter(a => a.identity.agentType === agentType && a.status !== 'complete')
  if (matching.length === 0) return 0
  const activeCount = matching.filter(a => a.status === 'working' || a.status === 'active').length
  return Math.min(100, (activeCount / Math.max(1, matching.length)) * 100)
}

export default function ContextUsageChart({ agents }: ContextUsageChartProps) {
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
          const liveValue = getContextUsageByType(agents, cfg.type)
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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={NocTheme.purpleLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M9 9h6v6H9z" fill={NocTheme.purpleLight} opacity="0.3" />
            <circle cx="7" cy="7" r="1" fill={NocTheme.purpleLight} />
            <circle cx="17" cy="7" r="1" fill={NocTheme.purpleLight} />
            <circle cx="7" cy="17" r="1" fill={NocTheme.purpleLight} />
            <circle cx="17" cy="17" r="1" fill={NocTheme.purpleLight} />
          </svg>
          <span style={{ color: NocTheme.textSecondary, fontSize: 11, fontWeight: 500, letterSpacing: '0.02em' }}>
            실시간 성능 차트 (Context Window Used)
          </span>
        </div>
        <span style={{ color: NocTheme.textMuted, fontSize: 12, cursor: 'default' }}>&#10005;</span>
      </div>
      <div ref={containerRef} style={{ flex: 1, minHeight: 0 }} />
    </div>
  )
}
