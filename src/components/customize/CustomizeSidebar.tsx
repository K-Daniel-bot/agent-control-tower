'use client'

import type { CustomizeSectionKey } from '@/types/customize'

interface CustomizeSidebarProps {
  readonly activeSection: CustomizeSectionKey
  readonly onSelect: (section: CustomizeSectionKey) => void
}

const SECTIONS: readonly { key: CustomizeSectionKey; label: string; icon: string }[] = [
  { key: 'project', label: '프로젝트 설정', icon: 'P' },
  { key: 'architecture', label: '에이전트 아키텍처', icon: 'A' },
  { key: 'tools', label: '도구 통합', icon: 'T' },
  { key: 'layout', label: '대시보드 레이아웃', icon: 'L' },
  { key: 'permissions', label: '권한 관리', icon: 'R' },
]

export default function CustomizeSidebar({ activeSection, onSelect }: CustomizeSidebarProps) {
  return (
    <div
      style={{
        width: 200,
        height: '100%',
        background: '#080808',
        borderRight: '1px solid #333333',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid #222222',
          fontSize: 12,
          color: '#888888',
          fontWeight: 600,
        }}
      >
        CUSTOMIZE
      </div>

      {/* Section list */}
      <div style={{ flex: 1, padding: '8px 0' }}>
        {SECTIONS.map((section) => {
          const isActive = activeSection === section.key
          return (
            <button
              key={section.key}
              onClick={() => onSelect(section.key)}
              style={{
                width: '100%',
                padding: '10px 16px',
                background: isActive ? 'rgba(0, 255, 136, 0.06)' : 'transparent',
                border: 'none',
                borderLeft: isActive ? '2px solid #00ff88' : '2px solid transparent',
                color: isActive ? '#e5e7eb' : '#8b95a5',
                fontSize: 11,
                cursor: 'pointer',
                fontFamily: 'inherit',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.15s ease',
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 3,
                  background: isActive ? 'rgba(0, 255, 136, 0.12)' : 'rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 9,
                  fontWeight: 700,
                  color: isActive ? '#00ff88' : '#666666',
                }}
              >
                {section.icon}
              </span>
              {section.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
