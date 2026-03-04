'use client'

import { useRef, useEffect } from 'react'
import * as echarts from 'echarts'

interface DataPoint {
  time: string
  value: number
}

interface MetricsChartProps {
  title: string
  data: DataPoint[]
  color: string
  type: 'line' | 'area' | 'bar'
  unit?: string
}

export default function MetricsChart({ title, data, color, type, unit = 'ms' }: MetricsChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    if (!chartRef.current) {
      chartRef.current = echarts.init(el, null, { renderer: 'canvas' })
    }

    const chart = chartRef.current
    const times = data.map((d) => d.time)
    const values = data.map((d) => d.value)

    const seriesBase = {
      name: title,
      type: type === 'bar' ? 'bar' : 'line',
      data: values,
      smooth: type !== 'bar',
      symbol: 'none',
      lineStyle: type !== 'bar' ? { color, width: 1.5 } : undefined,
      itemStyle: { color },
      barMaxWidth: 4,
      barBorderRadius: type === 'bar' ? [2, 2, 0, 0] : undefined,
      areaStyle:
        type === 'area'
          ? {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: color + '4d' },
                { offset: 1, color: color + '05' },
              ]),
            }
          : undefined,
    }

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      animation: false,
      grid: { top: 4, right: 6, bottom: 4, left: 28, containLabel: false },
      xAxis: {
        type: 'category',
        data: times,
        show: false,
        boundaryGap: type === 'bar',
      },
      yAxis: {
        type: 'value',
        splitNumber: 2,
        axisLabel: { fontSize: 9, color: '#4a5568', formatter: (v: number) => Math.round(v).toString() },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: '#1e2535', width: 1 } },
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0d1117',
        borderColor: '#2a3042',
        borderWidth: 1,
        textStyle: { fontSize: 10, color: '#e2e8f0' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => {
          const arr = Array.isArray(params) ? params : [params]
          const v = (arr[0]?.value as number) ?? 0
          return `${v.toFixed(1)}${unit}`
        },
        axisPointer: { lineStyle: { color: '#2a3042' } },
      },
      series: [seriesBase as echarts.SeriesOption],
    }

    chart.setOption(option)

    return () => {}
  }, [data, color, type, title, unit])

  // Resize observer
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(() => {
      chartRef.current?.resize()
    })
    observer.observe(el)
    return () => {
      observer.disconnect()
      chartRef.current?.dispose()
      chartRef.current = null
    }
  }, [])

  return (
    <div style={{ width: '100%', padding: '8px 0' }}>
      <div
        style={{
          fontSize: 10,
          color: '#9ca3af',
          marginBottom: 4,
          paddingLeft: 4,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </div>
      <div ref={containerRef} style={{ width: '100%', height: 70 }} />
    </div>
  )
}
