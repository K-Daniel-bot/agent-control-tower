'use client'

import { memo } from 'react'

// Isometric room geometry constants
const FLOOR = {
  top: { x: 400, y: 120 },
  right: { x: 700, y: 270 },
  bottom: { x: 400, y: 420 },
  left: { x: 100, y: 270 },
} as const

const WALL_HEIGHT = 180

const LEFT_WALL = [
  FLOOR.left,
  FLOOR.top,
  { x: FLOOR.top.x, y: FLOOR.top.y - WALL_HEIGHT },
  { x: FLOOR.left.x, y: FLOOR.left.y - WALL_HEIGHT },
] as const

const RIGHT_WALL = [
  FLOOR.top,
  FLOOR.right,
  { x: FLOOR.right.x, y: FLOOR.right.y - WALL_HEIGHT },
  { x: FLOOR.top.x, y: FLOOR.top.y - WALL_HEIGHT },
] as const

function toPoints(pts: ReadonlyArray<{ x: number; y: number }>): string {
  return pts.map(p => `${p.x},${p.y}`).join(' ')
}

function generateGridLines(): ReadonlyArray<{ x1: number; y1: number; x2: number; y2: number }> {
  const lines: Array<{ x1: number; y1: number; x2: number; y2: number }> = []
  const steps = 8

  for (let i = 1; i < steps; i++) {
    const t = i / steps
    // Lines parallel to left-top edge
    const startX = FLOOR.left.x + (FLOOR.bottom.x - FLOOR.left.x) * t
    const startY = FLOOR.left.y + (FLOOR.bottom.y - FLOOR.left.y) * t
    const endX = FLOOR.top.x + (FLOOR.right.x - FLOOR.top.x) * t
    const endY = FLOOR.top.y + (FLOOR.right.y - FLOOR.top.y) * t
    lines.push({ x1: startX, y1: startY, x2: endX, y2: endY })

    // Lines parallel to top-right edge
    const startX2 = FLOOR.left.x + (FLOOR.top.x - FLOOR.left.x) * t
    const startY2 = FLOOR.left.y + (FLOOR.top.y - FLOOR.left.y) * t
    const endX2 = FLOOR.bottom.x + (FLOOR.right.x - FLOOR.bottom.x) * t
    const endY2 = FLOOR.bottom.y + (FLOOR.right.y - FLOOR.bottom.y) * t
    lines.push({ x1: startX2, y1: startY2, x2: endX2, y2: endY2 })
  }

  return lines
}

const GRID_LINES = generateGridLines()

function IsometricFloor() {
  return (
    <g>
      {/* Floor gradient definition */}
      <defs>
        <linearGradient id="floorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
        <linearGradient id="leftWallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
        <linearGradient id="rightWallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#000000" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
      </defs>

      {/* Left wall */}
      <polygon
        points={toPoints(LEFT_WALL)}
        fill="url(#leftWallGrad)"
        stroke="#333333"
        strokeWidth={0.5}
      />
      {/* Right wall */}
      <polygon
        points={toPoints(RIGHT_WALL)}
        fill="url(#rightWallGrad)"
        stroke="#333333"
        strokeWidth={0.5}
      />
      {/* Wall edge highlight (top edge) */}
      <line
        x1={FLOOR.left.x}
        y1={FLOOR.left.y - WALL_HEIGHT}
        x2={FLOOR.top.x}
        y2={FLOOR.top.y - WALL_HEIGHT}
        stroke="#333333"
        strokeWidth={1}
      />
      <line
        x1={FLOOR.top.x}
        y1={FLOOR.top.y - WALL_HEIGHT}
        x2={FLOOR.right.x}
        y2={FLOOR.right.y - WALL_HEIGHT}
        stroke="#333333"
        strokeWidth={1}
      />

      {/* Floor */}
      <polygon
        points={toPoints([FLOOR.top, FLOOR.right, FLOOR.bottom, FLOOR.left])}
        fill="url(#floorGrad)"
        stroke="#333333"
        strokeWidth={1}
      />

      {/* Grid lines */}
      {GRID_LINES.map((line, i) => (
        <line
          key={i}
          x1={line.x1}
          y1={line.y1}
          x2={line.x2}
          y2={line.y2}
          stroke="#333333"
          strokeWidth={0.4}
          opacity={0.6}
        />
      ))}

      {/* Floor edge highlight */}
      <line
        x1={FLOOR.left.x}
        y1={FLOOR.left.y}
        x2={FLOOR.top.x}
        y2={FLOOR.top.y}
        stroke="#333333"
        strokeWidth={0.8}
      />
      <line
        x1={FLOOR.top.x}
        y1={FLOOR.top.y}
        x2={FLOOR.right.x}
        y2={FLOOR.right.y}
        stroke="#333333"
        strokeWidth={0.8}
      />
    </g>
  )
}

export default memo(IsometricFloor)

// Export floor geometry for positioning calculations
export const FLOOR_GEOMETRY = FLOOR
export const ROOM_WALL_HEIGHT = WALL_HEIGHT
