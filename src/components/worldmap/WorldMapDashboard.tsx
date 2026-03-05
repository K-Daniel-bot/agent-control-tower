'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { NeuralNode } from '@/types/worldmap'
import { NEURAL_NODES, NEURAL_EDGES } from '@/data/worldmapNodes'
import { NODE_TYPE_COLORS } from '@/types/worldmap'
import NeuralGraphCanvas from './NeuralGraphCanvas'
import FlowArchitecture from './FlowArchitecture'
import MapInspector from './MapInspector'
import ExternalViewDashboard from './ExternalViewDashboard'

const ParticleCluster3D = dynamic(() => import('./ParticleCluster3D'), { ssr: false })

type ViewMode = 'internal' | 'external'

function randomizeHealth(nodes: readonly NeuralNode[]): NeuralNode[] {
  return nodes.map(n => {
    if (Math.random() > 0.92) {
      const healthOpts = ['ok', 'ok', 'ok', 'warn', 'idle'] as const
      const newMetrics = {
        ...n.metrics,
        cpu: Math.max(0, Math.min(100, n.metrics.cpu + Math.floor((Math.random() - 0.5) * 20))),
        tokenRate: Math.max(0, n.metrics.tokenRate + Math.floor((Math.random() - 0.5) * 8)),
        queueDepth: Math.max(0, n.metrics.queueDepth + Math.floor((Math.random() - 0.5) * 3)),
      }
      return { ...n, health: healthOpts[Math.floor(Math.random() * healthOpts.length)], metrics: newMetrics }
    }
    return n
  })
}

export default function WorldMapDashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('internal')
  const [nodes, setNodes] = useState<NeuralNode[]>([...NEURAL_NODES])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [leftSize, setLeftSize] = useState({ w: 800, h: 600 })
  const [rightTopSize, setRightTopSize] = useState({ w: 400, h: 300 })
  const [rightBottomSize, setRightBottomSize] = useState({ w: 400, h: 300 })
  const leftRef = useRef<HTMLDivElement>(null)
  const rtRef = useRef<HTMLDivElement>(null)
  const rbRef = useRef<HTMLDivElement>(null)

  // Resize observers
  useEffect(() => {
    const observe = (el: HTMLElement | null, setter: (s: { w: number; h: number }) => void) => {
      if (!el) return () => {}
      const ro = new ResizeObserver(entries => {
        const e = entries[0]
        if (e) setter({ w: e.contentRect.width, h: e.contentRect.height })
      })
      ro.observe(el)
      return () => ro.disconnect()
    }
    const c1 = observe(leftRef.current, setLeftSize)
    const c2 = observe(rtRef.current, setRightTopSize)
    const c3 = observe(rbRef.current, setRightBottomSize)
    return () => { c1(); c2(); c3() }
  }, [])

  // Simulate health changes
  useEffect(() => {
    const iv = setInterval(() => setNodes(prev => randomizeHealth(prev)), 3000)
    return () => clearInterval(iv)
  }, [])

  const handleSelectNode = useCallback((id: string | null) => setSelectedNodeId(id), [])

  const selectedNode = useMemo(
    () => nodes.find(n => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  )

  // Stats
  const activeCount = useMemo(() => nodes.filter(n => n.health === 'ok').length, [nodes])
  const totalTokenRate = useMemo(() => nodes.reduce((s, n) => s + n.metrics.tokenRate, 0), [nodes])
  const warnCount = useMemo(() => nodes.filter(n => n.health === 'warn').length, [nodes])

  return (
    <div style={{
      width: '100%', height: '100%', background: '#060a12',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      {/* Minimal status bar */}
      <div style={{
        height: 28, flexShrink: 0, display: 'flex', alignItems: 'center',
        padding: '0 16px', borderBottom: '1px solid #0e1822',
        gap: 20, fontSize: 10,
      }}>
        <span style={{ color: '#1e3050', fontWeight: 700, letterSpacing: '0.08em' }}>NEURAL OPS WORLD MAP</span>
        {/* View mode toggle */}
        <div style={{ display: 'flex', gap: 2, background: '#0a0e18', borderRadius: 4, padding: 2 }}>
          {([
            { mode: 'internal' as const, label: '\uB0B4\uBD80\uBCF4\uAE30' },
            { mode: 'external' as const, label: '\uC678\uBD80\uBCF4\uAE30' },
          ]).map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '2px 10px',
                fontSize: 9,
                fontWeight: 600,
                fontFamily: 'inherit',
                border: 'none',
                borderRadius: 3,
                cursor: 'pointer',
                background: viewMode === mode ? '#00d4ff22' : 'transparent',
                color: viewMode === mode ? '#00d4ff' : '#1e3050',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ width: 1, height: 14, background: '#0e1822' }} />
        <span style={{ color: '#00ff8860' }}>{'\u25CF'} Active: {activeCount}</span>
        <span style={{ color: '#f59e0b60' }}>{'\u25CF'} Warn: {warnCount}</span>
        <span style={{ color: '#3b82f660' }}>{'\u25CF'} Nodes: {nodes.length}</span>
        <span style={{ color: '#1e305080' }}>Token: {totalTokenRate} t/s</span>
        <div style={{ flex: 1 }} />
        {/* Node type legend */}
        {viewMode === 'internal' && (
        <div style={{ display: 'flex', gap: 10 }}>
          {(['orchestrator', 'planner', 'executor', 'tool', 'service', 'database', 'external', 'automation'] as const).map(t => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: NODE_TYPE_COLORS[t] + '66' }} />
              <span style={{ fontSize: 8, color: '#1e3050' }}>{t.slice(0, 3).toUpperCase()}</span>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Main content */}
      {viewMode === 'external' ? (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <ExternalViewDashboard />
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
          {/* Left: Neural Graph (55%) */}
          <div ref={leftRef} style={{
            flex: '0 0 55%', borderRight: '1px solid #0e1822',
            overflow: 'hidden', position: 'relative',
          }}>
            <NeuralGraphCanvas
              width={leftSize.w}
              height={leftSize.h}
              nodes={nodes}
              edges={NEURAL_EDGES}
              selectedNodeId={selectedNodeId}
              onSelectNode={handleSelectNode}
            />
          </div>

          {/* Right panels (45%) */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Top-right: 3D Particle Cluster */}
            <div ref={rtRef} style={{
              flex: 1, borderBottom: '1px solid #0e1822', overflow: 'hidden',
            }}>
              <ParticleCluster3D />
            </div>

            {/* Bottom-right: Flow Architecture */}
            <div ref={rbRef} style={{ flex: 1, overflow: 'hidden' }}>
              <FlowArchitecture width={rightBottomSize.w} height={rightBottomSize.h} />
            </div>
          </div>

          {/* Inspector overlay */}
          {selectedNode && (
            <MapInspector
              node={selectedNode}
              edges={NEURAL_EDGES}
              nodes={nodes}
              onClose={() => setSelectedNodeId(null)}
            />
          )}
        </div>
      )}
    </div>
  )
}
