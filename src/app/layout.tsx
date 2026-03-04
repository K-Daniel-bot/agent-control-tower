import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '종합관제시스템 — Agent Control Tower',
  description: 'AI Agent Execution Monitoring Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          background: '#0a0e1a',
          color: '#e5e7eb',
          height: '100vh',
          width: '100vw',
          overflow: 'hidden',
          fontFamily: "system-ui, 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        {children}
      </body>
    </html>
  )
}
