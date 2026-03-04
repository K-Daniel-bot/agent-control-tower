'use client'

import { useRef, useEffect } from 'react'
import * as echarts from 'echarts'

interface GaugeChartProps {
  value: number
  label: string
  size?: number
}

function buildGaugeOption(value: number, label: string): echarts.EChartsOption {
  return {
    backgroundColor: 'transparent',
    animation: false,
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        radius: '95%',
        center: ['50%', '75%'],
        min: 0,
        max: 100,
        axisLine: {
          lineStyle: {
            width: 6,
            color: [
              [0.6, '#22c55e'],
              [0.8, '#f59e0b'],
              [1, '#ef4444'],
            ],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        title: {
          show: true,
          offsetCenter: [0, '20%'],
          fontSize: 8,
          color: '#6b7280',
        },
        detail: {
          show: true,
          offsetCenter: [0, '-15%'],
          fontSize: 11,
          fontWeight: 600,
          color: '#e2e8f0',
          formatter: '{value}%',
        },
        data: [{ value, name: label }],
      },
    ],
  }
}

export default function GaugeChart({ value, label, size = 50 }: GaugeChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    if (!chartRef.current) {
      chartRef.current = echarts.init(el, null, { renderer: 'canvas' })
    }
    chartRef.current.setOption(buildGaugeOption(value, label))
  }, [value, label])

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
    <div
      ref={containerRef}
      style={{ width: size, height: size * 0.8, flexShrink: 0 }}
    />
  )
}
