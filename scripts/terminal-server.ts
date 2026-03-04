import { WebSocketServer, WebSocket } from 'ws'
import * as pty from '@homebridge/node-pty-prebuilt-multiarch'
import type { IPty, IDisposable } from '@homebridge/node-pty-prebuilt-multiarch'
import * as os from 'os'
import * as path from 'path'

const PORT = 3001
const HOME = os.homedir()
const KAKU_ZSH_DIR = path.join(HOME, '.config/kaku/zsh')
const SESSION_TTL_MS = 10 * 60 * 1000 // 10 min idle before killing PTY

interface ClientMessage {
  type: 'init' | 'input' | 'resize' | 'command' | 'cd'
  sessionId?: string
  data?: string
  cols?: number
  rows?: number
  command?: string
  path?: string
}

interface Session {
  pty: IPty
  dataDisposable: IDisposable
  buffer: string          // last 50 KB of output for reconnect
  ws: WebSocket | null
  lastActivity: number
  idleTimer: ReturnType<typeof setTimeout> | null
}

const sessions = new Map<string, Session>()

// Base env without CLAUDECODE
const spawnEnv: Record<string, string> = {
  ...process.env,
  HOME,
  TERM: 'xterm-256color',
  COLORTERM: 'truecolor',
  LANG: process.env.LANG || 'en_US.UTF-8',
  KAKU_ZSH_DIR,
  PATH: `${KAKU_ZSH_DIR}/bin:${process.env.PATH || ''}`,
  KAKU_WEB_TERMINAL: '1',
} as Record<string, string>
delete spawnEnv.CLAUDECODE

const wss = new WebSocketServer({ port: PORT })
console.log(`[terminal-server] WebSocket server listening on ws://localhost:${PORT}`)

function scheduleCleanup(sessionId: string, session: Session) {
  if (session.idleTimer) clearTimeout(session.idleTimer)
  session.idleTimer = setTimeout(() => {
    const s = sessions.get(sessionId)
    if (s && !s.ws) {
      console.log(`[terminal-server] Idle timeout — killing session ${sessionId}`)
      s.dataDisposable.dispose()
      s.pty.kill()
      sessions.delete(sessionId)
    }
  }, SESSION_TTL_MS)
}

function createSession(sessionId: string, ws: WebSocket): Session {
  const ptyProcess = pty.spawn('/bin/zsh', ['--login'], {
    name: 'xterm-256color',
    cols: 120,
    rows: 30,
    cwd: HOME,
    env: spawnEnv,
  })

  const session: Session = {
    pty: ptyProcess,
    dataDisposable: null as unknown as IDisposable, // set below
    buffer: '',
    ws,
    lastActivity: Date.now(),
    idleTimer: null,
  }

  // Single persistent data handler — always writes to session.ws
  session.dataDisposable = ptyProcess.onData((data: string) => {
    session.buffer = (session.buffer + data).slice(-51200) // last 50 KB
    session.lastActivity = Date.now()
    const currentWs = session.ws
    if (currentWs?.readyState === WebSocket.OPEN) {
      currentWs.send(JSON.stringify({ type: 'output', data }))
    }
  })

  ptyProcess.onExit(({ exitCode }) => {
    console.log(`[terminal-server] Session ${sessionId} exited (code ${exitCode})`)
    const s = sessions.get(sessionId)
    if (s?.ws?.readyState === WebSocket.OPEN) {
      s.ws.send(JSON.stringify({ type: 'exit', code: exitCode }))
      s.ws.close()
    }
    sessions.delete(sessionId)
  })

  sessions.set(sessionId, session)
  console.log(`[terminal-server] New session ${sessionId}`)
  return session
}

wss.on('connection', (ws: WebSocket) => {
  let session: Session | null = null

  ws.on('message', (raw: Buffer) => {
    try {
      const msg: ClientMessage = JSON.parse(raw.toString())

      // ── Init: first message must be 'init' with sessionId ──
      if (msg.type === 'init') {
        const id = msg.sessionId
        if (!id) return

        if (sessions.has(id)) {
          // Reattach to existing session
          session = sessions.get(id)!
          if (session.idleTimer) {
            clearTimeout(session.idleTimer)
            session.idleTimer = null
          }
          session.ws = ws
          console.log(`[terminal-server] Reattached to session ${id}`)

          // Replay buffered output so the user sees recent state
          if (session.buffer && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'output', data: session.buffer }))
          }
        } else {
          // New session
          session = createSession(id, ws)

          // Welcome message (only for brand-new sessions)
          const welcome = [
            '',
            '\x1b[38;2;0;255;136m  ╔══════════════════════════════════════════════════╗\x1b[0m',
            '\x1b[38;2;0;255;136m  ║                                                  ║\x1b[0m',
            '\x1b[38;2;0;255;136m  ║\x1b[0m   \x1b[1;38;2;0;255;136mAgent Control Tower\x1b[0m에 오신걸 환영합니다.    \x1b[38;2;0;255;136m║\x1b[0m',
            '\x1b[38;2;0;255;136m  ║                                                  ║\x1b[0m',
            '\x1b[38;2;0;255;136m  ║\x1b[0m   \x1b[38;2;107;114;128m왼쪽 디렉토리에서 프로젝트를 선택하세요.\x1b[0m     \x1b[38;2;0;255;136m║\x1b[0m',
            '\x1b[38;2;0;255;136m  ║\x1b[0m   \x1b[38;2;107;114;128mtmux / claude 명령으로 시작할 수 있습니다.\x1b[0m   \x1b[38;2;0;255;136m║\x1b[0m',
            '\x1b[38;2;0;255;136m  ║                                                  ║\x1b[0m',
            '\x1b[38;2;0;255;136m  ╚══════════════════════════════════════════════════╝\x1b[0m',
            '',
          ].join('\r\n')

          setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: 'output', data: welcome }))
            }
          }, 400)
        }

        ws.send(JSON.stringify({ type: 'ready' }))
        return
      }

      if (!session) return

      switch (msg.type) {
        case 'input':
          if (msg.data) session.pty.write(msg.data)
          break
        case 'resize':
          if (msg.cols && msg.rows) session.pty.resize(msg.cols, msg.rows)
          break
        case 'command':
          if (msg.command) session.pty.write(`${msg.command}\r`)
          break
        case 'cd':
          if (msg.path) session.pty.write(`cd ${JSON.stringify(msg.path)}\r`)
          break
      }
    } catch {
      // ignore malformed messages
    }
  })

  // WebSocket close: detach but keep PTY alive
  ws.on('close', () => {
    if (session) {
      const id = [...sessions.entries()].find(([, s]) => s === session)?.[0]
      if (id) {
        session.ws = null
        session.lastActivity = Date.now()
        scheduleCleanup(id, session)
        console.log(`[terminal-server] Session ${id} detached — cleanup in ${SESSION_TTL_MS / 60000}min if not reconnected`)
      }
    }
  })

  ws.on('error', (err: Error) => {
    console.error('[terminal-server] WebSocket error:', err.message)
  })
})

// Graceful shutdown
function cleanup() {
  console.log('[terminal-server] Shutting down...')
  for (const [, s] of sessions.entries()) {
    s.dataDisposable.dispose()
    s.pty.kill()
    s.ws?.close()
  }
  sessions.clear()
  wss.close()
  process.exit(0)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
