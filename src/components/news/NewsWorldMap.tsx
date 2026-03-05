'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import type { NewsArticle, EventCategory } from '@/types/news'
import { CATEGORY_COLORS, SEVERITY_COLORS, CATEGORY_ICONS } from '@/types/news'

interface NewsWorldMapProps {
  articles: readonly NewsArticle[]
  onSelectArticle: (article: NewsArticle) => void
  onFlyTo?: { lat: number; lng: number } | null
}

interface MarkerCluster {
  readonly lat: number
  readonly lng: number
  readonly country: string
  readonly countryCode: string
  readonly city: string
  readonly articles: NewsArticle[]
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  return `${Math.floor(hours / 24)}일 전`
}

export default function NewsWorldMap({ articles, onSelectArticle, onFlyTo }: NewsWorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const mapGroupRef = useRef<SVGGElement | null>(null)
  const markerGroupRef = useRef<SVGGElement | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [worldData, setWorldData] = useState<any>(null)
  const [hoveredCluster, setHoveredCluster] = useState<MarkerCluster | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 })
  const [dims, setDims] = useState({ width: 960, height: 500 })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const zoomRef = useRef<any>(null)

  useEffect(() => {
    fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((r) => r.json())
      .then(setWorldData)
      .catch(() => {})
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width, height } = e.contentRect
        if (width > 0 && height > 0) setDims({ width, height })
      }
    })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const projection = useMemo(() => {
    return d3.geoNaturalEarth1()
      .scale(dims.width / 5.5)
      .translate([dims.width / 2, dims.height / 2])
  }, [dims])

  const pathGen = useMemo(() => d3.geoPath().projection(projection), [projection])

  const clusters = useMemo(() => {
    const map = new Map<string, MarkerCluster>()
    for (const a of articles) {
      const key = `${Math.round(a.location.lat * 10)}-${Math.round(a.location.lng * 10)}`
      const existing = map.get(key)
      if (existing) {
        map.set(key, { ...existing, articles: [...existing.articles, a] })
      } else {
        map.set(key, {
          lat: a.location.lat, lng: a.location.lng,
          country: a.location.country, countryCode: a.location.countryCode,
          city: a.location.city ?? '', articles: [a],
        })
      }
    }
    return Array.from(map.values())
  }, [articles])

  // Draw map + setup zoom
  useEffect(() => {
    if (!worldData || !svgRef.current) return
    const svg = d3.select(svgRef.current)

    svg.selectAll('g.map-root').remove()
    const root = svg.append('g').attr('class', 'map-root')
    const mapG = root.append('g').attr('class', 'map-layer')
    const markerG = root.append('g').attr('class', 'marker-layer')
    mapGroupRef.current = mapG.node()
    markerGroupRef.current = markerG.node()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const countries = topojson.feature(worldData, worldData.objects.countries) as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const borders = topojson.mesh(worldData, worldData.objects.countries, (a: any, b: any) => a !== b)

    const graticule = d3.geoGraticule10()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapG.append('path').datum(graticule).attr('d', pathGen as any)
      .attr('fill', 'none').attr('stroke', '#0d1117').attr('stroke-width', 0.4)

    mapG.selectAll('path.country').data(countries.features).enter()
      .append('path').attr('class', 'country')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .attr('d', pathGen as any)
      .attr('fill', '#0a1020').attr('stroke', '#1a2a3a').attr('stroke-width', 0.5)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapG.append('path').datum(borders).attr('d', pathGen as any)
      .attr('fill', 'none').attr('stroke', '#1a2a3a').attr('stroke-width', 0.4)

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 12])
      .on('zoom', (event) => {
        root.attr('transform', event.transform.toString())
      })

    svg.call(zoom)
    zoomRef.current = zoom

    return () => {
      svg.on('.zoom', null)
    }
  }, [worldData, pathGen])

  // Fly to location
  useEffect(() => {
    if (!onFlyTo || !svgRef.current || !zoomRef.current) return
    const svg = d3.select(svgRef.current)
    const coords = projection([onFlyTo.lng, onFlyTo.lat])
    if (!coords) return

    const [x, y] = coords
    const scale = 4
    const tx = dims.width / 2 - x * scale
    const ty = dims.height / 2 - y * scale
    const transform = d3.zoomIdentity.translate(tx, ty).scale(scale)

    svg.transition().duration(1000)
      .call(zoomRef.current.transform, transform)
  }, [onFlyTo, projection, dims])

  const handleMarkerHover = useCallback((cluster: MarkerCluster | null, e?: React.MouseEvent) => {
    setHoveredCluster(cluster)
    if (e && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
  }, [])

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%', background: '#000000', overflow: 'hidden', cursor: 'grab' }}>
      <svg ref={svgRef} width={dims.width} height={dims.height} style={{ display: 'block' }}>
        <rect width={dims.width} height={dims.height} fill="#000000" />
        <path d={pathGen({ type: 'Sphere' }) ?? ''} fill="#000508" stroke="#0d2137" strokeWidth={1} />
      </svg>

      {/* Markers overlay (re-renders with React) */}
      <svg width={dims.width} height={dims.height} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
        <g className="marker-overlay" ref={(el) => {
          if (!el || !svgRef.current) return
          const root = svgRef.current.querySelector('g.map-root')
          if (root) {
            el.setAttribute('transform', root.getAttribute('transform') ?? '')
            const obs = new MutationObserver(() => {
              el.setAttribute('transform', root.getAttribute('transform') ?? '')
            })
            obs.observe(root, { attributes: true, attributeFilter: ['transform'] })
          }
        }}>
          {clusters.map((cluster) => {
            const coords = projection([cluster.lng, cluster.lat])
            if (!coords) return null
            const [cx, cy] = coords
            const count = cluster.articles.length
            const r = Math.min(4 + count * 2, 16)

            // Dominant category
            const catCounts: Record<string, number> = {}
            for (const a of cluster.articles) {
              catCounts[a.category] = (catCounts[a.category] ?? 0) + 1
            }
            const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as EventCategory ?? 'AI'
            const color = CATEGORY_COLORS[topCat]

            // Has critical?
            const hasCritical = cluster.articles.some((a) => a.severity === 'critical')

            return (
              <g
                key={`${cluster.countryCode}-${cluster.city}-${cluster.lat}`}
                style={{ cursor: 'pointer', pointerEvents: 'all' }}
                onMouseEnter={(e) => handleMarkerHover(cluster, e)}
                onMouseLeave={() => handleMarkerHover(null)}
                onClick={(e) => {
                  e.stopPropagation()
                  if (cluster.articles.length === 1) {
                    onSelectArticle(cluster.articles[0]!)
                  } else {
                    onSelectArticle(cluster.articles[0]!)
                  }
                }}
              >
                {/* Pulse for critical */}
                {hasCritical && (
                  <circle cx={cx} cy={cy} r={r + 6} fill="none" stroke="#ef444466" strokeWidth={1.5}>
                    <animate attributeName="r" from={String(r)} to={String(r + 14)} dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.8" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}

                {/* Glow */}
                <circle cx={cx} cy={cy} r={r + 3} fill={`${color}12`} />

                {/* Main */}
                <circle cx={cx} cy={cy} r={r} fill={`${color}55`} stroke={color} strokeWidth={1.2} />

                {/* Icon */}
                <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" fill="#fff" fontSize={count > 5 ? 9 : 10} fontWeight={700}>
                  {CATEGORY_ICONS[topCat]}
                </text>

                {/* Label */}
                <text x={cx} y={cy + r + 10} textAnchor="middle" fill="#4a5568" fontSize={7} fontFamily="sans-serif">
                  {cluster.city || cluster.country}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      {/* Hover tooltip */}
      {hoveredCluster && (
        <div
          style={{
            position: 'absolute',
            left: tooltipPos.x + 15,
            top: tooltipPos.y - 10,
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.95)',
            border: '1px solid #333',
            borderRadius: 6,
            zIndex: 50,
            pointerEvents: 'none',
            maxWidth: 280,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#e5e7eb', marginBottom: 4 }}>
            {hoveredCluster.country} {hoveredCluster.city ? `· ${hoveredCluster.city}` : ''}
          </div>
          {hoveredCluster.articles.slice(0, 4).map((a) => (
            <div key={a.id} style={{ fontSize: 9, color: '#9ca3af', marginBottom: 2, display: 'flex', gap: 4, alignItems: 'center' }}>
              <span style={{ color: SEVERITY_COLORS[a.severity] }}>{CATEGORY_ICONS[a.category]}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</span>
            </div>
          ))}
          {hoveredCluster.articles.length > 4 && (
            <div style={{ fontSize: 9, color: '#555' }}>+{hoveredCluster.articles.length - 4}건 더</div>
          )}
        </div>
      )}

      {/* Zoom controls */}
      <div style={{ position: 'absolute', bottom: 14, right: 18, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <button
          onClick={() => {
            if (!svgRef.current || !zoomRef.current) return
            d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.5)
          }}
          style={{ width: 28, height: 28, background: 'rgba(0,0,0,0.85)', border: '1px solid #333', borderRadius: 4, color: '#9ca3af', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >+</button>
        <button
          onClick={() => {
            if (!svgRef.current || !zoomRef.current) return
            d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.67)
          }}
          style={{ width: 28, height: 28, background: 'rgba(0,0,0,0.85)', border: '1px solid #333', borderRadius: 4, color: '#9ca3af', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >-</button>
        <button
          onClick={() => {
            if (!svgRef.current || !zoomRef.current) return
            d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity)
          }}
          style={{ width: 28, height: 28, background: 'rgba(0,0,0,0.85)', border: '1px solid #333', borderRadius: 4, color: '#9ca3af', fontSize: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >RST</button>
      </div>

      {/* Stats overlay */}
      <div style={{ position: 'absolute', bottom: 14, left: 18, display: 'flex', gap: 12, padding: '6px 12px', background: 'rgba(0,0,0,0.85)', border: '1px solid #333', borderRadius: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88' }} />
          <span style={{ fontSize: 9, color: '#00ff88', fontWeight: 700 }}>LIVE</span>
        </div>
        <span style={{ fontSize: 9, color: '#6b7280' }}>{articles.length}건</span>
        <span style={{ fontSize: 9, color: '#6b7280' }}>{clusters.length}개 지역</span>
        <span style={{ fontSize: 9, color: '#ef4444' }}>{articles.filter((a) => a.severity === 'critical').length} CRITICAL</span>
      </div>
    </div>
  )
}
