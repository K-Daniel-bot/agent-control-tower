# Agent Control Tower - Test Plan

> Last updated: 2026-03-05
> Current test coverage: 0% (테스트 없음)
> Target coverage: 80%+

---

## 1. 현재 상태 분석

### 테스트 인프라 부재
- 테스트 프레임워크 미설치 (jest, vitest, @testing-library 없음)
- 테스트 파일 0개
- CI/CD 파이프라인 없음

### 테스트 가능 영역 분류

| 영역 | 파일 수 | 테스트 가능성 | 우선순위 |
|------|---------|-------------|---------|
| API Routes | 19 | 높음 (순수 서버 로직) | P0 |
| Custom Hooks | 10 | 높음 (상태 로직) | P0 |
| Utility Functions | 3 | 높음 (순수 함수) | P0 |
| Type Definitions | 10 | 중간 (타입 검증) | P1 |
| Components | 100+ | 중간 (렌더링 테스트) | P2 |
| E2E Flows | N/A | 중간 (유저 시나리오) | P3 |

---

## 2. 테스트 프레임워크 설정

### 필요 패키지

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event jsdom
npm install -D msw  # API mocking
```

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/data/**', 'src/types/**'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

---

## 3. P0: API Route Tests (19 endpoints)

### 3.1 Agents API

```
src/app/api/agents/__tests__/
├── route.test.ts          # GET /api/agents
├── agents-id.test.ts      # GET /api/agents/[id]
├── save.test.ts           # POST /api/agents/save
├── metrics.test.ts        # GET /api/agents/metrics
├── events.test.ts         # GET /api/agents/events
├── stream.test.ts         # GET /api/agents/stream
└── notify.test.ts         # POST /api/agents/notify
```

#### Test Cases - `/api/agents`

```typescript
describe('GET /api/agents', () => {
  it('should return agent list with correct structure')
  it('should return empty array when no agents exist')
  it('should include id, name, status, model fields')
})
```

#### Test Cases - `/api/agents/save`

```typescript
describe('POST /api/agents/save', () => {
  it('should create agent markdown file in ~/.claude/agents/')
  it('should return file path in response')
  it('should include YAML frontmatter with description')
  it('should handle missing required fields with 400')
  it('should not overwrite existing agent files')
})
```

### 3.2 Server API

```
src/app/api/servers/__tests__/
├── status.test.ts         # GET /api/servers/status
├── start.test.ts          # POST /api/servers/start
├── stop.test.ts           # POST /api/servers/stop
└── health.test.ts         # GET /api/servers/health
```

#### Test Cases - `/api/servers/start`

```typescript
describe('POST /api/servers/start', () => {
  it('should spawn child process with given command')
  it('should return process PID')
  it('should handle invalid command with error')
  it('should reject commands with injection patterns')
  it('should set correct working directory')
})
```

### 3.3 News API

```
src/app/api/news/__tests__/
├── route.test.ts          # GET /api/news
├── analyze.test.ts        # POST /api/news/analyze
└── save.test.ts           # POST /api/news/save
```

#### Test Cases - `/api/news`

```typescript
describe('GET /api/news', () => {
  it('should return articles array')
  it('should include originalUrl for every article')
  it('should return valid category values')
  it('should include content field with text')
})
```

### 3.4 Voice API

```
src/app/api/voice/__tests__/
└── summarize.test.ts      # POST /api/voice/summarize
```

#### Test Cases - `/api/voice/summarize`

```typescript
describe('POST /api/voice/summarize', () => {
  it('should return summary, topics, actionItems, sentiment, duration')
  it('should extract topics from repeated keywords')
  it('should detect Korean question patterns as positive sentiment')
  it('should calculate duration from paragraph timestamps')
  it('should handle empty paragraphs array')
  it('should handle invalid request body with 500')
})
```

### 3.5 Memory API

```
src/app/api/memory/__tests__/
├── route.test.ts          # GET /api/memory
└── file.test.ts           # POST /api/memory/file
```

### 3.6 File System API

```
src/app/api/fs/__tests__/
├── route.test.ts          # GET /api/fs
└── install.test.ts        # POST /api/fs/install
```

---

## 4. P0: Custom Hook Tests

```
src/hooks/__tests__/
├── useProjectConfig.test.ts
├── useTerminalConfig.test.ts
├── useAgentSimulation.test.ts
├── useNocMetrics.test.ts
├── usePaneManager.test.ts
└── useAgentStorage.test.ts
```

### useProjectConfig

```typescript
describe('useProjectConfig', () => {
  it('should initialize with default config')
  it('should load saved config from localStorage')
  it('should persist config changes to localStorage')
  it('should handle SET_PROJECT action')
  it('should handle SET_ARCHITECTURE action')
  it('should handle SET_TOOLS action')
  it('should handle SET_LAYOUT action')
  it('should handle SET_PERMISSIONS action')
  it('should handle RESET action')
  it('should not persist on first render')
  it('should handle corrupted localStorage gracefully')
})
```

### useTerminalConfig

```typescript
describe('useTerminalConfig', () => {
  it('should initialize with DEFAULT_CONFIG')
  it('should dispatch SET_FONT_SIZE correctly')
  it('should dispatch SET_THEME correctly')
  it('should persist to localStorage on change')
  it('should merge with defaults on load (forward compatibility)')
})
```

---

## 5. P0: Utility Function Tests

```
src/utils/__tests__/
├── agentInference.test.ts
├── nocDataTransform.test.ts
└── splitTreeUtils.test.ts
```

### nocDataTransform

```typescript
describe('nocDataTransform', () => {
  it('should transform agent data to NOC panel format')
  it('should handle empty input arrays')
  it('should calculate correct percentages')
  it('should maintain immutability of input data')
})
```

### Voice Punctuation (VoiceRecorder 내부 함수)

```typescript
describe('addPunctuation', () => {
  it('should add period to normal sentence')
  it('should add question mark to Korean question pattern')
  it('should not add punctuation if already present')
  it('should handle empty string')
  it('should handle whitespace-only string')
  it('should detect ~인가요 pattern')
  it('should detect ~습니까 pattern')
})
```

---

## 6. P1: Component Render Tests

### 핵심 컴포넌트만 우선 테스트

```
src/components/__tests__/
├── customize/
│   ├── CustomizePage.test.tsx
│   ├── ProjectSettingsSection.test.tsx
│   └── PermissionsSection.test.tsx
├── voice/
│   ├── VoiceMeetingDashboard.test.tsx
│   └── NotesSidebar.test.tsx
├── server/
│   ├── ServerDashboard.test.tsx
│   └── AddServerModal.test.tsx
└── layout/
    └── Header.test.tsx
