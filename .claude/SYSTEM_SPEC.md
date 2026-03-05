# Agent Control Tower - System Specification

> Last updated: 2026-03-05
> Total codebase: 27,165 lines / ~120 files

---

## 1. System Overview

Agent Control Tower는 **Project AI Operations Platform**이다.
단순 대시보드가 아니라, 에이전트 + 프로젝트 + 자동화 + 지식을 통합 관리하는 운영 플랫폼.

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 15.1.0 |
| UI | React | 19.0.0 |
| Language | TypeScript | 5.x |
| Charts | ECharts | 6.0.0 |
| Graph Viz | D3.js | 7.9.0 |
| Flow Graph | @xyflow/react | 12.3.6 |
| 3D Rendering | Three.js + @react-three/fiber | 0.183.2 / 9.5.0 |
| Terminal | @xterm/xterm | 6.0.0 |
| WebSocket | ws | 8.19.0 |
| PTY | @homebridge/node-pty | 0.12.0 |
| Map Data | topojson-client + world-atlas | 3.1.0 / 2.0.2 |

### Theme

- Background: `#000000` (Pure Black)
- Borders: `#333333`
- Text Primary: `#e5e7eb`
- Text Secondary: `#9ca3af` / `#8b95a5`
- Accent: `#00ff88` (Green)
- Font: `'JetBrains Mono', 'Fira Code', monospace`

---

## 2. Tab Architecture (12 tabs)

| Tab Key | Label | Main Component | Status |
|---------|-------|---------------|--------|
| `dashboard` | EMS | TopologyMap → NocDashboard | Active |
| `terminal` | TERMINAL | TerminalDashboard | Active |
| `server` | SERVER | ServerDashboard | Active |
| `customize` | CUSTOMIZE | CustomizePage | Active (New) |
| `worldmap` | WORLDMAP | WorldMapDashboard | Active |
| `memory` | MEMORY | MemoryDashboard | Active |
| `logs` | LOGS | (미구현) | Placeholder |
| `news` | NEWS | NewsDashboard | Active |
| `automation` | AUTOMATION | (미구현) | Placeholder |
| `remote` | REMOTE | (미구현) | Placeholder |
| `settings` | SETTINGS | AgentSettingsPage | Active |
| `voice` | VOICE | VoiceMeetingDashboard (Modal) | Active |

### 미구현 탭: `logs`, `automation`, `remote`

---

## 3. Component Directory Structure

| Directory | Files | Lines | Entry Component |
|-----------|-------|-------|-----------------|
| `noc/` | 19 | 2,658 | NocDashboard.tsx |
| `news/` | 11 | 3,053 | NewsDashboard.tsx |
| `terminal/` | 10 | 2,940 | TerminalDashboard.tsx |
| `topology/` | 13 | 2,290 | TopologyMap.tsx |
| `voice/` | 9 | 1,995 | VoiceMeetingDashboard.tsx |
| `settings/` | 9 | 1,480 | AgentSettingsPage.tsx |
| `customize/` | 7 | 979 | CustomizePage.tsx |
| `worldmap/` | 6 | 1,228 | WorldMapDashboard.tsx |
| `server/` | 4 | 944 | ServerDashboard.tsx |
| `layout/` | 2 | 801 | Header.tsx |
| `memory/` | 5 | 573 | MemoryDashboard.tsx |
| `bottom/` | 2 | 463 | BottomPanel.tsx |
| `right/` | 2 | 276 | RightPanel.tsx |
| `left/` | 1 | 349 | LeftPanel.tsx |

---

## 4. API Routes (19 endpoints)

### Agents API

| Method | Path | Purpose | Frontend Consumers |
|--------|------|---------|-------------------|
| GET | `/api/agents` | 에이전트 목록 조회 | 7 (AgentStatusPanel, etc.) |
| GET | `/api/agents/[id]` | 단일 에이전트 조회 | 0 (orphan) |
| GET | `/api/agents/metrics` | 메트릭 데이터 | 3 |
| GET | `/api/agents/events` | 이벤트 스트림 | 1 |
| GET | `/api/agents/stream` | SSE 스트림 | 0 (orphan) |
| POST | `/api/agents/save` | 에이전트 저장 (.md) | 2 |
| POST | `/api/agents/notify` | 알림 전송 | 0 (orphan) |

### Server API

| Method | Path | Purpose | Frontend Consumers |
|--------|------|---------|-------------------|
| GET | `/api/servers/status` | 서버 상태 조회 | 2 |
| POST | `/api/servers/start` | 서버 시작 | 2 |
| POST | `/api/servers/stop` | 서버 중지 | 2 |
| GET | `/api/servers/health` | 헬스체크 | 1 |

