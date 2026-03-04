'use client'

import { useMemo } from 'react'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import { tokenUsageSummary, workflowMetrics, agentMetrics } from '@/data/mockData'
import type { WorkflowMetric, AgentMetric } from '@/types'

// ============================================================
// Sub-components
// ============================================================

function SectionTitle({ title }: { title: string }) {
  return (
    <div
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#6b7280',
        paddingBottom: 5,
        borderBottom: '1px solid #2a3042',
        marginBottom: 6,
      }}
    >
      {title}
    </div>
  )
}

function ProgressBar({ percentage, isHigh }: { percentage: number; isHigh: boolean }) {
  const color = isHigh ? '#ff6b35' : '#00ff88'
  const shadow = isHigh ? 'rgba(255, 107, 53, 0.5)' : 'rgba(0, 255, 136, 0.4)'

  return (
    <div
      style={{
        height: 3,
        background: 'rgba(42, 48, 66, 0.8)',
        borderRadius: 2,
        overflow: 'hidden',
        marginTop: 3,
      }}
    >
      <div
        style={{
          width: `${Math.min(percentage, 100)}%`,
          height: '100%',
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          boxShadow: `0 0 4px ${shadow}`,
          borderRadius: 2,
          transition: 'width 0.5s ease',
        }}
      />
    </div>
  )
}

function WorkflowRow({ metric, rank }: { metric: WorkflowMetric; rank: number }) {
  const isHigh = metric.percentage >= 80

  return (
    <div
      style={{
        marginBottom: 8,
        padding: '5px 6px',
        borderRadius: 4,
        background: 'rgba(42, 48, 66, 0.15)',
        border: '1px solid rgba(42, 48, 66, 0.3)',
      }}
    >
      {/* Rank + Name row */}
      <div className="flex items-center justify-between" style={{ marginBottom: 2 }}>
        <div className="flex items-center gap-1.5">
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: rank <= 2 ? '#00ff88' : '#6b7280',
              minWidth: 12,
            }}
          >
            {rank}
          </span>
          <span
            style={{
              fontSize: 11,
              color: '#9ca3af',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: 120,
            }}
            title={metric.name}
          >
            {metric.name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: isHigh ? '#ff6b35' : '#e5e7eb',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {metric.tokenPerSec.toLocaleString()}
          </span>
          <span style={{ fontSize: 9, color: '#6b7280' }}>T/s</span>
        </div>
      </div>

      {/* Percentage + bar */}
      <div className="flex items-center gap-2">
        <div style={{ flex: 1 }}>
          <ProgressBar percentage={metric.percentage} isHigh={isHigh} />
        </div>
        <span
          style={{
            fontSize: 9,
            color: isHigh ? '#ff6b35' : '#6b7280',
            minWidth: 26,
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {metric.percentage}%
        </span>
      </div>
    </div>
  )
}

function AgentRow({ metric, rank }: { metric: AgentMetric; rank: number }) {
  const isHigh = metric.percentage >= 80
  const typeColor: Record<string, string> = {
    planner: '#a855f7',
    executor: '#3b82f6',
    verifier: '#00ff88',
    tool: '#f59e0b',
    coordinator: '#ff6b35',
  }
  const dotColor = typeColor[metric.type] ?? '#6b7280'

  return (
    <div
      style={{
        marginBottom: 7,
        padding: '4px 6px',
        borderRadius: 4,
        background: 'rgba(42, 48, 66, 0.15)',
        border: '1px solid rgba(42, 48, 66, 0.3)',
      }}
    >
      <div className="flex items-center justify-between" style={{ marginBottom: 2 }}>
        <div className="flex items-center gap-1.5">
          <span style={{ fontSize: 9, fontWeight: 700, color: rank <= 2 ? '#00ff88' : '#6b7280', minWidth: 12 }}>
            {rank}
          </span>
          <div
            style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: dotColor,
              boxShadow: `0 0 4px ${dotColor}`,
              flexShrink: 0,
            }}
          />
          <span
            style={{ fontSize: 11, color: '#9ca3af', maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            title={metric.name}
          >
            {metric.name}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span style={{ fontSize: 11, fontWeight: 700, color: isHigh ? '#ff6b35' : '#e5e7eb', fontVariantNumeric: 'tabular-nums' }}>
            {metric.tokenPerSec.toLocaleString()}
          </span>
          <span style={{ fontSize: 9, color: '#6b7280' }}>T/s</span>
        </div>
      </div>
      <ProgressBar percentage={metric.percentage} isHigh={isHigh} />
    </div>
  )
}

// ============================================================
// Token Usage Section (mini line chart)
// ============================================================
function TokenUsageSection() {
  const chartData = useMemo(
    () => tokenUsageSummary.chartData.map((d) => ({ value: d.value, t: d.timestamp })),
    []
  )

  return (
    <div style={{ marginBottom: 10 }}>
      <SectionTitle title="토큰 사용량 (Token/sec)" />

      {/* Big number */}
      <div className="flex items-end justify-between" style={{ marginBottom: 6 }}>
        <div>
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#00ff88',
              textShadow: '0 0 12px rgba(0, 255, 136, 0.5)',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
            }}
          >
            {tokenUsageSummary.totalTokenPerSec.toLocaleString()}
          </div>
          <div style={{ fontSize: 9, color: '#6b7280', marginTop: 2 }}>
            Token / sec · 최대 {tokenUsageSummary.peakTokenPerSec.toLocaleString()}
          </div>
        </div>
        <div className="text-right">
          <div style={{ fontSize: 11, color: '#9ca3af' }}>
            워크플로우 <span style={{ color: '#00ff88', fontWeight: 700 }}>{tokenUsageSummary.activeWorkflows}</span>
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>
            에이전트 <span style={{ color: '#3b82f6', fontWeight: 700 }}>{tokenUsageSummary.activeAgents}</span>
          </div>
        </div>
      </div>

      {/* Mini chart */}
      <div style={{ height: 48 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#00ff88"
              strokeWidth={1.5}
              dot={false}
              strokeOpacity={0.9}
            />
            <Tooltip
              contentStyle={{ background: '#1a1f2e', border: '1px solid #2a3042', fontSize: 10, borderRadius: 4 }}
              labelStyle={{ display: 'none' }}
              formatter={(v: number) => [`${Math.round(v).toLocaleString()} T/s`, '']}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ============================================================
// Main LeftPanel
// ============================================================
export default function LeftPanel() {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'rgba(26, 31, 46, 0.85)',
        borderRight: '1px solid #2a3042',
        overflowY: 'auto',
        padding: '10px 8px',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      {/* ── Section 1: Token Usage ── */}
      <TokenUsageSection />

      {/* ── Section 2: Workflow TOP5 ── */}
      <div style={{ marginBottom: 10 }}>
        <SectionTitle title="백본 트래픽 TOP5 (워크플로우)" />
        {workflowMetrics.map((m, i) => (
          <WorkflowRow key={m.id} metric={m} rank={i + 1} />
        ))}
      </div>

      {/* ── Section 3: Agent TOP5 ── */}
      <div>
        <SectionTitle title="장비 트래픽 TOP5 (에이전트)" />
        {agentMetrics.map((m, i) => (
          <AgentRow key={m.id} metric={m} rank={i + 1} />
        ))}
      </div>
    </div>
  )
}
