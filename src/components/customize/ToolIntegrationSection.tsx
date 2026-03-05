'use client'

import { useState } from 'react'
import type { ToolIntegrationItem } from '@/types/customize'

interface ToolIntegrationSectionProps {
  readonly tools: readonly ToolIntegrationItem[]
  readonly onChange: (tools: readonly ToolIntegrationItem[]) => void
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 10px',
  background: '#0a0a0a',
  border: '1px solid #333',
  borderRadius: 4,
  color: '#e5e7eb',
  fontSize: 12,
  fontFamily: "'JetBrains Mono', monospace",
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#9ca3af',
  marginBottom: 2,
  display: 'block',
}

const TOOL_CONFIG_FIELDS: Readonly<Record<string, readonly { key: string; label: string; placeholder: string; masked?: boolean }[]>> = {
  claude: [
    { key: 'envKey', label: 'API Key (env var)', placeholder: 'ANTHROPIC_API_KEY', masked: true },
    { key: 'model', label: 'Model', placeholder: 'claude-sonnet-4-6' },
  ],
  git: [
    { key: 'repoUrl', label: 'Repository URL', placeholder: 'https://github.com/user/repo' },
    { key: 'branch', label: 'Default Branch', placeholder: 'main' },
  ],
  notion: [
    { key: 'workspaceId', label: 'Workspace ID', placeholder: 'workspace-id' },
    { key: 'envKey', label: 'API Key (env var)', placeholder: 'NOTION_API_KEY', masked: true },
  ],
  browser: [
    { key: 'headless', label: 'Headless Mode', placeholder: 'true' },
  ],
  shell: [
    { key: 'allowedCommands', label: 'Allowed Commands', placeholder: 'npm,node,git,python3' },
  ],
}

export default function ToolIntegrationSection({ tools, onChange }: ToolIntegrationSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleToggle = (id: string) => {
    onChange(
      tools.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    )
  }

  const handleConfigChange = (id: string, key: string, value: string) => {
    onChange(
      tools.map((t) =>
        t.id === id ? { ...t, config: { ...t.config, [key]: value } } : t
      )
    )
  }

  return (
    <div style={{ padding: '20px 24px', maxWidth: 600 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#e5e7eb', marginBottom: 24 }}>
        도구 통합
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tools.map((tool) => {
          const isExpanded = expandedId === tool.id
          const fields = TOOL_CONFIG_FIELDS[tool.type] ?? []

          return (
            <div
              key={tool.id}
              style={{
                border: `1px solid ${tool.enabled ? 'rgba(0,255,136,0.2)' : '#222'}`,
                borderRadius: 6,
                background: tool.enabled ? 'rgba(0,255,136,0.02)' : 'rgba(255,255,255,0.01)',
                overflow: 'hidden',
                transition: 'all 0.15s',
              }}
            >
              {/* Tool Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 14px',
                  cursor: 'pointer',
                }}
                onClick={() => setExpandedId(isExpanded ? null : tool.id)}
              >
                {/* Status dot */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: tool.enabled ? '#00ff88' : '#444',
                    marginRight: 10,
                    flexShrink: 0,
                  }}
                />

                {/* Label */}
                <span style={{ fontSize: 12, color: tool.enabled ? '#e5e7eb' : '#8b95a5', flex: 1 }}>
                  {tool.label}
                </span>

                {/* Toggle button */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleToggle(tool.id) }}
                  style={{
                    padding: '3px 10px',
                    background: tool.enabled ? 'rgba(0,255,136,0.12)' : 'transparent',
                    border: `1px solid ${tool.enabled ? '#00ff88' : '#444'}`,
                    borderRadius: 3,
                    color: tool.enabled ? '#00ff88' : '#666',
                    fontSize: 9,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    marginRight: 8,
                  }}
                >
                  {tool.enabled ? 'ON' : 'OFF'}
                </button>

                {/* Expand icon */}
                <span style={{ fontSize: 10, color: '#666' }}>
                  {isExpanded ? '\u25BC' : '\u25B6'}
                </span>
              </div>

              {/* Config Fields */}
              {isExpanded && fields.length > 0 && (
                <div
                  style={{
                    padding: '0 14px 12px 32px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {fields.map((field) => (
                    <div key={field.key}>
                      <label style={labelStyle}>{field.label}</label>
                      <input
                        value={tool.config[field.key] ?? ''}
                        onChange={(e) => handleConfigChange(tool.id, field.key, e.target.value)}
                        placeholder={field.placeholder}
                        type={field.masked ? 'password' : 'text'}
                        style={inputStyle}
                      />
                      {field.masked && (
                        <div style={{ fontSize: 9, color: '#555', marginTop: 2 }}>
                          process.env.{field.placeholder} 환경변수 사용 권장
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
