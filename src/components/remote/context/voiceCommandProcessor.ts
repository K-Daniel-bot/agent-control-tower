// Voice Command Processor
// Parses Korean voice commands and returns executable actions

export type CommandAction =
  | { type: 'navigate'; url: string; label: string }
  | { type: 'click'; target: string; x: number; y: number }
  | { type: 'type'; text: string; target: string }
  | { type: 'scroll'; direction: 'up' | 'down' }
  | { type: 'search'; query: string; engine: string }
  | { type: 'open_app'; app: string }
  | { type: 'close_app'; app: string }
  | { type: 'screenshot' }
  | { type: 'unknown'; raw: string }

interface CommandPattern {
  readonly patterns: readonly RegExp[]
  readonly handler: (match: RegExpMatchArray, raw: string) => CommandAction
}

const SITE_MAP: Record<string, string> = {
  '네이버': 'https://www.naver.com',
  '구글': 'https://www.google.com',
  '유튜브': 'https://www.youtube.com',
  '깃허브': 'https://github.com',
  '깃헙': 'https://github.com',
  '지메일': 'https://mail.google.com',
  'gmail': 'https://mail.google.com',
  '카카오': 'https://www.kakaocorp.com',
  '다음': 'https://www.daum.net',
  '스택오버플로우': 'https://stackoverflow.com',
  '챗지피티': 'https://chat.openai.com',
  'chatgpt': 'https://chat.openai.com',
  '클로드': 'https://claude.ai',
  '트위터': 'https://x.com',
  '엑스': 'https://x.com',
  '인스타그램': 'https://www.instagram.com',
  '인스타': 'https://www.instagram.com',
  '페이스북': 'https://www.facebook.com',
  '링크드인': 'https://www.linkedin.com',
  '노션': 'https://www.notion.so',
  '슬랙': 'https://slack.com',
  '디스코드': 'https://discord.com',
  '아마존': 'https://www.amazon.com',
  '쿠팡': 'https://www.coupang.com',
  '배민': 'https://www.baemin.com',
  '배달의민족': 'https://www.baemin.com',
  '넷플릭스': 'https://www.netflix.com',
  '스포티파이': 'https://www.spotify.com',
}

function findSiteUrl(text: string): { site: string; url: string } | null {
  const normalized = text.toLowerCase().replace(/\s/g, '')
  for (const [name, url] of Object.entries(SITE_MAP)) {
    if (normalized.includes(name.toLowerCase().replace(/\s/g, ''))) {
      return { site: name, url }
    }
  }
  // URL pattern
  const urlMatch = text.match(/(https?:\/\/[^\s]+|www\.[^\s]+|[a-z0-9-]+\.(com|net|org|io|kr|co\.kr))/i)
  if (urlMatch) {
    const raw = urlMatch[0]
    const url = raw.startsWith('http') ? raw : `https://${raw}`
    return { site: raw, url }
  }
  return null
}

