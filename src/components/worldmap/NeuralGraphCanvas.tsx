'use client'

import { useRef, useEffect, useMemo, useCallback } from 'react'
import type { NeuralNode, NeuralEdge, LayerName } from '@/types/worldmap'
import { LAYERS, LAYER_LABELS, NODE_TYPE_COLORS } from '@/types/worldmap'

interface Props {
  width: number
  height: number
  nodes: readonly NeuralNode[]
  edges: readonly NeuralEdge[]
  selectedNodeId: string | null
  onSelectNode: (id: string | null) => void
}

interface NodePos { x: number; y: number; node: NeuralNode }

interface Particle {
  fromX: number; fromY: number
  toX: number; toY: number
  progress: number; speed: number; color: string
}

const BG = '#060a12'
const GRID_C = '#0e1420'
const R = 16
const PX = 80
const PY = 70

function layout(nodes: readonly NeuralNode[], w: number, h: number): Map<string, NodePos> {
  const pos = new Map<string, NodePos>()
  const groups = new Map<LayerName, NeuralNode[]>()
  for (const n of nodes) groups.set(n.layer, [...(groups.get(n.layer) ?? []), n])
  const uw = w - PX * 2
  const uh = h - PY * 2
  for (const [li, layer] of LAYERS.entries()) {
    const ln = groups.get(layer) ?? []
    const x = PX + (li / (LAYERS.length - 1)) * uw
    for (const [ni, node] of ln.entries()) {
      const y = PY + ((ni + 1) / (ln.length + 1)) * uh
      pos.set(node.id, { x, y, node })
    }
  }
  return pos
}

function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = GRID_C
  for (let x = 0; x < w; x += 28) {
    for (let y = 0; y < h; y += 28) {
      ctx.fillRect(x, y, 1, 1)
    }
  }
  // Scan lines
  ctx.strokeStyle = 'rgba(20,30,50,0.3)'
  ctx.lineWidth = 0.5
  for (let y = 0; y < h; y += 4) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }
}

function drawCornerBrackets(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.strokeStyle = '#1a2a40'
  ctx.lineWidth = 1
  const s = 20
  // top-left
  ctx.beginPath(); ctx.moveTo(4, s + 4); ctx.lineTo(4, 4); ctx.lineTo(s + 4, 4); ctx.stroke()
  // top-right
  ctx.beginPath(); ctx.moveTo(w - s - 4, 4); ctx.lineTo(w - 4, 4); ctx.lineTo(w - 4, s + 4); ctx.stroke()
  // bottom-left
  ctx.beginPath(); ctx.moveTo(4, h - s - 4); ctx.lineTo(4, h - 4); ctx.lineTo(s + 4, h - 4); ctx.stroke()
  // bottom-right
  ctx.beginPath(); ctx.moveTo(w - s - 4, h - 4); ctx.lineTo(w - 4, h - 4); ctx.lineTo(w - 4, h - s - 4); ctx.stroke()
}

