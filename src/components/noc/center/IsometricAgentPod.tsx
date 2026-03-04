'use client'

import { memo, useMemo } from 'react'

interface IsometricAgentPodProps {
  readonly x: number
  readonly y: number
  readonly color: string
  readonly status: string
  readonly name: string
  readonly agentType: string
}

// Isometric prism dimensions
const POD_W = 36
const POD_H = 22
const POD_DEPTH = 52

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return { r: 100, g: 100, b: 100 }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

function adjustBrightness(hex: string, factor: number): string {
  const { r, g, b } = hexToRgb(hex)
  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v * factor)))
  return `rgb(${clamp(r)},${clamp(g)},${clamp(b)})`
}

function IsometricAgentPod({ x, y, color, status, name }: IsometricAgentPodProps) {
  const faces = useMemo(() => {
    const hw = POD_W / 2
    const hh = POD_H / 2

    // Top face (lighter)
    const topFace = [
      `${x},${y - POD_DEPTH}`,
      `${x + hw},${y - POD_DEPTH + hh}`,
      `${x},${y - POD_DEPTH + POD_H}`,
      `${x - hw},${y - POD_DEPTH + hh}`,
    ].join(' ')

    // Left face (medium)
    const leftFace = [
      `${x - hw},${y - POD_DEPTH + hh}`,
      `${x},${y - POD_DEPTH + POD_H}`,
      `${x},${y}`,
      `${x - hw},${y - hh}`,
    ].join(' ')

    // Right face (darker)
    const rightFace = [
      `${x},${y - POD_DEPTH + POD_H}`,
      `${x + hw},${y - POD_DEPTH + hh}`,
      `${x + hw},${y - hh}`,
      `${x},${y}`,
    ].join(' ')

    return { topFace, leftFace, rightFace }
  }, [x, y])

  const topColor = adjustBrightness(color, 1.3)
  const leftColor = adjustBrightness(color, 0.7)
  const rightColor = adjustBrightness(color, 0.45)

  const isWorking = status === 'working' || status === 'active'
  const isError = status === 'error'
  const ledColor = isError ? '#ff3333' : isWorking ? '#00ff88' : '#4a5568'

  const glowId = `glow-${name.replace(/\s/g, '-')}`

  return (
    <g>
      {/* Glow filter for working pods */}
      {isWorking && (
        <defs>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feFlood floodColor={color} floodOpacity="0.4" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}

      {/* Pod body */}
      <g filter={isWorking ? `url(#${glowId})` : undefined}>
        {/* Left face */}
        <polygon
          points={faces.leftFace}
          fill={leftColor}
          stroke="#0a0e18"
          strokeWidth={0.5}
        />
        {/* Right face */}
        <polygon
          points={faces.rightFace}
          fill={rightColor}
          stroke="#0a0e18"
          strokeWidth={0.5}
        />
        {/* Top face */}
        <polygon
          points={faces.topFace}
          fill={topColor}
          stroke="#0a0e18"
          strokeWidth={0.5}
        />
      </g>

      {/* Status LED on top */}
      <circle
        cx={x}
        cy={y - POD_DEPTH}
        r={3}
        fill={ledColor}
        opacity={1}
      >
        {isWorking && (
          <animate
            attributeName="opacity"
            values="1;0.3;1"
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
        {isError && (
          <animate
            attributeName="opacity"
            values="1;0;1"
            dur="0.6s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      {/* LED glow halo */}
      {isWorking && (
        <circle
          cx={x}
          cy={y - POD_DEPTH}
          r={8}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={0.3}
        >
          <animate
            attributeName="r"
            values="6;12;6"
            dur="2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.4;0.1;0.4"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {/* Agent name label */}
      <text
        x={x}
        y={y + 10}
        textAnchor="middle"
        fill="#8892a8"
        fontSize={7}
        fontFamily="monospace"
      >
        {name.length > 10 ? `${name.slice(0, 9)}...` : name}
      </text>
    </g>
  )
}

export default memo(IsometricAgentPod)
