'use client'

import { useRef, useEffect, useCallback } from 'react'
import * as echarts from 'echarts'
import { NocTheme } from '@/constants/nocTheme'
import type { AgentMessage } from '@/types/topology'

interface CommunicationTrafficChartProps {
  readonly messages: ReadonlyArray<AgentMessage>
}

const POINT_COUNT = 30
const UPDATE_INTERVAL = 2000

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
      textStyle: { color: NocTheme.textSecondary, fontSize: 9 },
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
    series: [
      {
        name: 'In bps',
        type: 'line',
        data: inData,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: NocTheme.greenBright, width: 1.2 },
        itemStyle: { color: NocTheme.greenBright },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: NocTheme.greenBright + '30' },
            { offset: 1, color: NocTheme.greenBright + '05' },
          ]),
        },
      },
      {
        name: 'Out bps',
        type: 'line',
        data: outData,
        smooth: true,
        symbol: 'none',
        lineStyle: { color: NocTheme.orangeBright, width: 1.2 },
        itemStyle: { color: NocTheme.orangeBright },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: NocTheme.orangeBright + '30' },
            { offset: 1, color: NocTheme.orangeBright + '05' },
          ]),
        },
      },
    ],
  }
}

export default function CommunicationTrafficChart({ messages }: CommunicationTrafficChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)
  const dataRef = useRef<{ times: string[]; inSeries: number[]; outSeries: number[] }>({
    times: generateTimeLabels(),
    inSeries: Array.from({ length: POINT_COUNT }, () => 0),
    outSeries: Array.from({ length: POINT_COUNT }, () => 0),
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
      const nowTs = Date.now()
      const recentIn = messages.filter(m => nowTs - m.timestamp < 5000 && m.type !== 'system').length
      const recentOut = messages.filter(m => nowTs - m.timestamp < 5000 && m.type === 'result').length
      dataRef.current = {
        times: [...prev.times.slice(1), label],
        inSeries: [...prev.inSeries.slice(1), recentIn * 12],
        outSeries: [...prev.outSeries.slice(1), recentOut * 8],
      }
      updateChart()
    }, UPDATE_INTERVAL)

    return () => clearInterval(timer)
  }, [updateChart, messages])

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
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={NocTheme.greenBright} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 20h20" />
            <path d="M6 16V8" />
            <path d="M10 16V4" />
            <path d="M14 16v-4" />
            <path d="M18 16V6" />
          </svg>
          <span style={{ color: NocTheme.textSecondary, fontSize: 11, fontWeight: 500, letterSpacing: '0.02em' }}>
            실시간 성능 차트 (Agent Traffic)
          </span>
        </div>
        <span style={{ color: NocTheme.textMuted, fontSize: 12, cursor: 'default' }}>&#10005;</span>
      </div>
      <div ref={containerRef} style={{ flex: 1, minHeight: 0 }} />
    </div>
  )
}
