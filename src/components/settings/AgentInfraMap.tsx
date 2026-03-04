'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { INFRA_NODES } from '@/data/infraNodeFeatures'
import type { InfraNodeDef } from '@/data/infraNodeFeatures'
import NodeFeaturePopover from './NodeFeaturePopover'

const MAP_W = 600
const MAP_H = 420
const CENTER_X = MAP_W / 2
const CENTER_Y = MAP_H / 2
const ORBIT_RADIUS = 150
const NODE_R = 26
const ROTATION_STEP = 360 / INFRA_NODES.length

function getNodePos(baseAngle: number, rotationOffset: number) {
  const angle = baseAngle + rotationOffset
  const rad = (angle * Math.PI) / 180
  return {
    x: CENTER_X + ORBIT_RADIUS * Math.cos(rad),
    y: CENTER_Y + ORBIT_RADIUS * Math.sin(rad),
    angle,
  }
}

export default function AgentInfraMap() {
  const [rotationOffset, setRotationOffset] = useState(-90)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [hoveredPos, setHoveredPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [isAnimating, setIsAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ startX: number; startOffset: number } | null>(null)

  // Keyboard arrow rotation
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        animateRotation(-ROTATION_STEP)
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        animateRotation(ROTATION_STEP)
      }
    }

    el.addEventListener('keydown', handleKeyDown)
    return () => el.removeEventListener('keydown', handleKeyDown)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAnimating])

  const animateRotation = useCallback((delta: number) => {
    if (isAnimating) return
    setIsAnimating(true)
    setRotationOffset((prev) => prev + delta)
    setTimeout(() => setIsAnimating(false), 400)
  }, [isAnimating])

  // Mouse drag rotation
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-node]')) return
    dragRef.current = { startX: e.clientX, startOffset: rotationOffset }
  }, [rotationOffset])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current) return
    const dx = e.clientX - dragRef.current.startX
    setRotationOffset(dragRef.current.startOffset + dx * 0.5)
  }, [])

  const handleMouseUp = useCallback(() => {
    dragRef.current = null
  }, [])

  // Click node → rotate it to top (12 o'clock = -90 deg)
  const handleNodeClick = useCallback((node: InfraNodeDef) => {
    const currentAngle = (node.baseAngle + rotationOffset) % 360
    const targetAngle = -90
    const delta = targetAngle - currentAngle
    // Normalize to shortest path
    const normalized = ((delta + 540) % 360) - 180
    animateRotation(normalized)
  }, [rotationOffset, animateRotation])

  const handleNodeHover = useCallback((id: string, screenX: number, screenY: number) => {
    setHoveredId(id)
    setHoveredPos({ x: screenX, y: screenY })
  }, [])

  const handleNodeLeave = useCallback(() => {
    setHoveredId(null)
  }, [])

  const hoveredNode = hoveredId ? INFRA_NODES.find((n) => n.id === hoveredId) ?? null : null

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: `
          radial-gradient(ellipse 80% 60% at 50% 50%, rgba(59,130,246,0.06) 0%, transparent 70%),
          linear-gradient(180deg, #0a0e1a 0%, #0d1220 100%)
        `,
        overflow: 'hidden',
        cursor: dragRef.current ? 'grabbing' : 'grab',
        outline: 'none',
      }}
    >
      {/* Grid overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }}
      />

      {/* Arrow buttons */}
      <button
        onClick={() => animateRotation(-ROTATION_STEP)}
        style={{
          position: 'absolute',
          left: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'rgba(26,31,46,0.8)',
          border: '1px solid #2a3042',
          color: '#6b7280',
          fontSize: 12,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      >
        {'<'}
      </button>
      <button
        onClick={() => animateRotation(ROTATION_STEP)}
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 10,
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: 'rgba(26,31,46,0.8)',
          border: '1px solid #2a3042',
          color: '#6b7280',
          fontSize: 12,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s',
        }}
      >
        {'>'}
      </button>

      <svg
        viewBox={`0 0 ${MAP_W} ${MAP_H}`}
        style={{ width: '100%', height: '100%' }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Glow filter */}
          <filter id="glow-core" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {INFRA_NODES.map((node) => (
            <filter key={`glow-${node.id}`} id={`glow-${node.id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
          {/* Dash animation for orbit ring */}
          <style>{`
            @keyframes orbit-dash {
              to { stroke-dashoffset: -60; }
            }
            @keyframes core-pulse {
              0%, 100% { opacity: 0.3; r: 52; }
              50% { opacity: 0.6; r: 56; }
            }
            @keyframes data-flow {
              0% { stroke-dashoffset: 20; }
              100% { stroke-dashoffset: 0; }
            }
          `}</style>
        </defs>

        {/* Outer orbit ring — animated dash */}
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={ORBIT_RADIUS}
          fill="none"
          stroke="#2a3042"
          strokeWidth={1}
          strokeDasharray="6,6"
          style={{ animation: 'orbit-dash 3s linear infinite' }}
        />
        {/* Second faint orbit ring */}
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={ORBIT_RADIUS + 20}
          fill="none"
          stroke="#1a2035"
          strokeWidth={0.5}
          strokeDasharray="3,8"
          opacity={0.5}
          style={{ animation: 'orbit-dash 5s linear infinite reverse' }}
        />

        {/* Connection lines from core to each node */}
        {INFRA_NODES.map((node) => {
          const pos = getNodePos(node.baseAngle, rotationOffset)
          const isHov = hoveredId === node.id
          return (
            <line
              key={`conn-${node.id}`}
              x1={CENTER_X}
              y1={CENTER_Y}
              x2={pos.x}
              y2={pos.y}
              stroke={isHov ? node.color : '#2a3042'}
              strokeWidth={isHov ? 1.5 : 0.6}
              strokeDasharray="4,4"
              opacity={isHov ? 0.9 : 0.3}
              style={{
                transition: 'all 0.4s ease',
                animation: isHov ? 'data-flow 0.6s linear infinite' : 'none',
              }}
            />
          )
        })}

        {/* Center core — pulse glow */}
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={52}
          fill="none"
          stroke="#00ff88"
          strokeWidth={1.5}
          opacity={0.3}
          style={{ animation: 'core-pulse 2.5s ease-in-out infinite' }}
        />
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={44}
          fill="rgba(0,255,136,0.04)"
          stroke="rgba(0,255,136,0.3)"
          strokeWidth={1.5}
          filter="url(#glow-core)"
        />
        <circle
          cx={CENTER_X}
          cy={CENTER_Y}
          r={38}
          fill="rgba(10,14,26,0.95)"
          stroke="rgba(0,255,136,0.15)"
          strokeWidth={1}
        />
        <text
          x={CENTER_X}
          y={CENTER_Y - 8}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={18}
          fill="#00ff88"
          fontWeight={800}
          letterSpacing="0.06em"
          filter="url(#glow-core)"
        >
          ACT
        </text>
        <text
          x={CENTER_X}
          y={CENTER_Y + 10}
          textAnchor="middle"
          fontSize={5.5}
          fill="#6b7280"
          letterSpacing="0.1em"
        >
          Agent Control Tower
        </text>

        {/* Orbital nodes */}
        {INFRA_NODES.map((node) => {
          const pos = getNodePos(node.baseAngle, rotationOffset)
          const isHov = hoveredId === node.id

          return (
            <g
              key={node.id}
              data-node={node.id}
              style={{
                cursor: 'pointer',
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              onClick={() => handleNodeClick(node)}
              onMouseEnter={(e) => {
                const svg = (e.target as SVGElement).ownerSVGElement
                if (!svg) return
                const pt = svg.createSVGPoint()
                pt.x = pos.x
                pt.y = pos.y
                const ctm = svg.getScreenCTM()
                if (!ctm) return
                const screenPt = pt.matrixTransform(ctm)
                handleNodeHover(node.id, screenPt.x, screenPt.y)
              }}
              onMouseLeave={handleNodeLeave}
            >
              {/* Outer glow ring */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={isHov ? NODE_R + 8 : NODE_R + 4}
                fill="none"
                stroke={node.color}
                strokeWidth={isHov ? 2 : 1}
                opacity={isHov ? 0.7 : 0.2}
                filter={isHov ? `url(#glow-${node.id})` : undefined}
                style={{ transition: 'all 0.3s' }}
              />
              {/* Node body */}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={NODE_R}
                fill={isHov ? `${node.color}25` : `${node.color}10`}
                stroke={node.color}
                strokeWidth={isHov ? 1.5 : 0.8}
                style={{ transition: 'all 0.3s' }}
              />
              {/* Icon */}
              <text
                x={pos.x}
                y={pos.y - 4}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={18}
                style={{ pointerEvents: 'none' }}
              >
                {node.icon}
              </text>
              {/* Label */}
              <text
                x={pos.x}
                y={pos.y + 16}
                textAnchor="middle"
                fontSize={7}
                fill={isHov ? '#e5e7eb' : node.color}
                fontWeight={700}
                letterSpacing="0.04em"
                style={{ pointerEvents: 'none', transition: 'fill 0.3s' }}
              >
                {node.label}
              </text>
            </g>
          )
        })}
      </svg>

      {/* Feature popover on hover */}
      {hoveredNode && (
        <NodeFeaturePopover
          node={hoveredNode}
          screenX={hoveredPos.x}
          screenY={hoveredPos.y}
        />
      )}
    </div>
  )
}
