'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

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

const CustomTooltip = ({
  active,
  payload,
  unit,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  unit?: string
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: '#0d1117',
          border: '1px solid #2a3042',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          color: '#e2e8f0',
        }}
      >
        {payload[0].value.toFixed(1)}
        {unit || 'ms'}
      </div>
    )
  }
  return null
}

export default function MetricsChart({
  title,
  data,
  color,
  type,
  unit,
}: MetricsChartProps) {
  const renderChart = () => {
    const commonProps = {
      data,
      margin: { top: 2, right: 4, left: -20, bottom: 0 },
    }

    const axisStyle = {
      tick: { fontSize: 10, fill: '#4a5568' },
      axisLine: false,
      tickLine: false,
    }

    if (type === 'area') {
      return (
        <AreaChart {...commonProps}>
          <defs>
            <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" hide />
          <YAxis {...axisStyle} tickCount={3} />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#gradient-${color.replace('#', '')})`}
            dot={false}
            activeDot={{ r: 3, fill: color }}
          />
        </AreaChart>
      )
    }

    if (type === 'line') {
      return (
        <LineChart {...commonProps}>
          <XAxis dataKey="time" hide />
          <YAxis {...axisStyle} tickCount={3} />
          <Tooltip content={<CustomTooltip unit={unit} />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            activeDot={{ r: 3, fill: color }}
          />
        </LineChart>
      )
    }

    return (
      <BarChart {...commonProps} barSize={4}>
        <XAxis dataKey="time" hide />
        <YAxis {...axisStyle} tickCount={3} />
        <Tooltip content={<CustomTooltip unit={unit} />} />
        <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} opacity={0.8} />
      </BarChart>
    )
  }

  return (
    <div
      style={{
        width: '100%',
        padding: '8px 0',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          color: '#9ca3af',
          marginBottom: '4px',
          paddingLeft: '4px',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </div>
      <div style={{ width: '100%', height: '70px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
