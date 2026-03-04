'use client'

import { useEffect, useRef } from 'react'
import { useOrchestra } from '@/context/AgentOrchestraContext'
import { useCytoscapeElements } from '@/hooks/useCytoscapeElements'
import SectionHeader from './SectionHeader'
import GraphLegend from './GraphLegend'

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Module-level pre-load ────────────────────────────────────────────────────
// Cytoscape starts loading the moment this file is imported,
// NOT when the component mounts. By the time the user clicks TEST, it's ready.
let _cytoscapeFn: any = null
let _loadPromise: Promise<any> | null = null

function getCytoscape(): Promise<any> {
  if (_cytoscapeFn) return Promise.resolve(_cytoscapeFn)
  if (!_loadPromise) {
    _loadPromise = Promise.all([
      import('cytoscape'),
      import('cytoscape-fcose'),
    ]).then(([cytoscapeModule, fcoseModule]) => {
      const fn = cytoscapeModule.default ?? cytoscapeModule
      // fcose registers as CJS function (not .default)
      const fcose = typeof fcoseModule === 'function'
        ? fcoseModule
        : fcoseModule.default ?? fcoseModule
      try { fn.use(fcose) } catch (_) { /* already registered */ }
      _cytoscapeFn = fn
      return fn
    })
  }
  return _loadPromise
}

// Start loading immediately on module import (SSR-safe)
if (typeof window !== 'undefined') {
  getCytoscape()
}

// ─── Cytoscape style ─────────────────────────────────────────────────────────
const CY_STYLE: any[] = [
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
      'background-color': 'rgba(0, 255, 136, 0.15)',
      'border-color': '#00ff88',
      'border-width': 4,
      'width': 90,
      'height': 90,
      'font-size': 9,
      'font-weight': 'bold',
      'color': '#00ff88',
      'text-valign': 'center',
      'text-halign': 'center',
      'text-margin-y': 0,
      'text-wrap': 'wrap',
      'text-max-width': '70px',
    },
  },
  {
    selector: 'node[nodeType="orchestrator"]',
    style: { 'border-color': '#ffd700', 'width': 36, 'height': 36, 'color': '#ffd700', 'font-weight': 'bold' },
  },
  { selector: 'node[nodeType="planner"]',      style: { 'border-color': '#8b5cf6', 'color': '#8b5cf6', 'width': 28, 'height': 28 } },
  { selector: 'node[nodeType="executor"]',     style: { 'border-color': '#f59e0b', 'color': '#f59e0b', 'width': 28, 'height': 28 } },
  { selector: 'node[nodeType="tool"]',         style: { 'border-color': '#06b6d4', 'color': '#06b6d4' } },
  { selector: 'node[nodeType="verifier"], node[nodeType="verifier_tool"]', style: { 'border-color': '#10b981', 'color': '#10b981' } },
  { selector: 'node[nodeType="browser"]',      style: { 'border-color': '#3b82f6', 'color': '#3b82f6' } },
  { selector: 'node[nodeType="slack"]',        style: { 'border-color': '#e74c3c', 'color': '#e74c3c' } },
  { selector: 'node[nodeType="filesystem"]',   style: { 'border-color': '#f59e0b', 'color': '#f59e0b' } },
  { selector: 'node[nodeType="git"]',          style: { 'border-color': '#f97316', 'color': '#f97316' } },
  { selector: 'node[nodeType="shell"]',        style: { 'border-color': '#06b6d4', 'color': '#06b6d4' } },
  { selector: 'node[nodeType="knowledge"]',    style: { 'border-color': '#a855f7', 'color': '#a855f7' } },
  { selector: 'node[nodeType="policy"]',       style: { 'border-color': '#ef4444', 'color': '#ef4444' } },
  {
    selector: 'node[status="working"], node[status="active"]',
    style: { 'border-width': 3, 'background-color': 'rgba(0, 255, 136, 0.08)' },
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

// ─── Component ────────────────────────────────────────────────────────────────
export function DependencyGraphSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<any>(null)
  const { state } = useOrchestra()
  const elements = useCytoscapeElements(state)
  const isEmpty = elements.length === 0

  // Single effect: drives everything — init + update
  useEffect(() => {
    if (elements.length === 0) {
      // No agents yet — clear if cy exists
      if (cyRef.current) {
        cyRef.current.elements().remove()
      }
      return
    }

    let cancelled = false

    getCytoscape().then((cytoscapeFn) => {
      if (cancelled || !containerRef.current) return

      // Create cy instance only once
      if (!cyRef.current) {
        cyRef.current = cytoscapeFn({
          container: containerRef.current,
          elements: [],
          style: CY_STYLE,
          layout: { name: 'preset' },
          userZoomingEnabled: false,
          userPanningEnabled: false,
          boxSelectionEnabled: false,
          autoungrabify: true,
          autounselectify: true,
        })
      }

      const cy = cyRef.current

      // Replace all elements
      cy.elements().remove()
      cy.add(elements.map((el: any) => ({ group: el.group, data: el.data })))

      // Run layout — fcose with cose fallback
      try {
        cy.layout({
          name: 'fcose',
          quality: 'default',
          randomize: true,
          animate: true,
          animationDuration: 700,
          fit: true,
          padding: 40,
          nodeDimensionsIncludeLabels: true,
          idealEdgeLength: () => 110,
          edgeElasticity: () => 0.45,
          nodeRepulsion: () => 9000,
          gravity: 0.4,
          gravityRange: 1.5,
          numIter: 2500,
          tile: false,
        } as any).run()
      } catch (_) {
        // Fallback to built-in cose layout
        cy.layout({
          name: 'cose',
          fit: true,
          padding: 40,
          animate: true,
          animationDuration: 700,
          randomize: true,
          nodeRepulsion: () => 8000,
          nodeOverlap: 20,
          idealEdgeLength: () => 110,
          gravity: 80,
          numIter: 1000,
        } as any).run()
      }
    })

    return () => { cancelled = true }
  }, [elements])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy()
        cyRef.current = null
      }
    }
  }, [])

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
        {/* position:absolute + inset:0 ensures Cytoscape gets real pixel dimensions */}
        <div
          ref={containerRef}
          style={{
            position: 'absolute',
            inset: 0,
            opacity: isEmpty ? 0.3 : 1,
            transition: 'opacity 0.5s',
          }}
        />
      </div>
    </div>
  )
}

export default DependencyGraphSection
