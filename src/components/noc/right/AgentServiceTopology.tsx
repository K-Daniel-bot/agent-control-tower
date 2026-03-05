'use client'

// ─── Agent Service Topology (Horizontal Flowchart) ──────────────────────────
// Pure React SVG horizontal pipeline layout. No D3 dependency.
// Orchestrator on the left, services radiating right with connecting lines.
// ─────────────────────────────────────────────────────────────────────────────

interface TopoNode {
  readonly id: string
  readonly label: string
  readonly color: string
  readonly r: number
}

interface TopoLink {
  readonly source: string
  readonly target: string
}

const ORCHESTRATOR: TopoNode = {
  id: 'orchestrator',
  label: 'Orchestrator',
  color: '#ffd700',
  r: 32,
}

const SERVICE_NODES: readonly TopoNode[] = [
  { id: 'database', label: 'Database', color: '#3b82f6', r: 22 },
  { id: 'network', label: 'Network Monitor', color: '#06b6d4', r: 22 },
  { id: 'executor', label: 'Executor Pool', color: '#10b981', r: 22 },
  { id: 'internet', label: 'Internet_Service', color: '#ec4899', r: 22 },
  { id: 'ems', label: 'EMS', color: '#ff6b35', r: 22 },
]

const SECONDARY_LINKS: readonly TopoLink[] = [
  { source: 'executor', target: 'database' },
  { source: 'network', target: 'internet' },
  { source: 'ems', target: 'database' },
]

const NODE_MAP = new Map<string, TopoNode>(
  [ORCHESTRATOR, ...SERVICE_NODES].map(n => [n.id, n])
)

const PADDING_LEFT = 60
const COLUMN_GAP = 160
const ROW_GAP = 64
const SVG_HEIGHT = 280

function getOrchestratorPos() {
  const totalHeight = (SERVICE_NODES.length - 1) * ROW_GAP
  return { x: PADDING_LEFT, y: totalHeight / 2 + 30 }
}

function getServicePositions(): ReadonlyArray<{ readonly node: TopoNode; readonly x: number; readonly y: number }> {
  const startY = 30
  return SERVICE_NODES.map((node, idx) => ({
    node,
    x: PADDING_LEFT + COLUMN_GAP,
    y: startY + idx * ROW_GAP,
  }))
}

function CurvedLink({
  x1,
  y1,
  x2,
  y2,
  color,
  dashed = false,
}: {
  readonly x1: number
  readonly y1: number
  readonly x2: number
  readonly y2: number
  readonly color: string
  readonly dashed?: boolean
}) {
  const midX = (x1 + x2) / 2
  const d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={dashed ? 1 : 1.4}
      strokeOpacity={dashed ? 0.3 : 0.5}
      strokeDasharray={dashed ? '4 3' : 'none'}
    />
  )
}

function NodeCircle({
  x,
  y,
  node,
  isHub,
}: {
  readonly x: number
  readonly y: number
  readonly node: TopoNode
  readonly isHub: boolean
}) {
  return (
    <g transform={`translate(${x},${y})`}>
      {isHub && (
        <>
          <circle
            r={node.r}
            fill="rgba(255,215,0,0.10)"
            stroke={node.color}
            strokeWidth={2.5}
          />
          <circle
            r={node.r - 6}
            fill="none"
            stroke="#ffd700"
            strokeWidth={0.5}
            strokeOpacity={0.3}
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#ffd700"
            fontSize={10}
            fontWeight={700}
            style={{ pointerEvents: 'none' }}
          >
            ORC
          </text>
        </>
      )}
      {!isHub && (
        <circle
          r={node.r}
          fill="#000000"
          stroke={node.color}
          strokeWidth={1.8}
        />
      )}
      <text
        textAnchor="middle"
        y={node.r + 13}
        fill={node.color}
        fontSize={9}
        fontWeight={600}
        style={{ pointerEvents: 'none', letterSpacing: '0.02em' }}
      >
        {node.label}
      </text>
    </g>
  )
}

export default function AgentServiceTopology() {
  const orcPos = getOrchestratorPos()
  const servicePositions = getServicePositions()

  const posMap = new Map<string, { x: number; y: number }>()
  posMap.set('orchestrator', orcPos)
  servicePositions.forEach(({ node, x, y }) => posMap.set(node.id, { x, y }))

  const svgWidth = PADDING_LEFT + COLUMN_GAP + 100
  const computedHeight = Math.max(SVG_HEIGHT, (SERVICE_NODES.length - 1) * ROW_GAP + 60)

  return (
    <div style={{ width: '100%', height: '100%', overflowX: 'auto', overflowY: 'hidden' }}>
      <svg
        width={svgWidth}
        height={computedHeight}
        viewBox={`0 0 ${svgWidth} ${computedHeight}`}
        style={{ display: 'block', minWidth: svgWidth }}
      >
        <defs>
          <filter id="topo-glow-h">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {servicePositions.map(({ node, x, y }) => (
          <CurvedLink
            key={`orc-${node.id}`}
            x1={orcPos.x}
            y1={orcPos.y}
            x2={x}
            y2={y}
            color="#555555"
          />
        ))}

        {SECONDARY_LINKS.map((link) => {
          const srcPos = posMap.get(link.source)
          const tgtPos = posMap.get(link.target)
          if (!srcPos || !tgtPos) return null
          const srcNode = NODE_MAP.get(link.source)
          return (
            <CurvedLink
              key={`${link.source}-${link.target}`}
              x1={srcPos.x}
              y1={srcPos.y}
              x2={tgtPos.x}
              y2={tgtPos.y}
              color={srcNode?.color ?? '#444444'}
              dashed
            />
          )
        })}

        <NodeCircle x={orcPos.x} y={orcPos.y} node={ORCHESTRATOR} isHub />

        {servicePositions.map(({ node, x, y }) => (
          <NodeCircle key={node.id} x={x} y={y} node={node} isHub={false} />
        ))}
      </svg>
    </div>
  )
}
