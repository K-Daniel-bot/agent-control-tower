'use client'

import { useCallback, useRef } from 'react'
import type { AgentIdentity, AgentMessage, OrchestraAction, TopologyAgentType } from '@/types/topology'
import {
  createOrchestratorIdentity,
  createAgentIdentity,
  resetNamePool,
} from '@/data/koreanNamePool'

let _msgSeq = 0
function msg(
  from: AgentIdentity,
  to: AgentIdentity,
  message: string,
  type: AgentMessage['type'] = 'task'
): OrchestraAction {
  return {
    type: 'ADD_AGENT_MESSAGE',
    payload: {
      id: `msg-${++_msgSeq}`,
      fromId: from.id,
      toId: to.id,
      fromLabel: from.englishRole,
      toLabel: to.englishRole,
      message,
      timestamp: Date.now(),
      type,
    },
  }
}

function sysMsg(label: string, message: string): OrchestraAction {
  return {
    type: 'ADD_AGENT_MESSAGE',
    payload: {
      id: `msg-${++_msgSeq}`,
      fromId: 'system',
      toId: 'broadcast',
      fromLabel: label,
      toLabel: 'ALL',
      message,
      timestamp: Date.now(),
      type: 'system',
    },
  }
}

interface SimulationStep {
  delay: number
  action: () => OrchestraAction | OrchestraAction[]
}

function jitter(base: number): number {
  return base + Math.random() * 800 - 400
}

