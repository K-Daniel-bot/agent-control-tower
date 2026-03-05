'use client'

import { useState, useEffect } from 'react'

interface MemoryViewerProps {
  filePath: string | null
  fileName: string
}

function renderMarkdown(content: string): React.ReactNode[] {
  return content.split('\n').map((line, i) => {
    if (line.startsWith('### ')) {
      return <div key={i} style={{ fontSize: 13, fontWeight: 700, color: '#e5e7eb', marginTop: 14, marginBottom: 4 }}>{line.slice(4)}</div>
    }
    if (line.startsWith('## ')) {
      return <div key={i} style={{ fontSize: 14, fontWeight: 700, color: '#e5e7eb', marginTop: 16, marginBottom: 6, borderBottom: '1px solid #333333', paddingBottom: 4 }}>{line.slice(3)}</div>
    }
    if (line.startsWith('# ')) {
      return <div key={i} style={{ fontSize: 16, fontWeight: 700, color: '#f5f5f5', marginTop: 16, marginBottom: 8 }}>{line.slice(2)}</div>
    }
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return <div key={i} style={{ paddingLeft: 14, color: '#9ca3af', position: 'relative' }}><span style={{ position: 'absolute', left: 2, color: '#555' }}>&bull;</span>{line.slice(2)}</div>
    }
    if (line.startsWith('```')) return <div key={i} style={{ height: 1 }} />
    if (line.trim() === '') return <div key={i} style={{ height: 8 }} />
    return <div key={i} style={{ color: '#9ca3af' }}>{line}</div>
  })
}

export default function MemoryViewer({ filePath, fileName }: MemoryViewerProps) {
  const [content, setContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!filePath) { setContent(null); return }
    setLoading(true)
    fetch('/api/memory/file', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: filePath }),
    })
      .then((r) => r.json())
      .then((data) => { setContent(data.content ?? '로드 실패'); setLoading(false) })
      .catch(() => { setContent('파일 로드 오류'); setLoading(false) })
  }, [filePath])

  if (!filePath) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#333', fontSize: 13 }}>
        메모리 파일을 선택하면 내용을 확인할 수 있습니다
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '10px 16px', borderBottom: '1px solid #333333', flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#e5e7eb' }}>{fileName}</div>
        <div style={{ fontSize: 10, color: '#555', fontFamily: 'monospace', marginTop: 2 }}>{filePath}</div>
      </div>
      <div style={{ flex: 1, overflow: 'auto', padding: 16, fontSize: 12, lineHeight: 1.7, fontFamily: 'monospace' }}>
        {loading ? <div style={{ color: '#555' }}>로딩 중...</div>
          : content ? renderMarkdown(content)
          : <div style={{ color: '#333' }}>빈 파일</div>}
      </div>
    </div>
  )
}
