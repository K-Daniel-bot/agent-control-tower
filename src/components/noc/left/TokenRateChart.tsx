'use client'

import { useRef, useEffect, useCallback } from 'react'
import * as echarts from 'echarts'

const SERIES_CONFIG = [
  { name: '[Orchestrator]', color: '#00ff88' },
  { name: '[Planner]', color: '#3b82f6' },
  { name: '[Executor]', color: '#f59e0b' },
  { name: '[Tool Agent]', color: '#ef4444' },
] as const

const POINT_COUNT = 30
const UPDATE_INTERVAL = 2000

function generateInitialData(): number[][] {
  return SERIES_CONFIG.map(() => {
    const base = 40 + Math.random() * 30
    return Array.from({ length: POINT_COUNT }, (_, i) => {
      const trend = Math.sin(i * 0.3) * 10
      return Math.max(0, base + trend + (Math.random() - 0.5) * 15)
    })
  })
}

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
      textStyle: { color: '#9ca3af', fontSize: 9 },
      itemWidth: 12,
      itemHeight: 2,
      itemGap: 8,
    },
    xAxis: {
      type: 'category',
      data: times,
      axisLabel: { fontSize: 8, color: '#505661', interval: 9 },
      axisLine: { lineStyle: { color: '#333333' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitNumber: 3,
      axisLabel: { fontSize: 8, color: '#505661', formatter: (v: number) => `${Math.round(v)}` },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#333333', width: 1 } },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'transparent',
      borderColor: '#333333',
      borderWidth: 1,
      textStyle: { fontSize: 9, color: '#e6edf3' },
      axisPointer: { lineStyle: { color: '#333333' } },
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

export default function TokenRateChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)
  const dataRef = useRef<{ times: string[]; series: number[][] }>({
    times: generateTimeLabels(),
    series: generateInitialData(),
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
        series: prev.series.map((s) => {
          const last = s[s.length - 1]
          const next = Math.max(0, last + (Math.random() - 0.48) * 12)
          return [...s.slice(1), next]
        }),
      }
      updateChart()
    }, UPDATE_INTERVAL)

    return () => clearInterval(timer)
  }, [updateChart])

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
          borderBottom: '1px solid #333333',
          background: 'transparent',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#f59e0b', fontSize: 10 }}>&#9650;</span>
          <span style={{ color: '#9ca3af', fontSize: 11, fontWeight: 500, letterSpacing: '0.02em' }}>
            실시간 성능 차트 (Agent Token Rate)
          </span>
        </div>
        <span style={{ color: '#505661', fontSize: 12, cursor: 'default' }}>&#10005;</span>
      </div>
      <div ref={containerRef} style={{ flex: 1, minHeight: 0 }} />
    </div>
  )
}
