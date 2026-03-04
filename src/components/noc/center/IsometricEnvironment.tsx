'use client'

import { memo } from 'react'

// Ceiling light positions on the isometric floor
const CEILING_LIGHTS = [
  { cx: 300, cy: 220, r: 60 },
  { cx: 400, cy: 280, r: 70 },
  { cx: 500, cy: 220, r: 60 },
  { cx: 400, cy: 180, r: 50 },
] as const

interface StatusBoxProps {
  readonly label: string
  readonly value: string
  readonly unit: string
  readonly borderColor: string
  readonly textColor: string
}

function StatusBox({ label, value, unit, borderColor, textColor }: StatusBoxProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 14px',
        borderRadius: 4,
        border: `1px solid ${borderColor}`,
        background: 'rgba(10, 14, 26, 0.85)',
        minWidth: 100,
      }}
    >
      <span style={{ color: '#8892a8', fontSize: 11, fontWeight: 500 }}>
        {label}
      </span>
      <span style={{ color: textColor, fontSize: 14, fontWeight: 700, fontFamily: 'monospace' }}>
        {value}
      </span>
      <span style={{ color: '#6b7280', fontSize: 10 }}>
        {unit}
      </span>
    </div>
  )
}

function CeilingLights() {
  return (
    <g>
      <defs>
        {CEILING_LIGHTS.map((light, i) => (
          <radialGradient key={i} id={`ceilingLight${i}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1aff8c" stopOpacity={0.08} />
            <stop offset="40%" stopColor="#1aff8c" stopOpacity={0.03} />
            <stop offset="100%" stopColor="#1aff8c" stopOpacity={0} />
          </radialGradient>
        ))}
      </defs>
      {CEILING_LIGHTS.map((light, i) => (
        <ellipse
          key={i}
          cx={light.cx}
          cy={light.cy}
          rx={light.r}
          ry={light.r * 0.5}
          fill={`url(#ceilingLight${i})`}
        />
      ))}
    </g>
  )
}

function TitleOverlay() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          color: '#ffffff',
          fontSize: 16,
          fontWeight: 700,
          letterSpacing: 2,
          textShadow: '0 0 12px rgba(0,255,136,0.3)',
        }}
      >
        에이전트 운영현황
      </span>
    </div>
  )
}

function LogoOverlay() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 14,
        left: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#00ff88',
          boxShadow: '0 0 6px #00ff88',
        }}
      />
      <span
        style={{
          color: '#6b7fa8',
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}
      >
        Agent Control Tower
      </span>
    </div>
  )
}

function StatusOverlays() {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 12,
        right: 16,
        display: 'flex',
        gap: 10,
        pointerEvents: 'none',
      }}
    >
      <StatusBox
        label="전력"
        value="0.0"
        unit="%"
        borderColor="#10b981"
        textColor="#10b981"
      />
      <StatusBox
        label="온도"
        value="0.0"
        unit="°C"
        borderColor="#10b981"
        textColor="#10b981"
      />
      <StatusBox
        label="습도"
        value="0.0"
        unit="°C"
        borderColor="#a855f7"
        textColor="#a855f7"
      />
    </div>
  )
}

export const IsometricCeilingLights = memo(CeilingLights)
export const IsometricTitleOverlay = memo(TitleOverlay)
export const IsometricLogoOverlay = memo(LogoOverlay)
export const IsometricStatusOverlays = memo(StatusOverlays)
