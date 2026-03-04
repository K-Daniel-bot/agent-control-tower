'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { useOrchestra } from '@/context/AgentOrchestraContext'
import { useCytoscapeElements } from '@/hooks/useCytoscapeElements'
import SectionHeader from './SectionHeader'
import GraphLegend from './GraphLegend'

// ─── Node / Link types for D3 ─────────────────────────────────────────────────
interface D3Node extends d3.SimulationNodeDatum {
  id: string
  label: string
  nodeType: string
  color: string
  status?: string
  r: number
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  id: string
  color: string
  opacity?: number
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function nodeRadius(type: string): number {
  if (type === 'hub') return 42
  if (type === 'orchestrator') return 17
  if (type === 'planner' || type === 'executor') return 13
  return 10
}

function fontSizeForType(type: string): number {
  if (type === 'hub') return 9
  return 8
}

// ─── CyElement → D3 nodes/links converter ─────────────────────────────────────
function convertToD3(elements: ReturnType<typeof useCytoscapeElements>) {
  const nodeMap = new Map<string, D3Node>()
  const links: D3Link[] = []

  for (const el of elements) {
    if (el.group === 'nodes') {
      const d = el.data as { id: string; label: string; nodeType: string; color: string; status?: string }
      nodeMap.set(d.id, {
        id: d.id,
        label: d.label,
        nodeType: d.nodeType,
        color: d.color,
        status: d.status,
        r: nodeRadius(d.nodeType),
      })
    }
  }

  for (const el of elements) {
    if (el.group === 'edges') {
      const d = el.data as { id: string; source: string; target: string; color: string; opacity?: number }
      if (nodeMap.has(d.source) && nodeMap.has(d.target)) {
        links.push({
          id: d.id,
          source: d.source,
          target: d.target,
          color: d.color,
          opacity: d.opacity,
        })
      }
    }
  }

  return { nodes: Array.from(nodeMap.values()), links }
}

// ─── Component ────────────────────────────────────────────────────────────────
export function DependencyGraphSection() {
  const svgRef = useRef<SVGSVGElement>(null)
  const simRef = useRef<d3.Simulation<D3Node, D3Link> | null>(null)
  const { state } = useOrchestra()
  const elements = useCytoscapeElements(state)
  const isEmpty = elements.length === 0

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    // Clear previous
    d3.select(svg).selectAll('*').remove()

    if (elements.length === 0) return

    const { nodes, links } = convertToD3(elements)
    const width = svg.clientWidth || 400
    const height = svg.clientHeight || 300

    const root = d3
      .select(svg)
      .attr('width', width)
      .attr('height', height)

    // Defs: arrow marker (unused but kept for future)
    const defs = root.append('defs')
    defs.append('filter')
      .attr('id', 'glow')
      .html(`
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
      `)

    // Link layer
    const linkG = root.append('g').attr('class', 'links')
    const linkSel = linkG
      .selectAll<SVGLineElement, D3Link>('line')
      .data(links, (d) => d.id)
      .join('line')
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 1)
      .attr('stroke-opacity', (d) => d.opacity ?? 0.35)

    // Node layer
    const nodeG = root.append('g').attr('class', 'nodes')
    const nodeGrp = nodeG
      .selectAll<SVGGElement, D3Node>('g')
      .data(nodes, (d) => d.id)
      .join('g')
      .attr('cursor', 'default')

    // Circle
    nodeGrp
      .append('circle')
      .attr('r', (d) => d.r)
      .attr('fill', (d) => {
        if (d.nodeType === 'hub') return 'rgba(0,255,136,0.12)'
        return '#1a1f2e'
      })
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', (d) => (d.nodeType === 'hub' ? 3 : d.status === 'active' || d.status === 'working' ? 2.5 : 1.5))
      .attr('filter', (d) => (d.nodeType === 'hub' ? 'url(#glow)' : null))

    // Hub multi-line text (SVG tspan)
    nodeGrp.each(function (d) {
      const g = d3.select(this)
      if (d.nodeType === 'hub') {
        const lines = d.label.split('\n')
        const text = g.append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', d.color)
          .attr('font-size', fontSizeForType(d.nodeType))
          .attr('font-weight', 'bold')
          .attr('pointer-events', 'none')
        lines.forEach((line, i) => {
          text.append('tspan')
            .attr('x', 0)
            .attr('dy', i === 0 ? `${-(lines.length - 1) * 0.55}em` : '1.1em')
            .text(line)
        })
      }
    })

    // Label below (non-hub)
    nodeGrp
      .filter((d) => d.nodeType !== 'hub')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.r + 9)
      .attr('fill', (d) => d.color)
      .attr('font-size', (d) => fontSizeForType(d.nodeType))
      .attr('pointer-events', 'none')
      .text((d) => d.label.replace('\n', ' '))

    // Stop previous simulation
    if (simRef.current) {
      simRef.current.stop()
    }

    // Force simulation
    const simulation = d3
      .forceSimulation<D3Node>(nodes)
      .force(
        'link',
        d3
          .forceLink<D3Node, D3Link>(links)
          .id((d) => d.id)
          .distance((link) => {
            const src = link.source as D3Node
            const tgt = link.target as D3Node
            if (src.nodeType === 'hub' || tgt.nodeType === 'hub') return 110
            return 80
          })
          .strength(0.4),
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<D3Node>().radius((d) => d.r + 6))

    simRef.current = simulation

    // Pin hub to center
    const hubNode = nodes.find((n) => n.nodeType === 'hub')
    if (hubNode) {
      hubNode.fx = width / 2
      hubNode.fy = height / 2
    }

    simulation.on('tick', () => {
      linkSel
        .attr('x1', (d) => (d.source as D3Node).x ?? 0)
        .attr('y1', (d) => (d.source as D3Node).y ?? 0)
        .attr('x2', (d) => (d.target as D3Node).x ?? 0)
        .attr('y2', (d) => (d.target as D3Node).y ?? 0)

      nodeGrp.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })

    return () => {
      simulation.stop()
    }
  }, [elements])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      simRef.current?.stop()
    }
  }, [])

  return (
    <div
      style={{
        flex: '3.5 1 0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0,
        borderTop: '1px solid #2a3042',
      }}
    >
      <SectionHeader
        title="Agent Dependency Graph (D3)"
        accentColor="#3b82f6"
        rightSlot={!isEmpty ? <GraphLegend /> : undefined}
      />
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        {isEmpty && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <span style={{ fontSize: 11, color: '#4b5563', letterSpacing: '0.05em' }}>
              의존성 그래프 대기 중...
            </span>
          </div>
        )}
        <svg
          ref={svgRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            opacity: isEmpty ? 0.3 : 1,
            transition: 'opacity 0.5s',
          }}
        />
      </div>
    </div>
  )
}

export default DependencyGraphSection
