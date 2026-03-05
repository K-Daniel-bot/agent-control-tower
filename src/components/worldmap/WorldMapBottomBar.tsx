'use client'

import type { AgentPin, ActivityEntry, BottomTabType, RegionId } from '@/types/worldmap'
import { REGIONS } from '@/types/worldmap'
import RegionDetailPanel from './RegionDetailPanel'

interface WorldMapBottomBarProps {
  activeTab: BottomTabType
  onTabChange: (tab: BottomTabType) => void
  agents: AgentPin[]
  activities: ActivityEntry[]
  selectedRegion: RegionId | null
  onSelectRegion: (id: RegionId | null) => void
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

const TABS: { key: BottomTabType; label: string }[] = [
  { key: 'agents', label: 'Agents' },
  { key: 'activity', label: 'Activity' },
  { key: 'region', label: 'Region' },
]

export default function WorldMapBottomBar({
  activeTab,
  onTabChange,
  agents,
  activities,
  selectedRegion,
  onSelectRegion,
}: WorldMapBottomBarProps) {
  return (
    <div
      style={{
        height: 220,
        borderTop: '1px solid #333333',
        display: 'flex',
        flexDirection: 'column',
        background: '#000000',
        flexShrink: 0,
      }}
    >
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 0,
          borderBottom: '1px solid #333333',
          flexShrink: 0,
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            style={{
              padding: '8px 20px',
              background: activeTab === tab.key ? '#0a0a0a' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.key ? '2px solid #f59e0b' : '2px solid transparent',
              color: activeTab === tab.key ? '#e5e7eb' : '#555',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            {tab.label}
            {tab.key === 'agents' && (
              <span style={{ marginLeft: 6, color: '#6b7280' }}>{agents.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '10px 16px' }}>
        {activeTab === 'agents' && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {agents.length === 0 ? (
              <div style={{ fontSize: 12, color: '#333', padding: 8 }}>No agents active</div>
            ) : (
              agents.map((agent) => {
                const region = REGIONS.find((r) => r.id === agent.regionId)
                return (
                  <div
                    key={agent.id}
                    style={{
                      padding: '8px 14px',
                      background: '#000000',
                      border: '1px solid #333333',
                      borderRadius: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      minWidth: 240,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: STATUS_COLORS[agent.status],
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#e5e7eb' }}>
                        {agent.name}
                      </div>
                      <div style={{ fontSize: 10, color: '#6b7280' }}>
                        {agent.role} &middot;{' '}
                        <span style={{ color: region?.color }}>{region?.label}</span>
                        {' '}&middot; {agent.tokenRate} tok/s
                      </div>
                    </div>
                    <span style={{ fontSize: 9, color: STATUS_COLORS[agent.status], textTransform: 'uppercase' }}>
                      {agent.status}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div>
            {activities.length === 0 ? (
              <div style={{ fontSize: 12, color: '#333', padding: 8 }}>No activity yet</div>
            ) : (
              [...activities].reverse().slice(0, 50).map((act) => {
                const region = REGIONS.find((r) => r.id === act.regionId)
                return (
                  <div
                    key={act.id}
                    style={{
                      padding: '5px 8px',
                      borderBottom: '1px solid #111',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: 11,
                    }}
                  >
                    <span style={{ color: '#444', fontFamily: 'monospace', fontSize: 10, flexShrink: 0 }}>
                      {formatTime(act.timestamp)}
                    </span>
                    <span
                      style={{
                        padding: '1px 6px',
                        borderRadius: 3,
                        fontSize: 9,
                        background: `${region?.color ?? '#333'}15`,
                        color: region?.color ?? '#6b7280',
                        border: `1px solid ${region?.color ?? '#333'}33`,
                        flexShrink: 0,
                      }}
                    >
                      {region?.label}
                    </span>
                    <span style={{ color: '#9ca3af' }}>
                      <span style={{ color: '#e5e7eb', fontWeight: 500 }}>{act.agentName}</span>
                      {' '}{act.action}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'region' && selectedRegion && (
          <RegionDetailPanel
            regionId={selectedRegion}
            agents={agents}
            activities={activities}
          />
        )}

        {activeTab === 'region' && !selectedRegion && (
          <div style={{ padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>
              Select a region on the map to view details
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {REGIONS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => onSelectRegion(r.id)}
                  style={{
                    padding: '4px 12px',
                    background: `${r.color}10`,
                    border: `1px solid ${r.color}33`,
                    borderRadius: 4,
                    color: r.color,
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  {r.icon} {r.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
