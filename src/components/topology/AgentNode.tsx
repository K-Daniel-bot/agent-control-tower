'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { TopologyAgentType, AgentStatus } from '@/types/topology'

export interface AgentNodeData {
  label: string
  koreanName: string
  title: string
  englishRole: string
  agentType: TopologyAgentType
  status: AgentStatus
  tokenRate?: number
  latencyMs?: number
}

const AGENT_CONFIG: Record<TopologyAgentType, { icon: string; color: string; glowColor: string }> = {
  orchestrator: { icon: '👑', color: '#ffd700', glowColor: '255,215,0' },
  planner:      { icon: '📋', color: '#8b5cf6', glowColor: '139,92,246' },
  executor:     { icon: '⚡', color: '#f59e0b', glowColor: '245,158,11' },
  tool:         { icon: '🔧', color: '#06b6d4', glowColor: '6,182,212' },
  verifier:     { icon: '✅', color: '#10b981', glowColor: '16,185,129' },
  result:       { icon: '📊', color: '#00ff88', glowColor: '0,255,136' },
}

const STATUS_COLORS: Record<AgentStatus, string> = {
  spawning: '#3b82f6',
  active:   '#00ff88',
  working:  '#00ff88',
  idle:     '#6b7280',
  error:    '#ef4444',
  complete: '#6b7280',
}

function getAnimation(status: AgentStatus): string {
  switch (status) {
    case 'spawning':
      return 'spawn-fade-in 0.6s ease-out forwards'
    case 'working':
      return 'working-pulse 1.5s ease-in-out infinite'
    default:
      return 'none'
  }
}

function isGlowing(status: AgentStatus): boolean {
  return status === 'active' || status === 'working'
}

export function AgentNode({ data }: NodeProps) {
  const nodeData = data as unknown as AgentNodeData
  const config = AGENT_CONFIG[nodeData.agentType] ?? AGENT_CONFIG.executor
  const statusColor = STATUS_COLORS[nodeData.status] ?? STATUS_COLORS.idle
  const glowing = isGlowing(nodeData.status)

  return (
    <div
      style={{
        width: 100,
        minHeight: 70,
        background: 'rgba(26,31,46,0.95)',
        border: `1.5px solid ${glowing ? config.color : '#2a3042'}`,
        borderRadius: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6px 6px',
        gap: 2,
        boxShadow: glowing
          ? `0 0 12px rgba(${config.glowColor},0.6), 0 0 24px rgba(${config.glowColor},0.2)`
          : '0 2px 6px rgba(0,0,0,0.5)',
        position: 'relative',
        cursor: 'default',
        userSelect: 'none',
        animation: getAnimation(nodeData.status),
        opacity: nodeData.status === 'complete' ? 0.5 : 1,
        transition: 'opacity 0.5s, border-color 0.3s, box-shadow 0.3s',
      }}
    >
      {/* Target handle */}
      <Handle
        type="target"
        position={Position.Left}
        style={{
          background: config.color,
          border: `2px solid ${config.color}`,
          width: 8,
          height: 8,
        }}
      />

      {/* Status indicator */}
      <div
        style={{
          position: 'absolute',
          top: 4,
          right: 4,
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: statusColor,
          animation: glowing ? 'pulse-dot 1.5s ease-in-out infinite' : 'none',
          boxShadow: glowing ? `0 0 6px ${statusColor}` : 'none',
        }}
      />

      {/* Icon */}
      <span style={{ fontSize: 18, lineHeight: 1 }}>{config.icon}</span>

      {/* Korean name */}
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: config.color,
          textAlign: 'center',
          lineHeight: 1.2,
          maxWidth: 90,
          wordBreak: 'keep-all',
        }}
      >
        {nodeData.koreanName}
      </span>

      {/* Title */}
      <span
        style={{
          fontSize: 8,
          color: '#9ca3af',
          textAlign: 'center',
          letterSpacing: '0.05em',
        }}
      >
        {nodeData.title} · {nodeData.englishRole}
      </span>

      {/* Metrics row */}
      {nodeData.tokenRate != null && nodeData.tokenRate > 0 && (
        <div
          style={{
            display: 'flex',
            gap: 6,
            fontSize: 7,
            fontFamily: 'monospace',
            color: '#6b7280',
            marginTop: 1,
          }}
        >
          <span style={{ color: config.color }}>{nodeData.tokenRate}t/s</span>
          {nodeData.latencyMs != null && nodeData.latencyMs > 0 && (
            <span>p99:{nodeData.latencyMs}ms</span>
          )}
        </div>
      )}

      {/* Source handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={{
          background: config.color,
          border: `2px solid ${config.color}`,
          width: 8,
          height: 8,
        }}
      />
    </div>
  )
}

export default AgentNode
