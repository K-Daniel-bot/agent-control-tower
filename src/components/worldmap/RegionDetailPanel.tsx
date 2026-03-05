'use client'

import type { AgentPin, ActivityEntry, RegionId } from '@/types/worldmap'
import { REGIONS } from '@/types/worldmap'

interface RegionDetailPanelProps {
  regionId: RegionId
  agents: AgentPin[]
  activities: ActivityEntry[]
}

const STATUS_COLORS: Record<string, string> = {
  active: '#00ff88',
  working: '#f59e0b',
  spawning: '#3b82f6',
  idle: '#6b7280',
  error: '#ef4444',
  complete: '#555',
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function RegionDetailPanel({ regionId, agents, activities }: RegionDetailPanelProps) {
  const region = REGIONS.find((r) => r.id === regionId)
  if (!region) return null

  const regionAgents = agents.filter((a) => a.regionId === regionId)
  const regionActivities = activities
    .filter((a) => a.regionId === regionId)
    .slice(-20)
    .reverse()

  return (
    <div style={{ display: 'flex', gap: 16, height: '100%', overflow: 'hidden' }}>
      {/* Region Info + Agents */}
      <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: 12, overflow: 'auto' }}>
        {/* Region header */}
        <div
          style={{
            padding: '10px 14px',
            background: `${region.color}10`,
            border: `1px solid ${region.color}33`,
            borderRadius: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 16 }}>{region.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: region.color }}>{region.label}</span>
          </div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>{region.description}</div>
        </div>

        {/* Agents in region */}
        <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Agents ({regionAgents.length})
        </div>
        {regionAgents.length === 0 ? (
          <div style={{ fontSize: 12, color: '#333', padding: '8px 0' }}>No agents in this region</div>
        ) : (
          regionAgents.map((agent) => (
            <div
              key={agent.id}
              style={{
                padding: '8px 12px',
                background: '#000000',
                border: '1px solid #333333',
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: `${STATUS_COLORS[agent.status]}20`,
                  border: `1px solid ${STATUS_COLORS[agent.status]}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 700,
                  color: STATUS_COLORS[agent.status],
                  fontFamily: 'monospace',
                }}
              >
                {agent.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e5e7eb' }}>{agent.name}</div>
                <div style={{ fontSize: 10, color: '#6b7280' }}>
                  {agent.role} &middot; {agent.tokenRate} tok/s
                </div>
              </div>
              <div
                style={{
                  fontSize: 9,
                  color: STATUS_COLORS[agent.status],
                  textTransform: 'uppercase',
                }}
              >
                {agent.status}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Activity feed for region */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
          Recent Activity
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {regionActivities.length === 0 ? (
            <div style={{ fontSize: 12, color: '#333', padding: '8px 0' }}>No recent activity</div>
          ) : (
            regionActivities.map((act) => (
              <div
                key={act.id}
                style={{
                  padding: '6px 10px',
                  borderBottom: '1px solid #111',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  fontSize: 11,
                }}
              >
                <span style={{ color: '#555', fontFamily: 'monospace', fontSize: 10, flexShrink: 0 }}>
                  {formatTime(act.timestamp)}
                </span>
                <span style={{ color: '#9ca3af' }}>
                  <span style={{ color: '#e5e7eb', fontWeight: 500 }}>{act.agentName}</span>
                  {' '}{act.action}
                  {act.detail && (
                    <span style={{ color: '#555' }}> &mdash; {act.detail}</span>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
