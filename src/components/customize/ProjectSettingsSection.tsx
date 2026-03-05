'use client'

import type { ProjectSettings, ProjectEnvironment } from '@/types/customize'

interface ProjectSettingsSectionProps {
  readonly settings: ProjectSettings
  readonly onChange: (settings: ProjectSettings) => void
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

const ENVIRONMENTS: readonly { value: ProjectEnvironment; label: string }[] = [
  { value: 'development', label: 'Development' },
  { value: 'staging', label: 'Staging' },
  { value: 'production', label: 'Production' },
]

export default function ProjectSettingsSection({ settings, onChange }: ProjectSettingsSectionProps) {
  return (
    <div style={{ padding: '20px 24px', maxWidth: 600 }}>
      {/* Section Title */}
      <div style={{ fontSize: 14, fontWeight: 600, color: '#e5e7eb', marginBottom: 24 }}>
        프로젝트 설정
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Project Root Path */}
        <div>
          <label style={labelStyle}>Project Root Path</label>
          <input
            value={settings.rootPath}
            onChange={(e) => onChange({ ...settings, rootPath: e.target.value })}
            placeholder="/Users/daniel/projects/my-project"
            style={inputStyle}
          />
          <div style={{ fontSize: 10, color: '#666666', marginTop: 4 }}>
            Control Tower가 관리할 프로젝트의 루트 경로
          </div>
        </div>

        {/* Workspace Name */}
        <div>
          <label style={labelStyle}>Workspace Name</label>
          <input
            value={settings.workspaceName}
            onChange={(e) => onChange({ ...settings, workspaceName: e.target.value })}
            placeholder="my-workspace"
            style={inputStyle}
          />
          <div style={{ fontSize: 10, color: '#666666', marginTop: 4 }}>
            프로젝트 워크스페이스 이름
          </div>
        </div>

        {/* Environment */}
        <div>
          <label style={labelStyle}>Environment</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {ENVIRONMENTS.map((env) => {
              const isActive = settings.environment === env.value
              return (
                <button
                  key={env.value}
                  onClick={() => onChange({ ...settings, environment: env.value })}
                  style={{
                    padding: '6px 16px',
                    background: isActive ? 'rgba(0, 255, 136, 0.08)' : 'transparent',
                    border: `1px solid ${isActive ? 'rgba(0, 255, 136, 0.3)' : '#333333'}`,
                    borderRadius: 4,
                    color: isActive ? '#00ff88' : '#8b95a5',
                    fontSize: 11,
                    fontWeight: isActive ? 700 : 400,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                >
                  {env.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Status Info */}
        <div
          style={{
            marginTop: 8,
            padding: '12px 16px',
            background: 'rgba(0, 255, 136, 0.03)',
            border: '1px solid rgba(0, 255, 136, 0.1)',
            borderRadius: 4,
            fontSize: 10,
            color: '#666666',
            lineHeight: 1.6,
          }}
        >
          <div style={{ color: '#9ca3af', marginBottom: 4, fontWeight: 600 }}>
            현재 설정 상태
          </div>
          <div>Root: {settings.rootPath || '(미설정)'}</div>
          <div>Workspace: {settings.workspaceName || '(미설정)'}</div>
          <div>Environment: {settings.environment}</div>
        </div>
      </div>
    </div>
  )
}
