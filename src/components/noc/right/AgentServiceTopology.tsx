'use client'

import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

// ─── Agent Service Topology (Bubble Style) ────────────────────────────────────
// D3 force-directed bubble layout showing agent service relationships.
// Self-contained with static mock data -- no external context dependency.
// ───────────────────────────────────────────────────────────────────────────────

interface TopoNode extends d3.SimulationNodeDatum {
  readonly id: string
  readonly label: string
  readonly color: string
  readonly r: number
}

interface TopoLink extends d3.SimulationLinkDatum<TopoNode> {
  readonly id: string
}

const NODES: readonly TopoNode[] = [
  { id: 'orchestrator', label: 'Orchestrator', color: '#ffd700', r: 38 },
  { id: 'database', label: 'Database', color: '#3b82f6', r: 24 },
  { id: 'network', label: 'Network Monitor', color: '#06b6d4', r: 22 },
  { id: 'executor', label: 'Executor Pool', color: '#10b981', r: 26 },
  { id: 'internet', label: 'Internet_Service', color: '#ec4899', r: 20 },
  { id: 'ems', label: 'EMS', color: '#ff6b35', r: 18 },
]

const LINKS: readonly TopoLink[] = [
  { id: 'l1', source: 'orchestrator', target: 'database' },
  { id: 'l2', source: 'orchestrator', target: 'network' },
  { id: 'l3', source: 'orchestrator', target: 'executor' },
  { id: 'l4', source: 'orchestrator', target: 'internet' },
  { id: 'l5', source: 'orchestrator', target: 'ems' },
  { id: 'l6', source: 'executor', target: 'database' },
  { id: 'l7', source: 'network', target: 'internet' },
  { id: 'l8', source: 'ems', target: 'database' },
]

function createMutableData() {
  const nodes: TopoNode[] = NODES.map((n) => ({ ...n }))
  const links: TopoLink[] = LINKS.map((l) => ({ ...l }))
  return { nodes, links }
}

export default function AgentServiceTopology() {
  const svgRef = useRef<SVGSVGElement>(null)
  const simRef = useRef<d3.Simulation<TopoNode, TopoLink> | null>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    d3.select(svg).selectAll('*').remove()

    const { nodes, links } = createMutableData()
    const width = svg.clientWidth || 400
    const height = svg.clientHeight || 300

    const root = d3.select(svg).attr('width', width).attr('height', height)

    // Glow filter
    const defs = root.append('defs')
    defs
      .append('filter')
      .attr('id', 'topo-glow')
      .html(
        '<feGaussianBlur stdDeviation="3" result="blur"/>' +
          '<feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>'
      )

    // Link layer
    const linkSel = root
      .append('g')
      .selectAll<SVGLineElement, TopoLink>('line')
      .data(links, (d) => d.id)
      .join('line')
      .attr('stroke', '#333333')
      .attr('stroke-width', 1.2)
      .attr('stroke-opacity', 0.5)

    // Node groups
    const nodeGrp = root
      .append('g')
      .selectAll<SVGGElement, TopoNode>('g')
      .data(nodes, (d) => d.id)
      .join('g')
      .attr('cursor', 'default')

    // Circles
    nodeGrp
      .append('circle')
      .attr('r', (d) => d.r)
      .attr('fill', (d) => {
        if (d.id === 'orchestrator') return 'rgba(255,215,0,0.12)'
        return '#000000'
      })
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', (d) => (d.id === 'orchestrator' ? 2.5 : 1.8))
      .attr('filter', (d) => (d.id === 'orchestrator' ? 'url(#topo-glow)' : null))

    // Inner glow for hub
    nodeGrp
      .filter((d) => d.id === 'orchestrator')
      .append('circle')
      .attr('r', (d) => d.r - 6)
      .attr('fill', 'none')
      .attr('stroke', '#ffd700')
      .attr('stroke-width', 0.5)
      .attr('stroke-opacity', 0.3)

    // Labels below each bubble
    nodeGrp
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.r + 12)
      .attr('fill', (d) => d.color)
      .attr('font-size', 9)
      .attr('font-weight', 600)
      .attr('pointer-events', 'none')
      .attr('letter-spacing', '0.02em')
      .text((d) => d.label)

    // Hub center label
    nodeGrp
      .filter((d) => d.id === 'orchestrator')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#ffd700')
      .attr('font-size', 10)
      .attr('font-weight', 700)
      .attr('pointer-events', 'none')
      .text('ORC')

    // Stop previous simulation
    if (simRef.current) {
      simRef.current.stop()
    }

    // Force simulation
    const simulation = d3
      .forceSimulation<TopoNode>(nodes)
      .force(
        'link',
        d3
          .forceLink<TopoNode, TopoLink>(links)
          .id((d) => d.id)
          .distance((link) => {
            const src = link.source as TopoNode
            const tgt = link.target as TopoNode
            if (src.id === 'orchestrator' || tgt.id === 'orchestrator') return 100
            return 70
          })
          .strength(0.5)
      )
      .force('charge', d3.forceManyBody().strength(-250))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force(
        'collision',
        d3.forceCollide<TopoNode>().radius((d) => d.r + 8)
      )

    simRef.current = simulation

    // Pin orchestrator to center
    const hub = nodes.find((n) => n.id === 'orchestrator')
    if (hub) {
      hub.fx = width / 2
      hub.fy = height / 2
    }

    simulation.on('tick', () => {
      linkSel
        .attr('x1', (d) => (d.source as TopoNode).x ?? 0)
        .attr('y1', (d) => (d.source as TopoNode).y ?? 0)
        .attr('x2', (d) => (d.target as TopoNode).x ?? 0)
        .attr('y2', (d) => (d.target as TopoNode).y ?? 0)

      nodeGrp.attr('transform', (d) => `translate(${d.x ?? 0},${d.y ?? 0})`)
    })

    return () => {
      simulation.stop()
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      simRef.current?.stop()
    }
  }, [])

  return (
    <svg
      ref={svgRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      }}
    />
  )
}
