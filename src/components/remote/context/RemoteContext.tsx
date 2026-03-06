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
import {
  processVoiceCommand, getCommandResponseText, getSearchUrl,
  type CommandAction,
} from './voiceCommandProcessor'
import { useElectronAPI, type ElectronAPI } from '@/hooks/useElectronAPI'

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
  | { type: 'SET_CURSOR'; x: number; y: number; action: CursorAction; targetLabel?: string }
  | { type: 'SET_CURRENT_ACTION'; action: string | null }
  | { type: 'TOGGLE_MONITORING' }
  | { type: 'ADD_AUDIT_ENTRY'; entry: AuditEntry }
  | { type: 'ADD_THREAT'; threat: import('@/types/remote').ThreatAlert }
  | { type: 'UPDATE_SECURITY_LEVEL'; level: import('@/types/remote').SecurityLevel }


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
  readonly toggleMonitoring: () => void
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
  threats: [],
  processes: generateProcesses(),
  networkConnections: generateConnections(),
  voiceState: { isListening: false, isSpeaking: false, lastMessage: '대기 중입니다, 주인님.', waveform: EMPTY_WAVEFORM },
  securityLevel: 'normal',
  auditLog: [],
  accessControlList: ACL_RULES,
  executionSpeed: 1.0,
  currentAction: null,
  voiceLog: [],
  monitoringEnabled: true,
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

    case 'SET_CURSOR':
      return {
        ...state,
        aiCursor: {
          x: action.x,
          y: action.y,
          action: action.action,
          targetLabel: action.targetLabel,
        },
      }

    case 'SET_CURRENT_ACTION':
      return { ...state, currentAction: action.action }

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

    case 'TOGGLE_MONITORING':
      return { ...state, monitoringEnabled: !state.monitoringEnabled }

    case 'ADD_AUDIT_ENTRY':
      return { ...state, auditLog: [...state.auditLog, action.entry] }

    case 'ADD_THREAT':
      return { ...state, threats: [...state.threats, action.threat] }

    case 'UPDATE_SECURITY_LEVEL':
      return { ...state, securityLevel: action.level }

    default:
      return state
  }
}


// Cursor animation: smoothly move cursor to target over steps
function animateCursorTo(
  dispatch: React.Dispatch<RemoteAction>,
  targetX: number,
  targetY: number,
  action: CursorAction,
  label: string,
  steps: number = 8,
): Promise<void> {
  return new Promise((resolve) => {
    let step = 0
    const startX = 960 + rand(-200, 200)
    const startY = 540 + rand(-100, 100)
    const interval = setInterval(() => {
      step += 1
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      const x = Math.round(startX + (targetX - startX) * eased)
      const y = Math.round(startY + (targetY - startY) * eased)
      dispatch({
        type: 'SET_CURSOR',
        x, y,
        action: step < steps ? 'moving' : action,
        targetLabel: label,
      })
      if (step >= steps) {
        clearInterval(interval)
        resolve()
      }
    }, 80)
  })
}


