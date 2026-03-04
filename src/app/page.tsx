'use client'

import dynamic from 'next/dynamic'
import Header from '@/components/layout/Header'
import LeftPanel from '@/components/left/LeftPanel'

// Placeholder rendered when other agents' panels are not yet available
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

// Dynamic import loader — wraps import() so TS doesn't fail on missing modules
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const safeImport = (path: string): Promise<any> => import(path)

// Center: Topology Map (created by 꼬물이)
const TopologyMap = dynamic(
  async () => {
    try {
      const mod = await safeImport('@/components/topology/TopologyMap')
      return mod.default
    } catch {
      return () => <PlaceholderPanel title="토폴로지 맵" color="#3b82f6" />
    }
  },
  {
    ssr: false,
    loading: () => <PlaceholderPanel title="토폴로지 맵 로딩 중..." color="#3b82f6" />,
  }
)

// Right: Charts Panel (created by 쫄깃이)
const RightPanel = dynamic(
  async () => {
    try {
      const mod = await safeImport('@/components/right/RightPanel')
      return mod.default
    } catch {
      return () => <PlaceholderPanel title="실시간 차트 패널" color="#a855f7" />
    }
  },
  {
    ssr: false,
    loading: () => <PlaceholderPanel title="차트 로딩 중..." color="#a855f7" />,
  }
)

// Bottom: Event Log (created by 쫄깃이)
const BottomPanel = dynamic(
  async () => {
    try {
      const mod = await safeImport('@/components/bottom/BottomPanel')
      return mod.default
    } catch {
      return () => <PlaceholderPanel title="이벤트 로그" color="#f59e0b" />
    }
  },
  {
    ssr: false,
    loading: () => <PlaceholderPanel title="이벤트 로그 로딩 중..." color="#f59e0b" />,
  }
)

export default function DashboardPage() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: '48px 1fr 200px',
        gridTemplateColumns: '260px 1fr 280px',
        gridTemplateAreas: `
          "header header header"
          "left   center right"
          "bottom bottom bottom"
        `,
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: '#0a0e1a',
        gap: 0,
      }}
    >
      {/* Header — spans all 3 columns */}
      <div style={{ gridArea: 'header' }}>
        <Header />
      </div>

      {/* Left Panel */}
      <div style={{ gridArea: 'left', overflow: 'hidden' }}>
        <LeftPanel />
      </div>

      {/* Center: Topology Map */}
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

      {/* Right Panel */}
      <div style={{ gridArea: 'right', overflow: 'hidden' }}>
        <RightPanel />
      </div>

      {/* Bottom Panel — spans all 3 columns */}
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
