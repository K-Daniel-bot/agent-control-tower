'use client'

// ─── Agent Event Count Table ──────────────────────────────────────────────────
// Color-coded grid showing event counts by severity per agent type.
// Mirrors the Zenius NOC "이벤트 개수 (프로파일)" panel.
// ───────────────────────────────────────────────────────────────────────────────

interface SeverityColumn {
  readonly key: string
  readonly label: string
  readonly color: string
}

interface AgentRow {
  readonly code: string
  readonly label: string
  readonly counts: readonly number[]
}

const SEVERITY_COLUMNS: readonly SeverityColumn[] = [
  { key: 'caution', label: '주의', color: '#f59e0b' },
  { key: 'danger', label: '위험', color: '#ff6b35' },
  { key: 'urgent', label: '긴급', color: '#ef4444' },
  { key: 'sustained', label: '지속', color: '#a855f7' },
  { key: 'total', label: '합계', color: '#374151' },
] as const

const AGENT_ROWS: readonly AgentRow[] = [
  { code: 'ORC', label: 'Orchestrator', counts: [11, 7, 6, 3, 27] },
  { code: 'PLN', label: 'Planner', counts: [3, 2, 0, 0, 5] },
  { code: 'EXE', label: 'Executor', counts: [2, 0, 0, 0, 2] },
  { code: 'TOL', label: 'Tool', counts: [5, 3, 1, 0, 9] },
  { code: 'VRF', label: 'Verifier', counts: [1, 1, 0, 0, 2] },
] as const

function CountIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="1" width="5" height="5" rx="1" fill="#4b5563" />
      <rect x="8" y="1" width="5" height="5" rx="1" fill="#4b5563" />
      <rect x="1" y="8" width="5" height="5" rx="1" fill="#4b5563" />
      <rect x="8" y="8" width="5" height="5" rx="1" fill="#4b5563" />
    </svg>
  )
}

function computeTotalRow(rows: readonly AgentRow[]): readonly number[] {
  return SEVERITY_COLUMNS.map((_, colIdx) =>
    rows.reduce((sum, row) => sum + row.counts[colIdx], 0)
  )
}

export default function AgentEventCountTable() {
  const totalCounts = computeTotalRow(AGENT_ROWS)

  return (
    <div style={{ width: '100%' }}>
      {/* Column headers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '56px repeat(5, 1fr)',
          gap: 2,
          marginBottom: 2,
        }}
      >
        {/* Top-left: icon cell */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px 0',
            background: '#111827',
            borderRadius: 3,
          }}
        >
          <CountIcon />
        </div>

        {SEVERITY_COLUMNS.map((col) => (
          <div
            key={col.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px 0',
              fontSize: 10,
              fontWeight: 600,
              color: col.color,
              background: '#111827',
              borderRadius: 3,
              letterSpacing: '0.03em',
            }}
          >
            {col.label}
          </div>
        ))}
      </div>

      {/* Agent rows */}
      {AGENT_ROWS.map((row) => (
        <div
          key={row.code}
          style={{
            display: 'grid',
            gridTemplateColumns: '56px repeat(5, 1fr)',
            gap: 2,
            marginBottom: 2,
          }}
        >
          {/* Row label */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4px 2px',
              fontSize: 10,
              fontWeight: 600,
              color: '#6b7280',
              background: '#111827',
              borderRadius: 3,
              letterSpacing: '0.02em',
            }}
            title={row.label}
          >
            {row.code}
          </div>

          {/* Count cells */}
          {row.counts.map((count, colIdx) => {
            const col = SEVERITY_COLUMNS[colIdx]
            const isEmpty = count === 0
            return (
              <div
                key={col.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 30,
                  borderRadius: 3,
                  background: isEmpty ? '#1a1f2e' : col.color,
                  opacity: isEmpty ? 0.5 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: isEmpty ? '#374151' : '#ffffff',
                    textShadow: isEmpty ? 'none' : '0 1px 2px rgba(0,0,0,0.3)',
                  }}
                >
                  {count}
                </span>
              </div>
            )
          })}
        </div>
      ))}

      {/* Total row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '56px repeat(5, 1fr)',
          gap: 2,
          marginTop: 4,
          borderTop: '1px solid #1e2535',
          paddingTop: 4,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4px 2px',
            fontSize: 10,
            fontWeight: 700,
            color: '#9ca3af',
            background: '#111827',
            borderRadius: 3,
          }}
        >
          ALL
        </div>
        {totalCounts.map((count, colIdx) => {
          const col = SEVERITY_COLUMNS[colIdx]
          return (
            <div
              key={col.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 30,
                borderRadius: 3,
                background: `${col.color}88`,
                border: `1px solid ${col.color}44`,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#ffffff',
                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                }}
              >
                {count}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