export function RemoteProvider({ children }: { readonly children: ReactNode }) {
  const [state, dispatch] = useReducer(remoteReducer, initialState)
  const [screenMediaStream, setScreenMediaStream] = useState<MediaStream | null>(null)
  const electronAPI = useElectronAPI()

  const screenStreamRef = useRef<MediaStream | null>(null)
  const fpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const fpsCountRef = useRef(0)
  const recognitionRef = useRef<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const micStreamRef = useRef<MediaStream | null>(null)
  const waveformIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const commandQueueRef = useRef<boolean>(false)

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
    // Only auto-animate cursor when no command is being executed
    if (commandQueueRef.current) return
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

  // Real system monitoring: log startup audit entry
  useEffect(() => {
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      entry: {
        id: uid(), timestamp: Date.now(), severity: 'low',
        action: 'system_setting', target: '원격 제어 시스템',
        result: 'success', details: '시스템 초기화 완료',
      },
    })
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      entry: {
        id: uid(), timestamp: Date.now(), severity: 'low',
        action: 'system_setting', target: '보안 감시',
        result: 'success', details: '실시간 감시 모드 활성화',
      },
    })
  }, [])

  // Real monitoring: track browser performance metrics
  useEffect(() => {
    if (!state.monitoringEnabled) return
    const id = setInterval(() => {
      // Check for suspicious network activity patterns
      const perf = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
      const recentEntries = perf.filter(e => e.startTime > performance.now() - 5000)
      const suspiciousCount = recentEntries.filter(e =>
        e.initiatorType === 'xmlhttprequest' || e.initiatorType === 'fetch'
      ).length

      if (suspiciousCount > 20) {
        dispatch({
          type: 'ADD_THREAT',
          threat: {
            id: uid(), timestamp: Date.now(), level: 'warning',
            category: 'network', title: '비정상 네트워크 활동',
            description: `최근 5초간 ${suspiciousCount}건의 네트워크 요청 감지`,
            source: 'NetworkMonitor', resolved: false,
          },
        })
        dispatch({ type: 'UPDATE_SECURITY_LEVEL', level: 'elevated' })
      }

      // Monitor memory usage (Chrome only)
      const mem = (performance as any).memory // eslint-disable-line @typescript-eslint/no-explicit-any
      if (mem) {
        const usedMB = Math.round(mem.usedJSHeapSize / 1048576)
        const totalMB = Math.round(mem.jsHeapSizeLimit / 1048576)
        if (usedMB > totalMB * 0.8) {
          dispatch({
            type: 'ADD_THREAT',
            threat: {
              id: uid(), timestamp: Date.now(), level: 'warning',
              category: 'performance', title: '메모리 사용량 경고',
              description: `JS 힙 메모리 ${usedMB}MB / ${totalMB}MB (${Math.round(usedMB / totalMB * 100)}%)`,
              source: 'MemoryMonitor', resolved: false,
            },
          })
        }
      }
    }, 10000)
    return () => clearInterval(id)
  }, [state.monitoringEnabled])

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
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      entry: {
        id: uid(), timestamp: Date.now(), severity: 'low',
        action: 'screen_capture', target: '화면 공유',
        result: 'success', details: '화면 공유 중지됨',
      },
    })
  }, [clearFpsTracking])

  const startScreenCapture = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
      throw new Error('Screen capture is not supported in this browser')
    }
    try {
      // Request entire screen (monitor) preference instead of browser tab only
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'monitor',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        } as MediaTrackConstraints,
        audio: false,
      })
      screenStreamRef.current = stream
      setScreenMediaStream(stream)

      // Update resolution from actual track settings
      const trackSettings = stream.getVideoTracks()[0]?.getSettings()
      if (trackSettings?.width && trackSettings?.height) {
        dispatch({
          type: 'UPDATE_SCREEN_FPS',
          fps: trackSettings.frameRate ?? 30,
        })
      }

      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        screenStreamRef.current = null
        setScreenMediaStream(null)
        clearFpsTracking()
        dispatch({ type: 'UPDATE_SCREEN_FPS', fps: 0 })
      })

      startFpsTracking(stream)

      const displaySurface = (trackSettings as any)?.displaySurface ?? 'unknown' // eslint-disable-line @typescript-eslint/no-explicit-any
      dispatch({
        type: 'ADD_AUDIT_ENTRY',
        entry: {
          id: uid(), timestamp: Date.now(), severity: 'medium',
          action: 'screen_capture', target: `화면 공유 (${displaySurface})`,
          result: 'success',
          details: `해상도: ${trackSettings?.width ?? '?'}x${trackSettings?.height ?? '?'}`,
        },
      })
    } catch {
      dispatch({
        type: 'ADD_AUDIT_ENTRY',
        entry: {
          id: uid(), timestamp: Date.now(), severity: 'low',
          action: 'screen_capture', target: '화면 공유',
          result: 'denied', details: '사용자가 화면 공유를 거부함',
        },
      })
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

  // Speak with TTS and return a promise that resolves when done
  const speakAsync = useCallback((text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve()
        return
      }

      window.speechSynthesis.cancel()
      const prefixed = text.startsWith('주인님') ? text : `주인님, ${text}`
      const utterance = new SpeechSynthesisUtterance(prefixed)
      utterance.lang = 'ko-KR'

      utterance.onstart = () => {
        dispatch({ type: 'UPDATE_VOICE_STATE', payload: { isSpeaking: true } })
      }
      utterance.onend = () => {
        dispatch({ type: 'UPDATE_VOICE_STATE', payload: { isSpeaking: false } })
        resolve()
      }
      utterance.onerror = () => {
        dispatch({ type: 'UPDATE_VOICE_STATE', payload: { isSpeaking: false } })
        resolve()
      }

      const entry: VoiceEntry = {
        id: uid(), timestamp: Date.now(), type: 'response', text: prefixed,
      }
      dispatch({ type: 'ADD_VOICE_ENTRY', entry })
      dispatch({ type: 'UPDATE_VOICE_STATE', payload: { lastMessage: prefixed } })

      window.speechSynthesis.speak(utterance)
    })
  }, [])

  const speak = useCallback((text: string) => {
    speakAsync(text)
  }, [speakAsync])

  // Execute a parsed command action — uses Electron IPC when available
  const executeCommand = useCallback(async (action: CommandAction) => {
    commandQueueRef.current = true
    const responseText = getCommandResponseText(action)
    const isNative = electronAPI.isElectron

    const auditEntry: AuditEntry = {
      id: uid(), timestamp: Date.now(),
      severity: 'low',
      action: action.type === 'navigate' ? 'browser_navigate'
        : action.type === 'search' ? 'browser_navigate'
        : action.type === 'click' ? 'mouse_click'
        : action.type === 'type' ? 'keyboard'
        : action.type === 'scroll' ? 'scroll'
        : 'app_launch',
      target: action.type === 'navigate' ? action.url
        : action.type === 'search' ? `${action.engine}: ${action.query}`
        : action.type === 'click' ? action.target
        : action.type === 'type' ? action.text
        : action.type === 'unknown' ? action.raw
        : action.type,
      result: action.type === 'unknown' ? 'error' : 'success',
      details: `${isNative ? '[Native] ' : '[Browser] '}${responseText}`,
    }

    dispatch({ type: 'SET_CURRENT_ACTION', action: responseText })
    await speakAsync(responseText)

    switch (action.type) {
      case 'navigate': {
        await animateCursorTo(dispatch, 600, 60, 'clicking', '주소창')
        await new Promise(r => setTimeout(r, 300))
        dispatch({ type: 'SET_CURSOR', x: 600, y: 60, action: 'typing', targetLabel: action.url })
        dispatch({ type: 'SET_CURRENT_ACTION', action: `${action.label} 페이지로 이동 중...` })
        await new Promise(r => setTimeout(r, 800))
        if (isNative) {
          await electronAPI.shell.exec(`open "${action.url}"`)
        } else {
          window.open(action.url, '_blank')
        }
        break
      }
      case 'search': {
        const searchUrl = getSearchUrl(action.query, action.engine)
        await animateCursorTo(dispatch, 600, 60, 'clicking', '검색창')
        await new Promise(r => setTimeout(r, 300))
        dispatch({ type: 'SET_CURSOR', x: 600, y: 60, action: 'typing', targetLabel: `검색: ${action.query}` })
        dispatch({ type: 'SET_CURRENT_ACTION', action: `"${action.query}" 검색 중...` })
        await new Promise(r => setTimeout(r, 800))
        if (isNative) {
          await electronAPI.shell.exec(`open "${searchUrl}"`)
        } else {
          window.open(searchUrl, '_blank')
        }
        break
      }
      case 'click': {
        await animateCursorTo(dispatch, action.x, action.y, 'clicking', action.target)
        if (isNative) {
          await electronAPI.mouse.click(action.x, action.y)
        }
        await new Promise(r => setTimeout(r, 500))
        break
      }
      case 'type': {
        await animateCursorTo(dispatch, 960, 540, 'typing', 'Input field')
        dispatch({ type: 'SET_CURRENT_ACTION', action: `"${action.text}" 입력 중...` })
        if (isNative) {
          await electronAPI.keyboard.type(action.text)
        }
        await new Promise(r => setTimeout(r, 1000))
        break
      }
      case 'scroll': {
        dispatch({
          type: 'SET_CURSOR',
          x: 960, y: action.direction === 'up' ? 300 : 700,
          action: 'scrolling',
          targetLabel: action.direction === 'up' ? '위로 스크롤' : '아래로 스크롤',
        })
        dispatch({ type: 'SET_CURRENT_ACTION', action: `${action.direction === 'up' ? '위로' : '아래로'} 스크롤 중...` })
        if (isNative) {
          await electronAPI.keyboard.press(action.direction === 'up' ? 'pageup' : 'pagedown')
        }
        await new Promise(r => setTimeout(r, 800))
        break
      }
      case 'screenshot': {
        dispatch({ type: 'SET_CURRENT_ACTION', action: '화면 캡처 중...' })
        if (isNative) {
          await electronAPI.screen.capture()
        }
        await new Promise(r => setTimeout(r, 1000))
        break
      }
      case 'open_app': {
        await animateCursorTo(dispatch, 960, 800, 'clicking', action.app)
        dispatch({ type: 'SET_CURRENT_ACTION', action: `${action.app} 실행 중...` })
        if (isNative) {
          // macOS: use open -a, Linux: use xdg-open, Windows: use start
          const platform = electronAPI.platform
          if (platform === 'darwin') {
            await electronAPI.shell.exec(`open -a "${action.app}"`)
          } else if (platform === 'win32') {
            await electronAPI.shell.exec(`start "" "${action.app}"`)
          } else {
            await electronAPI.shell.exec(`xdg-open "${action.app}" || ${action.app}`)
          }
        }
        await new Promise(r => setTimeout(r, 1000))
        break
      }
      default:
        break
    }

    dispatch({ type: 'ADD_AUDIT_ENTRY', entry: auditEntry })
    dispatch({ type: 'SET_CURRENT_ACTION', action: null })
    dispatch({ type: 'SET_CURSOR', x: 960, y: 540, action: 'idle', targetLabel: undefined })
    commandQueueRef.current = false
  }, [speakAsync, electronAPI])

  const stopListening = useCallback(() => {
    recognitionRef.current?.abort()
    recognitionRef.current = null
    dispatch({ type: 'UPDATE_VOICE_STATE', payload: { isListening: false } })
    stopWaveformAnalysis()
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      entry: {
        id: uid(), timestamp: Date.now(), severity: 'low',
        action: 'voice_control', target: '음성 인식',
        result: 'success', details: '음성 인식 중지',
      },
    })
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
          id: uid(), timestamp: Date.now(), type: 'command', text: text.trim(),
        }
        dispatch({ type: 'ADD_VOICE_ENTRY', entry })
        dispatch({ type: 'UPDATE_VOICE_STATE', payload: { lastMessage: text.trim() } })

        // Process the command and execute it
        const commandAction = processVoiceCommand(text.trim())
        executeCommand(commandAction)
      }
    }

    recognition.onerror = () => {
      dispatch({ type: 'UPDATE_VOICE_STATE', payload: { isListening: false } })
      stopWaveformAnalysis()
    }

    recognition.onend = () => {
      // Auto-restart if still supposed to be listening
      if (recognitionRef.current === recognition) {
        try {
          recognition.start()
        } catch {
          dispatch({ type: 'UPDATE_VOICE_STATE', payload: { isListening: false } })
          stopWaveformAnalysis()
        }
      }
    }

    recognition.start()
    recognitionRef.current = recognition
    dispatch({ type: 'UPDATE_VOICE_STATE', payload: { isListening: true } })
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      entry: {
        id: uid(), timestamp: Date.now(), severity: 'low',
        action: 'voice_control', target: '음성 인식',
        result: 'success', details: '음성 인식 시작 (ko-KR)',
      },
    })

    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ audio: true }).then((micStream) => {
        micStreamRef.current = micStream
        startWaveformAnalysis(micStream)
      }).catch(() => { /* mic access denied */ })
    }
  }, [startWaveformAnalysis, stopWaveformAnalysis, executeCommand])

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

  const toggleMonitoring = useCallback(() => {
    dispatch({ type: 'TOGGLE_MONITORING' })
    dispatch({
      type: 'ADD_AUDIT_ENTRY',
      entry: {
        id: uid(), timestamp: Date.now(), severity: 'medium',
        action: 'system_setting', target: '보안 감시',
        result: 'success',
        details: state.monitoringEnabled ? '실시간 감시 비활성화' : '실시간 감시 활성화',
      },
    })
  }, [state.monitoringEnabled])

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
    toggleMonitoring,
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
