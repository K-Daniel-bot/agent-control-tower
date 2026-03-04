'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/components/layout/Header'
import type { TabType } from '@/components/layout/Header'
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
        background: 'rgba(26, 31, 46, 0.5)',
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

function DashboardView() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: '1fr 200px',
        gridTemplateColumns: '260px 1fr 280px',
        gridTemplateAreas: `
          "left   center right"
          "bottom bottom bottom"
        `,
        flex: 1,
        overflow: 'hidden',
        gap: 0,
      }}
    >
      <div style={{ gridArea: 'left', overflow: 'hidden' }}>
        <LeftPanel />
      </div>
      <div
        style={{
          gridArea: 'center',
          overflow: 'hidden',
          borderLeft: '1px solid #2a3042',
          borderRight: '1px solid #2a3042',
        }}
      >
        <TopologyMap />
      </div>
      <div style={{ gridArea: 'right', overflow: 'hidden' }}>
        <RightPanel />
      </div>
      <div
        style={{
          gridArea: 'bottom',
          overflow: 'hidden',
          borderTop: '1px solid #2a3042',
        }}
      >
        <BottomPanel />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: '#0a0e1a',
      }}
    >
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <div style={{ display: activeTab === 'dashboard' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
        <DashboardView />
      </div>
      <div style={{ display: activeTab === 'settings' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
        <AgentSettingsPage />
      </div>
      <div style={{ display: activeTab === 'terminal' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
        <TerminalDashboard isVisible={activeTab === 'terminal'} />
      </div>
    </div>
  )
}
