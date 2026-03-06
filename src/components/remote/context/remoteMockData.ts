import type {
  ApprovalRequest, AuditEntry, ProcessInfo,
  NetworkConnection, ThreatAlert, ACLRule,
} from '@/types/remote'

export const rand = (min: number, max: number) => Math.random() * (max - min) + min
export const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1))
export const pick = <T,>(arr: readonly T[]): T => arr[randInt(0, arr.length - 1)]
export const uid = () => `${Date.now()}-${randInt(1000, 9999)}`

const PROCESS_TEMPLATES: readonly { name: string; user: string; suspicious: boolean }[] = [
  { name: 'chrome.exe', user: 'daniel', suspicious: false },
  { name: 'node.exe', user: 'daniel', suspicious: false },
  { name: 'code.exe', user: 'daniel', suspicious: false },
  { name: 'explorer.exe', user: 'SYSTEM', suspicious: false },
  { name: 'svchost.exe', user: 'SYSTEM', suspicious: false },
  { name: 'postgres.exe', user: 'daniel', suspicious: false },
  { name: 'docker.exe', user: 'daniel', suspicious: false },
  { name: 'spotify.exe', user: 'daniel', suspicious: false },
  { name: 'slack.exe', user: 'daniel', suspicious: false },
  { name: 'csrss.exe', user: 'SYSTEM', suspicious: false },
  { name: 'svchost_x86.exe', user: 'TEMP', suspicious: true },
  { name: 'keylogger.dll', user: 'UNKNOWN', suspicious: true },
]

export function generateProcesses(): readonly ProcessInfo[] {
  const count = randInt(8, 12)
  const selected = [...PROCESS_TEMPLATES].sort(() => Math.random() - 0.5).slice(0, count)
  return selected.map((tpl, i) => ({
    pid: 1000 + i * randInt(100, 500),
    name: tpl.name,
    cpu: tpl.suspicious ? rand(25, 60) : rand(0.1, 12),
    memory: tpl.suspicious ? rand(200, 500) : rand(10, 350),
    status: 'running' as const,
    user: tpl.user,
    startTime: Date.now() - randInt(60_000, 86_400_000),
    isSuspicious: tpl.suspicious,
  }))
}

export function generateConnections(): readonly NetworkConnection[] {
  const templates = [
    { process: 'chrome.exe', remote: '142.250.80.46', port: 443, state: 'ESTABLISHED' as const },
    { process: 'slack.exe', remote: '34.120.195.11', port: 443, state: 'ESTABLISHED' as const },
    { process: 'node.exe', remote: '127.0.0.1', port: 3000, state: 'LISTEN' as const },
    { process: 'postgres.exe', remote: '127.0.0.1', port: 5432, state: 'LISTEN' as const },
    { process: 'docker.exe', remote: '172.17.0.1', port: 2375, state: 'ESTABLISHED' as const },
    { process: 'svchost.exe', remote: '13.107.4.52', port: 443, state: 'TIME_WAIT' as const },
    { process: 'svchost_x86.exe', remote: '45.33.32.156', port: 4444, state: 'SYN_SENT' as const },
    { process: 'chrome.exe', remote: '151.101.1.140', port: 443, state: 'ESTABLISHED' as const },
  ]
  const count = randInt(5, 8)
  return templates.slice(0, count).map((t, i) => ({
    id: `conn-${i}`,
    protocol: 'TCP' as const,
    localAddress: '192.168.1.105',
    localPort: 49152 + i,
    remoteAddress: t.remote,
    remotePort: t.port,
    state: t.state,
    process: t.process,
    bytesIn: randInt(1024, 5_000_000),
    bytesOut: randInt(512, 2_000_000),
    isSuspicious: t.process === 'svchost_x86.exe',
  }))
}

export function generateApprovalQueue(): readonly ApprovalRequest[] {
  const requests: readonly ApprovalRequest[] = [
    {
      id: uid(), timestamp: Date.now() - 12_000, severity: 'medium',
      action: 'app_launch', description: 'Chrome 브라우저 실행',
      target: 'chrome.exe', estimatedImpact: '네트워크 접근 허용',
      status: 'pending', voiceMessage: '주인님, Chrome을 실행하겠습니다.',
    },
    {
      id: uid(), timestamp: Date.now() - 8_000, severity: 'high',
      action: 'file_write', description: '설정 파일 수정',
      target: '/etc/hosts', estimatedImpact: '시스템 DNS 변경',
      status: 'pending', voiceMessage: '주인님, 호스트 파일을 수정해도 될까요?',
    },
    {
      id: uid(), timestamp: Date.now() - 5_000, severity: 'low',
      action: 'browser_navigate', description: 'GitHub 페이지 이동',
      target: 'https://github.com/dashboard', estimatedImpact: '없음',
      status: 'pending', voiceMessage: '주인님, GitHub으로 이동합니다.',
    },
    {
      id: uid(), timestamp: Date.now() - 2_000, severity: 'blocked',
      action: 'process_control', description: '백그라운드 프로세스 종료',
      target: 'svchost_x86.exe', estimatedImpact: '의심 프로세스 제거',
      status: 'pending', voiceMessage: '주인님, 의심스러운 프로세스를 종료하겠습니다.',
    },
  ]
  return requests.slice(0, randInt(3, 4))
}

