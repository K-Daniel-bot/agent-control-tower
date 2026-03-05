# Agent Control Tower - Refactoring Plan

> Last updated: 2026-03-05
> Priority: CRITICAL > HIGH > MEDIUM > LOW

---

## CRITICAL: 파일 크기 위반 (800줄 초과)

| File | Lines | Action |
|------|-------|--------|
| `src/data/skills.ts` | 1,451 | 카테고리별 분할 (5개 파일) |
| `src/components/news/ArticleDetailPopup.tsx` | 612 | 하위 컴포넌트 추출 |
| `src/components/voice/VoiceMeetingDashboard.tsx` | 571 | 툴바/상태 관리 분리 |
| `src/data/mockData.ts` | 556 | 도메인별 분할 |

### 1.1 skills.ts 분할

```
src/data/skills.ts (1,451 lines)
→ src/data/skills/index.ts (export 통합)
→ src/data/skills/development.ts
→ src/data/skills/testing.ts
→ src/data/skills/security.ts
→ src/data/skills/automation.ts
→ src/data/skills/documentation.ts
```

### 1.2 ArticleDetailPopup 분할

```
src/components/news/ArticleDetailPopup.tsx (612 lines)
→ ArticleDetailPopup.tsx (메인 모달 컨테이너, ~150줄)
→ ArticleHeader.tsx (제목, 날짜, 카테고리)
→ ArticleContent.tsx (본문 렌더링)
→ ArticleSourceInfo.tsx (원본 기사 출처 패널)
→ ArticleActions.tsx (저장, 공유 버튼)
```

### 1.3 VoiceMeetingDashboard 분할

```
src/components/voice/VoiceMeetingDashboard.tsx (571 lines)
→ VoiceMeetingDashboard.tsx (레이아웃, ~120줄)
→ useVoiceMeeting.ts (상태 관리 커스텀 훅, ~180줄)
→ VoiceToolbar.tsx (상단 버튼 바, ~100줄)
→ VoiceEmptyState.tsx (빈 상태 UI, ~50줄)
```

---

## CRITICAL: Orphan API Routes

프론트엔드에서 사용하지 않는 API 4개. 연동하거나 삭제해야 함.

| Route | Lines | Action |
|-------|-------|--------|
| `/api/agents/[id]` | 38 | Settings 탭에서 에이전트 상세 조회 연동 |
| `/api/agents/stream` | 50 | NOC 대시보드 실시간 스트림 연동 또는 삭제 |
| `/api/agents/notify` | 42 | Automation 탭 구현 시 연동 |
| `/api/news/analyze` | 85 | News 탭 AI 분석 기능 연동 |

---

## HIGH: 파일 크기 주의 (400~800줄)

리팩토링 우선순위 높음. 다음 수정 시 분리 검토 필수.

| File | Lines | Risk |
|------|-------|------|
| `Header.tsx` | 482 | TABS 배열이 300줄 차지, 별도 파일로 분리 |
| `NoteGraphPanel.tsx` | 471 | D3 로직 + UI 혼합 |
| `EventStreamPanel.tsx` | 453 | 데이터 처리 + 렌더링 혼합 |
| `AgentCreatePanel.tsx` | 434 | 폼 + 저장 로직 분리 필요 |
| `VideoPlayer.tsx` | 433 | 플레이어 + 컨트롤 분리 |
| `AINotesPanel.tsx` | 425 | 에디터 + 목록 분리 |
| `AgentRegistryPanel.tsx` | 425 | 테이블 + 필터 분리 |
| `OfficeRoom.tsx` | 420 | 3D 모델 로딩 + 렌더링 분리 |
| `AgentInfraMap.tsx` | 410 | Cytoscape 설정 분리 |

### Header.tsx 분할 제안

```
src/components/layout/Header.tsx (482 lines)
→ Header.tsx (레이아웃, ~120줄)
→ HeaderTabs.tsx (TABS 배열 + 아이콘 SVG, ~280줄)
→ HeaderUtilButtons.tsx (우측 유틸리티 버튼, ~80줄)
```

---

## HIGH: Type Safety 개선

### any 타입 사용 (8건)

| File | Line | Context | Fix |
|------|------|---------|-----|
| `MetricsChart.tsx` | 81 | ECharts formatter | `EChartsOption` 타입 사용 |
| `NewsWorldMap.tsx` | 106,108,112,118,122 | D3 TopoJSON | proper GeoJSON 타입 정의 |
| `VoiceRecorder.tsx` | 63 | SpeechRecognition | global type 선언 |
| `OfficeRoom.tsx` | 289 | Three.js traverse | `Object3D` 타입 사용 |

### 수정 예시 (VoiceRecorder)

```typescript
// Before
const recognition = new (SpeechRecognition as any)()

// After (src/types/speech.d.ts 추가)
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
}
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}
```

---

## MEDIUM: 중복 스타일 패턴

### 반복되는 인라인 스타일 객체

다음 스타일이 10개 이상 컴포넌트에서 중복 사용됨:

```typescript
// 이 패턴이 최소 6곳에서 반복
const inputStyle: React.CSSProperties = {
  padding: '8px 12px',
  background: '#0a0a0a',
  border: '1px solid #333',
  borderRadius: 4,
  color: '#e5e7eb',
  fontSize: 13,
  fontFamily: "'JetBrains Mono', monospace",
  outline: 'none',
}
```

### 개선 방안

```
src/styles/commonStyles.ts (신규)
→ inputStyle, labelStyle, buttonStyle, cardStyle
→ 각 컴포넌트에서 import하여 사용
→ 테마 토큰도 여기서 중앙 관리
```

---

## MEDIUM: Console 문 정리

