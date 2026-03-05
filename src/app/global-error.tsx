'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body
        style={{
          background: '#000000',
          color: '#e5e7eb',
          fontFamily: "'JetBrains Mono', monospace",
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: 16,
        }}
      >
        <div style={{ fontSize: 14, color: '#ff6b6b' }}>
          {error.message || 'Something went wrong'}
        </div>
        <button
          onClick={reset}
          style={{
            padding: '8px 20px',
            background: 'rgba(0, 255, 136, 0.1)',
            border: '1px solid #00ff88',
            borderRadius: 6,
            color: '#00ff88',
            fontSize: 12,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Retry
        </button>
      </body>
    </html>
  )
}
