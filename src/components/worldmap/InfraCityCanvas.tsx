'use client'

import { useRef, useEffect } from 'react'

interface Props { width: number; height: number }

// Zone definitions for isometric city layout
const ZONES = [
  { id: 'servers', label: 'SERVERS', x: 0.08, y: 0.15, w: 0.25, h: 0.35, color: '#00d4ff' },
  { id: 'database', label: 'DATABASE', x: 0.38, y: 0.10, w: 0.24, h: 0.30, color: '#f59e0b' },
  { id: 'projects', label: 'PROJECTS', x: 0.68, y: 0.15, w: 0.25, h: 0.35, color: '#00ff88' },
  { id: 'agents', label: 'AGENTS', x: 0.12, y: 0.58, w: 0.22, h: 0.30, color: '#a855f7' },
  { id: 'pipeline', label: 'PIPELINE', x: 0.42, y: 0.55, w: 0.20, h: 0.28, color: '#3b82f6' },
  { id: 'monitor', label: 'MONITOR', x: 0.68, y: 0.58, w: 0.24, h: 0.30, color: '#ec4899' },
] as const

// Buildings within zones (isometric boxes)
const BUILDINGS: readonly { zoneIdx: number; ox: number; oy: number; bw: number; bh: number; bd: number; bright: boolean }[] = [
  // Servers zone
  { zoneIdx: 0, ox: 0.02, oy: 0.04, bw: 40, bh: 55, bd: 25, bright: true },
  { zoneIdx: 0, ox: 0.08, oy: 0.04, bw: 35, bh: 45, bd: 25, bright: false },
  { zoneIdx: 0, ox: 0.14, oy: 0.04, bw: 38, bh: 60, bd: 25, bright: true },
  { zoneIdx: 0, ox: 0.05, oy: 0.16, bw: 42, bh: 40, bd: 25, bright: false },
  { zoneIdx: 0, ox: 0.12, oy: 0.16, bw: 36, bh: 50, bd: 25, bright: true },
  // Database zone
  { zoneIdx: 1, ox: 0.03, oy: 0.04, bw: 45, bh: 48, bd: 28, bright: true },
  { zoneIdx: 1, ox: 0.10, oy: 0.04, bw: 40, bh: 55, bd: 28, bright: false },
  { zoneIdx: 1, ox: 0.06, oy: 0.15, bw: 50, bh: 42, bd: 28, bright: true },
  // Projects zone
  { zoneIdx: 2, ox: 0.02, oy: 0.04, bw: 38, bh: 50, bd: 25, bright: false },
  { zoneIdx: 2, ox: 0.08, oy: 0.04, bw: 42, bh: 65, bd: 25, bright: true },
  { zoneIdx: 2, ox: 0.15, oy: 0.04, bw: 35, bh: 42, bd: 25, bright: false },
  { zoneIdx: 2, ox: 0.05, oy: 0.18, bw: 40, bh: 38, bd: 25, bright: true },
  // Agents zone
  { zoneIdx: 3, ox: 0.03, oy: 0.04, bw: 36, bh: 45, bd: 22, bright: true },
  { zoneIdx: 3, ox: 0.10, oy: 0.04, bw: 38, bh: 52, bd: 22, bright: false },
  { zoneIdx: 3, ox: 0.06, oy: 0.14, bw: 42, bh: 35, bd: 22, bright: true },
  // Pipeline zone
  { zoneIdx: 4, ox: 0.03, oy: 0.04, bw: 40, bh: 48, bd: 24, bright: false },
  { zoneIdx: 4, ox: 0.10, oy: 0.04, bw: 35, bh: 40, bd: 24, bright: true },
  // Monitor zone
  { zoneIdx: 5, ox: 0.03, oy: 0.04, bw: 44, bh: 50, bd: 26, bright: true },
  { zoneIdx: 5, ox: 0.12, oy: 0.04, bw: 38, bh: 42, bd: 26, bright: false },
  { zoneIdx: 5, ox: 0.07, oy: 0.15, bw: 40, bh: 36, bd: 26, bright: true },
]

// Road connections between zones
const ROADS: readonly { from: number; to: number }[] = [
  { from: 0, to: 1 }, { from: 1, to: 2 },
  { from: 0, to: 3 }, { from: 1, to: 4 }, { from: 2, to: 5 },
  { from: 3, to: 4 }, { from: 4, to: 5 },
]

