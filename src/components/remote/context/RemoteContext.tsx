'use client'

import {
  createContext, useContext, useReducer, useEffect,
  useCallback, useRef, useState, type ReactNode,
} from 'react'
import type {
  RemoteState, ApprovalRecord, AuditEntry,
  CursorAction, VoiceEntry,
} from '@/types/remote'
import {
  rand, randInt, pick, uid,
  generateProcesses, generateConnections, generateApprovalQueue,
  generateAuditLog, generateThreats, ACL_RULES,
} from './remoteMockData'

/* eslint-disable @typescript-eslint/no-explicit-any */
interface MediaStreamTrackProcessorInit {
  track: MediaStreamTrack
}

declare class MediaStreamTrackProcessor {
  constructor(init: MediaStreamTrackProcessorInit)
  readonly readable: ReadableStream<{ close(): void }>
}
/* eslint-enable @typescript-eslint/no-explicit-any */


type RemoteAction =
  | { type: 'UPDATE_METRICS' }
  | { type: 'UPDATE_CURSOR' }
  | { type: 'UPDATE_PROCESSES' }
  | { type: 'CYCLE_APPROVAL_QUEUE' }
  | { type: 'APPROVE_REQUEST'; id: string }
  | { type: 'DENY_REQUEST'; id: string }
  | { type: 'TOGGLE_CONNECTION' }
  | { type: 'SET_EXECUTION_SPEED'; speed: number }
  | { type: 'UPDATE_VOICE_STATE'; payload: Partial<RemoteState['voiceState']> }
  | { type: 'ADD_VOICE_ENTRY'; entry: VoiceEntry }
  | { type: 'UPDATE_WAVEFORM'; waveform: readonly number[] }
  | { type: 'UPDATE_SCREEN_FPS'; fps: number }


interface RemoteContextValue {
  readonly state: RemoteState
  readonly approveRequest: (id: string) => void
  readonly denyRequest: (id: string) => void
  readonly toggleConnection: () => void
  readonly setExecutionSpeed: (speed: number) => void
  readonly startScreenCapture: () => Promise<void>
  readonly stopScreenCapture: () => void
  readonly screenMediaStream: MediaStream | null
  readonly startListening: () => void
  readonly stopListening: () => void
  readonly speak: (text: string) => void
}

const RemoteContext = createContext<RemoteContextValue | null>(null)


const EMPTY_WAVEFORM: readonly number[] = Array.from({ length: 20 }, () => 0)

const initialState: RemoteState = {
  connectionStatus: 'connected',
  sandboxStatus: 'active',
  screenStream: { fps: 30, resolution: { width: 1920, height: 1080 }, isStreaming: true },
  aiCursor: { x: 960, y: 540, action: 'idle' },
  approvalQueue: generateApprovalQueue(),
  approvalHistory: [],
  systemMetrics: { cpu: 28, ram: { used: 8.2, total: 16 }, disk: { used: 256, total: 512 }, network: { upload: 1.2, download: 5.8 }, temperature: 62 },
  threats: generateThreats(),
  processes: generateProcesses(),
  networkConnections: generateConnections(),
  voiceState: { isListening: false, isSpeaking: false, lastMessage: '대기 중입니다, 주인님.', waveform: EMPTY_WAVEFORM },
  securityLevel: 'elevated',
  auditLog: generateAuditLog(),
  accessControlList: ACL_RULES,
  executionSpeed: 1.0,
  currentAction: null,
  voiceLog: [],
}


