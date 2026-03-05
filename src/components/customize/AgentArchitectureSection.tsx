'use client'

import type { AgentArchitectureSettings } from '@/types/customize'

interface AgentArchitectureSectionProps {
  readonly settings: AgentArchitectureSettings
  readonly onChange: (settings: AgentArchitectureSettings) => void
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  background: '#0a0a0a',
  border: '1px solid #333',
  borderRadius: 4,
  color: '#e5e7eb',
  fontSize: 13,
  fontFamily: "'JetBrains Mono', monospace",
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#9ca3af',
  marginBottom: 4,
  display: 'block',
}

const MODELS = [
  { value: 'claude-opus-4-6', label: 'Claude Opus 4.6' },
  { value: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6' },
  { value: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5' },
]

export default function AgentArchitectureSection({ settings, onChange }: AgentArchitectureSectionProps) {
  return (
    <div style={{ padding: '20px 24px', maxWidth: 600 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#e5e7eb', marginBottom: 24 }}>
        에이전트 아키텍처
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Orchestrator Section */}
        <div
          style={{
            padding: '16px',
            border: '1px solid #222',
            borderRadius: 6,
            background: 'rgba(255,255,255,0.01)',
          }}
        >
          <div style={{ fontSize: 12, color: '#00ff88', fontWeight: 600, marginBottom: 12 }}>
            Orchestrator
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={labelStyle}>Model</label>
              <select
                value={settings.orchestratorModel}
                onChange={(e) => onChange({ ...settings, orchestratorModel: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {MODELS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={labelStyle}>Max Tokens</label>
              <input
                type="number"
                value={settings.orchestratorMaxTokens}
                onChange={(e) => onChange({ ...settings, orchestratorMaxTokens: Number(e.target.value) })}
                min={1024}
                max={200000}
                step={1024}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Planner Section */}
        <div
          style={{
            padding: '16px',
            border: '1px solid #222',
            borderRadius: 6,
            background: 'rgba(255,255,255,0.01)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: '#00ff88', fontWeight: 600 }}>Planner</span>
            <button
              onClick={() => onChange({ ...settings, plannerEnabled: !settings.plannerEnabled })}
              style={{
                padding: '3px 10px',
                background: settings.plannerEnabled ? 'rgba(0,255,136,0.12)' : 'transparent',
                border: `1px solid ${settings.plannerEnabled ? '#00ff88' : '#444'}`,
                borderRadius: 3,
                color: settings.plannerEnabled ? '#00ff88' : '#666',
                fontSize: 10,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {settings.plannerEnabled ? 'ON' : 'OFF'}
            </button>
          </div>

          {settings.plannerEnabled && (
            <div>
              <label style={labelStyle}>Planner Model</label>
              <select
                value={settings.plannerModel}
                onChange={(e) => onChange({ ...settings, plannerModel: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {MODELS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Executor Pool */}
        <div
          style={{
            padding: '16px',
            border: '1px solid #222',
            borderRadius: 6,
            background: 'rgba(255,255,255,0.01)',
          }}
        >
          <div style={{ fontSize: 12, color: '#00ff88', fontWeight: 600, marginBottom: 12 }}>
            Executor Pool
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Pool Size</label>
              <input
                type="number"
                value={settings.executorPoolSize}
                onChange={(e) => onChange({ ...settings, executorPoolSize: Math.max(1, Math.min(10, Number(e.target.value))) })}
                min={1}
                max={10}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Concurrency</label>
              <input
                type="number"
                value={settings.executorConcurrency}
                onChange={(e) => onChange({ ...settings, executorConcurrency: Math.max(1, Math.min(5, Number(e.target.value))) })}
                min={1}
                max={5}
                style={inputStyle}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
