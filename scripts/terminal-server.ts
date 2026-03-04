import { WebSocketServer, WebSocket } from 'ws'
import * as pty from '@homebridge/node-pty-prebuilt-multiarch'
import type { IPty } from '@homebridge/node-pty-prebuilt-multiarch'
import * as os from 'os'
import * as path from 'path'

const PORT = 3001
const HOME = os.homedir()
const KAKU_ZSH_DIR = path.join(HOME, '.config/kaku/zsh')

interface ClientMessage {
  type: 'input' | 'resize' | 'command' | 'cd'
  data?: string
  cols?: number
  rows?: number
  command?: string
  path?: string
}

const sessions = new Map<WebSocket, IPty>()

const wss = new WebSocketServer({ port: PORT })

console.log(`[terminal-server] WebSocket server listening on ws://localhost:${PORT}`)

wss.on('connection', (ws: WebSocket) => {
  console.log('[terminal-server] New connection')

  // Spawn zsh as login shell (-l) so .zshrc + kaku integration loads
  const ptyProcess = pty.spawn('/bin/zsh', ['--login'], {
    name: 'xterm-256color',
    cols: 120,
    rows: 30,
    cwd: HOME,
    env: {
      ...process.env,
      HOME,
      TERM: 'xterm-256color',
      COLORTERM: 'truecolor',
      LANG: process.env.LANG || 'en_US.UTF-8',
      KAKU_ZSH_DIR,
      PATH: `${KAKU_ZSH_DIR}/bin:${process.env.PATH || ''}`,
      // Disable some features that cause issues in web terminals
      KAKU_WEB_TERMINAL: '1',
    } as Record<string, string>,
  })

  sessions.set(ws, ptyProcess)

  // PTY output → WebSocket
  ptyProcess.onData((data: string) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'output', data }))
    }
  })

  // PTY exit → notify client
  ptyProcess.onExit(({ exitCode }) => {
    console.log(`[terminal-server] PTY exited with code ${exitCode}`)
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'exit', code: exitCode }))
      ws.close()
    }
    sessions.delete(ws)
  })

  // WebSocket messages → PTY
  ws.on('message', (raw: Buffer) => {
    try {
      const msg: ClientMessage = JSON.parse(raw.toString())

      switch (msg.type) {
        case 'input':
          if (msg.data) {
            ptyProcess.write(msg.data)
          }
          break

        case 'resize':
          if (msg.cols && msg.rows) {
            ptyProcess.resize(msg.cols, msg.rows)
          }
          break

        case 'command':
          if (msg.command) {
            ptyProcess.write(`${msg.command}\r`)
          }
          break

        case 'cd':
          if (msg.path) {
            ptyProcess.write(`cd ${JSON.stringify(msg.path)}\r`)
          }
          break
      }
    } catch {
      // ignore malformed messages
    }
  })

  // WebSocket close → kill PTY
  ws.on('close', () => {
    console.log('[terminal-server] Connection closed')
    const p = sessions.get(ws)
    if (p) {
      p.kill()
      sessions.delete(ws)
    }
  })

  ws.on('error', (err: Error) => {
    console.error('[terminal-server] WebSocket error:', err.message)
  })

  // Send ready signal
  ws.send(JSON.stringify({ type: 'ready' }))

  // Welcome message (ANSI art)
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
  }, 500)
})

// Graceful shutdown
function cleanup() {
  console.log('[terminal-server] Shutting down...')
  for (const [ws, p] of sessions.entries()) {
    p.kill()
    ws.close()
  }
  sessions.clear()
  wss.close()
  process.exit(0)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
