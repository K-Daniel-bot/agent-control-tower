'use client'

import { useEffect, useRef } from 'react'
import { useOrchestra } from '@/context/AgentOrchestraContext'
import { useCytoscapeElements } from '@/hooks/useCytoscapeElements'
import SectionHeader from './SectionHeader'
import GraphLegend from './GraphLegend'

/* eslint-disable @typescript-eslint/no-explicit-any */
const CYTOSCAPE_STYLE: any[] = [
  {
    selector: 'node',
    style: {
      'background-color': '#1a1f2e',
      'border-width': 2,
      'border-color': '#2a3042',
      'label': 'data(label)',
      'color': '#9ca3af',
      'font-size': 8,
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 6,
      'width': 24,
      'height': 24,
      'text-wrap': 'wrap',
      'text-max-width': '60px',
    },
  },
  {
    selector: 'node[nodeType="hub"]',
    style: {
      'background-color': 'rgba(0, 255, 136, 0.1)',
      'border-color': '#00ff88',
      'border-width': 3,
      'width': 60,
      'height': 60,
      'font-size': 9,
      'font-weight': 'bold',
      'color': '#00ff88',
      'text-valign': 'center',
      'text-halign': 'center',
      'text-margin-y': 0,
    },
  },
  {
    selector: 'node[nodeType="orchestrator"]',
    style: {
      'border-color': '#ffd700',
      'width': 32,
      'height': 32,
      'color': '#ffd700',
      'font-size': 8,
      'font-weight': 'bold',
    },
  },
  {
    selector: 'node[nodeType="planner"]',
    style: { 'border-color': '#8b5cf6', 'color': '#8b5cf6' },
  },
  {
    selector: 'node[nodeType="executor"]',
    style: { 'border-color': '#f59e0b', 'color': '#f59e0b' },
  },
  {
    selector: 'node[nodeType="tool"]',
    style: { 'border-color': '#06b6d4', 'color': '#06b6d4' },
  },
  {
    selector: 'node[nodeType="verifier"], node[nodeType="verifier_tool"]',
    style: { 'border-color': '#10b981', 'color': '#10b981' },
  },
  {
    selector: 'node[nodeType="browser"]',
    style: { 'border-color': '#3b82f6', 'color': '#3b82f6' },
  },
  {
    selector: 'node[nodeType="slack"]',
    style: { 'border-color': '#e74c3c', 'color': '#e74c3c' },
  },
  {
    selector: 'node[nodeType="filesystem"]',
    style: { 'border-color': '#f59e0b', 'color': '#f59e0b' },
  },
  {
    selector: 'node[nodeType="git"]',
    style: { 'border-color': '#f97316', 'color': '#f97316' },
  },
  {
    selector: 'node[nodeType="shell"]',
    style: { 'border-color': '#06b6d4', 'color': '#06b6d4' },
  },
  {
    selector: 'node[nodeType="knowledge"]',
    style: { 'border-color': '#a855f7', 'color': '#a855f7' },
  },
  {
    selector: 'node[nodeType="policy"]',
    style: { 'border-color': '#ef4444', 'color': '#ef4444' },
  },
  {
    selector: 'node[status="working"], node[status="active"]',
    style: {
      'border-width': 3,
      'background-color': 'rgba(0, 255, 136, 0.08)',
    },
  },
  {
    selector: 'edge',
    style: {
      'line-color': '#2a3042',
      'width': 1,
      'curve-style': 'bezier',
      'opacity': 0.5,
      'target-arrow-shape': 'none',
    },
  },
]

export function DependencyGraphSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<any>(null)
  const { state } = useOrchestra()
  const elements = useCytoscapeElements(state)
  const isEmpty = elements.length === 0

  // Initialize Cytoscape (dynamic import to avoid SSR issues)
  useEffect(() => {
    if (!containerRef.current) return

    let cy: any = null
    let cancelled = false

    import('cytoscape').then((cytoscapeModule) => {
      if (cancelled || !containerRef.current) return

      const cytoscapeFn = cytoscapeModule.default ?? cytoscapeModule
      cy = cytoscapeFn({
        container: containerRef.current,
        elements: [],
        style: CYTOSCAPE_STYLE,
        layout: { name: 'preset' },
        userZoomingEnabled: false,
        userPanningEnabled: false,
        boxSelectionEnabled: false,
        autoungrabify: true,
        autounselectify: true,
      })

      cyRef.current = cy
    })

    return () => {
      cancelled = true
      if (cy) {
        cy.destroy()
      }
      cyRef.current = null
    }
  }, [])

  // Update elements when state changes
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return

    cy.elements().remove()

    if (elements.length === 0) return

    cy.add(
      elements.map((el: any) => ({
        group: el.group,
        data: el.data,
        position: el.position,
      }))
    )

    cy.fit(undefined, 30)
    cy.center()
  }, [elements])

  return (
    <div
      style={{
        flex: '3.5 1 0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        minHeight: 0,
        borderTop: '1px solid #2a3042',
      }}
    >
      <SectionHeader
        title="Agent Dependency Graph (Cytoscape)"
        accentColor="#3b82f6"
        rightSlot={!isEmpty ? <GraphLegend /> : undefined}
      />
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        {isEmpty && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <span style={{ fontSize: 11, color: '#4b5563', letterSpacing: '0.05em' }}>
              의존성 그래프 대기 중...
            </span>
          </div>
        )}
        <div
          ref={containerRef}
          style={{
            width: '100%',
            height: '100%',
            opacity: isEmpty ? 0.3 : 1,
            transition: 'opacity 0.5s',
          }}
        />
      </div>
    </div>
  )
}

export default DependencyGraphSection
