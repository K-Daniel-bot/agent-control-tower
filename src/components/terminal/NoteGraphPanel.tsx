'use client'

import { useMemo, useCallback, useState } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  Controls,
  ReactFlowProvider,
  useReactFlow,
  type NodeProps,
  type NodeTypes,
  Handle,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

interface Note {
  readonly id: string
  readonly title: string
  readonly content: string
  readonly tags: readonly string[]
  readonly createdAt: number
  readonly updatedAt: number
}

function loadNotesFromStorage(): readonly Note[] {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('act-notes') : null
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// ─── Note node data ───────────────────────────────────────────────────────────

interface NoteNodeData {
  title: string
  tagCount: number
  contentPreview: string
  isHighlighted: boolean
}

interface TagNodeData {
  tagName: string
  isHighlighted: boolean
}

// ─── Custom node: NoteNode ────────────────────────────────────────────────────

function NoteNode({ data }: NodeProps) {
  const nodeData = data as unknown as NoteNodeData
  const highlighted = nodeData.isHighlighted

  const containerStyle: React.CSSProperties = {
    width: 160,
    minHeight: 80,
    background: highlighted ? '#1e3a5f' : '#162942',
    border: `2px solid ${highlighted ? '#60a5fa' : '#3b82f6'}`,
    borderRadius: 8,
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    boxShadow: highlighted
      ? '0 0 12px rgba(59,130,246,0.5), 0 2px 8px rgba(0,0,0,0.5)'
      : '0 2px 8px rgba(0,0,0,0.5)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    cursor: 'default',
    userSelect: 'none',
  }

  return (
    <div style={containerStyle}>
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: '#3b82f6', border: '2px solid #3b82f6', width: 8, height: 8 }}
      />
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: highlighted ? '#93c5fd' : '#e5e7eb',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {nodeData.title || '(제목 없음)'}
      </div>
      <div
        style={{
          fontSize: 8,
          color: highlighted ? '#60a5fa' : '#3b82f6',
          fontWeight: 600,
        }}
      >
        태그 {nodeData.tagCount}개
      </div>
      {nodeData.contentPreview && (
        <div
          style={{
            fontSize: 8,
            color: '#6b7280',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {nodeData.contentPreview}
        </div>
      )}
    </div>
  )
}

// ─── Custom node: TagNode ─────────────────────────────────────────────────────

function TagNode({ data }: NodeProps) {
  const nodeData = data as unknown as TagNodeData
  const highlighted = nodeData.isHighlighted

  const containerStyle: React.CSSProperties = {
    width: 80,
    height: 30,
    background: highlighted ? 'rgba(0,255,136,0.2)' : 'rgba(0,255,136,0.1)',
    border: `1.5px solid ${highlighted ? '#00ff88' : 'rgba(0,255,136,0.5)'}`,
    borderRadius: 15,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: highlighted
      ? '0 0 8px rgba(0,255,136,0.5)'
      : 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
    cursor: 'default',
    userSelect: 'none',
  }

  return (
    <div style={containerStyle}>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#00ff88', border: '2px solid #00ff88', width: 6, height: 6 }}
      />
      <span
        style={{
          fontSize: 9,
          fontWeight: 600,
          color: highlighted ? '#00ff88' : 'rgba(0,255,136,0.8)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          padding: '0 6px',
        }}
      >
        #{nodeData.tagName}
      </span>
    </div>
  )
}

// ─── Node types map (defined outside component to avoid re-creation) ──────────

const NODE_TYPES: NodeTypes = {
  noteNode: NoteNode,
  tagNode: TagNode,
}

// ─── Layout builder ───────────────────────────────────────────────────────────

interface FlowNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, unknown>
}

interface FlowEdge {
  id: string
  source: string
  target: string
  style: React.CSSProperties
  animated?: boolean
}