export default function NeuralGraphCanvas({ width, height, nodes, edges, selectedNodeId, onSelectNode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef(0)
  const particlesRef = useRef<Particle[]>([])

  const positions = useMemo(() => layout(nodes, width, height), [nodes, width, height])

  // Init particles
  useEffect(() => {
    const active = edges.filter(e => e.active)
    if (active.length === 0) return
    const ps: Particle[] = []
    for (let i = 0; i < 50; i++) {
      const e = active[i % active.length]
      const f = positions.get(e.source)
      const t = positions.get(e.target)
      if (!f || !t) continue
      const tn = nodes.find(n => n.id === e.target)
      ps.push({
        fromX: f.x, fromY: f.y, toX: t.x, toY: t.y,
        progress: Math.random(),
        speed: 0.0015 + Math.random() * 0.003,
        color: tn ? NODE_TYPE_COLORS[tn.type] : '#6688cc',
      })
    }
    particlesRef.current = ps
  }, [edges, positions, nodes])

  useEffect(() => {
    const cvs = canvasRef.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    cvs.width = width * dpr
    cvs.height = height * dpr
    ctx.scale(dpr, dpr)

    const activeEdges = edges.filter(e => e.active)

    function frame(): void {
      if (!ctx) return
      // Update particles
      for (const p of particlesRef.current) {
        p.progress += p.speed
        if (p.progress >= 1 && activeEdges.length > 0) {
          const e = activeEdges[Math.floor(Math.random() * activeEdges.length)]
          const f = positions.get(e.source)
          const t = positions.get(e.target)
          if (f && t) {
            p.fromX = f.x; p.fromY = f.y; p.toX = t.x; p.toY = t.y
            p.progress = 0; p.speed = 0.0015 + Math.random() * 0.003
            const tn = nodes.find(n => n.id === e.target)
            p.color = tn ? NODE_TYPE_COLORS[tn.type] : '#6688cc'
          }
        }
      }

      // BG
      ctx.fillStyle = BG
      ctx.fillRect(0, 0, width, height)
      drawGrid(ctx, width, height)
      drawCornerBrackets(ctx, width, height)

      // Layer labels
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      for (const [i, layer] of LAYERS.entries()) {
        const x = PX + (i / (LAYERS.length - 1)) * (width - PX * 2)
        ctx.fillStyle = '#1e2d44'
        ctx.fillText(LAYER_LABELS[layer], x, 30)
        // Vertical guide line
        ctx.strokeStyle = 'rgba(20,40,70,0.2)'
        ctx.lineWidth = 0.5
        ctx.setLineDash([2, 6])
        ctx.beginPath(); ctx.moveTo(x, 42); ctx.lineTo(x, height - 20); ctx.stroke()
        ctx.setLineDash([])
      }

      // Edges
      for (const e of edges) {
        const f = positions.get(e.source)
        const t = positions.get(e.target)
        if (!f || !t) continue
        ctx.beginPath()
        // Bezier curve for smoother lines
        const mx = (f.x + t.x) / 2
        ctx.moveTo(f.x, f.y)
        ctx.bezierCurveTo(mx, f.y, mx, t.y, t.x, t.y)
        if (e.active) {
          ctx.strokeStyle = 'rgba(100,160,220,0.28)'
          ctx.lineWidth = 1
          ctx.shadowColor = 'rgba(80,140,220,0.35)'
          ctx.shadowBlur = 6
        } else {
          ctx.strokeStyle = 'rgba(60,90,140,0.12)'
          ctx.lineWidth = 0.6
          ctx.shadowBlur = 0
        }
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      // Particles
      for (const p of particlesRef.current) {
        const t = p.progress
        const mx = (p.fromX + p.toX) / 2
        // Bezier interpolation (quadratic approx)
        const u = 1 - t
        const px = u * u * p.fromX + 2 * u * t * mx + t * t * p.toX
        const py = u * u * p.fromY + 2 * u * t * ((p.fromY + p.toY) / 2) + t * t * p.toY
        ctx.beginPath()
        ctx.arc(px, py, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = 8
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Nodes
      for (const [, pos] of positions) {
        const { x, y, node } = pos
        const c = NODE_TYPE_COLORS[node.type]
        const sel = selectedNodeId === node.id
        const active = node.health === 'ok'

        // Glow
        if (active) {
          ctx.beginPath()
          ctx.arc(x, y, R + 8, 0, Math.PI * 2)
          const g = ctx.createRadialGradient(x, y, R - 2, x, y, R + 8)
          g.addColorStop(0, c + '18')
          g.addColorStop(1, c + '00')
          ctx.fillStyle = g
          ctx.fill()
        }

        // Selection ring
        if (sel) {
          ctx.beginPath()
          ctx.arc(x, y, R + 5, 0, Math.PI * 2)
          ctx.strokeStyle = '#ffffff'
          ctx.lineWidth = 1
          ctx.setLineDash([3, 3])
          ctx.stroke()
          ctx.setLineDash([])
        }

        // Fill
        ctx.beginPath()
        ctx.arc(x, y, R, 0, Math.PI * 2)
        ctx.fillStyle = '#080c16'
        ctx.fill()

        // Ring
        ctx.beginPath()
        ctx.arc(x, y, R, 0, Math.PI * 2)
        ctx.strokeStyle = c
        ctx.lineWidth = node.health === 'error' ? 3 : 2
        ctx.shadowColor = c
        ctx.shadowBlur = active ? 10 : 0
        ctx.stroke()
        ctx.shadowBlur = 0

        // Cross for idle/error
        if (node.health === 'idle') {
          ctx.strokeStyle = c + '40'
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(x - 5, y - 5); ctx.lineTo(x + 5, y + 5)
          ctx.moveTo(x + 5, y - 5); ctx.lineTo(x - 5, y + 5)
          ctx.stroke()
        }
        if (node.health === 'warn') {
          ctx.beginPath()
          ctx.arc(x + R * 0.7, y - R * 0.7, 3.5, 0, Math.PI * 2)
          ctx.fillStyle = '#f59e0b'
          ctx.shadowColor = '#f59e0b'
          ctx.shadowBlur = 4
          ctx.fill()
          ctx.shadowBlur = 0
        }

        // Short label
        ctx.font = 'bold 9px monospace'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = c
        ctx.fillText(node.shortLabel, x, y)

        // Name below
        ctx.font = '8px monospace'
        ctx.fillStyle = '#3a4a60'
        ctx.fillText(node.label, x, y + R + 12)
      }

      // HUD overlay
      const ac = nodes.filter(n => n.health === 'ok').length
      const tr = nodes.reduce((s, n) => s + n.metrics.tokenRate, 0)
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.font = '10px monospace'
      ctx.fillStyle = '#00ff8866'
      ctx.fillText('\u25CF rREC Enabled', 14, height - 64)
      ctx.fillText(`\u25CF All Agent Nodes Active: ${ac}/${nodes.length}`, 14, height - 48)
      ctx.fillStyle = '#3b82f666'
      ctx.fillText(`\u25CF Token Stream: ${tr} tok/s`, 14, height - 32)
      ctx.fillStyle = '#1e2d4466'
      ctx.fillText(`${nodes.length} NODES  ${edges.length} EDGES  ${edges.filter(e => e.active).length} ACTIVE`, 14, height - 16)

      // Top-right HUD
      ctx.textAlign = 'right'
      ctx.fillStyle = '#00d4ff44'
      ctx.fillText('NEURAL OPS TOPOLOGY', width - 14, 14)
      ctx.fillStyle = '#1e2d4444'
      ctx.fillText('Layer Mode: Transformer', width - 14, 28)

      animRef.current = requestAnimationFrame(frame)
    }

    frame()
    return () => cancelAnimationFrame(animRef.current)
  }, [width, height, nodes, edges, positions, selectedNodeId])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const cvs = canvasRef.current
    if (!cvs) return
    const rect = cvs.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    let hit: string | null = null
    for (const [id, p] of positions) {
      const dx = mx - p.x, dy = my - p.y
      if (dx * dx + dy * dy < (R + 4) * (R + 4)) { hit = id; break }
    }
    onSelectNode(hit)
  }, [positions, onSelectNode])

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: 'block', cursor: 'crosshair' }}
      onClick={handleClick}
    />
  )
}
