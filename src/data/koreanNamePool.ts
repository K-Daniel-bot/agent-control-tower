import type { AgentIdentity, TopologyAgentType } from '@/types/topology'

interface KoreanNameEntry {
  koreanName: string
  title: string
  rank: number
}

/** CEO - always fixed as orchestrator */
export const ORCHESTRATOR_ENTRY: KoreanNameEntry = {
  koreanName: '강다니엘',
  title: 'CEO',
  rank: 1,
}

/** Pool of Korean names with corporate titles */
const NAME_POOL: ReadonlyArray<KoreanNameEntry> = [
  { koreanName: '박지민', title: '부사장', rank: 2 },
  { koreanName: '김서연', title: '전무', rank: 3 },
  { koreanName: '이준혁', title: '상무', rank: 4 },
  { koreanName: '정하은', title: '이사', rank: 5 },
  { koreanName: '홍길동', title: '팀장', rank: 6 },
  { koreanName: '최유진', title: '팀장', rank: 7 },
  { koreanName: '윤서아', title: '과장', rank: 8 },
  { koreanName: '한도윤', title: '과장', rank: 9 },
  { koreanName: '임채원', title: '대리', rank: 10 },
  { koreanName: '송하린', title: '대리', rank: 11 },
  { koreanName: '조민서', title: '주임', rank: 12 },
  { koreanName: '강예은', title: '주임', rank: 13 },
  { koreanName: '배수현', title: '사원', rank: 14 },
  { koreanName: '오지후', title: '사원', rank: 15 },
]

let assignIndex = 0

/** Assign the next unused Korean name from the pool */
export function assignName(usedNames: ReadonlyArray<string>): KoreanNameEntry {
  const available = NAME_POOL.filter(
    (entry) => !usedNames.includes(entry.koreanName)
  )

  if (available.length > 0) {
    const entry = available[0]
    return entry
  }

  // Fallback: append numeric suffix
  const base = NAME_POOL[assignIndex % NAME_POOL.length]
  assignIndex += 1
  return {
    ...base,
    koreanName: `${base.koreanName}${assignIndex}`,
  }
}

/** Create orchestrator identity */
export function createOrchestratorIdentity(): AgentIdentity {
  return {
    id: 'orchestrator-ceo',
    koreanName: ORCHESTRATOR_ENTRY.koreanName,
    title: ORCHESTRATOR_ENTRY.title,
    englishRole: 'Orchestrator',
    agentType: 'orchestrator',
  }
}

/** Create agent identity with Korean name */
export function createAgentIdentity(
  agentType: TopologyAgentType,
  englishRole: string,
  usedNames: ReadonlyArray<string>
): AgentIdentity {
  const nameEntry = assignName(usedNames)
  return {
    id: `${agentType}-${nameEntry.koreanName}-${Date.now()}`,
    koreanName: nameEntry.koreanName,
    title: nameEntry.title,
    englishRole,
    agentType,
  }
}

/** Format display label: "강다니엘/CEO" */
export function getDisplayLabel(identity: AgentIdentity): string {
  return `${identity.koreanName}/${identity.title}`
}

/** Reset assignment index (for simulation reset) */
export function resetNamePool(): void {
  assignIndex = 0
}