function buildLayout(
  notes: readonly Note[],
  highlightedNoteId: string | null,
): { nodes: FlowNode[]; edges: FlowEdge[] } {
  const nodes: FlowNode[] = []
  const edges: FlowEdge[] = []

  // Collect all unique tags across notes
  const allTagSet = new Set<string>()
  notes.forEach((note) => note.tags.forEach((t) => allTagSet.add(t)))
  const allTags = Array.from(allTagSet)

  // Track which tag nodes have been placed (shared tags appear once)
  const tagNodePositions = new Map<string, { x: number; y: number }>()

  // Place note nodes in a grid: 3 columns
  const COLS = 3
  const NOTE_X_START = 60
  const NOTE_Y_START = 60
  const NOTE_X_SPACING = 250
  const NOTE_Y_SPACING = 220

  notes.forEach((note, i) => {
    const col = i % COLS
    const row = Math.floor(i / COLS)
    const noteX = NOTE_X_START + col * NOTE_X_SPACING
    const noteY = NOTE_Y_START + row * NOTE_Y_SPACING

    const isHighlighted = note.id === highlightedNoteId

    const contentPreview = note.content
      .split('\n')
      .find((line) => line.trim().length > 0)
      ?.slice(0, 40) ?? ''

    nodes.push({
      id: `note-${note.id}`,
      type: 'noteNode',
      position: { x: noteX, y: noteY },
      data: {
        title: note.title,
        tagCount: note.tags.length,
        contentPreview,
        isHighlighted,
      } as Record<string, unknown>,
    })

    // Place tag nodes below this note
    note.tags.forEach((tag, tagIdx) => {
      const tagNodeId = `tag-${tag}`
      const isTagHighlighted = isHighlighted

      if (!tagNodePositions.has(tag)) {
        const tagX = noteX + tagIdx * 90 - (note.tags.length - 1) * 45
        const tagY = noteY + 140

        tagNodePositions.set(tag, { x: tagX, y: tagY })

        nodes.push({
          id: tagNodeId,
          type: 'tagNode',
          position: { x: tagX, y: tagY },
          data: {
            tagName: tag,
            isHighlighted: isTagHighlighted,
          } as Record<string, unknown>,
        })
      } else if (isTagHighlighted) {
        // Update highlight state for already-placed shared tag node
        const existing = nodes.find((n) => n.id === tagNodeId)
        if (existing) {
          const idx = nodes.indexOf(existing)
          nodes[idx] = {
            ...existing,
            data: { ...existing.data, isHighlighted: true },
          }
        }
      }

      edges.push({
        id: `edge-${note.id}-${tag}`,
        source: `note-${note.id}`,
        target: tagNodeId,
        style: {
          stroke: isHighlighted ? '#60a5fa' : '#2a3042',
          strokeWidth: isHighlighted ? 2 : 1,
          opacity: isHighlighted ? 0.9 : 0.5,
        },
        animated: isHighlighted,
      })
    })
  })

  // Ensure all unique tags have a node even if they appeared in multiple notes
  // (already handled by tagNodePositions map above)
  // Just make sure unused tags from allTags are rendered if they had no note match
  // This can't happen by construction, so no extra work needed.
  void allTags

  return { nodes, edges }
}

// ─── Inner flow component (needs ReactFlowProvider context) ───────────────────

function GraphContent({ notes }: { notes: readonly Note[] }) {
  const [highlightedNoteId, setHighlightedNoteId] = useState<string | null>(null)
  const { fitView } = useReactFlow()

  const { nodes, edges } = useMemo(
    () => buildLayout(notes, highlightedNoteId),
    [notes, highlightedNoteId],
  )

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: { id: string }) => {
      if (!node.id.startsWith('note-')) return
      const noteId = node.id.replace(/^note-/, '')
      setHighlightedNoteId((prev) => (prev === noteId ? null : noteId))
    },
    [],
  )

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag
        zoomOnScroll
        zoomOnPinch
        onInit={() => {
          setTimeout(() => fitView({ padding: 0.3, duration: 500 }), 100)
        }}
        onNodeClick={handleNodeClick}
        proOptions={{ hideAttribution: true }}
        style={{ background: '#0a0e1a' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#1e2535"
          gap={20}
          size={1}
        />
        <MiniMap
          style={{
            background: 'rgba(10,14,26,0.9)',
            border: '1px solid #2a3042',
          }}
          nodeColor={(node) => {
            if (node.type === 'tagNode') return '#00ff88'
            return '#3b82f6'
          }}
          maskColor="rgba(10,14,26,0.6)"
        />
        <Controls
          style={{ background: 'rgba(16,20,32,0.9)', border: '1px solid #2a3042' }}
        />
      </ReactFlow>
    </div>
  )
}

// ─── Main exported component ──────────────────────────────────────────────────

export default function NoteGraphPanel() {
  const notes = loadNotesFromStorage()
  const isEmpty = notes.length === 0

  const containerStyle: React.CSSProperties = {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    background: '#0a0e1a',
    overflow: 'hidden',
    minWidth: 0,
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 12px',
    borderBottom: '1px solid #2a3042',
    background: 'rgba(16,20,32,0.9)',
    flexShrink: 0,
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: isEmpty ? '#2a3042' : '#3b82f6',
              boxShadow: isEmpty ? 'none' : '0 0 6px #3b82f6',
            }}
          />
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#9ca3af',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            노트 그래프
          </span>
          {!isEmpty && (
            <span
              style={{
                fontSize: 8,
                color: '#3b82f6',
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.25)',
                borderRadius: 8,
                padding: '0 5px',
              }}
            >
              {notes.length}개 노트 · 노드 클릭으로 하이라이트
            </span>
          )}
        </div>
      </div>

      {/* Graph area */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        {isEmpty ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#2a3042',
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: '#4b5563',
                textAlign: 'center',
                maxWidth: 260,
                lineHeight: 1.5,
              }}
            >
              노트가 없습니다. AI 노트에서 노트를 추가하면 그래프가 표시됩니다.
            </span>
          </div>
        ) : (
          <ReactFlowProvider>
            <GraphContent notes={notes} />
          </ReactFlowProvider>
        )}
      </div>
    </div>
  )
}