### File System API

| Method | Path | Purpose | Frontend Consumers |
|--------|------|---------|-------------------|
| GET | `/api/fs` | 디렉토리 목록 | 4 |
| POST | `/api/fs/install` | 패키지 설치 | 1 |

### News API

| Method | Path | Purpose | Frontend Consumers |
|--------|------|---------|-------------------|
| GET | `/api/news` | 뉴스 기사 조회 | 3 |
| POST | `/api/news/analyze` | AI 뉴스 분석 | 0 (orphan) |
| POST | `/api/news/save` | 기사 저장 | 2 |

### Memory API

| Method | Path | Purpose | Frontend Consumers |
|--------|------|---------|-------------------|
| GET | `/api/memory` | 메모리 조회 | 2 |
| POST | `/api/memory/file` | 파일 읽기 | 1 |

### Voice API

| Method | Path | Purpose | Frontend Consumers |
|--------|------|---------|-------------------|
| POST | `/api/voice/summarize` | 회의 요약 분석 | 1 |

### Orphan APIs (프론트엔드 미연결)
- `/api/agents/[id]` - 단일 에이전트 조회 (사용처 없음)
- `/api/agents/stream` - SSE 스트림 (사용처 없음)
- `/api/agents/notify` - 알림 전송 (사용처 없음)
- `/api/news/analyze` - AI 분석 (사용처 없음)

---

## 5. State Management

### Global State
- **AgentOrchestraContext** (`src/context/AgentOrchestraContext.tsx`)
  - useReducer 기반
  - 에이전트 상태, 디스패치 관리
  - TopologyMap에서 Provider wrapping

### localStorage Persistence

| Key | Purpose | Component |
|-----|---------|-----------|
| `act-terminal-config` | 터미널 설정 | useTerminalConfig hook |
| `act-project-config` | 프로젝트 설정 | useProjectConfig hook |
| `act-voice-notes` | 회의 노트 | VoiceMeetingDashboard |
| `act-notes` | AI 노트 | AINotesPanel |
| `act-project-dir` | 프로젝트 경로 | TerminalDashboard, ServerDashboard |

### Custom Hooks (10개)

| Hook | Purpose | Lines |
|------|---------|-------|
| `useAgentSimulation` | 에이전트 시뮬레이션 데이터 | 306 |
| `useAgentSSE` | Server-Sent Events | 95 |
| `useAgentStorage` | 에이전트 저장 | 42 |
| `useCytoscapeElements` | Cytoscape 그래프 요소 | 140 |
| `useExecutionFlowLayout` | 실행 흐름 레이아웃 | 169 |
| `useIsometricLayout` | 아이소메트릭 좌표 | 59 |
| `useNocMetrics` | NOC 메트릭 데이터 | 84 |
| `usePaneManager` | 패널 분할 관리 | 98 |
| `useProjectConfig` | 프로젝트 설정 (new) | 109 |
| `useTerminalConfig` | 터미널 설정 | 70 |

---

## 6. Data Files

| File | Lines | Purpose |
|------|-------|---------|
| `src/data/skills.ts` | 1,451 | 스킬 목록 데이터 |
| `src/data/mockData.ts` | 556 | Mock 에이전트/이벤트 데이터 |
| `src/data/agentSettingsData.ts` | 204 | 설정 패널 데이터 |
| `src/data/terminalThemes.ts` | 125 | 터미널 테마 데이터 |
| `src/data/koreanNamePool.ts` | 91 | 한국어 이름 풀 |
| `src/data/infraNodeFeatures.ts` | 75 | 인프라 노드 기능 |

---

## 7. Type Definitions

| File | Lines | Purpose |
|------|-------|---------|
| `src/types/index.ts` | 145 | 에이전트 코어 타입 |
| `src/types/topology.ts` | 112 | 토폴로지 맵 타입 |
| `src/types/news.ts` | 97 | 뉴스 관련 타입 |
| `src/types/terminal.ts` | 83 | 터미널 설정 타입 |
| `src/types/customize.ts` | 60 | 프로젝트 설정 타입 |
| `src/types/worldmap.ts` | 53 | 월드맵 타입 |
| `src/types/memory.ts` | 42 | 메모리 타입 |
| `src/types/server.ts` | 34 | 서버 관련 타입 |
| `src/types/agent.ts` | 25 | 저장 에이전트 타입 |
| `src/types/voice.ts` | 21 | 음성 회의 타입 |

