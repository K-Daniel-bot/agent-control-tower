'use client'

import React, { useEffect, useState } from 'react'
import type { RightPanelTab } from '@/types/terminal'

export type TabType = 'dashboard' | 'terminal' | 'settings' | 'remote' | 'server' | 'customize' | 'worldmap' | 'memory' | 'logs' | 'automation' | 'news'

interface HeaderProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  terminalPanel?: RightPanelTab
  onTogglePanel?: (tab: 'note' | 'graph') => void
}

const TABS: ReadonlyArray<{
  key: TabType
  label: string
  icon: React.ReactNode
}> = [
  {
    key: 'dashboard',
    label: 'EMS',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1.5" y="1.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <rect x="10.5" y="1.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <rect x="1.5" y="10.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <rect x="10.5" y="10.5" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    ),
  },
  {
    key: 'terminal',
    label: 'TERMINAL',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1.5" y="2.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <polyline points="5,8 7.5,10.5 5,13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="9.5" y1="12.5" x2="13" y2="12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: 'server',
    label: 'SERVER',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <rect x="2" y="9" width="14" height="5" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="15" cy="4.5" r="0.8" fill="currentColor" />
        <circle cx="15" cy="11.5" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: 'customize',
    label: 'CUSTOMIZE',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L12 8H6Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="2" y="9" width="14" height="6" rx="1" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="6" cy="12" r="0.6" fill="currentColor" />
        <circle cx="9" cy="12" r="0.6" fill="currentColor" />
        <circle cx="12" cy="12" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: 'worldmap',
    label: 'WORLDMAP',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7.5" stroke="currentColor" strokeWidth="1.4" />
        <path d="M4 7C4 5 5 4 7 4M14 7C14 5 13 4 11 4M4 11C4 13 5 14 7 14M14 11C14 13 13 14 11 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="9" cy="9" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: 'memory',
    label: 'MEMORY',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="4" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <line x1="5" y1="4" x2="5" y2="14" stroke="currentColor" strokeWidth="1.2" />
        <line x1="9" y1="4" x2="9" y2="14" stroke="currentColor" strokeWidth="1.2" />
        <line x1="13" y1="4" x2="13" y2="14" stroke="currentColor" strokeWidth="1.2" />
        <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    key: 'logs',
    label: 'LOGS',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <line x1="5" y1="5" x2="13" y2="5" stroke="currentColor" strokeWidth="1.2" />
        <line x1="5" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.2" />
        <line x1="5" y1="11" x2="13" y2="11" stroke="currentColor" strokeWidth="1.2" />
        <line x1="5" y1="14" x2="10" y2="14" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    key: 'news',
    label: 'NEWS',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="2" width="14" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <line x1="5" y1="5" x2="8" y2="5" stroke="currentColor" strokeWidth="1.4" />
        <rect x="10" y="4" width="3" height="4" rx="0.5" stroke="currentColor" strokeWidth="1" />
        <line x1="5" y1="8" x2="8" y2="8" stroke="currentColor" strokeWidth="1" />
        <line x1="5" y1="10.5" x2="13" y2="10.5" stroke="currentColor" strokeWidth="1" />
        <line x1="5" y1="13" x2="13" y2="13" stroke="currentColor" strokeWidth="1" />
      </svg>
    ),
  },
  {
    key: 'automation',
    label: 'AUTOMATION',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M3 8C3 5.24 5.24 3 8 3C10.76 3 13 5.24 13 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M15 10C15 12.76 12.76 15 10 15C7.24 15 5 12.76 5 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="9" cy="9" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: 'remote',
    label: 'REMOTE',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="3" width="14" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="5" cy="10" r="1" fill="currentColor" />
        <circle cx="9" cy="10" r="1" fill="currentColor" />
        <circle cx="13" cy="10" r="1" fill="currentColor" />
        <line x1="5" y1="13" x2="13" y2="13" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    key: 'settings',
    label: 'SETTINGS',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="2.8" stroke="currentColor" strokeWidth="1.4" />
        <path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.2 4.2l1.4 1.4M12.4 12.4l1.4 1.4M4.2 13.8l1.4-1.4M12.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function Header({ activeTab, onTabChange, terminalPanel, onTogglePanel }: HeaderProps) {
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
        hour12: true,
      })
      setCurrentDate(dateStr)
      setCurrentTime(timeStr)
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  const utilIconStyle = (active: boolean): React.CSSProperties => ({
    width: 26,
    height: 26,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: active ? 'rgba(0,255,136,0.12)' : 'transparent',
    border: `1px solid ${active ? 'rgba(0,255,136,0.35)' : 'transparent'}`,
    borderRadius: 4,
    cursor: 'pointer',
    color: active ? '#00ff88' : '#8b95a5',
    transition: 'all 0.15s',
    padding: 0,
  })

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'stretch',
        height: 52,
        background: '#000000',
        borderBottom: '1px solid #333333',
        flexShrink: 0,
      }}
    >
      {/* Left: Logo + Icon Tabs */}
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '0 12px',
            cursor: 'pointer',
            borderRight: '1px solid #333333',
          }}
          onClick={() => onTabChange('dashboard')}
        >
          <span
            style={{
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: '0.08em',
              whiteSpace: 'nowrap',
              background: 'linear-gradient(90deg, #00ff88 0%, #06b6d4 30%, #3b82f6 55%, #8b5cf6 80%, #f59e0b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Agent Control Tower
          </span>
        </div>

        {/* Tab Icons */}
        <div style={{ display: 'flex', alignItems: 'stretch' }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => onTabChange(tab.key)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  padding: '0 12px',
                  background: isActive ? '#000000' : 'transparent',
                  borderLeft: 'none',
                  borderRight: '1px solid #333333',
                  borderTop: 'none',
                  borderBottom: isActive ? '2px solid #f59e0b' : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  minWidth: 56,
                }}
              >
                <span style={{ color: isActive ? '#e6edf3' : '#6b7280', lineHeight: 1 }}>
                  {tab.icon}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#e6edf3' : '#6b7280',
                    letterSpacing: '0.06em',
                  }}
                >
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right: Utility icons + Status + Time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px' }}>
        {/* Utility icon buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <a
            href="https://my-home-steel.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            title="My Homepage"
            style={{ ...utilIconStyle(false), textDecoration: 'none' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </a>
          <a
            href="https://github.com/K-Daniel-bot"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub @K-Daniel-bot"
            style={{ ...utilIconStyle(false), textDecoration: 'none' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>
          <button
            title="Git 리포지토리"
            style={utilIconStyle(false)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="3" cy="3" r="1.2" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <circle cx="11" cy="3" r="1.2" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <circle cx="7" cy="11" r="1.2" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <line x1="3.8" y1="3.6" x2="10.2" y2="3.6" stroke="currentColor" strokeWidth="1" />
              <line x1="7.5" y1="4.2" x2="7" y2="9.8" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
          <button
            title="보이스 회의"
            style={utilIconStyle(false)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1C4.24 1 2 3.24 2 6C2 7.5 2.7 8.84 3.8 9.7L3.5 12C3.45 12.35 3.75 12.65 4.1 12.6L6.3 12C6.53 12.02 6.76 12.02 7 12C9.76 12 12 9.76 12 7C12 4.24 9.76 2 7 2Z" stroke="currentColor" strokeWidth="1.2" fill="none" />
              <circle cx="7" cy="6.5" r="0.8" fill="currentColor" />
              <line x1="5.5" y1="6.5" x2="4.5" y2="6.5" stroke="currentColor" strokeWidth="0.8" />
              <line x1="8.5" y1="6.5" x2="9.5" y2="6.5" stroke="currentColor" strokeWidth="0.8" />
            </svg>
          </button>
          <button
            onClick={() => { onTabChange('terminal'); onTogglePanel?.('note') }}
            title="AI 노트"
            style={utilIconStyle(terminalPanel === 'note' && activeTab === 'terminal')}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
              <line x1="4.5" y1="4.5" x2="9.5" y2="4.5" stroke="currentColor" strokeWidth="1.2" />
              <line x1="4.5" y1="7" x2="9.5" y2="7" stroke="currentColor" strokeWidth="1.2" />
              <line x1="4.5" y1="9.5" x2="7.5" y2="9.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
          <button
            onClick={() => { onTabChange('terminal'); onTogglePanel?.('graph') }}
            title="그래프 뷰"
            style={utilIconStyle(terminalPanel === 'graph' && activeTab === 'terminal')}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="2.5" r="1.5" fill="currentColor" />
              <circle cx="2.5" cy="11" r="1.5" fill="currentColor" />
              <circle cx="11.5" cy="11" r="1.5" fill="currentColor" />
              <line x1="7" y1="4" x2="2.5" y2="9.5" stroke="currentColor" strokeWidth="1.2" />
              <line x1="7" y1="4" x2="11.5" y2="9.5" stroke="currentColor" strokeWidth="1.2" />
              <line x1="4" y1="11" x2="10" y2="11" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
          <button
            title="카카오톡"
            style={utilIconStyle(false)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1C3.7 1 1 3.1 1 5.8C1 7.2 1.7 8.4 2.8 9.2L2.3 11.5C2.1 12.3 2.9 13 3.6 12.5L6 11C6.3 11 6.7 11 7 11C10.3 11 13 8.9 13 6.2C13 3.5 10.3 1 7 1Z" stroke="currentColor" strokeWidth="1" fill="none" />
              <circle cx="4.5" cy="6" r="0.4" fill="currentColor" />
              <circle cx="7" cy="6" r="0.4" fill="currentColor" />
              <circle cx="9.5" cy="6" r="0.4" fill="currentColor" />
            </svg>
          </button>
          <button
            title="노션"
            style={utilIconStyle(false)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="12" height="12" rx="1" stroke="currentColor" strokeWidth="1" fill="none" />
              <path d="M3 3L11 3M3 6L11 6M3 9L8 9M3 12L11 12" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
              <rect x="9" y="9.5" width="2.5" height="2.5" rx="0.5" fill="currentColor" />
            </svg>
          </button>
          <button
            title="슬랙"
            style={utilIconStyle(false)}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 2C2.4 2 2 2.4 2 3V4.5C2 5.1 2.4 5.5 3 5.5C3.6 5.5 4 5.1 4 4.5V3C4 2.4 3.6 2 3 2Z" stroke="currentColor" strokeWidth="0.8" fill="none" />
              <path d="M6 2C5.4 2 5 2.4 5 3V8C5 8.6 5.4 9 6 9C6.6 9 7 8.6 7 8V3C7 2.4 6.6 2 6 2Z" stroke="currentColor" strokeWidth="0.8" fill="none" />
              <path d="M9 3C8.4 3 8 3.4 8 4C8 4.6 8.4 5 9 5C9.6 5 10 4.6 10 4C10 3.4 9.6 3 9 3Z" stroke="currentColor" strokeWidth="0.8" fill="none" />
              <path d="M11 2C10.4 2 10 2.4 10 3V9C10 9.6 10.4 10 11 10C11.6 10 12 9.6 12 9V3C12 2.4 11.6 2 11 2Z" stroke="currentColor" strokeWidth="0.8" fill="none" />
            </svg>
          </button>
        </div>

        <div style={{ width: 1, height: 24, background: '#333333' }} />

        {/* Status indicators */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#00ff88',
                boxShadow: '0 0 6px #00ff88',
              }}
            />
            <span style={{ fontSize: 10, color: '#8b95a5' }}>정상</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#ff6b35',
                boxShadow: '0 0 6px #ff6b35',
              }}
            />
            <span style={{ fontSize: 10, color: '#8b95a5' }}>경고 2</span>
          </div>
        </div>

        <div style={{ width: 1, height: 24, background: '#333333' }} />

        {/* Date/Time */}
        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#e6edf3',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '0.04em',
              lineHeight: 1.2,
            }}
          >
            {currentTime}
          </div>
          <div style={{ fontSize: 10, color: '#8b95a5', lineHeight: 1.2 }}>
            {currentDate}
          </div>
        </div>
      </div>
    </header>
  )
}
