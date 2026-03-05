'use client'

import type { DashboardLayoutSettings, WidgetConfig } from '@/types/customize'

interface DashboardLayoutSectionProps {
  readonly settings: DashboardLayoutSettings
  readonly onChange: (settings: DashboardLayoutSettings) => void
}

const MONITORING_OPTIONS = [
  { id: 'agents', label: 'Agent Status' },
  { id: 'tokens', label: 'Token Usage' },
  { id: 'events', label: 'Event Log' },
  { id: 'topology', label: 'Topology Map' },
  { id: 'communication', label: 'Communication Traffic' },
]

export default function DashboardLayoutSection({ settings, onChange }: DashboardLayoutSectionProps) {
  const handleWidgetToggle = (id: string) => {
    const updated: readonly WidgetConfig[] = settings.widgets.map((w) =>
      w.id === id ? { ...w, visible: !w.visible } : w
    )
    onChange({ ...settings, widgets: updated })
  }

  const handleMonitoringToggle = (id: string) => {
    const panels = settings.monitoringPanels.includes(id)
      ? settings.monitoringPanels.filter((p) => p !== id)
      : [...settings.monitoringPanels, id]
    onChange({ ...settings, monitoringPanels: panels })
  }

  return (
    <div style={{ padding: '20px 24px', maxWidth: 600 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#e5e7eb', marginBottom: 24 }}>
        대시보드 레이아웃
      </div>

      {/* Widget Visibility */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12, fontWeight: 600 }}>
          위젯 표시
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {settings.widgets.map((widget) => (
            <button
              key={widget.id}
              onClick={() => handleWidgetToggle(widget.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 12px',
                background: widget.visible ? 'rgba(0,255,136,0.04)' : 'transparent',
                border: `1px solid ${widget.visible ? 'rgba(0,255,136,0.15)' : '#222'}`,
                borderRadius: 4,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {/* Checkbox */}
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  border: `1px solid ${widget.visible ? '#00ff88' : '#444'}`,
                  background: widget.visible ? 'rgba(0,255,136,0.2)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  color: '#00ff88',
                  flexShrink: 0,
                }}
              >
                {widget.visible ? '\u2713' : ''}
              </div>

              <span style={{ fontSize: 12, color: widget.visible ? '#e5e7eb' : '#666' }}>
                {widget.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Monitoring Panels */}
      <div>
        <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12, fontWeight: 600 }}>
          모니터링 패널
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {MONITORING_OPTIONS.map((opt) => {
            const isActive = settings.monitoringPanels.includes(opt.id)
            return (
              <button
                key={opt.id}
                onClick={() => handleMonitoringToggle(opt.id)}
                style={{
                  padding: '6px 14px',
                  background: isActive ? 'rgba(0,255,136,0.08)' : 'transparent',
                  border: `1px solid ${isActive ? 'rgba(0,255,136,0.3)' : '#333'}`,
                  borderRadius: 4,
                  color: isActive ? '#00ff88' : '#8b95a5',
                  fontSize: 11,
                  fontWeight: isActive ? 700 : 400,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