function remoteReducer(state: RemoteState, action: RemoteAction): RemoteState {
  switch (action.type) {
    case 'UPDATE_METRICS': {
      const newCpu = Math.max(15, Math.min(45, state.systemMetrics.cpu + rand(-3, 3)))
      const newRam = Math.max(6, Math.min(12, state.systemMetrics.ram.used + rand(-0.2, 0.2)))
      return {
        ...state,
        systemMetrics: {
          ...state.systemMetrics,
          cpu: Math.round(newCpu * 10) / 10,
          ram: { ...state.systemMetrics.ram, used: Math.round(newRam * 10) / 10 },
          network: {
            upload: Math.round(rand(0.5, 4) * 10) / 10,
            download: Math.round(rand(2, 12) * 10) / 10,
          },
          temperature: randInt(58, 68),
        },
      }
    }

    case 'UPDATE_CURSOR': {
      const actions: readonly CursorAction[] = ['moving', 'clicking', 'typing', 'idle', 'scrolling']
      const labels = ['Search bar', 'Submit button', 'Terminal', 'Editor tab', 'File tree', undefined]
      return {
        ...state,
        aiCursor: {
          x: Math.max(0, Math.min(1920, state.aiCursor.x + rand(-80, 80))),
          y: Math.max(0, Math.min(1080, state.aiCursor.y + rand(-60, 60))),
          action: pick(actions),
          targetLabel: pick(labels),
        },
      }
    }

    case 'UPDATE_PROCESSES':
      return {
        ...state,
        processes: state.processes.map(p => ({
          ...p,
          cpu: Math.max(0, Math.min(100, p.cpu + rand(-2, 2))),
          memory: Math.max(5, p.memory + rand(-5, 5)),
        })),
      }

    case 'CYCLE_APPROVAL_QUEUE': {
      const expired = state.approvalQueue.filter(r => Date.now() - r.timestamp > 30_000)
      if (expired.length === 0) return state
      const expiredIds = new Set(expired.map(r => r.id))
      return {
        ...state,
        approvalQueue: state.approvalQueue.filter(r => !expiredIds.has(r.id)),
      }
    }

    case 'APPROVE_REQUEST': {
      const request = state.approvalQueue.find(r => r.id === action.id)
      if (!request) return state
      const record: ApprovalRecord = {
        id: uid(), request: { ...request, status: 'approved' },
        respondedAt: Date.now(), decision: 'approved', respondedBy: 'ui',
      }
      const entry: AuditEntry = {
        id: uid(), timestamp: Date.now(), severity: request.severity,
        action: request.action, target: request.target, result: 'success',
        details: `승인됨: ${request.description}`,
      }
      return {
        ...state,
        approvalQueue: state.approvalQueue.filter(r => r.id !== action.id),
        approvalHistory: [...state.approvalHistory, record],
        auditLog: [...state.auditLog, entry],
      }
    }

    case 'DENY_REQUEST': {
      const request = state.approvalQueue.find(r => r.id === action.id)
      if (!request) return state
      const record: ApprovalRecord = {
        id: uid(), request: { ...request, status: 'denied' },
        respondedAt: Date.now(), decision: 'denied', respondedBy: 'ui',
      }
      const entry: AuditEntry = {
        id: uid(), timestamp: Date.now(), severity: request.severity,
        action: request.action, target: request.target, result: 'denied',
        details: `거부됨: ${request.description}`,
      }
      return {
        ...state,
        approvalQueue: state.approvalQueue.filter(r => r.id !== action.id),
        approvalHistory: [...state.approvalHistory, record],
        auditLog: [...state.auditLog, entry],
      }
    }

    case 'TOGGLE_CONNECTION': {
      const next = state.connectionStatus === 'connected' ? 'disconnected' : 'connecting'
      return {
        ...state,
        connectionStatus: next,
        sandboxStatus: next === 'disconnected' ? 'inactive' : state.sandboxStatus,
        screenStream: { ...state.screenStream, isStreaming: next !== 'disconnected' },
      }
    }

    case 'SET_EXECUTION_SPEED':
      return { ...state, executionSpeed: action.speed }

    case 'UPDATE_VOICE_STATE':
      return { ...state, voiceState: { ...state.voiceState, ...action.payload } }

    case 'ADD_VOICE_ENTRY':
      return { ...state, voiceLog: [...state.voiceLog, action.entry] }

    case 'UPDATE_WAVEFORM':
      return { ...state, voiceState: { ...state.voiceState, waveform: action.waveform } }

    case 'UPDATE_SCREEN_FPS':
      return { ...state, screenStream: { ...state.screenStream, fps: action.fps } }

    default:
      return state
  }
}


