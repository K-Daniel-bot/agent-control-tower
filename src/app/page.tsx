'use client'

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import Header from '@/components/layout/Header'
import type { TabType } from '@/components/layout/Header'
import type { RightPanelTab } from '@/types/terminal'
import LeftPanel from '@/components/left/LeftPanel'
import VoiceModal from '@/components/voice/VoiceModal'

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

const VoiceMeetingDashboard = dynamic(
  () =>
    import('@/components/voice/VoiceMeetingDashboard')
      .then((mod) => mod.default)
      .catch(() => () => <PlaceholderPanel title="보이스 회의" color="#ec4899" />),
  {
    ssr: false,
    loading: () => <PlaceholderPanel title="보이스 회의 로딩 중..." color="#ec4899" />,
  }
)

const CustomizePage = dynamic(
  () =>
    import('@/components/customize/CustomizePage')
      .then((mod) => mod.default)
      .catch(() => () => <PlaceholderPanel title="프로젝트 설정" color="#f59e0b" />),
  {
    ssr: false,
    loading: () => <PlaceholderPanel title="프로젝트 설정 로딩 중..." color="#f59e0b" />,
  }
)

const RemoteDashboard = dynamic(
  () =>
    import('@/components/remote/RemoteDashboard')
      .then((mod) => mod.default)
      .catch(() => () => <PlaceholderPanel title="원격 제어" color="#06b6d4" />),
  {
    ssr: false,
    loading: () => <PlaceholderPanel title="원격 제어 로딩 중..." color="#06b6d4" />,
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
  const [voiceModalOpen, setVoiceModalOpen] = useState(false)
  const [kakaoModalOpen, setKakaoModalOpen] = useState(false)

  const handleTogglePanel = useCallback((tab: 'note' | 'graph') => {
    setActiveTab('terminal')
    setTerminalPanel(prev => prev === tab ? null : tab)
  }, [])

  const handleToggleTerminalPanel = useCallback((tab: 'skill' | 'note' | 'graph') => {
    setTerminalPanel(prev => prev === tab ? null : tab)
  }, [])

  const handleVoiceModalOpen = useCallback(() => {
    setVoiceModalOpen(true)
  }, [])

  const handleVoiceModalClose = useCallback(() => {
    setVoiceModalOpen(false)
  }, [])

  const handleKakaoModalOpen = useCallback(() => {
    setKakaoModalOpen(true)
  }, [])

  const handleKakaoModalClose = useCallback(() => {
    setKakaoModalOpen(false)
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
        onVoiceModalOpen={handleVoiceModalOpen}
        onKakaoModalOpen={handleKakaoModalOpen}
      />
      <div style={{ display: activeTab === 'dashboard' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
        <DashboardView />
      </div>
      <div style={{ display: activeTab === 'settings' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
        <AgentSettingsPage />
      </div>
      <div style={{ display: activeTab === 'customize' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
        <CustomizePage />
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
      <div style={{ display: activeTab === 'voice' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
        <VoiceMeetingDashboard />
      </div>
      <div style={{ display: activeTab === 'remote' ? 'flex' : 'none', flex: 1, overflow: 'hidden' }}>
        <RemoteDashboard />
      </div>

      {/* Voice Modal */}
      <VoiceModal isOpen={voiceModalOpen} onClose={handleVoiceModalClose} />

      {/* KakaoTalk Modal (placeholder) */}
      {kakaoModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
          }}
          onClick={handleKakaoModalClose}
        >
          <div
            style={{
              width: 400,
              background: '#000000',
              border: '1px solid #333333',
              borderRadius: 8,
              padding: 24,
              color: '#e5e7eb',
              fontFamily: "'JetBrains Mono', monospace",
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 14, marginBottom: 16 }}>카카오톡 API</div>
            <div style={{ fontSize: 12, color: '#aaaaaa', marginBottom: 20 }}>
              카카오톡 통합 기능 준비 중입니다
            </div>
            <button
              onClick={handleKakaoModalClose}
              style={{
                padding: '8px 16px',
                background: '#00ff88',
                border: 'none',
                borderRadius: 4,
                color: '#000000',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
