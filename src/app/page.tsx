'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/components/layout/Header'
import type { TabType } from '@/components/layout/Header'
import type { RightPanelTab } from '@/types/terminal'
import LeftPanel from '@/components/left/LeftPanel'

function PlaceholderPanel({ title, color }: { title: string; color: string }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        gap: 8,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: `2px solid ${color}`,
          opacity: 0.5,
        }}
      />
      <span style={{ fontSize: 12, color: '#6b7280', letterSpacing: '0.05em' }}>{title}</span>
    </div>
  )
}

const TopologyMap = dynamic(
  () =>
    import('@/components/topology/TopologyMap')
      .then((mod) => mod.default)
      .catch(() => () => <PlaceholderPanel title="토폴로지 맵" color="#3b82f6" />),
  {
    ssr: false,
    loading: () => <PlaceholderPanel title="토폴로지 맵 로딩 중..." color="#3b82f6" />,
  }
)

const RightPanel = dynamic(
  () =>
    import('@/components/right/RightPanel')
      .then((mod) => mod.default)
      .catch(() => () => <PlaceholderPanel title="실시간 차트 패널" color="#a855f7" />),
  {
    ssr: false,
    loading: () => <PlaceholderPanel title="차트 로딩 중..." color="#a855f7" />,
  }
)

const BottomPanel = dynamic(
  () =>
    import('@/components/bottom/BottomPanel')
      .then((mod) => mod.default)
      .catch(() => () => <PlaceholderPanel title="이벤트 로그" color="#f59e0b" />),
  {
    ssr: false,
    loading: () => <PlaceholderPanel title="이벤트 로그 로딩 중..." color="#f59e0b" />,
  }
)

const AgentSettingsPage = dynamic(
  () =>
    import('@/components/settings/AgentSettingsPage')
      .then((mod) => mod.default)
      .catch(() => () => <PlaceholderPanel title="에이전트 설정" color="#3b82f6" />),
  {
    ssr: false,
    loading: () => <PlaceholderPanel title="에이전트 설정 로딩 중..." color="#3b82f6" />,
  }
)

const TerminalDashboard = dynamic(
  () =>
    import('@/components/terminal/TerminalDashboard')
      .then((mod) => mod.default)
      .catch(() => () => <PlaceholderPanel title="터미널" color="#00ff88" />),
  {
    ssr: false,
    loading: () => <PlaceholderPanel title="터미널 로딩 중..." color="#00ff88" />,
  }
)

const ServerDashboard = dynamic(
  () =>
    import('@/components/server/ServerDashboard')
      .then((mod) => mod.default)
      .catch(() => () => <PlaceholderPanel title="서버 관리" color="#f59e0b" />),
  {
    ssr: false,
    loading: () => <PlaceholderPanel title="서버 관리 로딩 중..." color="#f59e0b" />,
  }
)

const WorldMapDashboard = dynamic(
  () =>
    import('@/components/worldmap/WorldMapDashboard')
      .then((mod) => mod.default)
      .catch(() => () => <PlaceholderPanel title="월드맵" color="#06b6d4" />),
  {
    ssr: false,
    loading: () => <PlaceholderPanel title="월드맵 로딩 중..." color="#06b6d4" />,
  }
)

const MemoryDashboard = dynamic(
  () =>
    import('@/components/memory/MemoryDashboard')
      .then((mod) => mod.default)
      .catch(() => () => <PlaceholderPanel title="메모리" color="#a855f7" />),
  {
    ssr: false,
    loading: () => <PlaceholderPanel title="메모리 로딩 중..." color="#a855f7" />,
  }
)

const NewsDashboard = dynamic(
  () =>
    import('@/components/news/NewsDashboard')
      .then((mod) => mod.default)
      .catch(() => () => <PlaceholderPanel title="뉴스" color="#ef4444" />),
  {
    ssr: false,
    loading: () => <PlaceholderPanel title="뉴스 로딩 중..." color="#ef4444" />,
  }
)

function DashboardView() {
  return (
    <div style={{ flex: 1, overflow: 'hidden' }}>
      <TopologyMap />
    </div>
  )
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [terminalPanel, setTerminalPanel] = useState<RightPanelTab>(null)

  const handleTogglePanel = useCallback((tab: 'note' | 'graph') => {
    setActiveTab('terminal')
    setTerminalPanel(prev => prev === tab ? null : tab)
  }, [])

  const handleToggleTerminalPanel = useCallback((tab: 'skill' | 'note' | 'graph') => {
    setTerminalPanel(prev => prev === tab ? null : tab)
  }, [])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'transparent',
      }}
    >
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        terminalPanel={terminalPanel}
        onTogglePanel={handleTogglePanel}
      />
      <div style={{ display: activeTab === 'dashboard' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
        <DashboardView />
      </div>
      <div style={{ display: activeTab === 'settings' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
        <AgentSettingsPage />
      </div>
      <div style={{ display: activeTab === 'terminal' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
        <TerminalDashboard
          isVisible={activeTab === 'terminal'}
          rightPanel={terminalPanel}
          onTogglePanel={handleToggleTerminalPanel}
        />
      </div>
      <div style={{ display: activeTab === 'server' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
        <ServerDashboard />
      </div>
      <div style={{ display: activeTab === 'worldmap' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
        <WorldMapDashboard />
      </div>
      <div style={{ display: activeTab === 'memory' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
        <MemoryDashboard />
      </div>
      <div style={{ display: activeTab === 'news' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
        <NewsDashboard />
      </div>
    </div>
  )
}
