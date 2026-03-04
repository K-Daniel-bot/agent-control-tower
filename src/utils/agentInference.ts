import type { AgentRoleType, AgentSkill, AgentRank } from '@/types/agent'

export interface InferenceResult {
  roleType: AgentRoleType
  skills: AgentSkill[]
  summary: string
}

type Pattern = [RegExp, AgentRoleType, AgentSkill[], string]

const PATTERNS: Pattern[] = [
  [/test|qa|quality|spec|검증|테스트/i,                       'tester',       ['testing', 'documentation'],              '테스트 및 품질 검증 전문가'],
  [/plan|architect|design|strategy|설계|기획/i,               'planner',      ['documentation', 'data_analysis'],        '시스템 설계 및 전략 기획'],
  [/code|develop|frontend|backend|full.?stack|개발|코딩/i,    'coder',        ['coding', 'git', 'api'],                  '소프트웨어 개발 및 구현'],
  [/review|audit|코드\s*리뷰|검토/i,                         'reviewer',     ['code_review', 'security_analysis'],      '코드 리뷰 및 품질 관리'],
  [/data|analys|insight|report|분석|데이터/i,                 'analyst',      ['data_analysis', 'documentation'],        '데이터 분석 및 인사이트 도출'],
  [/search|research|investigate|gather|조사|리서치/i,         'researcher',   ['web_search', 'documentation'],           '정보 수집 및 리서치'],
  [/security|vulnerabilit|penetration|보안|취약/i,            'security',     ['security_analysis', 'code_review'],      '보안 분석 및 취약점 검토'],
  [/doc|manual|guide|wiki|문서|가이드/i,                      'documenter',   ['documentation', 'web_search'],           '문서화 및 가이드 작성'],
  [/tool|util|helper|script|자동화|도구/i,                    'tool',         ['shell', 'api'],                          '유틸리티 도구 및 자동화'],
  [/orchestrat|coordinat|총괄|조율|매니저/i,                  'orchestrator', ['api', 'data_analysis'],                  '에이전트 총괄 및 조율'],
  [/verif|validat|검증|확인|validate/i,                       'verifier',     ['testing', 'code_review'],                '결과 검증 및 유효성 확인'],
]

export function inferFromDescription(description: string): InferenceResult {
  if (!description.trim()) {
    return { roleType: 'executor', skills: ['coding', 'api'], summary: '' }
  }
  for (const [pattern, roleType, skills, summary] of PATTERNS) {
    if (pattern.test(description)) return { roleType, skills, summary }
  }
  return { roleType: 'executor', skills: ['coding', 'api', 'shell'], summary: '범용 태스크 실행 전문가' }
}

export const ROLE_META: Record<AgentRoleType, { label: string; icon: string; color: string }> = {
  orchestrator: { label: 'Orchestrator', icon: '👑', color: '#ffd700' },
  planner:      { label: 'Planner',      icon: '📋', color: '#8b5cf6' },
  executor:     { label: 'Executor',     icon: '⚡', color: '#f59e0b' },
  coder:        { label: 'Coder',        icon: '💻', color: '#3b82f6' },
  tool:         { label: 'Tool',         icon: '🔧', color: '#06b6d4' },
  verifier:     { label: 'Verifier',     icon: '✅', color: '#10b981' },
  researcher:   { label: 'Researcher',   icon: '🔍', color: '#a855f7' },
  analyst:      { label: 'Analyst',      icon: '📊', color: '#ec4899' },
  reviewer:     { label: 'Reviewer',     icon: '👁', color: '#f97316' },
  tester:       { label: 'Tester',       icon: '🧪', color: '#14b8a6' },
  documenter:   { label: 'Documenter',   icon: '📝', color: '#84cc16' },
  security:     { label: 'Security',     icon: '🛡', color: '#ef4444' },
}

export const SKILL_META: Record<AgentSkill, { label: string; icon: string }> = {
  coding:           { label: '코딩',       icon: '💻' },
  web_search:       { label: '웹 검색',    icon: '🌐' },
  file_mgmt:        { label: '파일 관리',  icon: '📁' },
  git:              { label: 'Git',        icon: '🌿' },
  database:         { label: 'DB',         icon: '🗄' },
  api:              { label: 'API 호출',   icon: '🔌' },
  messaging:        { label: '메시지',     icon: '💬' },
  code_review:      { label: '코드 리뷰', icon: '👁' },
  testing:          { label: '테스트',     icon: '🧪' },
  documentation:    { label: '문서화',     icon: '📝' },
  security_analysis:{ label: '보안',       icon: '🛡' },
  data_analysis:    { label: '데이터 분석',icon: '📊' },
  browser:          { label: '브라우저',   icon: '🌐' },
  shell:            { label: '쉘',         icon: '⌨' },
}

export const RANK_OPTIONS: AgentRank[] = ['Junior', 'Mid-Level', 'Senior', 'Lead', 'Principal', 'Staff', 'Fellow']
