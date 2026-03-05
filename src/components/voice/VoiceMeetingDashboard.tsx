'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import type { Paragraph, Participant, MeetingNote } from '@/types/voice'
import NotesSidebar from './NotesSidebar'
import VoiceRecorder from './VoiceRecorder'
import TranscriptView from './TranscriptView'
import ParticipantManager from './ParticipantManager'
import ShareMenu from './ShareMenu'
import MeetingSummaryPanel from './MeetingSummaryPanel'

const STORAGE_KEY = 'act-voice-notes'
const PARTICIPANT_COLORS = [
  '#00ff88', '#ff6b6b', '#4ecdc4', '#ffe66d',
  '#a78bfa', '#f97316', '#06b6d4', '#ec4899',
] as const

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function loadNotes(): readonly MeetingNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as MeetingNote[]
  } catch {
    return []
  }
}

function saveNotes(notes: readonly MeetingNote[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  } catch {
    // storage full or unavailable
  }
}

function createEmptyNote(): MeetingNote {
  return {
    id: generateId(),
    title: '',
    createdAt: new Date().toISOString(),
    paragraphs: [],
    participants: [],
  }
}

export default function VoiceMeetingDashboard() {
  const [notes, setNotes] = useState<readonly MeetingNote[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [currentText, setCurrentText] = useState('')
  const [shareMenuOpen, setShareMenuOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [summaryData, setSummaryData] = useState<{
    summary: string
    topics: readonly string[]
    actionItems: readonly string[]
    sentiment: string
    duration: string
  } | null>(null)
  const [isSummarizing, setIsSummarizing] = useState(false)

  const lastFinalTimestamp = useRef<number>(Date.now())
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const interimTextRef = useRef('')

  // Load notes from localStorage on mount
  useEffect(() => {
    setNotes(loadNotes())
  }, [])

  // Persist notes on change
  useEffect(() => {
    if (notes.length > 0) {
      saveNotes(notes)
    }
  }, [notes])

  const activeNote = notes.find((n) => n.id === activeNoteId) ?? null

  const updateActiveNote = useCallback(
    (updater: (note: MeetingNote) => MeetingNote) => {
      setNotes((prev) =>
        prev.map((n) => (n.id === activeNoteId ? updater(n) : n))
      )
    },
    [activeNoteId]
  )

  // -- Note management --

  const handleNewNote = useCallback(() => {
    const newNote = createEmptyNote()
    setNotes((prev) => [newNote, ...prev])
    setActiveNoteId(newNote.id)
    setIsRecording(false)
    setCurrentText('')
  }, [])

  const handleSelectNote = useCallback((id: string) => {
    setActiveNoteId(id)
    setIsRecording(false)
    setCurrentText('')
  }, [])

  const handleDeleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => prev.filter((n) => n.id !== id))
      if (activeNoteId === id) {
        setActiveNoteId(null)
        setIsRecording(false)
        setCurrentText('')
      }
    },
    [activeNoteId]
  )

  const handleRenameNote = useCallback((id: string, newTitle: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, title: newTitle } : n))
    )
  }, [])

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTitle = e.target.value
      updateActiveNote((note) => ({ ...note, title: newTitle }))
    },
    [updateActiveNote]
  )

  // -- Recording --

  const handleToggleRecord = useCallback(() => {
    if (!activeNoteId) return
    setIsRecording((prev) => !prev)
  }, [activeNoteId])

  const flushCurrentText = useCallback(() => {
    if (interimTextRef.current.trim().length === 0) return
    if (!activeNoteId) return

    const paragraph: Paragraph = {
      id: generateId(),
      text: interimTextRef.current.trim(),
      timestamp: new Date().toISOString(),
    }

    updateActiveNote((note) => ({
      ...note,
      paragraphs: [...note.paragraphs, paragraph],
    }))

    interimTextRef.current = ''
    setCurrentText('')
  }, [activeNoteId, updateActiveNote])

  const handleTranscript = useCallback(
    (text: string, isFinal: boolean) => {
      if (!activeNoteId) return

      if (isFinal) {
        // Clear any pending silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = null
        }

        const now = Date.now()
        const gap = now - lastFinalTimestamp.current
        lastFinalTimestamp.current = now

        // If gap > 3 seconds, flush previous text as a paragraph
        if (gap > 3000 && interimTextRef.current.trim().length > 0) {
          flushCurrentText()
        }

        // Append final text
        interimTextRef.current =
          interimTextRef.current.length > 0
            ? `${interimTextRef.current} ${text}`
            : text
        setCurrentText(interimTextRef.current)

        // Start silence timer - if no new speech for 3s, create paragraph
        silenceTimerRef.current = setTimeout(() => {
          flushCurrentText()
        }, 3000)
      } else {
        // Interim: show current accumulated + interim
        const preview =
          interimTextRef.current.length > 0
            ? `${interimTextRef.current} ${text}`
            : text
        setCurrentText(preview)
      }
    },
    [activeNoteId, flushCurrentText]
  )

  // Flush remaining text when stopping recording
  useEffect(() => {
    if (!isRecording && interimTextRef.current.trim().length > 0) {
      flushCurrentText()
    }
  }, [isRecording, flushCurrentText])

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current)
      }
    }
  }, [])

  // -- Participants --

  const handleAddParticipant = useCallback(
    (name: string) => {
      const colorIndex =
        (activeNote?.participants.length ?? 0) % PARTICIPANT_COLORS.length
      const participant: Participant = {
        id: generateId(),
        name,
        color: PARTICIPANT_COLORS[colorIndex],
      }
      updateActiveNote((note) => ({
        ...note,
        participants: [...note.participants, participant],
      }))
    },
    [activeNote, updateActiveNote]
  )

  const [activeParticipantId, setActiveParticipantId] = useState<string | undefined>()

  const handleSelectParticipant = useCallback((id: string) => {
    setActiveParticipantId((prev) => (prev === id ? undefined : id))
  }, [])

  // -- AI Summary --

  const handleSummaryGenerated = useCallback(
    (paragraphId: string, summary: string) => {
      updateActiveNote((note) => ({
        ...note,
        paragraphs: note.paragraphs.map((p) =>
          p.id === paragraphId ? { ...p, aiSummary: summary } : p
        ),
      }))
    },
    [updateActiveNote]
  )

  // -- Share --

  const handleShare = useCallback((type: string) => {
    setShareMenuOpen(false)
    setToastMessage('\uC900\uBE44 \uC911\uC785\uB2C8\uB2E4')
    setTimeout(() => setToastMessage(null), 2000)
  }, [])

  // -- File upload --

  const handleFileUpload = useCallback(() => {
    setToastMessage('음성 파일 업로드 - 준비 중입니다')
    setTimeout(() => setToastMessage(null), 2000)
  }, [])

  const handleSummarize = useCallback(async () => {
    if (!activeNote || activeNote.paragraphs.length === 0) {
      setToastMessage('요약할 내용이 없습니다')
      setTimeout(() => setToastMessage(null), 2000)
      return
    }

    setIsSummarizing(true)
    try {
      const response = await fetch('/api/voice/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeNote.title,
          paragraphs: activeNote.paragraphs,
          participants: activeNote.participants,
        }),
      })

      if (!response.ok) throw new Error('Failed to summarize')

      const data = (await response.json()) as typeof summaryData
      setSummaryData(data)
      setToastMessage('회의 분석이 완료되었습니다')
      setTimeout(() => setToastMessage(null), 2000)
    } catch (error) {
      console.error('Summarize error:', error)
      setToastMessage('분석 중 오류가 발생했습니다')
      setTimeout(() => setToastMessage(null), 2000)
    } finally {
      setIsSummarizing(false)
    }
  }, [activeNote])

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        background: '#000000',
        color: '#e5e7eb',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        position: 'relative',
      }}
    >
      {/* Left Sidebar */}
      <NotesSidebar
        notes={notes}
        activeNoteId={activeNoteId}
        onSelectNote={handleSelectNote}
        onDeleteNote={handleDeleteNote}
        onNewNote={handleNewNote}
        onRenameNote={handleRenameNote}
      />

      {/* Center Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Top Toolbar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            borderBottom: '1px solid #222222',
            flexShrink: 0,
          }}
        >
          <button
            onClick={handleNewNote}
            style={{
              padding: '6px 14px',
              background: 'transparent',
              border: '1px solid #333333',
              borderRadius: 4,
              color: '#e5e7eb',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            새 노트 만들기
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <VoiceRecorder
              isRecording={isRecording}
              onToggleRecord={handleToggleRecord}
              onTranscript={handleTranscript}
            />
          </div>

          <button
            onClick={handleFileUpload}
            style={{
              padding: '6px 14px',
              background: 'transparent',
              border: '1px solid #333333',
              borderRadius: 4,
              color: '#aaaaaa',
              fontSize: 12,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            음성 파일
          </button>

          <button
            onClick={handleSummarize}
            disabled={!activeNote || activeNote.paragraphs.length === 0 || isSummarizing}
            style={{
              padding: '6px 14px',
              background: 'transparent',
              border: '1px solid #333333',
              borderRadius: 4,
              color:
                !activeNote || activeNote.paragraphs.length === 0 ? '#666666' : '#00ff88',
              fontSize: 12,
              cursor:
                !activeNote || activeNote.paragraphs.length === 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              opacity: isSummarizing ? 0.6 : 1,
            }}
          >
            {isSummarizing ? '분석 중...' : '회의 내용 정리'}
          </button>

          <div style={{ marginLeft: 'auto', position: 'relative' }}>
            <button
              onClick={() => setShareMenuOpen((prev) => !prev)}
              style={{
                padding: '6px 14px',
                background: 'transparent',
                border: '1px solid #333333',
                borderRadius: 4,
                color: '#aaaaaa',
                fontSize: 12,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              공유
            </button>
            <ShareMenu
              isOpen={shareMenuOpen}
              onClose={() => setShareMenuOpen(false)}
              onShare={handleShare}
            />
          </div>
        </div>

        {/* Main content area */}
        {activeNote ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Title + Participants */}
            <div
              style={{
                padding: '12px 20px',
                borderBottom: '1px solid #1a1a1a',
                flexShrink: 0,
              }}
            >
              <input
                value={activeNote.title}
                onChange={handleTitleChange}
                placeholder="회의 제목을 입력하세요"
                style={{
                  width: '100%',
                  padding: '6px 0',
                  background: 'transparent',
                  border: 'none',
                  color: '#e5e7eb',
                  fontSize: 18,
                  fontFamily: 'inherit',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
              <ParticipantManager
                participants={activeNote.participants}
                onAdd={handleAddParticipant}
                onSelect={handleSelectParticipant}
                activeId={activeParticipantId}
              />
            </div>

            {/* Transcript */}
            <TranscriptView
              paragraphs={activeNote.paragraphs}
              currentText={currentText}
              onSummaryGenerated={handleSummaryGenerated}
            />

            {/* Meeting Summary Panel */}
            {summaryData && (
              <MeetingSummaryPanel
                title={activeNote.title}
                summary={summaryData.summary}
                topics={summaryData.topics}
                actionItems={summaryData.actionItems}
                sentiment={summaryData.sentiment}
                duration={summaryData.duration}
                onClose={() => setSummaryData(null)}
              />
            )}
          </div>
        ) : (
          /* Empty state */
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 16,
              color: '#555555',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                border: '2px dashed #333333',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                color: '#333333',
              }}
            >
              M
            </div>
            <div style={{ fontSize: 14 }}>Voice Meeting Dashboard</div>
            <div style={{ fontSize: 11 }}>
              새 노트를 만들어 회의를 시작하세요
            </div>
            <button
              onClick={handleNewNote}
              style={{
                marginTop: 8,
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
              새 노트 만들기
            </button>
          </div>
        )}
      </div>

      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '8px 20px',
            background: '#222222',
            border: '1px solid #333333',
            borderRadius: 6,
            color: '#e5e7eb',
            fontSize: 12,
            fontFamily: "'JetBrains Mono', monospace",
            zIndex: 1000,
          }}
        >
          {toastMessage}
        </div>
      )}
    </div>
  )
}