function drawIsometricBox(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, bw: number, bh: number, bd: number,
  color: string, glow: boolean
) {
  // Isometric projection offsets
  const isoX = bw * 0.5
  const isoY = bw * 0.25
  const depthX = bd * 0.5
  const depthY = bd * 0.25

  if (glow) {
    ctx.shadowColor = color
    ctx.shadowBlur = 8
  }

  // Top face
  ctx.fillStyle = color + '30'
  ctx.strokeStyle = color + '55'
  ctx.lineWidth = 0.8
  ctx.beginPath()
  ctx.moveTo(x, y - bh)
  ctx.lineTo(x + isoX, y - bh - isoY)
  ctx.lineTo(x + isoX + depthX, y - bh - isoY + depthY)
  ctx.lineTo(x + depthX, y - bh + depthY)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Right face
  ctx.fillStyle = color + '18'
  ctx.beginPath()
  ctx.moveTo(x + isoX, y - bh - isoY)
  ctx.lineTo(x + isoX, y - isoY)
  ctx.lineTo(x + isoX + depthX, y - isoY + depthY)
  ctx.lineTo(x + isoX + depthX, y - bh - isoY + depthY)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Front face
  ctx.fillStyle = color + '22'
  ctx.beginPath()
  ctx.moveTo(x, y - bh)
  ctx.lineTo(x, y)
  ctx.lineTo(x + isoX, y - isoY)
  ctx.lineTo(x + isoX, y - bh - isoY)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Window lines on front face
  ctx.strokeStyle = color + '20'
  ctx.lineWidth = 0.4
  const windowRows = Math.floor(bh / 12)
  for (let i = 1; i <= windowRows; i++) {
    const wy = y - (bh * i / (windowRows + 1))
    ctx.beginPath()
    ctx.moveTo(x + 3, wy)
    ctx.lineTo(x + isoX - 3, wy - isoY * ((isoX - 6) / isoX))
    ctx.stroke()
  }

  ctx.shadowBlur = 0
}

function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Dot grid background
  ctx.fillStyle = '#0e1822'
  for (let x = 0; x < w; x += 24) {
    for (let y = 0; y < h; y += 24) {
      ctx.fillRect(x, y, 1, 1)
    }
  }
}

function drawRoad(
  ctx: CanvasRenderingContext2D,
  x1: number, y1: number, x2: number, y2: number,
  color: string, time: number
) {
  ctx.strokeStyle = color + '15'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()

  // Glowing dots along road
  const segments = 6
  for (let i = 0; i < segments; i++) {
    const t = ((i / segments) + time * 0.3) % 1
    const px = x1 + (x2 - x1) * t
    const py = y1 + (y2 - y1) * t
    ctx.beginPath()
    ctx.arc(px, py, 1.5, 0, Math.PI * 2)
    ctx.fillStyle = color + '40'
    ctx.fill()
  }
}