export function RemoteProvider({ children }: { readonly children: ReactNode }) {
  const [state, dispatch] = useReducer(remoteReducer, initialState)
  const [screenMediaStream, setScreenMediaStream] = useState<MediaStream | null>(null)

  const screenStreamRef = useRef<MediaStream | null>(null)
  const fpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fpsCountRef = useRef(0)
  const recognitionRef = useRef<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const waveformIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'UPDATE_METRICS' }), 2000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'UPDATE_PROCESSES' }), 3000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'CYCLE_APPROVAL_QUEUE' }), 5000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'UPDATE_CURSOR' }), 200)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (state.connectionStatus !== 'connecting') return
    const id = setTimeout(() => {
      dispatch({ type: 'TOGGLE_CONNECTION' })
      dispatch({ type: 'TOGGLE_CONNECTION' })
    }, 2000)
    return () => clearTimeout(id)
  }, [state.connectionStatus])

  useEffect(() => {
    return () => {
      screenStreamRef.current?.getTracks().forEach(t => t.stop())
      micStreamRef.current?.getTracks().forEach(t => t.stop())
      recognitionRef.current?.abort()
      audioCtxRef.current?.close().catch(() => {/* already closed */})
      if (fpsIntervalRef.current) clearInterval(fpsIntervalRef.current)
      if (waveformIntervalRef.current) clearInterval(waveformIntervalRef.current)
    }
  }, [])

  const clearFpsTracking = useCallback(() => {
    if (fpsIntervalRef.current) {
      clearInterval(fpsIntervalRef.current)
      fpsIntervalRef.current = null
    }
    fpsCountRef.current = 0
  }, [])

  const startFpsTracking = useCallback((stream: MediaStream) => {
    const videoTrack = stream.getVideoTracks()[0]
    if (!videoTrack) return

    fpsCountRef.current = 0

    if (typeof MediaStreamTrackProcessor !== 'undefined') {
      const processor = new MediaStreamTrackProcessor({ track: videoTrack })
      const reader = processor.readable.getReader()
      const readFrame = () => {
        reader.read().then(({ done, value }) => {
          if (done) return
          fpsCountRef.current += 1
          value?.close()
          readFrame()
        }).catch(() => { /* stream ended */ })
      }
      readFrame()
    }

    fpsIntervalRef.current = setInterval(() => {
      dispatch({ type: 'UPDATE_SCREEN_FPS', fps: fpsCountRef.current })
      fpsCountRef.current = 0
    }, 1000)
  }, [])

  const stopScreenCapture = useCallback(() => {
    screenStreamRef.current?.getTracks().forEach(t => t.stop())
    screenStreamRef.current = null
    setScreenMediaStream(null)
    clearFpsTracking()
    dispatch({ type: 'UPDATE_SCREEN_FPS', fps: 0 })
  }, [clearFpsTracking])

  const startScreenCapture = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      throw new Error('Screen capture is not supported in this browser')
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false })
      screenStreamRef.current = stream
      setScreenMediaStream(stream)

      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        screenStreamRef.current = null
        setScreenMediaStream(null)
        clearFpsTracking()
        dispatch({ type: 'UPDATE_SCREEN_FPS', fps: 0 })
      })

      startFpsTracking(stream)
    } catch (error) {
      throw new Error(`Screen capture failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }, [startFpsTracking, clearFpsTracking])

  const stopWaveformAnalysis = useCallback(() => {
    if (waveformIntervalRef.current) {
      clearInterval(waveformIntervalRef.current)
      waveformIntervalRef.current = null
    }
    audioCtxRef.current?.close().catch(() => {/* already closed */})
    audioCtxRef.current = null
    analyserRef.current = null
    micStreamRef.current?.getTracks().forEach(t => t.stop())
    micStreamRef.current = null
    dispatch({ type: 'UPDATE_WAVEFORM', waveform: EMPTY_WAVEFORM })
  }, [])

  const startWaveformAnalysis = useCallback((micStream: MediaStream) => {
    try {
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      const source = ctx.createMediaStreamSource(micStream)
      source.connect(analyser)

      audioCtxRef.current = ctx
      analyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      waveformIntervalRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray)
        const bars = 20
        const step = Math.max(1, Math.floor(dataArray.length / bars))
        const waveform: readonly number[] = Array.from({ length: bars }, (_, i) => {
          const val = dataArray[i * step] ?? 0
          return Math.round((val / 255) * 100) / 100
        })
        dispatch({ type: 'UPDATE_WAVEFORM', waveform })
      }, 100)
    } catch {
      // AudioContext not available
    }
  }, [])

  const stopListening = useCallback(() => {
    recognitionRef.current?.abort()
    recognitionRef.current = null
    dispatch({ type: 'UPDATE_VOICE_STATE', payload: { isListening: false } })
    stopWaveformAnalysis()
  }, [stopWaveformAnalysis])

  const startListening = useCallback(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognitionCtor = (window as any).webkitSpeechRecognition ?? (window as any).SpeechRecognition // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!SpeechRecognitionCtor) return

    if (recognitionRef.current) {
      recognitionRef.current.abort()
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'ko-KR'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const last = event.results[event.results.length - 1]
      if (!last) return
      const text = last[0]?.transcript ?? ''
      if (last.isFinal && text.trim()) {
        const entry: VoiceEntry = {
          id: uid(),
          timestamp: Date.now(),
          type: 'command',
          text: text.trim(),
        }
        dispatch({ type: 'ADD_VOICE_ENTRY', entry })
        dispatch({ type: 'UPDATE_VOICE_STATE', payload: { lastMessage: text.trim() } })
      }
    }

    recognition.onerror = () => {
      dispatch({ type: 'UPDATE_VOICE_STATE', payload: { isListening: false } })
      stopWaveformAnalysis()
    }

    recognition.onend = () => {
      dispatch({ type: 'UPDATE_VOICE_STATE', payload: { isListening: false } })
      stopWaveformAnalysis()
    }

    recognition.start()
    recognitionRef.current = recognition
    dispatch({ type: 'UPDATE_VOICE_STATE', payload: { isListening: true } })

    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((micStream) => {
        micStreamRef.current = micStream
        startWaveformAnalysis(micStream)
      }).catch(() => { /* mic access denied */ })
    }
  }, [startWaveformAnalysis, stopWaveformAnalysis])

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    window.speechSynthesis.cancel()
    const prefixed = text.startsWith('주인님') ? text : `주인님, ${text}`
    const utterance = new SpeechSynthesisUtterance(prefixed)
    utterance.lang = 'ko-KR'

    utterance.onstart = () => {
      dispatch({ type: 'UPDATE_VOICE_STATE', payload: { isSpeaking: true } })
    }
    utterance.onend = () => {
      dispatch({ type: 'UPDATE_VOICE_STATE', payload: { isSpeaking: false } })
    }
    utterance.onerror = () => {
      dispatch({ type: 'UPDATE_VOICE_STATE', payload: { isSpeaking: false } })
    }

    const entry: VoiceEntry = {
      id: uid(),
      timestamp: Date.now(),
      type: 'response',
      text: prefixed,
    }
    dispatch({ type: 'ADD_VOICE_ENTRY', entry })
    dispatch({ type: 'UPDATE_VOICE_STATE', payload: { lastMessage: prefixed } })

    window.speechSynthesis.speak(utterance)
  }, [])

  const approveRequest = useCallback((id: string) => {
    dispatch({ type: 'APPROVE_REQUEST', id })
  }, [])

  const denyRequest = useCallback((id: string) => {
    dispatch({ type: 'DENY_REQUEST', id })
  }, [])

  const toggleConnection = useCallback(() => {
    dispatch({ type: 'TOGGLE_CONNECTION' })
  }, [])

  const setExecutionSpeed = useCallback((speed: number) => {
    dispatch({ type: 'SET_EXECUTION_SPEED', speed })
  }, [])

  const value: RemoteContextValue = {
    state,
    approveRequest,
    denyRequest,
    toggleConnection,
    setExecutionSpeed,
    startScreenCapture,
    stopScreenCapture,
    screenMediaStream,
    startListening,
    stopListening,
    speak,
  }

  return (
    <RemoteContext.Provider value={value}>
      {children}
    </RemoteContext.Provider>
  )
}

export function useRemote(): RemoteContextValue {
  const context = useContext(RemoteContext)
  if (!context) {
    throw new Error('useRemote must be used within a RemoteProvider')
  }
  return context
}
