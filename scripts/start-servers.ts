#!/usr/bin/env node

import { spawn, ChildProcess } from 'child_process'
import * as readline from 'readline'
import * as path from 'path'

const BASE_DIR = path.join(__dirname, '..')

interface ServerProcess {
  name: string
  port?: number
  command: string
  args: string[]
  process?: ChildProcess
  status: 'idle' | 'starting' | 'running' | 'failed'
  output: string[]
}

const servers: ServerProcess[] = [
  {
    name: 'Next.js App',
    port: 3000,
    command: 'npm',
    args: ['run', 'dev'],
    status: 'idle',
    output: [],
  },
  {
    name: 'Terminal Server',
    port: 3001,
    command: 'npm',
    args: ['run', 'dev:terminal'],
    status: 'idle',
    output: [],
  },
]

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function clearScreen() {
  process.stdout.write('\x1Bc')
}

function displayDashboard() {
  clearScreen()
  console.log('\n' + '═'.repeat(60))
  console.log('  🚀 Agent Control Tower - Server Manager')
  console.log('═'.repeat(60) + '\n')

  servers.forEach((server, idx) => {
    const statusIcon =
      server.status === 'running'
        ? '✓'
        : server.status === 'failed'
          ? '✗'
          : server.status === 'starting'
            ? '⟳'
            : '○'
    const statusColor =
      server.status === 'running'
        ? '\x1b[32m'
        : server.status === 'failed'
          ? '\x1b[31m'
          : server.status === 'starting'
            ? '\x1b[33m'
            : '\x1b[36m'
    const resetColor = '\x1b[0m'

    const portStr = server.port ? ` (port ${server.port})` : ''
    console.log(
      `  ${idx + 1}. ${server.name}${portStr}`
    )
    console.log(
      `     Status: ${statusColor}${statusIcon} ${server.status}${resetColor}`
    )

    // Show last output line
    if (server.output.length > 0) {
      const lastLine = server.output[server.output.length - 1]
      const displayLine = lastLine.substring(0, 50)
      console.log(`     Output: ${displayLine}${lastLine.length > 50 ? '...' : ''}`)
    }
    console.log('')
  })

  console.log('─'.repeat(60))
  console.log('  Commands:')
  console.log('    [a]ll    - Start all servers')
  console.log('    [1-2]    - Start specific server')
  console.log('    [k]ill   - Stop all servers')
  console.log('    [r]efresh - Refresh dashboard')
  console.log('    [q]uit    - Exit program')
  console.log('─'.repeat(60) + '\n')
}

function startServer(server: ServerProcess) {
  if (server.status === 'running') {
    console.log(`\n⚠️  ${server.name} is already running\n`)
    return
  }

  server.status = 'starting'
  server.output = []
  displayDashboard()

  const proc = spawn(server.command, server.args, {
    cwd: BASE_DIR,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true,
  })

  server.process = proc

  proc.stdout?.on('data', (data: Buffer) => {
    const line = data.toString().trim()
    if (line) {
      server.output.push(line)
      if (server.output.length > 10) server.output.shift()

      // Detect when server is ready
      if (
        (server.name === 'Next.js App' && line.includes('ready')) ||
        (server.name === 'Terminal Server' && line.includes('listening'))
      ) {
        server.status = 'running'
        console.log(`✓ ${server.name} started successfully`)
      }
    }
  })

  proc.stderr?.on('data', (data: Buffer) => {
    const line = data.toString().trim()
    if (line) {
      server.output.push(`[ERR] ${line}`)
      if (server.output.length > 10) server.output.shift()
    }
  })

  proc.on('error', (error) => {
    server.status = 'failed'
    server.output.push(`Error: ${error.message}`)
    console.error(`✗ ${server.name} failed to start:`, error.message)
  })

  proc.on('exit', (code) => {
    server.status = code === 0 ? 'idle' : 'failed'
    server.output.push(`[EXIT] Process exited with code ${code}`)
    console.log(`${server.name} stopped (code: ${code})`)
  })
}

function stopAll() {
  console.log('\n⏹️  Stopping all servers...\n')
  servers.forEach((server) => {
    if (server.process && server.status !== 'idle') {
      server.process.kill('SIGTERM')
      server.status = 'idle'
    }
  })
  setTimeout(() => {
    displayDashboard()
  }, 500)
}

function handleInput(input: string) {
  const cmd = input.trim().toLowerCase()

  switch (cmd) {
    case 'a':
    case 'all':
      servers.forEach(startServer)
      setTimeout(displayDashboard, 1000)
      break
    case '1':
      startServer(servers[0])
      setTimeout(displayDashboard, 1000)
      break
    case '2':
      startServer(servers[1])
      setTimeout(displayDashboard, 1000)
      break
    case 'k':
    case 'kill':
      stopAll()
      break
    case 'r':
    case 'refresh':
      displayDashboard()
      break
    case 'q':
    case 'quit':
      console.log('\nShutting down...')
      stopAll()
      setTimeout(() => {
        rl.close()
        process.exit(0)
      }, 1000)
      break
    default:
      console.log('Unknown command. Press Enter to see dashboard.')
      displayDashboard()
  }
}

// Start interactive prompt
displayDashboard()

rl.on('line', (input) => {
  handleInput(input)
  if (!input.match(/^[qQ]/)) {
    rl.prompt()
  }
})

// Handle process exit
process.on('SIGINT', () => {
  console.log('\n\nReceived SIGINT, cleaning up...')
  stopAll()
  setTimeout(() => {
    rl.close()
    process.exit(0)
  }, 1000)
})

process.on('SIGTERM', () => {
  stopAll()
  process.exit(0)
})
