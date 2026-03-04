'use client'

import AgentEventCountTable from './AgentEventCountTable'
import AgentServiceTopology from './AgentServiceTopology'

// ─── NOC Right Panel ──────────────────────────────────────────────────────────
// Container splitting into event count table (top ~45%) and
// bubble-style service topology (bottom ~55%).
// ───────────────────────────────────────────────────────────────────────────────

function PanelHeader({ title }: { title: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 10px',
        background: 'linear-gradient(90deg, #151b2e 0%, #0e1220 100%)',
        borderBottom: '1px solid #1e2535',
        minHeight: 28,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: '#94a3b8',
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: '#374151', cursor: 'pointer' }}>□</span>
        <span style={{ fontSize: 10, color: '#374151', cursor: 'pointer' }}>✕</span>
      </div>
    </div>
  )
}

export default function NocRightPanel() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: 'rgba(10,14,26,0.97)',
        overflow: 'hidden',
      }}
    >
      {/* Top section: Event Count Table (~45%) */}
      <div
        style={{
          flex: '0 0 45%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderBottom: '1px solid #1e2535',
        }}
      >
        <PanelHeader title="이벤트 개수 (프로파일)" />
        <div style={{ flex: 1, overflow: 'auto', padding: '6px 8px' }}>
          <AgentEventCountTable />
        </div>
      </div>

      {/* Bottom section: Service Topology (~55%) */}
      <div
        style={{
          flex: '1 1 55%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0,
        }}
      >
        <PanelHeader title="에이전트 서비스별 (Bubble Style)" />
        <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
          <AgentServiceTopology />
        </div>
      </div>
    </div>
  )
}
