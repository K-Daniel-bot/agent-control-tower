'use client'

import { useEffect, useState } from 'react'
import type { RightPanelTab } from '@/types/terminal'

export type TabType = 'dashboard' | 'settings' | 'terminal'

interface HeaderProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  terminalPanel?: RightPanelTab
  onTogglePanel?: (tab: 'note' | 'graph') => void
}

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

  const iconBtn = (active: boolean) => ({
    width: 26,
    height: 26,
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    background: active ? 'rgba(0,255,136,0.12)' : 'transparent',
    border: `1px solid ${active ? 'rgba(0,255,136,0.35)' : 'transparent'}`,
    borderRadius: 5,
    cursor: 'pointer' as const,
    color: active ? '#00ff88' : '#6b7280',
    transition: 'all 0.15s',
    padding: 0,
  })

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
      <div
        className="flex items-center gap-2 min-w-[200px]"
        style={{ cursor: 'pointer' }}
        onClick={() => onTabChange('dashboard')}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/act-logo.png"
          alt="ACT Logo"
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
            objectFit: 'contain',
            flexShrink: 0,
          }}
        />
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

      {/* Center: Title + Tab Navigation */}
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
            { key: 'terminal' as TabType, label: '프로젝트 시작' },
            { key: 'settings' as TabType, label: '에이전트 설정' },
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

      {/* Right: Icons + Status + Time */}
      <div className="flex items-center gap-3 min-w-[200px] justify-end">
        {/* Icon buttons: GitHub, AI note, Graph view */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {/* GitHub */}
          <a
            href="https://github.com/K-Daniel-bot"
            target="_blank"
            rel="noopener noreferrer"
            title="GitHub @K-Daniel-bot"
            style={{
              ...iconBtn(false),
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#e5e7eb'
              e.currentTarget.style.borderColor = 'rgba(229,231,235,0.2)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#6b7280'
              e.currentTarget.style.borderColor = 'transparent'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
          </a>

          {/* AI Note icon */}
          <button
            onClick={() => {
              onTabChange('terminal')
              onTogglePanel?.('note')
            }}
            title="AI 노트"
            style={iconBtn(terminalPanel === 'note' && activeTab === 'terminal')}
            onMouseEnter={e => {
              if (terminalPanel !== 'note' || activeTab !== 'terminal') {
                e.currentTarget.style.color = '#3b82f6'
                e.currentTarget.style.borderColor = 'rgba(59,130,246,0.3)'
              }
            }}
            onMouseLeave={e => {
              if (terminalPanel !== 'note' || activeTab !== 'terminal') {
                e.currentTarget.style.color = '#6b7280'
                e.currentTarget.style.borderColor = 'transparent'
              }
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
              <line x1="4.5" y1="4.5" x2="9.5" y2="4.5" stroke="currentColor" strokeWidth="1.2" />
              <line x1="4.5" y1="7" x2="9.5" y2="7" stroke="currentColor" strokeWidth="1.2" />
              <line x1="4.5" y1="9.5" x2="7.5" y2="9.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>

          {/* Graph view icon */}
          <button
            onClick={() => {
              onTabChange('terminal')
              onTogglePanel?.('graph')
            }}
            title="그래프 뷰"
            style={iconBtn(terminalPanel === 'graph' && activeTab === 'terminal')}
            onMouseEnter={e => {
              if (terminalPanel !== 'graph' || activeTab !== 'terminal') {
                e.currentTarget.style.color = '#06b6d4'
                e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'
              }
            }}
            onMouseLeave={e => {
              if (terminalPanel !== 'graph' || activeTab !== 'terminal') {
                e.currentTarget.style.color = '#6b7280'
                e.currentTarget.style.borderColor = 'transparent'
              }
            }}
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
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: '#2a3042' }} />

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
