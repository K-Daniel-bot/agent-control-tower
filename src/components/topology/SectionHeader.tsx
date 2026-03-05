'use client'

interface SectionHeaderProps {
  title: string
  accentColor?: string
  rightSlot?: React.ReactNode
}

export function SectionHeader({
  title,
  accentColor = '#00ff88',
  rightSlot,
}: SectionHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 12px',
        borderBottom: '1px solid #333333',
        flexShrink: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div
          style={{
            width: 3,
            height: 14,
            borderRadius: 2,
            background: accentColor,
            boxShadow: `0 0 6px ${accentColor}`,
          }}
        />
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: '#9ca3af',
          }}
        >
          {title}
        </span>
      </div>
      {rightSlot && <div>{rightSlot}</div>}
    </div>
  )
}

export default SectionHeader
