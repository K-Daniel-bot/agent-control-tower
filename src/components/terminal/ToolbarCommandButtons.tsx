'use client'

interface ToolbarCommandButtonsProps {
  readonly onSendCommand: (command: string) => void
  readonly onSplitHorizontal: () => void
  readonly onSplitVertical: () => void
  readonly paneCount: number
}

function ClaudeIcon() {
  return (
    <img
      src="/icons8-클로드-아이-100.png"
      alt="Claude"
      style={{ width: 14, height: 14 }}
    />
  )
}

function CodexIcon() {
  return (
    <img
      src="/icons8-chatgpt-100.png"
      alt="Codex"
      style={{ width: 14, height: 14 }}
    />
  )
}

function TmuxIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#3b82f6" strokeWidth="1.8" />
      <line x1="12" y1="3" x2="12" y2="21" stroke="#3b82f6" strokeWidth="1.8" />
      <line x1="12" y1="12" x2="21" y2="12" stroke="#3b82f6" strokeWidth="1.8" />
    </svg>
  )
}

function SplitHIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <line x1="3" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

function SplitVIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <line x1="12" y1="3" x2="12" y2="21" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

const COMMAND_BUTTONS = [
  { label: 'Claude', command: 'claude', Icon: ClaudeIcon, color: '#d97706' },
  { label: 'Codex', command: 'codex', Icon: CodexIcon, color: '#10b981' },
  { label: 'tmux', command: 'tmux', Icon: TmuxIcon, color: '#3b82f6' },
] as const

export default function ToolbarCommandButtons({
  onSendCommand,
  onSplitHorizontal,
  onSplitVertical,
  paneCount,
}: ToolbarCommandButtonsProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {/* Command buttons */}
      {COMMAND_BUTTONS.map(({ label, command, Icon, color }) => (
        <button
          key={command}
          onClick={() => onSendCommand(command)}
          title={`${label} 실행`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 3,
            padding: '2px 7px',
            background: `${color}10`,
            border: `1px solid ${color}33`,
            borderRadius: 4,
            color,
            fontSize: 8,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          <Icon />
          {label}
        </button>
      ))}

      {/* Separator */}
      <div style={{ width: 1, height: 16, background: '#333333', margin: '0 2px' }} />

      {/* Split buttons */}
      <button
        onClick={onSplitHorizontal}
        disabled={paneCount >= 6}
        title="수평 분할"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '2px 6px',
          background: 'rgba(46,53,69,0.3)',
          border: '1px solid rgba(156,163,175,0.2)',
          borderRadius: 4,
          color: paneCount >= 6 ? '#374151' : '#9ca3af',
          fontSize: 8,
          cursor: paneCount >= 6 ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <SplitHIcon />
      </button>

      <button
        onClick={onSplitVertical}
        disabled={paneCount >= 6}
        title="수직 분할"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          padding: '2px 6px',
          background: 'rgba(46,53,69,0.3)',
          border: '1px solid rgba(156,163,175,0.2)',
          borderRadius: 4,
          color: paneCount >= 6 ? '#374151' : '#9ca3af',
          fontSize: 8,
          cursor: paneCount >= 6 ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <SplitVIcon />
      </button>

      {/* Pane count */}
      {paneCount > 1 && (
        <span style={{ fontSize: 8, color: '#505661', fontFamily: 'monospace' }}>
          {paneCount}/6
        </span>
      )}
    </div>
  )
}