function drawBeacon(ctx: CanvasRenderingContext2D, cx: number, cy: number, time: number) {
  // Central beacon pulse
  const pulse = Math.sin(time * 2) * 0.3 + 0.7

  // Outer glow rings
  for (let i = 3; i >= 0; i--) {
    const r = 12 + i * 10 * pulse
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(0,212,255,${0.08 - i * 0.015})`
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // Core
  ctx.beginPath()
  ctx.arc(cx, cy, 5, 0, Math.PI * 2)
  ctx.fillStyle = '#00d4ff'
  ctx.shadowColor = '#00d4ff'
  ctx.shadowBlur = 15
  ctx.fill()
  ctx.shadowBlur = 0

  // Diamond shape
  ctx.strokeStyle = 'rgba(0,212,255,0.5)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(cx, cy - 18 * pulse)
  ctx.lineTo(cx + 10 * pulse, cy)
  ctx.lineTo(cx, cy + 18 * pulse)
  ctx.lineTo(cx - 10 * pulse, cy)
  ctx.closePath()
  ctx.stroke()
}

function drawCornerBrackets(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.strokeStyle = '#1a2a40'
  ctx.lineWidth = 1
  const s = 20
  ctx.beginPath(); ctx.moveTo(4, s + 4); ctx.lineTo(4, 4); ctx.lineTo(s + 4, 4); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(w - s - 4, 4); ctx.lineTo(w - 4, 4); ctx.lineTo(w - 4, s + 4); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(4, h - s - 4); ctx.lineTo(4, h - 4); ctx.lineTo(s + 4, h - 4); ctx.stroke()
  ctx.beginPath(); ctx.moveTo(w - s - 4, h - 4); ctx.lineTo(w - 4, h - 4); ctx.lineTo(w - 4, h - s - 4); ctx.stroke()
}

export default function InfraCityCanvas({ width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef(0)
  const timeRef = useRef(0)

  useEffect(() => {
    const cvs = canvasRef.current
    if (!cvs) return
    const ctx = cvs.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    cvs.width = width * dpr
    cvs.height = height * dpr
    ctx.scale(dpr, dpr)

    function frame() {
      if (!ctx) return
      timeRef.current += 0.016

      // Background
      ctx.fillStyle = '#060a12'
      ctx.fillRect(0, 0, width, height)
      drawGrid(ctx, width, height)
      drawCornerBrackets(ctx, width, height)

      // Roads between zone centers
      for (const road of ROADS) {
        const zf = ZONES[road.from]
        const zt = ZONES[road.to]
        const x1 = (zf.x + zf.w / 2) * width
        const y1 = (zf.y + zf.h / 2) * height
        const x2 = (zt.x + zt.w / 2) * width
        const y2 = (zt.y + zt.h / 2) * height
        drawRoad(ctx, x1, y1, x2, y2, zf.color, timeRef.current)
      }

      // Zone areas
      for (const zone of ZONES) {
        const zx = zone.x * width
        const zy = zone.y * height
        const zw = zone.w * width
        const zh = zone.h * height

        // Zone background
        ctx.fillStyle = zone.color + '06'
        ctx.strokeStyle = zone.color + '18'
        ctx.lineWidth = 0.6
        ctx.setLineDash([4, 4])
        ctx.beginPath()
        ctx.rect(zx, zy, zw, zh)
        ctx.fill()
        ctx.stroke()
        ctx.setLineDash([])

        // Zone label
        ctx.font = 'bold 9px monospace'
        ctx.textAlign = 'center'
        ctx.fillStyle = zone.color + '55'
        ctx.fillText(zone.label, zx + zw / 2, zy - 4)
      }

      // Buildings
      for (const b of BUILDINGS) {
        const zone = ZONES[b.zoneIdx]
        const bx = (zone.x + b.ox) * width
        const by = (zone.y + zone.h * 0.35 + b.oy) * height
        drawIsometricBox(ctx, bx, by, b.bw, b.bh, b.bd, zone.color, b.bright)
      }

      // Central beacon
      drawBeacon(ctx, width * 0.50, height * 0.48, timeRef.current)

      // Scan line effect
      const scanY = (timeRef.current * 30) % height
      ctx.strokeStyle = 'rgba(0,212,255,0.03)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, scanY)
      ctx.lineTo(width, scanY)
      ctx.stroke()

      // HUD text
      ctx.textAlign = 'left'
      ctx.textBaseline = 'top'
      ctx.font = '10px monospace'
      ctx.fillStyle = '#00d4ff44'
      ctx.fillText('INFRASTRUCTURE CITY', 14, 14)
      ctx.fillStyle = '#1e2d4444'
      ctx.fillText('Isometric Agent Topology', 14, 28)

      ctx.textAlign = 'right'
      ctx.fillStyle = '#00ff8844'
      ctx.fillText(`${ZONES.length} ZONES  ${BUILDINGS.length} NODES`, width - 14, 14)

      // Bottom metric bar
      ctx.fillStyle = '#0a0e18cc'
      ctx.fillRect(0, height - 44, width, 44)
      ctx.strokeStyle = '#0e1822'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, height - 44)
      ctx.lineTo(width, height - 44)
      ctx.stroke()

      ctx.textAlign = 'left'
      ctx.font = '9px monospace'
      const metrics = [
        { label: 'CPU', value: '34%', color: '#00ff88' },
        { label: 'MEM', value: '62%', color: '#3b82f6' },
        { label: 'NET', value: '1.2Gbps', color: '#00d4ff' },
        { label: 'AGENTS', value: '22', color: '#a855f7' },
        { label: 'QUEUE', value: '8', color: '#f59e0b' },
        { label: 'LATENCY', value: '12ms', color: '#ec4899' },
      ]
      const mw = width / metrics.length
      for (const [i, m] of metrics.entries()) {
        const mx = 14 + i * mw
        ctx.fillStyle = m.color + '40'
        ctx.fillText(m.label, mx, height - 36)
        ctx.fillStyle = m.color + '88'
        ctx.font = 'bold 11px monospace'
        ctx.fillText(m.value, mx, height - 22)
        ctx.font = '9px monospace'
      }

      animRef.current = requestAnimationFrame(frame)
    }

    frame()
    return () => cancelAnimationFrame(animRef.current)
  }, [width, height])

  return <canvas ref={canvasRef} style={{ width, height, display: 'block' }} />
}