const COMMAND_PATTERNS: readonly CommandPattern[] = [
  // Navigation: "네이버에 들어가", "구글로 이동해", "유튜브 열어"
  {
    patterns: [
      /(.+?)(?:에|으로|로)\s*(?:들어가|이동해|이동하|가줘|가자|접속해|접속하|열어|열어줘|가봐)/,
      /(.+?)\s*(?:열어|열어줘|켜줘|켜|실행해|실행하|띄워|띄워줘)/,
      /(.+?)\s*(?:사이트|페이지|홈페이지).*?(?:열어|가|이동|접속)/,
    ],
    handler: (match, raw) => {
      const target = match[1]?.trim() ?? raw
      const site = findSiteUrl(target) ?? findSiteUrl(raw)
      if (site) {
        return { type: 'navigate', url: site.url, label: site.site }
      }
      return { type: 'unknown', raw }
    },
  },
  // Search: "네이버에서 검색해", "구글에서 ~~ 검색"
  {
    patterns: [
      /(.+?)(?:에서|에)\s*(.+?)\s*(?:검색해|검색하|검색|찾아|찾아봐|찾아줘)/,
      /(.+?)\s*(?:검색해|검색하|검색해줘|찾아봐)/,
    ],
    handler: (match) => {
      if (match[2]) {
        const engine = match[1]?.trim() ?? '구글'
        const query = match[2].trim()
        return { type: 'search', query, engine }
      }
      const query = match[1]?.trim() ?? ''
      return { type: 'search', query, engine: '구글' }
    },
  },
  // Scroll
  {
    patterns: [
      /(?:위로|위쪽으로|상단으로)\s*(?:스크롤|올려|올려줘)/,
      /스크롤\s*(?:위로|올려)/,
    ],
    handler: () => ({ type: 'scroll', direction: 'up' }),
  },
  {
    patterns: [
      /(?:아래로|아래쪽으로|하단으로)\s*(?:스크롤|내려|내려줘)/,
      /스크롤\s*(?:아래로|내려)/,
    ],
    handler: () => ({ type: 'scroll', direction: 'down' }),
  },
  // Click
  {
    patterns: [
      /(.+?)\s*(?:클릭해|클릭하|클릭|눌러|눌러줘|누르|선택해|선택하)/,
    ],
    handler: (match) => {
      const target = match[1]?.trim() ?? 'unknown'
      return { type: 'click', target, x: 960, y: 540 }
    },
  },
  // Type
  {
    patterns: [
      /(.+?)\s*(?:입력해|입력하|타이핑해|타이핑하|써줘|적어|적어줘|치|쳐)/,
    ],
    handler: (match) => {
      const text = match[1]?.trim() ?? ''
      return { type: 'type', text, target: 'Input field' }
    },
  },
  // Screenshot
  {
    patterns: [
      /(?:스크린샷|캡처|화면\s*캡처|스크린\s*캡처|화면\s*저장)/,
    ],
    handler: () => ({ type: 'screenshot' }),
  },
  // App open
  {
    patterns: [
      /(.+?)\s*(?:앱|어플|프로그램|애플리케이션).*?(?:열어|실행|켜)/,
    ],
    handler: (match) => ({ type: 'open_app', app: match[1]?.trim() ?? '' }),
  },
]

export function processVoiceCommand(text: string): CommandAction {
  const trimmed = text.trim()

  // Direct site name match (no verb needed) e.g. "네이버"
  const directSite = findSiteUrl(trimmed)
  if (directSite && trimmed.length < 20) {
    return { type: 'navigate', url: directSite.url, label: directSite.site }
  }

  for (const cmd of COMMAND_PATTERNS) {
    for (const pattern of cmd.patterns) {
      const match = trimmed.match(pattern)
      if (match) {
        const result = cmd.handler(match, trimmed)
        if (result.type !== 'unknown') return result
      }
    }
  }

  // Fallback: check if any known site name is in the text
  const fallbackSite = findSiteUrl(trimmed)
  if (fallbackSite) {
    return { type: 'navigate', url: fallbackSite.url, label: fallbackSite.site }
  }

  return { type: 'unknown', raw: trimmed }
}

export function getCommandResponseText(action: CommandAction): string {
  switch (action.type) {
    case 'navigate':
      return `주인님, ${action.label}(으)로 이동하겠습니다.`
    case 'click':
      return `주인님, ${action.target}을(를) 클릭하겠습니다.`
    case 'type':
      return `주인님, "${action.text}"을(를) 입력하겠습니다.`
    case 'scroll':
      return `주인님, ${action.direction === 'up' ? '위로' : '아래로'} 스크롤하겠습니다.`
    case 'search':
      return `주인님, ${action.engine}에서 "${action.query}"을(를) 검색하겠습니다.`
    case 'open_app':
      return `주인님, ${action.app}을(를) 실행하겠습니다.`
    case 'close_app':
      return `주인님, ${action.app}을(를) 종료하겠습니다.`
    case 'screenshot':
      return '주인님, 화면을 캡처하겠습니다.'
    case 'unknown':
      return `주인님, "${action.raw}" 명령을 이해하지 못했습니다. 다시 말씀해 주세요.`
  }
}

export function getSearchUrl(query: string, engine: string): string {
  const normalized = engine.toLowerCase().replace(/\s/g, '')
  if (normalized.includes('네이버') || normalized.includes('naver')) {
    return `https://search.naver.com/search.naver?query=${encodeURIComponent(query)}`
  }
  if (normalized.includes('유튜브') || normalized.includes('youtube')) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
  }
  return `https://www.google.com/search?q=${encodeURIComponent(query)}`
}