```

### CustomizePage

```typescript
describe('CustomizePage', () => {
  it('should render sidebar with 5 sections')
  it('should show ProjectSettings by default')
  it('should switch sections on sidebar click')
  it('should persist settings to localStorage')
})
```

### PermissionsSection

```typescript
describe('PermissionsSection', () => {
  it('should render empty state when no permissions')
  it('should add new permission entry')
  it('should remove permission entry')
  it('should change role via dropdown')
  it('should not add entry with empty name')
  it('should not add entry with empty email')
})
```

### NotesSidebar

```typescript
describe('NotesSidebar', () => {
  it('should render note list')
  it('should highlight active note')
  it('should show delete button on hover')
  it('should enter edit mode on double-click')
  it('should save on Enter key')
  it('should cancel on Escape key')
})
```

---

## 7. P2: Integration Tests

### API + UI 연동 테스트

```typescript
describe('Server Management Flow', () => {
  it('should fetch server status on mount')
  it('should start server and update status')
  it('should stop server and update status')
  it('should show error toast on start failure')
})

describe('Voice Meeting Flow', () => {
  it('should create new note')
  it('should record and display transcript')
  it('should summarize meeting via API')
  it('should persist notes to localStorage')
})

describe('Customize Settings Flow', () => {
  it('should save project root path')
  it('should toggle tool integration')
  it('should add permission entry')
  it('should persist all changes across page reload')
})
```

---

## 8. P3: E2E Tests (Playwright)

### Critical User Journeys

```
tests/e2e/
├── dashboard-navigation.spec.ts
├── server-management.spec.ts
├── voice-meeting.spec.ts
├── customize-settings.spec.ts
└── news-browsing.spec.ts
```

### Dashboard Navigation

```typescript
test('should navigate between all active tabs', async ({ page }) => {
  await page.goto('http://localhost:3000')

  // EMS (default)
  await expect(page.locator('[data-tab="dashboard"]')).toBeVisible()

  // Terminal
  await page.click('[title="TERMINAL"]')
  await expect(page.locator('.xterm')).toBeVisible()

  // Server
  await page.click('[title="SERVER"]')
  await expect(page.locator('text=서버 관리')).toBeVisible()

  // Customize
  await page.click('[title="CUSTOMIZE"]')
  await expect(page.locator('text=프로젝트 설정')).toBeVisible()

  // Voice (modal)
  await page.click('[title="보이스 회의"]')
  await expect(page.locator('text=Voice Meeting Dashboard')).toBeVisible()
})
```

---

## 9. Test Coverage Targets

| Phase | Target | Scope |
|-------|--------|-------|
| Phase 1 | 30% | API Routes + Hooks + Utils |
| Phase 2 | 50% | + Core Component Renders |
| Phase 3 | 70% | + Integration Tests |
| Phase 4 | 80% | + E2E Critical Paths |

### Coverage Exclusions

- `src/data/skills.ts` (static data)
- `src/data/mockData.ts` (mock data)
- `src/types/**` (type definitions)
- `src/components/noc/center/OfficeRoom.tsx` (3D rendering)
- Third-party integration wrappers (D3, ECharts, Three.js)

---

## 10. 실행 계획

```
Step 1: vitest + @testing-library 설치
Step 2: test setup 파일 생성 (localStorage mock 등)
Step 3: P0 API Route 테스트 작성 (19 endpoints)
Step 4: P0 Hook 테스트 작성 (6 hooks)
Step 5: P0 Utility 테스트 작성 (3 utils)
Step 6: npm run test 스크립트 추가
Step 7: 빌드 파이프라인에 테스트 통합
```

### package.json 스크립트 추가

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```
