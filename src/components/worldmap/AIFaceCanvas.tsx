'use client'

import { useRef, useEffect } from 'react'

interface Props { width: number; height: number }

// Simplified face profile points (normalized 0-1, right side of canvas)
const FACE_OUTLINE: readonly [number, number][] = [
  [0.72, 0.08], [0.78, 0.06], [0.84, 0.08], [0.88, 0.14], [0.91, 0.22],
  [0.93, 0.32], [0.92, 0.42], [0.90, 0.50], [0.86, 0.58], [0.80, 0.65],
  [0.74, 0.70], [0.68, 0.72], [0.63, 0.70], [0.60, 0.66], [0.58, 0.74],
  [0.56, 0.82], [0.55, 0.88],
  [0.57, 0.62], [0.54, 0.52], [0.50, 0.44], [0.48, 0.38], [0.52, 0.34],
  [0.58, 0.30], [0.64, 0.26], [0.68, 0.20], [0.72, 0.14],
]

// Internal mesh points for triangulation
const MESH_POINTS: readonly [number, number][] = [
  [0.70, 0.20], [0.76, 0.18], [0.82, 0.16], [0.86, 0.20],
  [0.74, 0.28], [0.80, 0.26], [0.86, 0.28], [0.89, 0.34],
  [0.68, 0.34], [0.74, 0.36], [0.80, 0.34], [0.85, 0.38],
  [0.62, 0.40], [0.68, 0.42], [0.76, 0.44], [0.82, 0.42],
  [0.60, 0.50], [0.66, 0.50], [0.74, 0.52], [0.80, 0.50],
  [0.64, 0.58], [0.70, 0.58], [0.78, 0.56], [0.84, 0.52],
  [0.66, 0.64], [0.72, 0.62], [0.78, 0.60],
  [0.62, 0.32], [0.56, 0.40], [0.52, 0.48],
]