---

## 8. External Dependencies Flow

```
Browser → Next.js App Router → API Routes → File System (fs, child_process)
                                           → External Fetch (health checks)
                                           → node-pty (terminal sessions)
```

- **외부 API 호출 없음** (모든 데이터는 로컬 생성 또는 mock)
- **데이터베이스 없음** (localStorage + 파일시스템만 사용)
- **인증 없음** (모든 API 공개)

---

## 9. Data Persistence Tiers

| Tier | Storage | Data | Lifetime |
|------|---------|------|----------|
| In-Memory | agentSettingsData.ts | 에이전트 런타임 상태, 메트릭, 이벤트 | 세션 종료 시 소멸 |
| localStorage | Browser | 서버 설정, 프로젝트 경로, 노트, 터미널 설정 | 영구 (브라우저 기반) |
| File System | ~/.claude/ | 에이전트 마크다운, 스킬, 뉴스 분석, 저장 기사 | 영구 (디스크) |

### localStorage Key Registry

| Key | Component | Data |
|-----|-----------|------|
| `act-terminal-config` | useTerminalConfig | 터미널 테마/폰트/커서 설정 |
| `act-project-config` | useProjectConfig | 프로젝트 Root/환경/아키텍처 설정 |
| `act-voice-notes` | VoiceMeetingDashboard | 회의 노트 (제목, 문단, 참여자) |
| `act-notes` | AINotesPanel | AI 노트 텍스트 |
| `act-project-dir` | TerminalDashboard, ServerDashboard | 프로젝트 디렉토리 경로 |
| `act-saved-agents` | useAgentStorage | 생성된 에이전트 목록 |
| `agent-control-tower-servers` | ServerDashboard | 사용자 정의 서버 목록 |

### File System Paths

| Path | Purpose |
|------|---------|
| `~/.claude/agents/{id}.md` | 에이전트 마크다운 파일 |
| `~/.claude/skills/{id}/` | 설치된 스킬 파일 |
| `~/.claude/news-analysis/` | 뉴스 분석 결과 |
| `~/.claude/saved-news.json` | 저장된 기사 |
| `~/.claude/projects/*/memory/` | 프로젝트별 메모리 |
| `~/.claude/work-log/buffer.jsonl` | 세션 작업 로그 |

---

## 10. SSE (Server-Sent Events) Architecture

```
POST /api/agents/notify → agentEventBus.broadcast() → SSE listeners
                                                         ↓
GET /api/agents/stream  ← EventSource ← useAgentSSE hook
                                         ↓
                              AgentOrchestraContext dispatch
                              (SPAWN, UPDATE, COMPLETE, REMOVE, MESSAGE)
```

- Heartbeat: 15초 간격
- 최대 메시지 큐: 120개
- In-memory listener set 관리

---

## 11. OrchestraContext State Schema

```typescript
interface OrchestraState {
  agents: AgentState[]              // 런타임 에이전트 인스턴스
  executionEdges: ExecutionEdge[]    // 에이전트 간 연결
  dependencyLinks: DependencyLink[] // 도구 의존성
  messages: AgentMessage[]          // 대화 로그 (max 120)
  phase: 'idle' | 'running'        // 워크플로우 상태
}

// 9 Action Types:
// SPAWN_AGENT, UPDATE_AGENT_STATUS, COMPLETE_AGENT, REMOVE_AGENT
// ADD_EXECUTION_EDGE, ADD_DEPENDENCY_LINK, ADD_AGENT_MESSAGE
// SET_PHASE, RESET
```

---

## 12. Build Configuration

- `next.config.ts` - 기본 설정 (DO NOT MODIFY)
- `tsconfig.json` - TypeScript strict mode
- SSR disabled on all heavy components (dynamic import with ssr: false)
- Git LFS for 3D model assets

---

## 13. Code Quality Metrics

| Metric | Value | Target |
|--------|-------|--------|
| Total Lines | 27,165 | - |
| Files > 400 lines | 19 | 0 (800 max) |
| Files > 800 lines | 1 (skills.ts 1,451) | 0 |
| `any` type usage | 8 | 0 |
| Test coverage | 0% | 80% |
| Orphan API routes | 4 | 0 |
| Input validation (Zod) | 0 routes | All API routes |
| dangerouslySetInnerHTML | 1 (safe) | - |
| Mutation violations | 1 (useAgentSimulation) | 0 |
| Console statements | 9 (all console.error) | Acceptable |