export function generateAuditLog(): readonly AuditEntry[] {
  const actions = [
    { action: 'app_launch', target: 'chrome.exe', result: 'success' as const, severity: 'low' as const },
    { action: 'file_read', target: '/Users/daniel/.env', result: 'blocked' as const, severity: 'high' as const },
    { action: 'mouse_click', target: 'Button:Submit', result: 'success' as const, severity: 'low' as const },
    { action: 'browser_navigate', target: 'https://api.openai.com', result: 'success' as const, severity: 'medium' as const },
    { action: 'file_write', target: '/tmp/output.json', result: 'success' as const, severity: 'low' as const },
    { action: 'network', target: '45.33.32.156:4444', result: 'denied' as const, severity: 'high' as const },
    { action: 'keyboard', target: 'Terminal input', result: 'success' as const, severity: 'low' as const },
    { action: 'process_control', target: 'kill PID 3847', result: 'denied' as const, severity: 'medium' as const },
    { action: 'app_launch', target: 'slack.exe', result: 'success' as const, severity: 'low' as const },
    { action: 'scroll', target: 'Document viewport', result: 'success' as const, severity: 'low' as const },
    { action: 'file_delete', target: '/tmp/cache/*.log', result: 'success' as const, severity: 'low' as const },
    { action: 'system_setting', target: 'display.brightness', result: 'success' as const, severity: 'low' as const },
    { action: 'network', target: 'DNS query: malware.bad', result: 'blocked' as const, severity: 'high' as const },
    { action: 'file_read', target: 'package.json', result: 'success' as const, severity: 'low' as const },
    { action: 'browser_navigate', target: 'https://stackoverflow.com', result: 'success' as const, severity: 'low' as const },
    { action: 'app_close', target: 'notepad.exe', result: 'success' as const, severity: 'low' as const },
    { action: 'mouse_move', target: 'Desktop region', result: 'success' as const, severity: 'low' as const },
  ]
  return actions.map((a, i) => ({
    id: `audit-${i}`,
    timestamp: Date.now() - (actions.length - i) * 15_000,
    severity: a.severity,
    action: a.action,
    target: a.target,
    result: a.result,
  }))
}

export function generateThreats(): readonly ThreatAlert[] {
  return [
    {
      id: 'threat-1', timestamp: Date.now() - 120_000, level: 'info',
      category: 'network', title: '비표준 포트 통신 감지',
      description: 'Port 4444로의 아웃바운드 연결 시도가 감지되었습니다.',
      source: 'NetworkMonitor', resolved: false,
    },
    {
      id: 'threat-2', timestamp: Date.now() - 60_000, level: 'warning',
      category: 'process', title: '의심 프로세스 실행',
      description: 'svchost_x86.exe가 비정상 경로에서 실행 중입니다.',
      source: 'ProcessGuard', resolved: false,
    },
    {
      id: 'threat-3', timestamp: Date.now() - 30_000, level: 'info',
      category: 'filesystem', title: '민감 파일 접근 차단',
      description: '.env 파일 읽기 요청이 ACL에 의해 차단되었습니다.',
      source: 'FileWatcher', resolved: true,
    },
  ]
}

export const ACL_RULES: readonly ACLRule[] = [
  { id: 'acl-1', type: 'deny', resource: 'file', pattern: '**/.env*', description: '환경변수 파일 접근 차단', enabled: true },
  { id: 'acl-2', type: 'deny', resource: 'file', pattern: '**/credentials*', description: '인증정보 파일 접근 차단', enabled: true },
  { id: 'acl-3', type: 'deny', resource: 'network', pattern: '*:4444', description: '의심 포트 차단', enabled: true },
  { id: 'acl-4', type: 'allow', resource: 'process', pattern: 'chrome.exe|code.exe|node.exe', description: '허용 애플리케이션', enabled: true },
  { id: 'acl-5', type: 'deny', resource: 'file', pattern: '/etc/shadow', description: '시스템 비밀번호 파일 차단', enabled: true },
  { id: 'acl-6', type: 'deny', resource: 'registry', pattern: 'HKLM\\SYSTEM\\*', description: '시스템 레지스트리 변경 차단', enabled: true },
]