function drawCircuitTraces(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const traces = [
    // Horizontal traces from left
    { y: 0.15, x1: 0.02, x2: 0.38, dots: [0.08, 0.18, 0.28] },
    { y: 0.25, x1: 0.05, x2: 0.42, dots: [0.12, 0.24, 0.35] },
    { y: 0.35, x1: 0.01, x2: 0.45, dots: [0.06, 0.15, 0.30, 0.40] },
    { y: 0.45, x1: 0.04, x2: 0.48, dots: [0.10, 0.22, 0.36] },
    { y: 0.55, x1: 0.02, x2: 0.46, dots: [0.08, 0.20, 0.32, 0.42] },
    { y: 0.65, x1: 0.06, x2: 0.44, dots: [0.14, 0.26, 0.38] },
    { y: 0.75, x1: 0.03, x2: 0.40, dots: [0.10, 0.22, 0.34] },
    { y: 0.85, x1: 0.08, x2: 0.36, dots: [0.16, 0.28] },
  ]

  ctx.lineWidth = 0.8
  for (const t of traces) {
    ctx.strokeStyle = 'rgba(0,180,220,0.12)'
    ctx.beginPath()
    ctx.moveTo(t.x1 * w, t.y * h)
    ctx.lineTo(t.x2 * w, t.y * h)
    ctx.stroke()

    // Dots along trace
    for (const dx of t.dots) {
      ctx.fillStyle = 'rgba(0,200,240,0.25)'
      ctx.beginPath()
      ctx.arc(dx * w, t.y * h, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Vertical connecting traces
  const vTraces = [
    { x: 0.10, y1: 0.12, y2: 0.88 },
    { x: 0.22, y1: 0.18, y2: 0.80 },
    { x: 0.34, y1: 0.10, y2: 0.82 },
    { x: 0.42, y1: 0.20, y2: 0.70 },
  ]
  for (const v of vTraces) {
    ctx.strokeStyle = 'rgba(0,160,200,0.08)'
    ctx.beginPath()
    ctx.moveTo(v.x * w, v.y1 * h)
    ctx.lineTo(v.x * w, v.y2 * h)
    ctx.stroke()
  }

  // Chip rectangles
  const chips = [
    { x: 0.08, y: 0.22, w: 0.06, h: 0.04 },
    { x: 0.18, y: 0.42, w: 0.08, h: 0.05 },
    { x: 0.28, y: 0.32, w: 0.05, h: 0.04 },
    { x: 0.12, y: 0.62, w: 0.07, h: 0.04 },
    { x: 0.32, y: 0.52, w: 0.06, h: 0.05 },
    { x: 0.06, y: 0.78, w: 0.05, h: 0.03 },
    { x: 0.24, y: 0.72, w: 0.06, h: 0.04 },
  ]
  for (const c of chips) {
    ctx.strokeStyle = 'rgba(0,180,220,0.18)'
    ctx.fillStyle = 'rgba(0,120,180,0.06)'
    ctx.lineWidth = 0.6
    ctx.beginPath()
    ctx.rect(c.x * w, c.y * h, c.w * w, c.h * h)
    ctx.fill()
    ctx.stroke()
    // Pin dots
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = 'rgba(0,200,240,0.20)'
      ctx.beginPath()
      ctx.arc((c.x + c.w * (i + 1) / 4) * w, c.y * h, 1.2, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc((c.x + c.w * (i + 1) / 4) * w, (c.y + c.h) * h, 1.2, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

export default function AIFaceCanvas({ width, height }: Props) {
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

    const allPts = [...FACE_OUTLINE, ...MESH_POINTS]

    function frame() {
      if (!ctx) return
      timeRef.current += 0.016

      // Background
      ctx.fillStyle = '#0a1628'
      ctx.fillRect(0, 0, width, height)

      // Circuit traces (left side)
      drawCircuitTraces(ctx, width, height)

      // Draw face wireframe mesh
      ctx.strokeStyle = 'rgba(0,210,240,0.22)'
      ctx.lineWidth = 0.6

      // Connect nearby points to form mesh
      for (let i = 0; i < allPts.length; i++) {
        for (let j = i + 1; j < allPts.length; j++) {
          const dx = allPts[i][0] - allPts[j][0]
          const dy = allPts[i][1] - allPts[j][1]
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 0.14) {
            const alpha = Math.max(0.04, 0.22 - dist * 1.2)
            ctx.strokeStyle = `rgba(0,210,240,${alpha})`
            ctx.beginPath()
            ctx.moveTo(allPts[i][0] * width, allPts[i][1] * height)
            ctx.lineTo(allPts[j][0] * width, allPts[j][1] * height)
            ctx.stroke()
          }
        }
      }

      // Face outline (brighter)
      ctx.strokeStyle = 'rgba(0,220,255,0.45)'
      ctx.lineWidth = 1.2
      ctx.shadowColor = 'rgba(0,200,255,0.4)'
      ctx.shadowBlur = 6
      ctx.beginPath()
      for (let i = 0; i < FACE_OUTLINE.length; i++) {
        const [fx, fy] = FACE_OUTLINE[i]
        if (i === 0) ctx.moveTo(fx * width, fy * height)
        else ctx.lineTo(fx * width, fy * height)
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      // Node dots
      for (const [px, py] of allPts) {
        const pulse = Math.sin(timeRef.current * 2 + px * 10 + py * 10) * 0.3 + 0.7
        ctx.fillStyle = `rgba(0,220,255,${0.3 * pulse})`
        ctx.shadowColor = 'rgba(0,200,255,0.5)'
        ctx.shadowBlur = 4
        ctx.beginPath()
        ctx.arc(px * width, py * height, 2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.shadowBlur = 0

      // Connecting lines from face to circuit area (bridge)
      ctx.strokeStyle = 'rgba(0,180,220,0.10)'
      ctx.lineWidth = 0.5
      for (let i = 0; i < 8; i++) {
        const srcPt = allPts[Math.floor(i * allPts.length / 8)]
        const ty = 0.15 + i * 0.1
        ctx.beginPath()
        ctx.moveTo(srcPt[0] * width, srcPt[1] * height)
        ctx.bezierCurveTo(
          0.45 * width, srcPt[1] * height,
          0.42 * width, ty * height,
          0.38 * width, ty * height,
        )
        ctx.stroke()
      }

      // HUD text
      ctx.font = '9px monospace'
      ctx.fillStyle = 'rgba(0,180,220,0.30)'
      ctx.textAlign = 'left'
      ctx.fillText('AI NEURAL INTERFACE', 10, 16)
      ctx.fillStyle = 'rgba(0,180,220,0.15)'
      ctx.fillText('Mesh Nodes: ' + allPts.length, 10, height - 10)

      animRef.current = requestAnimationFrame(frame)
    }

    frame()
    return () => cancelAnimationFrame(animRef.current)
  }, [width, height])

  return <canvas ref={canvasRef} style={{ width, height, display: 'block' }} />
}
