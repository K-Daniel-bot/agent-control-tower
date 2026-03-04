'use client'

import { useRef, useEffect, useCallback } from 'react'
import * as echarts from 'echarts'

const POINT_COUNT = 30
const UPDATE_INTERVAL = 2000

function generateInitialSeries(): number[] {
  const base = 50 + Math.random() * 30
  return Array.from({ length: POINT_COUNT }, (_, i) => {
    const trend = Math.sin(i * 0.35) * 15
    return Math.max(0, base + trend + (Math.random() - 0.5) * 20)
  })
}

function generateTimeLabels(): string[] {
  const now = Date.now()
  return Array.from({ length: POINT_COUNT }, (_, i) => {
    const d = new Date(now - (POINT_COUNT - 1 - i) * UPDATE_INTERVAL)
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  })
}

function buildOption(times: string[], inData: number[], outData: number[]): echarts.EChartsOption {
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
      itemGap: 12,
      data: [
        { name: 'In bps', icon: 'roundRect' },
        { name: 'Out bps', icon: 'roundRect' },
      ],
    },
    xAxis: {
      type: 'category',
      data: times,
      axisLabel: { fontSize: 8, color: '#4b5563', interval: 9 },
      axisLine: { lineStyle: { color: '#1e2535' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitNumber: 3,
      axisLabel: { fontSize: 8, color: '#4b5563', formatter: (v: number) => `${Math.round(v)}` },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#1e2535', width: 1 } },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#0d1117',
      borderColor: '#2a3042',
      borderWidth: 1,
      textStyle: { fontSize: 9, color: '#e2e8f0' },
      axisPointer: { lineStyle: { color: '#2a3042' } },
    },
    series: [
      {
        name: 'In bps',
        type: 'line',
        data: inData,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#00ff88', width: 1.2 },
        itemStyle: { color: '#00ff88' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#00ff8830' },
            { offset: 1, color: '#00ff8805' },
          ]),
        },
      },
      {
        name: 'Out bps',
        type: 'line',
        data: outData,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: '#ff6b35', width: 1.2 },
        itemStyle: { color: '#ff6b35' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#ff6b3530' },
            { offset: 1, color: '#ff6b3505' },
          ]),
        },
      },
    ],
  }
}

export default function CommunicationTrafficChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)
  const dataRef = useRef<{ times: string[]; inSeries: number[]; outSeries: number[] }>({
    times: generateTimeLabels(),
    inSeries: generateInitialSeries(),
    outSeries: generateInitialSeries(),
  })

  const updateChart = useCallback(() => {
    if (!chartRef.current) return
    const { times, inSeries, outSeries } = dataRef.current
    chartRef.current.setOption(buildOption(times, inSeries, outSeries))
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
      const lastIn = prev.inSeries[prev.inSeries.length - 1]
      const lastOut = prev.outSeries[prev.outSeries.length - 1]
      dataRef.current = {
        times: [...prev.times.slice(1), label],
        inSeries: [...prev.inSeries.slice(1), Math.max(0, lastIn + (Math.random() - 0.48) * 14)],
        outSeries: [...prev.outSeries.slice(1), Math.max(0, lastOut + (Math.random() - 0.48) * 14)],
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
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          height: 28,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          borderBottom: '1px solid #1e2535',
          background: 'rgba(15,20,35,0.95)',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: '#f59e0b', fontSize: 10 }}>&#9650;</span>
          <span style={{ color: '#9ca3af', fontSize: 11, fontWeight: 500, letterSpacing: '0.02em' }}>
            실시간 성능 차트 (Agent Traffic)
          </span>
        </div>
        <span style={{ color: '#4b5563', fontSize: 12, cursor: 'default' }}>&#10005;</span>
      </div>
      <div ref={containerRef} style={{ flex: 1, minHeight: 0 }} />
    </div>
  )
}
