'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { AgentPin, ActivityEntry, WorldMapViewMode, BottomTabType, RegionId } from '@/types/worldmap'
import { REGIONS } from '@/types/worldmap'
import TerritoryMap2D from './TerritoryMap2D'
import WorldMapBottomBar from './WorldMapBottomBar'

const GlobeView3D = dynamic(() => import('./GlobeView3D'), { ssr: false })

// Mock agent simulation data
const MOCK_AGENTS: AgentPin[] = [
  { id: 'a1', name: 'Planner', regionId: 'codebase', status: 'active', tokenRate: 12, role: 'planner', avatar: 'P' },
  { id: 'a2', name: 'Executor', regionId: 'codebase', status: 'working', tokenRate: 28, role: 'executor', avatar: 'E' },
  { id: 'a3', name: 'Reviewer', regionId: 'codebase', status: 'idle', tokenRate: 0, role: 'reviewer', avatar: 'R' },
  { id: 'a4', name: 'API Agent', regionId: 'api_gateway', status: 'active', tokenRate: 8, role: 'tool', avatar: 'A' },
  { id: 'a5', name: 'File Scanner', regionId: 'filesystem', status: 'working', tokenRate: 15, role: 'executor', avatar: 'F' },
  { id: 'a6', name: 'Shell Runner', regionId: 'local_tools', status: 'active', tokenRate: 5, role: 'tool', avatar: 'S' },
  { id: 'a7', name: 'Tester', regionId: 'local_tools', status: 'idle', tokenRate: 0, role: 'verifier', avatar: 'T' },
  { id: 'a8', name: 'Coordinator', regionId: 'communication', status: 'active', tokenRate: 3, role: 'orchestrator', avatar: 'C' },
]

const ACTIONS = [
  'read file src/app/page.tsx',
  'executed grep search',
  'called external API',
  'wrote test file',
  'ran npm build',
  'analyzed dependencies',
  'sent message to Planner',
  'completed code review',
  'parsed JSON response',
  'spawned subprocess',
]

function generateActivity(agents: AgentPin[]): ActivityEntry {
  const agent = agents[Math.floor(Math.random() * agents.length)]
  return {
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    agentId: agent.id,
    agentName: agent.name,
    regionId: agent.regionId,
    action: ACTIONS[Math.floor(Math.random() * ACTIONS.length)],
    timestamp: Date.now(),
  }
}

function randomizeAgentStatus(agents: readonly AgentPin[]): AgentPin[] {
  return agents.map((agent) => {
    if (Math.random() > 0.85) {
      const statuses = ['active', 'working', 'idle'] as const
      const regionIds = REGIONS.map((r) => r.id)
      return {
        ...agent,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        tokenRate: Math.floor(Math.random() * 30),
        regionId: Math.random() > 0.9
          ? regionIds[Math.floor(Math.random() * regionIds.length)]
          : agent.regionId,
      }
    }
    return agent
  })
}

export default function WorldMapDashboard() {
  const [viewMode, setViewMode] = useState<WorldMapViewMode>('2d')
  const [agents, setAgents] = useState<AgentPin[]>(MOCK_AGENTS)
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState<RegionId | null>(null)
  const [bottomTab, setBottomTab] = useState<BottomTabType>('agents')
  const [containerSize, setContainerSize] = useState({ width: 800, height: 500 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Resize observer
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Simulate agent movement and activity
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents((prev) => randomizeAgentStatus(prev))
      setActivities((prev) => {
        const newEntry = generateActivity(MOCK_AGENTS)
        return [...prev.slice(-99), newEntry]
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSelectRegion = useCallback((id: RegionId | null) => {
    setSelectedRegion(id)
    if (id) setBottomTab('region')
  }, [])

  // Stats
  const activeCount = useMemo(
    () => agents.filter((a) => a.status === 'active' || a.status === 'working').length,
    [agents]
  )
  const totalTokenRate = useMemo(
    () => agents.reduce((sum, a) => sum + a.tokenRate, 0),
    [agents]
  )

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: '#000',
        color: '#e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          padding: '10px 20px',
          borderBottom: '1px solid #333333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '0.02em' }}>
            Agent World Map
          </span>
          <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#6b7280' }}>
            <span>
              <span style={{ color: '#00ff88' }}>{activeCount}</span> active
            </span>
            <span>
              <span style={{ color: '#f59e0b' }}>{totalTokenRate}</span> tok/s
            </span>
            <span>{agents.length} total</span>
          </div>
        </div>

        {/* View mode toggle */}
        <div
          style={{
            display: 'flex',
            background: '#0a0a0a',
            borderRadius: 4,
            border: '1px solid #333333',
            overflow: 'hidden',
          }}
        >
          {(['2d', 'globe'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '5px 14px',
                background: viewMode === mode ? '#111111' : 'transparent',
                border: 'none',
                color: viewMode === mode ? '#e5e7eb' : '#555',
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              {mode === '2d' ? '2D Territory' : '3D Globe'}
            </button>
          ))}
        </div>
      </div>

      {/* Map view */}
      <div ref={containerRef} style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {viewMode === '2d' ? (
          <TerritoryMap2D
            agents={agents}
            selectedAgent={selectedAgent}
            selectedRegion={selectedRegion}
            onSelectAgent={setSelectedAgent}
            onSelectRegion={handleSelectRegion}
            width={containerSize.width}
            height={containerSize.height}
          />
        ) : (
          <GlobeView3D
            agents={agents}
            selectedRegion={selectedRegion}
            onSelectRegion={handleSelectRegion}
          />
        )}

        {/* Region legend overlay */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: '#000000cc',
            border: '1px solid #333333',
            borderRadius: 6,
            padding: '8px 12px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {REGIONS.map((r) => {
            const count = agents.filter((a) => a.regionId === r.id).length
            return (
              <div
                key={r.id}
                onClick={() => handleSelectRegion(selectedRegion === r.id ? null : r.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 10,
                  cursor: 'pointer',
                  opacity: selectedRegion && selectedRegion !== r.id ? 0.4 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: r.color,
                  }}
                />
                <span style={{ color: '#9ca3af' }}>{r.label}</span>
                {count > 0 && (
                  <span style={{ color: r.color, fontWeight: 600 }}>{count}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <WorldMapBottomBar
        activeTab={bottomTab}
        onTabChange={setBottomTab}
        agents={agents}
        activities={activities}
        selectedRegion={selectedRegion}
        onSelectRegion={handleSelectRegion}
      />
    </div>
  )
}
