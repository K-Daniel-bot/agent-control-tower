'use client'

import { useRemote } from '../context/RemoteContext'
import { NocTheme } from '@/constants/nocTheme'

const PRESETS: readonly number[] = [0.5, 1, 2, 4]
const ACCENT = '#00ff88'
const FONT_FAMILY = "'JetBrains Mono', 'Fira Code', 'Menlo', monospace"

export default function SpeedController() {
  const { state, setExecutionSpeed } = useRemote()
  const { executionSpeed } = state

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    setExecutionSpeed(value)
  }

  const sliderPercent =
    ((executionSpeed - 0.25) / (4 - 0.25)) * 100

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 16px',
        background: NocTheme.background,
        border: `1px solid ${NocTheme.border}`,
        borderRadius: 8,
        fontFamily: FONT_FAMILY,
      }}
    >
      {/* Speed label */}
      <span
        style={{
          fontSize: 11,
          color: NocTheme.textTertiary,
          flexShrink: 0,
        }}
      >
        속도
      </span>

      {/* Current speed display */}
      <span
        style={{
          fontSize: 14,
          fontWeight: 700,
          color: ACCENT,
          minWidth: 42,
          textAlign: 'center',
          flexShrink: 0,
        }}
      >
        {formatSpeed(executionSpeed)}
      </span>

      {/* Slider */}
      <div style={{ position: 'relative', flex: 1, height: 20, display: 'flex', alignItems: 'center' }}>
        {/* Track background */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 4,
            borderRadius: 2,
            background: NocTheme.border,
          }}
        />
        {/* Track fill */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            width: `${sliderPercent}%`,
            height: 4,
            borderRadius: 2,
            background: ACCENT,
            boxShadow: `0 0 6px ${ACCENT}40`,
          }}
        />
        {/* Native input range */}
        <input
          type="range"
          min={0.25}
          max={4}
          step={0.25}
          value={executionSpeed}
          onChange={handleSliderChange}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            width: '100%',
            height: 20,
            opacity: 0,
            cursor: 'pointer',
            margin: 0,
            zIndex: 2,
          }}
        />
        {/* Thumb indicator */}
        <div
          style={{
            position: 'absolute',
            left: `${sliderPercent}%`,
            transform: 'translateX(-50%)',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: ACCENT,
            boxShadow: `0 0 8px ${ACCENT}60`,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Preset buttons */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        {PRESETS.map(preset => {
          const isActive = executionSpeed === preset
          return (
            <button
              key={preset}
              type="button"
              onClick={() => setExecutionSpeed(preset)}
              style={{
                padding: '3px 8px',
                fontSize: 10,
                fontFamily: FONT_FAMILY,
                fontWeight: isActive ? 700 : 400,
                color: isActive ? '#000' : NocTheme.textSecondary,
                background: isActive ? ACCENT : 'transparent',
                border: `1px solid ${isActive ? ACCENT : NocTheme.border}`,
                borderRadius: 4,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {formatSpeed(preset)}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function formatSpeed(speed: number): string {
  if (Number.isInteger(speed)) {
    return `${speed}x`
  }
  return `${speed}x`
}