function buildSimulationSteps(): SimulationStep[] {
  const usedNames: string[] = []

  const makeAgent = (type: TopologyAgentType, role: string) => {
    const identity = createAgentIdentity(type, role, usedNames)
    usedNames.push(identity.koreanName)
    return identity
  }

  // Pre-generate all identities
  const ceo = createOrchestratorIdentity()
  const planner1 = makeAgent('planner', 'Planner A')
  const planner2 = makeAgent('planner', 'Planner B')
  const executor1 = makeAgent('executor', 'Executor A')
  const executor2 = makeAgent('executor', 'Executor B')
  const executor3 = makeAgent('executor', 'Executor C')
  const tool1 = makeAgent('tool', 'Browser')
  const tool2 = makeAgent('tool', 'Filesystem')
  const tool3 = makeAgent('tool', 'Git')
  const tool4 = makeAgent('tool', 'Shell')
  const verifier1 = makeAgent('verifier', 'Verifier A')
  const verifier2 = makeAgent('verifier', 'Verifier B')

  return [
    // Phase: Start
    { delay: 0, action: () => ({ type: 'SET_PHASE', payload: 'running' }) },
    { delay: 50, action: () => sysMsg('SYSTEM', '오케스트라 파이프라인 초기화 완료. 에이전트 배포 시작.') },

    // CEO spawns first
    { delay: 300, action: () => ({ type: 'SPAWN_AGENT', payload: ceo }) },
    { delay: jitter(800), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: ceo.id, status: 'active', tokenRate: 120, latencyMs: 45 } }) },
    { delay: jitter(200), action: () => sysMsg(ceo.englishRole, '태스크 분석 중. 서브 에이전트 할당 계획 수립 시작.') },
    { delay: jitter(500), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: ceo.id, status: 'working', tokenRate: 156, latencyMs: 52 } }) },

    // Planners spawn
    { delay: jitter(1200), action: () => ({ type: 'SPAWN_AGENT', payload: planner1 }) },
    {
      delay: jitter(400),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${ceo.id}-${planner1.id}`, sourceId: ceo.id, targetId: planner1.id, status: 'normal', dataRate: 48 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${ceo.id}-${planner1.id}`, sourceId: ceo.id, targetId: planner1.id, type: 'communicates' } },
        msg(ceo, planner1, '워크플로우 파이프라인 A 기획 시작. 리소스 예산 256 토큰/s 배정.'),
      ],
    },
    { delay: jitter(600), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: planner1.id, status: 'active', tokenRate: 88, latencyMs: 120 } }) },
    { delay: jitter(200), action: () => msg(planner1, ceo, '수신 완료. 서브태스크 3개로 분해, 실행 에이전트 요청합니다.', 'result') },

    { delay: jitter(800), action: () => ({ type: 'SPAWN_AGENT', payload: planner2 }) },
    {
      delay: jitter(400),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${ceo.id}-${planner2.id}`, sourceId: ceo.id, targetId: planner2.id, status: 'normal', dataRate: 35 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${ceo.id}-${planner2.id}`, sourceId: ceo.id, targetId: planner2.id, type: 'communicates' } },
        msg(ceo, planner2, '워크플로우 파이프라인 B 병렬 처리 담당. 우선순위 HIGH.'),
      ],
    },
    { delay: jitter(600), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: planner2.id, status: 'working', tokenRate: 72, latencyMs: 95 } }) },

    // Planners working
    { delay: jitter(1000), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: planner1.id, status: 'working', tokenRate: 105, latencyMs: 89 } }) },
    { delay: jitter(100), action: () => msg(planner1, planner2, '실행 컨텍스트 동기화 요청. 공유 메모리 블록 #0x3F 접근 허용 요청.') },
    { delay: jitter(300), action: () => msg(planner2, planner1, '동기화 허용. 블록 #0x3F 읽기 권한 부여. 충돌 없음.', 'result') },

    // Executors spawn
    { delay: jitter(1500), action: () => ({ type: 'SPAWN_AGENT', payload: executor1 }) },
    {
      delay: jitter(300),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${planner1.id}-${executor1.id}`, sourceId: planner1.id, targetId: executor1.id, status: 'normal', dataRate: 62 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${planner1.id}-${executor1.id}`, sourceId: planner1.id, targetId: executor1.id, type: 'depends' } },
        msg(planner1, executor1, '서브태스크 #1 할당: 외부 데이터 수집 및 전처리. 데드라인 T+30s.'),
      ],
    },
    { delay: jitter(500), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: executor1.id, status: 'active', tokenRate: 48, latencyMs: 245 } }) },
    { delay: jitter(200), action: () => msg(executor1, planner1, '태스크 수신. 브라우저 도구 호출 준비 중...', 'result') },

    { delay: jitter(800), action: () => ({ type: 'SPAWN_AGENT', payload: executor2 }) },
    {
      delay: jitter(300),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${planner1.id}-${executor2.id}`, sourceId: planner1.id, targetId: executor2.id, status: 'normal', dataRate: 55 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${planner1.id}-${executor2.id}`, sourceId: planner1.id, targetId: executor2.id, type: 'depends' } },
        msg(planner1, executor2, '서브태스크 #2 할당: 파일시스템 검색 및 인덱싱. 병렬 실행 가능.'),
      ],
    },
    { delay: jitter(500), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: executor2.id, status: 'working', tokenRate: 92, latencyMs: 180 } }) },

    { delay: jitter(600), action: () => ({ type: 'SPAWN_AGENT', payload: executor3 }) },
    {
      delay: jitter(300),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${planner2.id}-${executor3.id}`, sourceId: planner2.id, targetId: executor3.id, status: 'normal', dataRate: 40 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${planner2.id}-${executor3.id}`, sourceId: planner2.id, targetId: executor3.id, type: 'depends' } },
        msg(planner2, executor3, '파이프라인 B 실행 담당. Git 저장소 변경사항 추적 및 커밋 로그 분석.'),
      ],
    },
    { delay: jitter(500), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: executor3.id, status: 'active', tokenRate: 65, latencyMs: 310 } }) },

    // Executors working messages
    { delay: jitter(800), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: executor1.id, status: 'working', tokenRate: 78, latencyMs: 198 } }) },
    { delay: jitter(100), action: () => msg(executor1, executor2, '데이터 수집 진행 중. 중간 결과 공유: URL 148개 크롤링 완료.') },
    { delay: jitter(500), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: executor3.id, status: 'working', tokenRate: 85, latencyMs: 267 } }) },
    { delay: jitter(200), action: () => msg(executor3, planner2, '커밋 분석 완료: 총 342건. 이상 패턴 2건 감지, 검증 에이전트 요청 필요.') },

    // Tools spawn
    { delay: jitter(1200), action: () => ({ type: 'SPAWN_AGENT', payload: tool1 }) },
    {
      delay: jitter(200),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${executor1.id}-${tool1.id}`, sourceId: executor1.id, targetId: tool1.id, status: 'normal', dataRate: 30 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${executor1.id}-${tool1.id}`, sourceId: executor1.id, targetId: tool1.id, type: 'uses' } },
        msg(executor1, tool1, 'fetch("https://api.target.com/v2/data") 호출 요청. timeout=8000ms.'),
      ],
    },
    { delay: jitter(400), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: tool1.id, status: 'working', tokenRate: 25, latencyMs: 450 } }) },
    { delay: jitter(300), action: () => msg(tool1, executor1, '응답 수신 완료. HTTP 200. payload 42KB, 파싱 중...', 'result') },

    { delay: jitter(600), action: () => ({ type: 'SPAWN_AGENT', payload: tool2 }) },
    {
      delay: jitter(200),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${executor2.id}-${tool2.id}`, sourceId: executor2.id, targetId: tool2.id, status: 'normal', dataRate: 42 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${executor2.id}-${tool2.id}`, sourceId: executor2.id, targetId: tool2.id, type: 'uses' } },
        msg(executor2, tool2, 'glob("**/*.ts", { cwd: "/workspace" }) 파일 스캔 요청.'),
      ],
    },
    { delay: jitter(400), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: tool2.id, status: 'working', tokenRate: 38, latencyMs: 320 } }) },
    { delay: jitter(300), action: () => msg(tool2, executor2, '파일 1,247개 발견. 변경 파일 38개 필터링 완료.', 'result') },

    { delay: jitter(500), action: () => ({ type: 'SPAWN_AGENT', payload: tool3 }) },
    {
      delay: jitter(200),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${executor3.id}-${tool3.id}`, sourceId: executor3.id, targetId: tool3.id, status: 'normal', dataRate: 28 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${executor3.id}-${tool3.id}`, sourceId: executor3.id, targetId: tool3.id, type: 'uses' } },
        msg(executor3, tool3, 'git log --since="7 days ago" --format=json 실행 요청.'),
      ],
    },
    { delay: jitter(400), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: tool3.id, status: 'active', tokenRate: 15, latencyMs: 180 } }) },

    { delay: jitter(400), action: () => ({ type: 'SPAWN_AGENT', payload: tool4 }) },
    {
      delay: jitter(200),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${executor3.id}-${tool4.id}`, sourceId: executor3.id, targetId: tool4.id, status: 'normal', dataRate: 35 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${executor3.id}-${tool4.id}`, sourceId: executor3.id, targetId: tool4.id, type: 'uses' } },
        msg(executor3, tool4, 'bash -c "npm run lint -- --format json" 실행 요청.'),
      ],
    },
    { delay: jitter(400), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: tool4.id, status: 'working', tokenRate: 22, latencyMs: 140 } }) },

    // Error scenario
    { delay: jitter(2000), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: executor2.id, status: 'error', tokenRate: 0, latencyMs: 890 } }) },
    { delay: jitter(100), action: () => msg(executor2, planner1, 'ERROR: LLM 응답 타임아웃 (890ms). 재시도 1/3 준비 중.', 'error') },
    { delay: jitter(200), action: () => msg(planner1, executor2, '재시도 승인. 컨텍스트 캐시 재사용, 토큰 예산 +64 추가 지원.') },
    { delay: jitter(1500), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: executor2.id, status: 'working', tokenRate: 45, latencyMs: 220 } }) },
    { delay: jitter(100), action: () => msg(executor2, planner1, '재시도 성공. 처리 재개 (latency 220ms).', 'result') },

    // Verifiers spawn
    { delay: jitter(2000), action: () => ({ type: 'SPAWN_AGENT', payload: verifier1 }) },
    {
      delay: jitter(300),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${tool1.id}-${verifier1.id}`, sourceId: tool1.id, targetId: verifier1.id, status: 'normal', dataRate: 52 } },
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${tool2.id}-${verifier1.id}`, sourceId: tool2.id, targetId: verifier1.id, status: 'normal', dataRate: 44 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${tool1.id}-${verifier1.id}`, sourceId: tool1.id, targetId: verifier1.id, type: 'depends' } },
        msg(tool1, verifier1, '데이터 검증 요청. 스키마 체크 + 무결성 해시 첨부.'),
      ],
    },
    { delay: jitter(500), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: verifier1.id, status: 'working', tokenRate: 95, latencyMs: 78 } }) },
    { delay: jitter(300), action: () => msg(verifier1, tool1, '검증 통과: 스키마 OK, 해시 일치, 이상값 없음.', 'result') },

    { delay: jitter(800), action: () => ({ type: 'SPAWN_AGENT', payload: verifier2 }) },
    {
      delay: jitter(300),
      action: () => [
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${tool3.id}-${verifier2.id}`, sourceId: tool3.id, targetId: verifier2.id, status: 'normal', dataRate: 38 } },
        { type: 'ADD_EXECUTION_EDGE', payload: { id: `e-${tool4.id}-${verifier2.id}`, sourceId: tool4.id, targetId: verifier2.id, status: 'normal', dataRate: 30 } },
        { type: 'ADD_DEPENDENCY_LINK', payload: { id: `d-${tool3.id}-${verifier2.id}`, sourceId: tool3.id, targetId: verifier2.id, type: 'depends' } },
        msg(tool3, verifier2, 'Git 커밋 무결성 검증 요청. 서명 확인 포함.'),
      ],
    },
    { delay: jitter(500), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: verifier2.id, status: 'working', tokenRate: 82, latencyMs: 95 } }) },
    { delay: jitter(400), action: () => msg(verifier2, executor3, '경고: 커밋 #a3f91b 서명 불일치. 수동 확인 권장.', 'error') },

    // Completion cascade
    { delay: jitter(3000), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: tool1.id } }) },
    { delay: jitter(100), action: () => msg(tool1, executor1, '모든 태스크 완료. 리소스 반환.', 'result') },
    { delay: jitter(500), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: tool2.id } }) },
    { delay: jitter(400), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: tool3.id } }) },
    { delay: jitter(300), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: tool4.id } }) },
    { delay: jitter(1000), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: verifier1.id } }) },
    { delay: jitter(200), action: () => msg(verifier1, planner1, '검증 파이프라인 완료. 최종 보고서 생성 중.', 'result') },
    { delay: jitter(500), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: verifier2.id } }) },
    { delay: jitter(800), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: executor1.id } }) },
    { delay: jitter(400), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: executor2.id } }) },
    { delay: jitter(300), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: executor3.id } }) },
    { delay: jitter(600), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: planner1.id } }) },
    { delay: jitter(200), action: () => msg(planner1, ceo, '파이프라인 A 완료. 총 처리 시간 기록 전송.', 'result') },
    { delay: jitter(300), action: () => ({ type: 'COMPLETE_AGENT', payload: { id: planner2.id } }) },
    { delay: jitter(500), action: () => ({ type: 'UPDATE_AGENT_STATUS', payload: { id: ceo.id, status: 'complete', tokenRate: 0, latencyMs: 0 } }) },
    { delay: jitter(100), action: () => sysMsg(ceo.englishRole, '모든 워크플로우 완료. 총 에이전트 12개, 메시지 교환 완료.') },

    // Phase complete
    { delay: jitter(1000), action: () => ({ type: 'SET_PHASE', payload: 'complete' }) },
    { delay: 100, action: () => sysMsg('SYSTEM', '파이프라인 종료. 다음 실행 대기 중...') },
  ]
}

export function useAgentSimulation(
  dispatch: React.Dispatch<OrchestraAction>
) {
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []
  }, [])

  const startSimulation = useCallback(() => {
    clearAllTimeouts()
    resetNamePool()
    dispatch({ type: 'RESET' })

    const steps = buildSimulationSteps()
    let cumulativeDelay = 0

    for (const step of steps) {
      cumulativeDelay += step.delay
      const timeout = setTimeout(() => {
        const result = step.action()
        if (Array.isArray(result)) {
          result.forEach((a) => dispatch(a))
        } else {
          dispatch(result)
        }
      }, cumulativeDelay)
      timeoutsRef.current = [...timeoutsRef.current, timeout]
    }
  }, [dispatch, clearAllTimeouts])

  const resetSimulation = useCallback(() => {
    clearAllTimeouts()
    resetNamePool()
    dispatch({ type: 'RESET' })
  }, [dispatch, clearAllTimeouts])

  return { startSimulation, resetSimulation }
}
