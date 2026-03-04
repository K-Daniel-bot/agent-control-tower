'use client'

import { useEffect, useState } from 'react'

export type TabType = 'dashboard' | 'settings' | 'terminal'

interface HeaderProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState<string>('')
  const [currentDate, setCurrentDate] = useState<string>('')

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const dateStr = now.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        weekday: 'short',
      })
      const timeStr = now.toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      setCurrentDate(dateStr)
      setCurrentTime(timeStr)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header
      style={{
        background: 'linear-gradient(90deg, #0a0e1a 0%, #1a1f2e 40%, #1a1f2e 60%, #0a0e1a 100%)',
        borderBottom: '1px solid #2a3042',
        boxShadow: '0 2px 12px rgba(0, 255, 136, 0.08)',
      }}
      className="flex items-center justify-between px-4 h-12 flex-shrink-0"
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-2 min-w-[200px]">
        <div
          style={{
            width: 28,
            height: 28,
            background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(0, 255, 136, 0.4)',
            flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="4" r="2.5" fill="#0a0e1a" />
            <circle cx="3" cy="12" r="2.5" fill="#0a0e1a" />
            <circle cx="13" cy="12" r="2.5" fill="#0a0e1a" />
            <line x1="8" y1="4" x2="3" y2="12" stroke="#0a0e1a" strokeWidth="1.5" />
            <line x1="8" y1="4" x2="13" y2="12" stroke="#0a0e1a" strokeWidth="1.5" />
          </svg>
        </div>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: '#00ff88',
              letterSpacing: '0.06em',
              lineHeight: 1.2,
              textShadow: '0 0 8px rgba(0, 255, 136, 0.4)',
            }}
          >
            Agent Control Tower
          </div>
          <div
            style={{
              fontSize: 9,
              color: '#6b7280',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            AI Operations Center
          </div>
        </div>
      </div>

      {/* Center: Title */}
      <div className="flex flex-col items-center flex-1">
        <div
          style={{
            fontSize: 18,
            fontWeight: 800,
            letterSpacing: '0.15em',
            color: '#e5e7eb',
            textShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
          }}
        >
          에이전트 관제 시스템
        </div>
        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
          {([
            { key: 'dashboard' as TabType, label: '관제 대시보드' },
            { key: 'settings' as TabType, label: '에이전트 설정' },
            { key: 'terminal' as TabType, label: '프로젝트 시작' },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              style={{
                padding: '2px 10px',
                fontSize: 9,
                fontWeight: activeTab === tab.key ? 700 : 400,
                color: activeTab === tab.key ? '#00ff88' : '#6b7280',
                background: activeTab === tab.key ? 'rgba(0,255,136,0.08)' : 'transparent',
                border: `1px solid ${activeTab === tab.key ? 'rgba(0,255,136,0.3)' : 'transparent'}`,
                borderRadius: 3,
                cursor: 'pointer',
                letterSpacing: '0.05em',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Date/Time + Status */}
      <div className="flex items-center gap-3 min-w-[200px] justify-end">
        {/* Status indicators */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#00ff88',
                boxShadow: '0 0 6px #00ff88',
                animation: 'pulse 2s ease-in-out infinite',
              }}
            />
            <span style={{ fontSize: 10, color: '#6b7280' }}>정상</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#ff6b35',
                boxShadow: '0 0 6px #ff6b35',
              }}
            />
            <span style={{ fontSize: 10, color: '#6b7280' }}>경고 2</span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: '#2a3042' }} />

        {/* Date/Time */}
        <div className="text-right">
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#e5e7eb',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.04em',
              lineHeight: 1.2,
            }}
          >
            {currentTime}
          </div>
          <div
            style={{
              fontSize: 10,
              color: '#6b7280',
              lineHeight: 1.2,
            }}
          >
            {currentDate}
          </div>
        </div>
      </div>
    </header>
  )
}