| File | Type | Action |
|------|------|--------|
| `layout.tsx:36-37` | console.error 가로채기 | 유지 (의도적) |
| `voice/summarize/route.ts:134` | console.error | 유지 (API 에러 로깅) |
| `servers/page.tsx:42,57,69` | console.error | 유지 (서버 에러 로깅) |
| `GitRepoModal.tsx:46` | console.error | 유지 (에러 핸들링) |
| `ServerDashboard.tsx:101,115` | console.error | 유지 (에러 핸들링) |
| `VoiceMeetingDashboard.tsx:300` | console.error | 유지 (에러 핸들링) |
| `VoiceRecorder.tsx:105` | console.error | 유지 (Speech API 에러) |
| `OfficeRoom.tsx:25` | console.warn | 유지 (3D 에러 바운더리) |
| `skills.ts:1025` | grep 명령어 결과 | 삭제 (데이터에 섞인 shell 출력) |

---

## MEDIUM: Mutation 패턴

API route에서 `.push()` 사용 7건 - 서버사이드이므로 허용되나, 가능하면 불변 패턴으로 전환.

| File | Line | Pattern | Severity |
|------|------|---------|----------|
| `memory/route.ts` | 65,163 | results.push, projects.push | Low (API) |
| `news/route.ts` | 320 | articles.push | Low (API) |
| `voice/summarize/route.ts` | 58 | items.push | Low (API) |
| `DependencyGraphSection.tsx` | 62 | links.push | Medium (Component) |
| `NoteGraphPanel.tsx` | 228,251,272 | nodes.push, edges.push | Medium (Component) |

### DependencyGraphSection 수정 예시

```typescript
// Before
const links: Link[] = []
data.forEach(d => { links.push({ ... }) })

// After
const links = data.map(d => ({ ... }))
```

---

## MEDIUM: dangerouslySetInnerHTML

- `src/app/layout.tsx:34` - console.error 인터셉터 스크립트
- **Risk**: Low (하드코딩된 스크립트, 사용자 입력 아님)
- **Action**: 유지하되 주석 추가

---

## CRITICAL: Input Validation 부재

모든 API route에서 Zod 스키마 검증 없이 `as` 타입 단언만 사용 중.

| Route | 현재 | 위험도 |
|-------|------|--------|
| `/api/agents/save` | `await request.json() as AgentSaveBody` | HIGH |
| `/api/voice/summarize` | `await request.json() as SummarizeRequest` | HIGH |
| `/api/news/save` | `JSON.parse(content) as unknown[]` | HIGH |
| `/api/servers/start` | `await request.json()` no type | MEDIUM |
| `/api/servers/stop` | `await request.json()` no type | MEDIUM |
| `/api/fs/install` | `await request.json()` no type | MEDIUM |

### 수정 방법

```bash
npm install zod
```

```typescript
// Before
const body = await request.json() as AgentSaveBody

// After
import { z } from 'zod'

const AgentSaveSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  rank: z.string(),
  roleType: z.string(),
  description: z.string(),
  skills: z.array(z.string()),
})

const body = AgentSaveSchema.parse(await request.json())
```

---

## HIGH: 중복 유틸리티 함수

### 시간 포맷 함수 중복 (3곳)

```
ArticleDetailPopup.tsx → getTimeAgo()
EventStreamPanel.tsx   → timeAgo()
NotesSidebar.tsx       → formatDate()
```

**Action**: `src/utils/dateUtils.ts` 생성 → 통합

### 라벨/상수 매핑 중복 (5곳)

```
ArticleDetailPopup.tsx → SEVERITY_LABELS, SENTIMENT_LABELS
EventStreamPanel.tsx   → 같은 패턴
FinancialPanel.tsx     → 같은 패턴
```

**Action**: `src/constants/labelMaps.ts` 생성 → 통합

---

## HIGH: Mutation 수정 필수

| File | Line | Pattern | Action |
|------|------|---------|--------|
| `useAgentSimulation.ts` | 63 | `usedNames.push(identity.koreanName)` | 파라미터 mutation - 반드시 수정 |

```typescript
// Before (WRONG: 파라미터 mutation)
function makeAgent(usedNames: string[]) {
  usedNames.push(identity.koreanName)  // MUTATION!
}

// After (CORRECT: 새 배열 반환)
function makeAgent(usedNames: readonly string[]): { agent: Agent, updatedNames: readonly string[] } {
  return {
    agent,
    updatedNames: [...usedNames, identity.koreanName]
  }
}
```

---

## LOW: 미구현 탭 정리

3개 탭이 Header에 존재하지만 콘텐츠가 없음:

| Tab | Priority | Plan |
|-----|----------|------|
| `logs` | High | LOGS 탭 구현 (Agent/System/Event 로그 뷰어) |
| `automation` | High | AUTOMATION 탭 구현 (워크플로우 엔진) |
| `remote` | Medium | REMOTE 탭 구현 (원격 접속/관리) |

---

## LOW: localStorage 키 네이밍 통일

현재 키 패턴이 일관성 없음:

| Current | Suggested |
|---------|-----------|
| `act-terminal-config` | `act-terminal-config` ✓ |
| `act-project-config` | `act-project-config` ✓ |
| `act-voice-notes` | `act-voice-notes` ✓ |
| `act-notes` | `act-terminal-notes` (충돌 방지) |
| `act-project-dir` | `act-project-dir` ✓ |

---

## 리팩토링 실행 순서

```
Phase 1 (즉시): CRITICAL 파일 분할 + Orphan API 정리
Phase 2 (단기): HIGH 파일 분할 + Type Safety
Phase 3 (중기): MEDIUM 스타일 통합 + Mutation 수정
Phase 4 (장기): LOW 미구현 탭 + 키 네이밍
```
