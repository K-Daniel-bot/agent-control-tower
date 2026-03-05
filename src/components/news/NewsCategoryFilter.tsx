'use client'

import type { EventCategory } from '@/types/news'
import { EVENT_CATEGORIES, CATEGORY_COLORS } from '@/types/news'

interface NewsCategoryFilterProps {
  selected: EventCategory | null
  onSelect: (category: EventCategory | null) => void
  counts: Record<string, number>
}

export default function NewsCategoryFilter({ selected, onSelect, counts }: NewsCategoryFilterProps) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', padding: '8px 0' }}>
      <button
        onClick={() => onSelect(null)}
        style={{
          padding: '3px 10px',
          fontSize: 10,
          fontWeight: 600,
          background: selected === null ? '#333333' : 'transparent',
          border: `1px solid ${selected === null ? '#555' : '#333333'}`,
          borderRadius: 12,
          color: selected === null ? '#e5e7eb' : '#6b7280',
          cursor: 'pointer',
        }}
      >
        ALL
      </button>
      {EVENT_CATEGORIES.map((cat) => {
        const color = CATEGORY_COLORS[cat]
        const isActive = selected === cat
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            style={{
              padding: '3px 10px',
              fontSize: 10,
              fontWeight: 600,
              background: isActive ? `${color}20` : 'transparent',
              border: `1px solid ${isActive ? `${color}55` : '#333333'}`,
              borderRadius: 12,
              color: isActive ? color : '#6b7280',
              cursor: 'pointer',
            }}
          >
            {cat} {counts[cat] ? `(${counts[cat]})` : ''}
          </button>
        )
      })}
    </div>
  )
}
