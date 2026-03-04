export interface Skill {
  readonly id: string
  readonly name: string
  readonly nameKo: string
  readonly description: string
  readonly detailedDescription: string
  readonly category: 'ai' | 'devops' | 'dev' | 'cloud' | 'shell' | 'monitor'
  readonly icon: string
  readonly command: string
  readonly tags: readonly string[]
}

export const SKILLS: readonly Skill[] = [
  // ─── AI / Claude 전용 ────────────────────────────────────────────────────────
  {
    id: 'claude-code',
    name: 'Claude Code',
    nameKo: 'AI 코딩 어시스턴트',
    description: '코드 생성, 리팩토링, 디버깅, PR 리뷰를 AI가 자동 처리합니다',
    detailedDescription: `Claude Code는 Anthropic의 Claude AI를 터미널에서 직접 활용하는 코딩 어시스턴트입니다.

주요 기능:
• 자연어로 코드 작성 요청 → 즉시 구현
• 기존 코드 리팩토링 및 최적화 제안
• 버그 원인 분석 및 수정 코드 생성
• PR 리뷰 및 코드 품질 평가
• 테스트 코드 자동 생성

사용법:
- 프로젝트 루트에서 실행하면 CLAUDE.md를 자동 인식
- /plan 명령으로 대규모 작업 전 계획 수립
- /compact 으로 컨텍스트 압축 후 재개

주의: CLAUDECODE 환경변수 제거 후 실행해야 중첩 실행 문제 방지`,
    category: 'ai',
    icon: '🤖',
    command: 'env -u CLAUDECODE claude',
    tags: ['Claude', 'AI', '코딩', '자동화'],
  },
  {
    id: 'claude-review',
    name: 'Claude 코드 리뷰',
    nameKo: 'AI 코드 품질 검사',
    description: '변경된 코드를 Claude가 보안·품질·패턴 관점에서 자동 리뷰합니다',
    detailedDescription: `git diff로 변경사항을 수집하여 Claude에게 전달하는 코드 리뷰 워크플로우입니다.

검토 항목:
• 보안 취약점 (OWASP Top 10, SQL Injection, XSS 등)
• 코드 품질 (가독성, 중복, 복잡도)
• 아키텍처 패턴 준수 여부
• 테스트 커버리지 검토
• 성능 병목 가능성

출력 형식:
CRITICAL / HIGH / MEDIUM / LOW 등급별 분류
각 이슈에 수정 제안 코드 포함`,
    category: 'ai',
    icon: '🔍',
    command: 'git diff HEAD | env -u CLAUDECODE claude --print "다음 변경사항을 보안, 품질, 패턴 관점에서 리뷰해줘:"',
    tags: ['Claude', '코드리뷰', '보안', '품질'],
  },
  {
    id: 'claude-debug',
    name: 'Claude 디버깅',
    nameKo: 'AI 버그 원인 분석',
    description: '에러 로그를 Claude에게 전달하여 근본 원인과 수정법을 즉시 분석합니다',
    detailedDescription: `에러 메시지와 스택 트레이스를 Claude가 분석하여 근본 원인을 찾아줍니다.

분석 방식:
• 스택 트레이스에서 실제 오류 발생 위치 추적
• 관련 파일 및 함수 연결 관계 파악
• 동일 패턴의 알려진 버그와 비교

지원 오류 유형:
- Runtime Error, Promise rejection, TypeScript 타입 불일치
- Network / API 오류 (CORS, 401, 500 등)
- Memory leak 패턴

활용 팁: 에러 메시지를 클립보드에 복사 후 "이 에러 분석해줘"로 시작`,
    category: 'ai',
    icon: '🐛',
    command: 'env -u CLAUDECODE claude --print "다음 에러를 분석하고 수정 방법을 제안해줘:"',
    tags: ['Claude', '디버깅', '에러분석'],
  },
  {
    id: 'claude-arch',
    name: 'Claude 아키텍처 설계',
    nameKo: 'AI 시스템 설계 자문',
    description: '새 기능이나 시스템 설계를 Claude와 함께 아키텍처 레벨에서 논의합니다',
    detailedDescription: `복잡한 기능 구현 전 Claude와 아키텍처를 먼저 설계하는 워크플로우입니다.

설계 범위:
• 컴포넌트 분리 방식 (단일 책임 원칙)
• 데이터 흐름 및 상태 관리 전략
• API 인터페이스 설계
• 확장성 고려사항

산출물:
- 컴포넌트 다이어그램 (Mermaid)
- 파일 구조 제안
- 인터페이스 정의 코드
- 구현 우선순위 로드맵`,
    category: 'ai',
    icon: '🏗',
    command: 'env -u CLAUDECODE claude --print "다음 기능의 아키텍처를 설계해줘. 컴포넌트 분리, 데이터 흐름, 확장성을 고려해서:"',
    tags: ['Claude', '아키텍처', '설계'],
  },
  {
    id: 'claude-test-gen',
    name: 'Claude 테스트 생성',
    nameKo: 'AI 테스트 코드 작성',
    description: '소스 코드를 분석하여 Claude가 단위/통합 테스트 코드를 자동 생성합니다',
    detailedDescription: `기존 코드를 분석하여 포괄적인 테스트 스위트를 자동 생성합니다.

생성 가능한 테스트:
• 단위 테스트 (Jest, Vitest, pytest)
• 통합 테스트 (API 엔드포인트, DB 연동)
• E2E 테스트 (Playwright, Cypress)

커버리지 전략:
- Happy path, Error path, Edge cases
- Async/await 처리, Mock/stub 설정

목표: 80% 이상 코드 커버리지 달성`,
    category: 'ai',
    icon: '🧪',
    command: 'env -u CLAUDECODE claude --print "다음 코드에 대한 포괄적인 테스트 코드를 Jest 형식으로 작성해줘:"',
    tags: ['Claude', '테스트', 'TDD', 'Jest'],
  },
  {
    id: 'claude-docs',
    name: 'Claude 문서 생성',
    nameKo: 'AI 기술 문서 자동화',
    description: 'README, API 문서, 주석을 Claude가 코드에서 자동으로 생성합니다',
    detailedDescription: `코드를 분석하여 개발자와 사용자 모두를 위한 문서를 자동 생성합니다.

생성 문서 유형:
• README.md (프로젝트 소개, 설치, 사용법)
• API 문서 (엔드포인트, 파라미터, 응답 예시)
• JSDoc / TSDoc 주석
• 아키텍처 결정 기록 (ADR)

문서 품질:
- 코드 예시 포함, 한국어/영어 지원
- Markdown 형식, Mermaid 다이어그램 포함`,
    category: 'ai',
    icon: '📝',
    command: 'env -u CLAUDECODE claude --print "다음 코드에 대한 JSDoc 주석과 README 문서를 작성해줘:"',
    tags: ['Claude', '문서', 'README', 'JSDoc'],
  },
  {
    id: 'claude-refactor',
    name: 'Claude 리팩토링',
    nameKo: 'AI 코드 구조 개선',
    description: '레거시 코드를 Claude가 현대적 패턴과 원칙에 맞게 자동 리팩토링합니다',
    detailedDescription: `기존 코드를 클린 코드 원칙에 따라 자동으로 개선합니다.

리팩토링 원칙:
• SOLID 원칙 적용
• DRY (Don't Repeat Yourself) 중복 제거
• 함수 분리 (50줄 이하 유지)
• 불변성 패턴 적용

개선 항목:
- 긴 함수 → 작은 함수들로 분리
- 중첩 콜백 → async/await
- any 타입 → 구체적 타입 정의
- 매직 넘버 → 상수로 추출`,
    category: 'ai',
    icon: '♻️',
    command: 'env -u CLAUDECODE claude --print "다음 코드를 클린 코드 원칙(SOLID, DRY, 불변성)에 따라 리팩토링해줘:"',
    tags: ['Claude', '리팩토링', 'CleanCode'],
  },
  {
    id: 'claude-security',
    name: 'Claude 보안 분석',
    nameKo: 'AI 보안 취약점 스캔',
    description: 'Claude가 코드의 OWASP Top 10 취약점과 보안 이슈를 자동 분석합니다',
    detailedDescription: `코드베이스의 보안 취약점을 AI가 체계적으로 분석합니다.

분석 프레임워크:
• OWASP Top 10 (2021 기준)
• STRIDE 위협 모델링
• CWE (Common Weakness Enumeration)

주요 검사 항목:
- SQL/NoSQL Injection, XSS, CSRF
- 인증/인가 로직 오류
- 민감 정보 노출 (API 키 하드코딩)
- IDOR, 의존성 취약점

출력 형식:
CRITICAL / HIGH / MEDIUM / LOW 등급별 분류 + 수정 코드`,
    category: 'ai',
    icon: '🛡',
    command: 'env -u CLAUDECODE claude --print "다음 코드의 OWASP Top 10 보안 취약점을 분석하고 등급별로 분류해줘:"',
    tags: ['Claude', '보안', 'OWASP', '취약점'],
  },
  {
    id: 'claude-perf',
    name: 'Claude 성능 최적화',
    nameKo: 'AI 퍼포먼스 튜닝',
    description: '코드의 성능 병목을 Claude가 찾아 최적화 방안을 제시합니다',
    detailedDescription: `성능 문제를 체계적으로 분석하고 최적화 전략을 제시합니다.

분석 영역:
• 알고리즘 복잡도 (Big-O 분석)
• 데이터베이스 쿼리 최적화
• 메모리 사용량 및 누수 패턴
• React memoization 기회
• 비동기 처리 패턴 (병렬 vs 순차)

최적화 기법:
- N+1 쿼리 해결, 캐싱 전략 (Redis)
- 지연 로딩, Web Worker 분리
- 인덱스 추가 및 쿼리 플랜 분석`,
    category: 'ai',
    icon: '⚡',
    command: 'env -u CLAUDECODE claude --print "다음 코드의 성능 병목을 분석하고 최적화 방안을 제시해줘:"',
    tags: ['Claude', '성능', '최적화', 'BigO'],
  },
  {
    id: 'claude-api-design',
    name: 'Claude API 설계',
    nameKo: 'AI REST/GraphQL 설계',
    description: 'Claude와 함께 RESTful API 또는 GraphQL 스키마를 설계합니다',
    detailedDescription: `확장 가능하고 일관성 있는 API 인터페이스를 설계합니다.

설계 원칙:
• RESTful 네이밍 컨벤션
• HTTP 메서드 적절한 활용
• 상태 코드 표준화
• 버전 관리 전략, 페이지네이션

포함 산출물:
- OpenAPI 3.0 스펙 (YAML)
- 요청/응답 DTO 타입 정의
- 에러 응답 표준화
- 인증 흐름 (JWT Bearer, OAuth2)`,
    category: 'ai',
    icon: '🔌',
    command: 'env -u CLAUDECODE claude --print "다음 요구사항에 맞는 RESTful API 엔드포인트와 OpenAPI 스펙을 설계해줘:"',
    tags: ['Claude', 'API', 'REST', 'GraphQL'],
  },
  {
    id: 'claude-pr-review',
    name: 'Claude PR 리뷰',
    nameKo: 'AI Pull Request 검토',
    description: 'Claude가 PR의 변경사항을 자동 리뷰하고 머지 전 이슈를 사전 발견합니다',
    detailedDescription: `Pull Request 머지 전 자동화된 코드 리뷰를 수행합니다.

리뷰 관점:
• 기능 요구사항 충족 여부
• 코드 스타일 일관성
• 테스트 충분성 및 리그레션 위험도
• 보안 위험 요소

출력 형식:
✅ 승인 / ⚠️ 조건부 승인 / ❌ 변경 요청
각 파일별 인라인 코멘트 스타일`,
    category: 'ai',
    icon: '👀',
    command: 'git diff main...HEAD | env -u CLAUDECODE claude --print "이 PR 변경사항을 리뷰해줘:"',
    tags: ['Claude', 'PR', '코드리뷰', 'Git'],
  },
  {
    id: 'claude-sql',
    name: 'Claude SQL 최적화',
    nameKo: 'AI 쿼리 튜닝',
    description: 'Claude가 느린 SQL 쿼리를 분석하고 인덱스 전략과 최적화 쿼리를 제시합니다',
    detailedDescription: `데이터베이스 쿼리 성능을 AI가 체계적으로 최적화합니다.

분석 항목:
• EXPLAIN ANALYZE 결과 해석
• N+1 쿼리 패턴 감지
• JOIN 순서 최적화, 서브쿼리 vs CTE

최적화 기법:
- 복합 인덱스 설계 (카디널리티 고려)
- Covering Index로 힙 액세스 제거
- Partial Index로 조건부 인덱싱

지원 DB: PostgreSQL, MySQL, SQLite, MongoDB`,
    category: 'ai',
    icon: '🗃',
    command: 'env -u CLAUDECODE claude --print "다음 SQL 쿼리를 분석하고 최적화된 쿼리와 인덱스 전략을 제시해줘:"',
    tags: ['Claude', 'SQL', 'DB', '최적화'],
  },
  {
    id: 'claude-shell-script',
    name: 'Claude 쉘 스크립트',
    nameKo: 'AI bash 자동화 생성',
    description: 'Claude가 자연어 설명을 받아 안전하고 실용적인 bash 스크립트를 생성합니다',
    detailedDescription: `복잡한 자동화 작업을 안전한 bash 스크립트로 변환합니다.

생성 특징:
• set -euo pipefail 안전 모드 기본 적용
• 입력 유효성 검사 포함
• 에러 처리 및 로깅, dry-run 옵션 지원

품질 기준:
- shellcheck 통과, POSIX 호환성 고려
- 주석으로 각 섹션 설명`,
    category: 'ai',
    icon: '📜',
    command: 'env -u CLAUDECODE claude --print "다음 작업을 수행하는 안전한 bash 스크립트를 생성해줘 (set -euo pipefail 포함):"',
    tags: ['Claude', 'bash', '자동화', '스크립트'],
  },
  {
    id: 'claude-dockerfile',
    name: 'Claude Dockerfile',
    nameKo: 'AI 컨테이너 이미지 최적화',
    description: 'Claude가 프로젝트에 최적화된 멀티스테이지 Dockerfile을 생성합니다',
    detailedDescription: `프로젝트 특성에 맞는 최적화된 Dockerfile을 생성합니다.

최적화 기법:
• 멀티스테이지 빌드로 이미지 크기 최소화
• 레이어 캐싱 최적화
• Non-root 사용자로 보안 강화

포함 내용:
- 베이스 이미지 선택 근거
- 헬스체크 명령 설정
- docker-compose.yml 함께 생성

지원 스택: Node.js, Python, Go, Java, Next.js`,
    category: 'ai',
    icon: '🐳',
    command: 'env -u CLAUDECODE claude --print "현재 프로젝트에 최적화된 멀티스테이지 Dockerfile과 docker-compose.yml을 생성해줘:"',
    tags: ['Claude', 'Docker', '컨테이너', 'DevOps'],
  },
  {
    id: 'claude-cicd',
    name: 'Claude CI/CD 설계',
    nameKo: 'AI 파이프라인 자동화',
    description: 'Claude가 GitHub Actions, GitLab CI 등 CI/CD 파이프라인 설정을 생성합니다',
    detailedDescription: `프로젝트에 맞는 CI/CD 파이프라인을 자동 설계합니다.

지원 플랫폼:
• GitHub Actions, GitLab CI/CD, CircleCI, Jenkins

파이프라인 단계:
1. Lint & Type Check
2. Unit Tests + Coverage
3. Security Scan (Trivy, Snyk)
4. Build & Docker Image
5. Staging → E2E → Production 배포 (수동 승인)

최적화: 캐싱, 병렬 Job, Slack/Discord 알림 통합`,
    category: 'ai',
    icon: '🔄',
    command: 'env -u CLAUDECODE claude --print "이 프로젝트를 위한 GitHub Actions CI/CD 파이프라인을 생성해줘. 테스트, 빌드, 배포 단계 포함:"',
    tags: ['Claude', 'CI/CD', 'GitHub Actions', 'DevOps'],
  },
  {
    id: 'claude-explain',
    name: 'Claude 코드 설명',
    nameKo: 'AI 코드 분석 및 해설',
    description: '복잡한 코드를 Claude가 초보자도 이해할 수 있게 단계별로 설명합니다',
    detailedDescription: `복잡한 코드를 체계적으로 분해하고 설명합니다.

설명 구조:
1. 전체 목적 요약 (1-2문장)
2. 핵심 알고리즘/패턴 설명
3. 데이터 흐름 시각화 (ASCII 다이어그램)
4. 각 함수/섹션별 역할
5. 잠재적 문제점 및 개선 여지

활용 사례:
- 레거시 코드 이해, 오픈소스 기여 전 파악
- 코드 리뷰 준비, 기술 면접 설명 연습`,
    category: 'ai',
    icon: '💡',
    command: 'env -u CLAUDECODE claude --print "다음 코드를 단계별로 자세히 설명해줘. 데이터 흐름과 핵심 패턴을 포함해서:"',
    tags: ['Claude', '코드설명', '학습'],
  },
  {
    id: 'claude-convention',
    name: 'Claude 컨벤션 검사',
    nameKo: 'AI 코딩 스타일 통일',
    description: 'Claude가 프로젝트 전체의 코딩 컨벤션 일관성을 분석하고 통일 방안을 제시합니다',
    detailedDescription: `프로젝트 코딩 스타일의 일관성을 분석하고 개선합니다.

검사 항목:
• 네이밍 컨벤션 (camelCase, PascalCase, snake_case)
• import 순서 및 그룹핑
• 에러 처리 패턴, 상수/변수 선언 방식

자동 생성:
- .eslintrc 설정 파일
- .prettierrc 설정 파일
- CODING_STYLE.md 가이드 문서`,
    category: 'ai',
    icon: '📏',
    command: 'find . -name "*.ts" -o -name "*.tsx" | head -10 | xargs cat | env -u CLAUDECODE claude --print "이 코드들의 컨벤션을 분석하고 통일된 가이드라인을 제안해줘:"',
    tags: ['Claude', '컨벤션', 'ESLint', 'Prettier'],
  },
  {
    id: 'claude-migration',
    name: 'Claude 마이그레이션',
    nameKo: 'AI 코드 전환 도우미',
    description: 'JavaScript→TypeScript, React 클래스→훅 등 코드 마이그레이션을 Claude가 자동화합니다',
    detailedDescription: `레거시 코드를 현대적인 기술 스택으로 자동 전환합니다.

지원 마이그레이션:
• JavaScript → TypeScript
• Class 컴포넌트 → 함수 컴포넌트 + Hooks
• Redux → Zustand / Jotai
• CommonJS → ES Modules

주의사항:
- 변경 전/후 동작 동일성 보장
- 리그레션 테스트 포함
- 점진적 마이그레이션 지원`,
    category: 'ai',
    icon: '🔀',
    command: 'env -u CLAUDECODE claude --print "다음 코드를 단계별로 TypeScript로 마이그레이션해줘:"',
    tags: ['Claude', '마이그레이션', 'TypeScript'],
  },
  {
    id: 'claude-deps',
    name: 'Claude 의존성 분석',
    nameKo: 'AI 패키지 감사',
    description: 'package.json을 분석하여 Claude가 불필요한 패키지, 취약점, 업데이트를 종합 리포트합니다',
    detailedDescription: `프로젝트 의존성을 종합적으로 분석합니다.

분석 항목:
• 사용되지 않는 패키지 감지
• 보안 취약점이 있는 패키지 식별
• 번들 크기에 영향을 주는 패키지

대체 패키지 추천:
- lodash → native ES2023 메서드
- moment → date-fns / dayjs
- axios → native fetch`,
    category: 'ai',
    icon: '📦',
    command: 'cat package.json | env -u CLAUDECODE claude --print "이 package.json을 분석하여 취약점, 미사용 패키지, 최적화 방안을 리포트해줘:"',
    tags: ['Claude', '의존성', 'npm', '패키지'],
  },
  {
    id: 'claude-onboard',
    name: 'Claude 온보딩 가이드',
    nameKo: 'AI 신규 개발자 안내',
    description: '프로젝트 구조를 Claude가 분석하여 신규 팀원을 위한 온보딩 문서를 생성합니다',
    detailedDescription: `신규 개발자가 빠르게 프로젝트에 적응할 수 있는 문서를 자동 생성합니다.

문서 구성:
1. 프로젝트 개요 및 목적
2. 아키텍처 다이어그램
3. 개발 환경 설정 (단계별 명령어)
4. 핵심 개념 및 패턴, 자주 쓰는 명령어
5. 트러블슈팅 FAQ`,
    category: 'ai',
    icon: '🚀',
    command: 'env -u CLAUDECODE claude --print "이 프로젝트 구조로 신규 개발자 온보딩 가이드를 작성해줘:"',
    tags: ['Claude', '온보딩', '문서화', '팀'],
  },
  {
    id: 'aider',
    name: 'Aider',
    nameKo: 'Git 연동 AI 코딩',
    description: 'Aider는 git과 연동하여 자동 커밋하며 코드를 수정하는 AI 페어 프로그래머입니다',
    detailedDescription: `Aider는 git 히스토리와 연동하여 코드 변경 시 자동 커밋하는 AI 도구입니다.

Claude Code와의 차이점:
• 자동 git commit (변경마다 커밋 생성)
• 여러 LLM 모델 지원 (GPT-4, Claude, Gemini)
• 파일 맵핑으로 대규모 코드베이스 이해

설치:
pip install aider-chat

주요 모드:
- aider --model claude-3-5-sonnet: Claude 사용
- aider --model gpt-4o: GPT-4o 사용
- aider --watch: 파일 변경 감지 모드`,
    category: 'ai',
    icon: '🤝',
    command: 'aider --model claude-sonnet-4-6 2>/dev/null || pip install aider-chat && echo "설치 완료 후 aider 실행"',
    tags: ['AI', 'Aider', 'git', '자동커밋'],
  },
  {
    id: 'codex-cli',
    name: 'Codex CLI',
    nameKo: 'OpenAI 코딩 도우미',
    description: 'OpenAI Codex 기반 터미널 코딩 어시스턴트. 자연어로 코드 작성',
    detailedDescription: `OpenAI의 GPT 모델을 터미널에서 직접 활용하는 코딩 도구입니다.

Claude Code와의 차이점:
- OpenAI GPT-4o 기반 (vs Claude)
- 별도 API 키 필요 (OPENAI_API_KEY)
- 다른 코딩 스타일과 패턴 적용

설치: npm install -g @openai/codex
설정: export OPENAI_API_KEY=sk-...`,
    category: 'ai',
    icon: '🧠',
    command: 'codex',
    tags: ['AI', 'OpenAI', '코딩'],
  },

  // ─── 개발 ────────────────────────────────────────────────────────────────────
  {
    id: 'git-status',
    name: 'Git Smart Commit',
    nameKo: '스마트 커밋',
    description: '변경사항을 자동 스테이징하고 현재 브랜치 상태를 출력합니다',
    detailedDescription: `git status와 git diff --stat을 함께 실행하여 커밋 전 변경사항을 빠르게 검토합니다.

출력 정보:
• 현재 브랜치명
• 스테이징된 파일 목록
• 각 파일의 추가/삭제 라인 수

Conventional Commits 형식:
feat(scope): 새 기능
fix(scope): 버그 수정
refactor: 리팩토링`,
    category: 'dev',
    icon: '🌿',
    command: 'git status && git diff --stat',
    tags: ['Git', '버전관리'],
  },
  {
    id: 'git-log',
    name: 'Git Log Graph',
    nameKo: '커밋 히스토리',
    description: '브랜치 그래프와 함께 최근 20개 커밋 히스토리를 표시합니다',
    detailedDescription: `--graph 옵션으로 브랜치 분기와 머지 히스토리를 시각화합니다.

고급 활용:
- git log --all: 원격 브랜치 포함
- git log --author="이름": 특정 작성자 필터
- git log --since="2 weeks ago": 기간 필터
- git log -S "검색어": 내용 포함 커밋 검색`,
    category: 'dev',
    icon: '📜',
    command: 'git log --oneline --graph --decorate -20',
    tags: ['Git', '히스토리'],
  },
  {
    id: 'git-stash',
    name: 'Git Stash 목록',
    nameKo: '임시 저장 목록',
    description: '현재 작업을 stash하고 저장된 목록을 확인합니다',
    detailedDescription: `현재 작업 디렉토리를 임시 저장하고 나중에 복원합니다.

주요 명령어:
- git stash: 현재 변경사항 저장
- git stash pop: 최근 stash 복원 + 삭제
- git stash apply stash@{0}: 복원 (삭제 안 함)
- git stash show -p stash@{0}: 미리보기

팁: git stash push -m "작업 설명"`,
    category: 'dev',
    icon: '🗂',
    command: 'git stash list',
    tags: ['Git', 'stash'],
  },
  {
    id: 'git-branch-clean',
    name: 'Git 브랜치 정리',
    nameKo: '머지된 브랜치 삭제',
    description: 'main 브랜치에 이미 머지된 로컬 브랜치를 일괄 삭제합니다',
    detailedDescription: `오래된 로컬 브랜치를 정리하여 git branch -a 목록을 깔끔하게 유지합니다.

동작 방식:
1. main에 머지된 브랜치 목록 수집
2. main, master, develop 보호 브랜치 제외
3. 나머지 머지된 브랜치 삭제

원격 브랜치 정리:
git remote prune origin → 삭제된 원격 브랜치 참조 제거
git fetch --prune → fetch와 동시에 정리`,
    category: 'dev',
    icon: '✂️',
    command: 'git branch --merged main | grep -v "\\* main\\|master\\|develop" | xargs git branch -d 2>/dev/null && echo "머지된 브랜치 정리 완료"',
    tags: ['Git', '브랜치', '정리'],
  },
  {
    id: 'git-bisect',
    name: 'Git Bisect',
    nameKo: '버그 도입 커밋 찾기',
    description: '이진 탐색으로 버그가 도입된 정확한 커밋을 자동으로 찾아냅니다',
    detailedDescription: `git bisect는 이진 탐색 알고리즘으로 버그 도입 커밋을 O(log n) 시간에 찾습니다.

사용 방법:
1. git bisect start
2. git bisect bad (현재 코드가 버그 있음)
3. git bisect good [이전 정상 커밋 해시]
4. 각 체크아웃마다 good/bad 표시
5. 자동으로 버그 도입 커밋 특정

자동화:
git bisect run npm test → 테스트 자동 실행으로 좋은/나쁜 판단`,
    category: 'dev',
    icon: '🔀',
    command: 'git bisect start && echo "git bisect bad (현재), git bisect good [정상 커밋 해시]"',
    tags: ['Git', 'bisect', '디버깅'],
  },
  {
    id: 'vitest',
    name: 'Vitest 테스트',
    nameKo: 'Vite 기반 빠른 테스트',
    description: 'Vitest로 테스트를 실행합니다. Jest보다 10배 빠르며 ESM 기본 지원합니다',
    detailedDescription: `Vite 기반 테스트 러너 Vitest는 Jest와 호환되면서 훨씬 빠릅니다.

Jest 대비 장점:
• 최대 10배 빠른 실행 속도
• ESM 기본 지원 (babel 설정 불필요)
• TypeScript 기본 지원
• Vite 생태계 통합

주요 명령:
- vitest: watch 모드로 실행
- vitest run: 1회 실행 후 종료
- vitest --ui: 브라우저 UI로 결과 확인
- vitest --coverage: 커버리지 포함

Jest 마이그레이션:
jest.config → vitest.config 변환이 대부분 1:1 대응`,
    category: 'dev',
    icon: '⚡',
    command: 'npx vitest run --reporter=verbose 2>/dev/null || npx jest --passWithNoTests 2>/dev/null',
    tags: ['Vitest', 'Jest', '테스트', 'Vite'],
  },
  {
    id: 'playwright',
    name: 'Playwright E2E',
    nameKo: 'E2E 브라우저 테스트',
    description: 'Playwright로 실제 브라우저에서 End-to-End 테스트를 자동 실행합니다',
    detailedDescription: `Microsoft Playwright는 Chromium/Firefox/WebKit 전체를 지원하는 E2E 테스트 프레임워크입니다.

Cypress 대비 장점:
• 멀티 브라우저 동시 테스트
• 네트워크 요청 인터셉트
• 모바일 뷰포트 에뮬레이션
• 병렬 실행으로 빠른 속도

주요 기능:
- 자동 대기 (auto-wait)
- 스크린샷/비디오 자동 캡처
- 네트워크 모킹 (route.fulfill)
- Codegen으로 테스트 자동 생성: playwright codegen http://localhost:3000`,
    category: 'dev',
    icon: '🎭',
    command: 'npx playwright test --reporter=list 2>/dev/null || echo "npx playwright install 후 실행"',
    tags: ['Playwright', 'E2E', '브라우저', '테스트'],
  },
  {
    id: 'prisma-studio',
    name: 'Prisma Studio',
    nameKo: 'DB GUI 브라우저',
    description: 'Prisma Studio로 브라우저에서 데이터베이스를 시각적으로 조회/편집합니다',
    detailedDescription: `Prisma Studio는 localhost에서 실행되는 DB 관리 GUI입니다.

주요 기능:
• 테이블별 레코드 조회/편집/삭제
• 관계(Relation) 시각적 탐색
• 필터링 및 정렬
• JSON 필드 편집

접속 방법:
http://localhost:5555 에서 자동 실행

지원 DB:
PostgreSQL, MySQL, SQLite, MongoDB, SQL Server

Prisma Migrate:
npx prisma migrate dev → 스키마 변경 마이그레이션
npx prisma db push → 스키마 강제 적용 (개발용)`,
    category: 'dev',
    icon: '🗄',
    command: 'npx prisma studio 2>/dev/null || echo "prisma 미설치: npm install @prisma/client prisma"',
    tags: ['Prisma', 'DB', 'GUI', 'ORM'],
  },
  {
    id: 'prettier-check',
    name: 'Prettier 포맷 검사',
    nameKo: '코드 포맷 일관성 확인',
    description: 'Prettier로 전체 코드베이스의 포맷 일관성을 검사합니다',
    detailedDescription: `Prettier는 코드 스타일을 자동으로 통일하는 코드 포매터입니다.

--check 옵션:
파일을 수정하지 않고 형식 불일치 항목만 나열합니다
→ CI/CD에서 "포맷 위반 시 빌드 실패" 패턴에 사용

자동 수정:
npx prettier --write . → 모든 파일 자동 수정

설정 파일 (.prettierrc):
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100
}

ESLint와 통합:
eslint-config-prettier로 충돌 규칙 비활성화`,
    category: 'dev',
    icon: '💅',
    command: 'npx prettier --check "**/*.{ts,tsx,js,jsx,json,css,md}" 2>/dev/null || echo "prettier 미설치"',
    tags: ['Prettier', '포맷', '코드스타일'],
  },
  {
    id: 'ts-check',
    name: 'TypeScript 타입 검사',
    nameKo: '타입 오류 확인',
    description: '프로젝트 전체의 TypeScript 타입 오류를 찾아냅니다',
    detailedDescription: `TypeScript 컴파일러로 전체 프로젝트의 타입 오류를 정적 분석합니다.

오류 유형별 대처:
• TS2345: 인수 타입 불일치 → 타입 캐스팅 또는 수정
• TS2322: 할당 타입 불일치 → 타입 좁히기 필요
• TS2304: 이름을 찾을 수 없음 → import 누락
• TS7006: 암시적 any → 명시적 타입 선언

CI에서 활용:
npx tsc --noEmit && echo "타입 검사 통과"`,
    category: 'dev',
    icon: '🔷',
    command: 'npx tsc --noEmit',
    tags: ['TypeScript', '타입', '검사'],
  },
  {
    id: 'eslint-fix',
    name: 'ESLint 자동 수정',
    nameKo: '코드 스타일 교정',
    description: 'ESLint 규칙에 따라 자동 수정 가능한 오류를 모두 수정합니다',
    detailedDescription: `ESLint의 --fix 옵션으로 자동 수정 가능한 코드 스타일 문제를 일괄 처리합니다.

자동 수정 가능한 항목:
• 세미콜론 추가/제거, 따옴표 스타일 통일
• 들여쓰기 정규화, 사용되지 않는 import 제거

수동 수정 필요한 항목:
- 복잡한 논리 오류, 타입 불일치
- 접근성 이슈 (jsx-a11y)`,
    category: 'dev',
    icon: '✨',
    command: 'npx eslint . --fix --ext .ts,.tsx,.js,.jsx',
    tags: ['ESLint', '린트', '자동수정'],
  },
  {
    id: 'npm-audit',
    name: 'npm 보안 감사',
    nameKo: '취약점 스캔',
    description: 'npm 패키지의 보안 취약점을 스캔하고 수정 가능한 항목을 보여줍니다',
    detailedDescription: `npm 레지스트리의 취약점 DB와 비교하여 보안 이슈를 탐지합니다.

취약점 등급:
🔴 Critical: 즉시 업데이트 필수
🟠 High: 빠른 업데이트 권장
🟡 Moderate: 검토 후 업데이트

수정 방법:
npm audit fix → 자동 수정 (minor/patch)
npm audit fix --force → 메이저 버전 포함 (주의!)`,
    category: 'dev',
    icon: '🛡',
    command: 'npm audit --audit-level=moderate',
    tags: ['npm', '보안', '취약점'],
  },
  {
    id: 'npm-outdated',
    name: 'npm 업데이트 확인',
    nameKo: '패키지 최신 버전 확인',
    description: '구버전 패키지 목록과 최신 버전을 비교 출력합니다',
    detailedDescription: `현재 설치된 패키지와 npm 레지스트리의 최신 버전을 비교합니다.

업데이트 전략:
1. 패치 버전: 즉시 업데이트 (버그 수정)
2. 마이너 버전: 테스트 후 업데이트
3. 메이저 버전: 변경 내역 확인 후 신중하게

자동화 도구:
ncu -u → package.json 자동 업데이트
ncu --target minor → 마이너 버전까지만`,
    category: 'dev',
    icon: '📦',
    command: 'npm outdated',
    tags: ['npm', '업데이트'],
  },
  {
    id: 'coverage-report',
    name: '커버리지 리포트',
    nameKo: '테스트 커버리지 확인',
    description: 'Jest 커버리지를 실행하고 커버되지 않은 코드를 표시합니다',
    detailedDescription: `테스트 커버리지를 측정하여 테스트가 부족한 영역을 찾아냅니다.

커버리지 유형:
• Statements, Branches, Functions, Lines

권장 목표:
- 전체: 80% 이상
- 핵심 비즈니스 로직: 90% 이상

HTML 리포트:
npx jest --coverage --coverageReporters="html"
→ coverage/index.html에서 시각적 확인`,
    category: 'dev',
    icon: '📈',
    command: 'npx jest --coverage --coverageReporters="text-summary" 2>/dev/null || pytest --cov=. --cov-report=term-missing 2>/dev/null',
    tags: ['Jest', '커버리지', '테스트'],
  },
  {
    id: 'dead-code',
    name: '데드코드 탐지',
    nameKo: '미사용 코드 제거',
    description: 'knip으로 사용되지 않는 export를 탐지하여 코드 크기를 줄입니다',
    detailedDescription: `프로젝트에서 실제로 사용되지 않는 코드를 자동으로 탐지합니다.

탐지 항목:
• 사용되지 않는 export 함수/클래스/변수
• 임포트하지 않는 파일
• 주석 처리된 오래된 코드

도구별 특징:
- knip: 올인원 데드코드 탐지 (최신 권장)
- ts-prune: TypeScript export 분석
- unimported: 전체 파일 의존성 분석`,
    category: 'dev',
    icon: '🗑',
    command: 'npx knip 2>/dev/null || npx ts-prune 2>/dev/null || echo "npx knip 설치 후 재시도"',
    tags: ['데드코드', '최적화', 'knip'],
  },

  // ─── Shell ───────────────────────────────────────────────────────────────────
  {
    id: 'sys-info',
    name: '시스템 정보',
    nameKo: 'CPU/메모리/OS 요약',
    description: 'OS 버전, CPU, 메모리 등 시스템 기본 정보를 한눈에 확인합니다',
    detailedDescription: `운영체제 및 하드웨어 기본 정보를 빠르게 수집합니다.

출력 정보:
• uname -a: OS 커널 버전 및 아키텍처
• CPU 모델명 (macOS: sysctl, Linux: /proc/cpuinfo)

추가 정보:
sw_vers: macOS 상세 버전
system_profiler SPHardwareDataType: 전체 하드웨어 정보`,
    category: 'shell',
    icon: '🖥',
    command: 'uname -a && sysctl -n machdep.cpu.brand_string 2>/dev/null || cat /proc/cpuinfo | grep "model name" | head -1',
    tags: ['시스템', 'OS', 'CPU'],
  },
  {
    id: 'disk-usage',
    name: '디스크 사용량',
    nameKo: '용량 분석',
    description: '현재 디렉토리 기준 상위 10개 폴더의 디스크 사용량을 표시합니다',
    detailedDescription: `디스크 공간을 많이 차지하는 디렉토리를 빠르게 파악합니다.

디스크 정리 대상:
- node_modules/: npm 패키지 (수 GB 가능)
- .next/: Next.js 빌드 캐시
- dist/, build/: 빌드 결과물

추가 도구:
df -h: 전체 파티션 사용량
ncdu: 인터랙티브 디스크 분석 (brew install ncdu)`,
    category: 'shell',
    icon: '💾',
    command: 'du -sh ./* 2>/dev/null | sort -rh | head -10',
    tags: ['디스크', '용량'],
  },
  {
    id: 'port-list',
    name: '포트 사용 현황',
    nameKo: '열린 포트 확인',
    description: '현재 시스템에서 열려 있는 TCP 포트와 프로세스를 목록으로 표시합니다',
    detailedDescription: `현재 리스닝 중인 TCP 포트와 해당 프로세스를 확인합니다.

포트별 주요 서비스:
3000: Node.js/Next.js, 5432: PostgreSQL
6379: Redis, 27017: MongoDB, 8080: HTTP 대체

포트 충돌 해결:
lsof -ti :[포트번호] | xargs kill -9`,
    category: 'shell',
    icon: '🔌',
    command: 'lsof -nP -iTCP -sTCP:LISTEN | awk \'{print $1, $9}\' | sort -u',
    tags: ['포트', '네트워크', 'lsof'],
  },
  {
    id: 'kill-port',
    name: '포트 프로세스 종료',
    nameKo: '3000번 포트 강제 종료',
    description: '3000번 포트를 점유 중인 프로세스를 강제로 종료합니다',
    detailedDescription: `개발 서버 시작 시 "포트 이미 사용 중" 오류를 해결합니다.

다른 포트도 적용:
lsof -ti :8080 | xargs kill -9 2>/dev/null

주의사항:
- SIGKILL(-9)은 정상 종료 절차 없이 강제 종료
- DB 프로세스에 사용 시 데이터 손상 위험
- 일반적으로 개발 서버에만 사용 권장`,
    category: 'shell',
    icon: '⚠️',
    command: 'lsof -ti :3000 | xargs kill -9 2>/dev/null && echo "포트 3000 해제 완료"',
    tags: ['포트', '종료', '3000'],
  },
  {
    id: 'proc-monitor',
    name: '프로세스 모니터',
    nameKo: 'CPU 상위 10개',
    description: 'CPU 사용률 상위 10개 프로세스를 실시간으로 표시합니다',
    detailedDescription: `시스템 CPU 점유율이 높을 때 원인 프로세스를 빠르게 파악합니다.

CPU 과부하 원인 패턴:
- 무한루프 코드 → PID 확인 후 kill
- 컴파일/빌드 작업 → 정상, 완료까지 대기

프로세스 종료:
kill -15 [PID]: 정상 종료 요청 (SIGTERM)
kill -9 [PID]: 강제 종료 (SIGKILL)`,
    category: 'shell',
    icon: '📊',
    command: 'ps aux --sort=-%cpu | head -11 2>/dev/null || ps -A -o pid,%cpu,%mem,comm | sort -k2 -rn | head -11',
    tags: ['프로세스', 'CPU', '모니터'],
  },
  {
    id: 'env-vars',
    name: '환경 변수 목록',
    nameKo: 'ENV 목록 (정렬)',
    description: '현재 셸의 모든 환경 변수를 알파벳 순으로 정렬해 출력합니다',
    detailedDescription: `현재 셸 세션의 모든 환경 변수를 확인합니다.

민감 정보 필터링:
env | sort | grep -v "KEY\\|SECRET\\|TOKEN\\|PASSWORD"

환경 변수 설정:
.env 파일: 프로젝트별 설정
~/.zshrc 또는 ~/.bashrc: 전역 설정

주의: env 출력에 민감 정보가 포함될 수 있으므로 공유 시 주의`,
    category: 'shell',
    icon: '🔑',
    command: 'env | sort',
    tags: ['환경변수', 'ENV'],
  },
  {
    id: 'curl-health',
    name: 'HTTP 헬스체크',
    nameKo: 'localhost 상태 확인',
    description: 'localhost:3000의 응답 상태와 latency를 빠르게 측정합니다',
    detailedDescription: `curl로 개발 서버의 HTTP 응답 상태와 응답 시간을 측정합니다.

상태 코드 해석:
200: 정상, 301/302: 리다이렉트
404: 경로 없음, 500: 서버 오류
502: 게이트웨이 오류 (서버 다운 가능)
ECONNREFUSED: 서버 실행 안 됨`,
    category: 'shell',
    icon: '💓',
    command: 'curl -o /dev/null -s -w "HTTP %{http_code} | Time: %{time_total}s\\n" http://localhost:3000',
    tags: ['curl', 'HTTP', '헬스체크'],
  },
  {
    id: 'jq-format',
    name: 'JSON 처리 (jq)',
    nameKo: 'JSON 파싱 및 필터링',
    description: 'jq로 JSON 데이터를 파싱하고 필드를 추출하거나 포맷합니다',
    detailedDescription: `jq는 JSON 처리를 위한 커맨드라인 도구입니다. 마치 JSON을 위한 sed/awk와 같습니다.

기본 사용법:
• cat data.json | jq .  → 예쁘게 출력
• jq '.name' data.json → 특정 필드 추출
• jq '.[] | .id' → 배열 순회

고급 필터:
jq '.users[] | select(.age > 18) | .name'
jq '[.[] | {id, name}]' → 필드 선택 후 배열

API 응답 처리:
curl -s https://api.example.com | jq '.data[0]'

설치: brew install jq`,
    category: 'shell',
    icon: '🔧',
    command: 'echo \'{"version":"1.0","status":"ok"}\' | jq . && echo "---" && jq --version',
    tags: ['jq', 'JSON', '파싱'],
  },
  {
    id: 'rsync-backup',
    name: 'rsync 백업',
    nameKo: '디렉토리 동기화 백업',
    description: 'rsync로 현재 프로젝트를 백업 디렉토리에 증분 동기화합니다',
    detailedDescription: `rsync는 변경된 파일만 전송하는 효율적인 파일 동기화 도구입니다.

옵션 설명:
• -a: 아카이브 모드 (권한, 심볼릭 링크, 타임스탬프 유지)
• -v: 진행 상황 출력
• --delete: 소스에 없는 파일 대상에서 삭제
• --exclude: 특정 디렉토리/파일 제외

원격 백업:
rsync -av ./ user@server:/backup/project/

백업 전략:
- 일별 백업: ~/Desktop/backup-$(date +%Y%m%d)/
- 압축 옵션: rsync -az (네트워크 전송 시)`,
    category: 'shell',
    icon: '🔄',
    command: 'rsync -av --exclude="node_modules" --exclude=".git" --exclude=".next" ./ ~/Desktop/project-backup-$(date +%Y%m%d)/ && echo "백업 완료"',
    tags: ['rsync', '백업', '동기화'],
  },
  {
    id: 'grep-search',
    name: '코드 내용 검색',
    nameKo: 'TODO/FIXME 찾기',
    description: '소스 코드에서 TODO, FIXME 주석을 빠르게 찾아냅니다',
    detailedDescription: `소스 코드 전체에서 주석이나 특정 패턴을 빠르게 검색합니다.

검색 패턴:
• TODO: 나중에 처리할 작업
• FIXME: 알고 있는 버그
• HACK: 임시 해결책

추가 검색 예시:
grep -rn "console.log" --include="*.ts" .
grep -rn "api_key\\|apikey" --include="*.ts" .`,
    category: 'shell',
    icon: '📌',
    command: 'grep -rn --include="*.ts" --include="*.tsx" --include="*.js" "TODO\\|FIXME\\|HACK" . 2>/dev/null | head -20',
    tags: ['grep', 'TODO', '검색'],
  },
  {
    id: 'watch-file',
    name: '파일 변경 감시',
    nameKo: 'watch + 명령 자동 실행',
    description: '특정 디렉토리의 파일 변경을 감시하고 변경 시 명령을 자동 실행합니다',
    detailedDescription: `fswatch 또는 inotifywait으로 파일 변경을 실시간으로 감지합니다.

macOS (fswatch):
fswatch -o ./src | xargs -n1 -I{} npm test

Linux (inotifywait):
while inotifywait -e modify -r ./src; do npm test; done

활용 사례:
- 파일 저장 시 자동 테스트 실행
- 설정 파일 변경 시 서버 자동 재시작
- 로그 파일 변경 시 알림

설치 (macOS): brew install fswatch`,
    category: 'shell',
    icon: '👁',
    command: 'fswatch -o ./src | xargs -n1 -I{} sh -c "date && echo 변경 감지" 2>/dev/null || echo "fswatch 설치 필요: brew install fswatch"',
    tags: ['fswatch', 'watch', '자동화'],
  },

  // ─── DevOps ──────────────────────────────────────────────────────────────────
  {
    id: 'tmux',
    name: 'tmux 세션',
    nameKo: '터미널 멀티플렉서',
    description: '세션을 유지하고 창을 분할합니다. 원격 작업에 필수적입니다',
    detailedDescription: `tmux는 터미널 세션을 유지하고 여러 창과 패널을 관리하는 멀티플렉서입니다.

필수 단축키 (prefix: Ctrl+B):
- d: 세션 분리 (백그라운드 유지)
- c: 새 창 생성
- %: 수직 분할, ": 수평 분할
- z: 패널 전체화면 토글

설정 (~/.tmux.conf):
set -g mouse on → 마우스 지원`,
    category: 'devops',
    icon: '🪟',
    command: 'tmux new-session -A -s main',
    tags: ['터미널', '세션', '분할'],
  },
  {
    id: 'docker-build',
    name: 'Docker 빌드',
    nameKo: '컨테이너 빌드',
    description: '현재 디렉토리의 Dockerfile로 이미지를 빌드합니다',
    detailedDescription: `Dockerfile을 사용하여 컨테이너 이미지를 빌드합니다.

빌드 최적화 기법:
• 레이어 캐싱 활용 (의존성 먼저 복사)
• 멀티스테이지 빌드로 이미지 크기 최소화
• .dockerignore로 불필요한 파일 제외

이미지 최적화 목표:
Node.js 앱: 100-200MB (alpine 기반)`,
    category: 'devops',
    icon: '🐳',
    command: 'docker build -t app:latest . && docker images app',
    tags: ['Docker', '컨테이너', 'DevOps'],
  },
  {
    id: 'docker-compose-up',
    name: 'Docker Compose 시작',
    nameKo: '서비스 스택 실행',
    description: 'docker-compose.yml의 모든 서비스를 백그라운드에서 시작합니다',
    detailedDescription: `docker-compose로 여러 컨테이너 서비스를 한 번에 관리합니다.

주요 명령:
• docker compose up -d: 백그라운드 시작
• docker compose down: 모든 서비스 중지
• docker compose logs -f: 전체 로그 스트리밍
• docker compose restart [service]: 특정 서비스 재시작

환경 변수:
.env 파일 자동 인식
--env-file 옵션으로 다른 파일 지정`,
    category: 'devops',
    icon: '🚀',
    command: 'docker compose up -d && docker compose ps',
    tags: ['Docker', 'Compose', 'DevOps'],
  },
  {
    id: 'docker-ps',
    name: 'Docker 컨테이너 목록',
    nameKo: '실행 중인 컨테이너',
    description: '현재 실행 중인 모든 Docker 컨테이너의 상태를 표시합니다',
    detailedDescription: `현재 실행 중인 Docker 컨테이너의 상태를 확인합니다.

상태 유형:
- Up X hours: 정상 실행
- Exited (0): 정상 종료
- Restarting: 재시작 루프 (문제 있음)

시스템 전체 정리:
docker system prune -af (미사용 이미지/컨테이너/볼륨 삭제)`,
    category: 'devops',
    icon: '📦',
    command: 'docker ps --format "table {{.Names}}\\t{{.Status}}\\t{{.Ports}}"',
    tags: ['Docker', '컨테이너'],
  },
  {
    id: 'pm2-status',
    name: 'PM2 프로세스',
    nameKo: 'Node.js 프로세스 매니저',
    description: 'PM2로 Node.js 앱의 프로세스 상태와 메모리/CPU를 확인합니다',
    detailedDescription: `PM2는 Node.js 앱을 프로덕션에서 관리하는 프로세스 매니저입니다.

주요 명령:
• pm2 start app.js: 앱 시작
• pm2 restart all: 전체 재시작
• pm2 stop [id]: 특정 프로세스 중지
• pm2 logs [id]: 로그 스트리밍
• pm2 monit: 대화형 모니터링

고급 기능:
- pm2 start npm --name "next" -- start: npm 스크립트 실행
- pm2 cluster mode: CPU 코어 수만큼 자동 클러스터링
- pm2 save + pm2 startup: 시스템 재시작 시 자동 복구

설치: npm install -g pm2`,
    category: 'devops',
    icon: '⚙️',
    command: 'pm2 list 2>/dev/null || echo "PM2 미설치: npm install -g pm2"',
    tags: ['PM2', 'Node.js', '프로세스', 'DevOps'],
  },
  {
    id: 'terraform-plan',
    name: 'Terraform Plan',
    nameKo: '인프라 변경 계획 확인',
    description: 'terraform plan으로 인프라 변경사항을 apply 전에 미리 확인합니다',
    detailedDescription: `Terraform은 코드로 클라우드 인프라를 관리하는 IaC(Infrastructure as Code) 도구입니다.

Plan 단계:
• 현재 상태와 원하는 상태 비교
• 생성/수정/삭제될 리소스 목록
• 변경 예상 비용 추정 (일부 provider)

작업 흐름:
1. terraform init: 프로바이더 초기화
2. terraform plan: 변경사항 미리보기
3. terraform apply: 실제 적용
4. terraform destroy: 인프라 삭제

상태 파일:
- terraform.tfstate: 현재 인프라 상태 기록
- 원격 저장소 (S3, GCS) 사용 권장

설치: brew install terraform`,
    category: 'devops',
    icon: '🏗',
    command: 'terraform plan 2>/dev/null || echo "terraform 미설치: brew install terraform"',
    tags: ['Terraform', 'IaC', 'DevOps', '클라우드'],
  },
  {
    id: 'helm-status',
    name: 'Helm 차트 상태',
    nameKo: 'Kubernetes 패키지 관리',
    description: 'Helm 릴리즈 목록과 각 차트의 배포 상태를 확인합니다',
    detailedDescription: `Helm은 Kubernetes의 패키지 매니저입니다. npm과 유사하게 차트(패키지)를 관리합니다.

주요 명령:
• helm list: 설치된 릴리즈 목록
• helm install [name] [chart]: 차트 설치
• helm upgrade [name] [chart]: 업그레이드
• helm rollback [name] [revision]: 이전 버전으로 롤백
• helm uninstall [name]: 제거

유용한 명령:
helm history [release]: 배포 이력 확인
helm get values [release]: 현재 설정값
helm template [chart]: 렌더링된 YAML 미리보기

설치: brew install helm`,
    category: 'devops',
    icon: '⎈',
    command: 'helm list 2>/dev/null || echo "helm 미설치: brew install helm"',
    tags: ['Helm', 'K8s', 'DevOps'],
  },
  {
    id: 'k8s-status',
    name: 'kubectl 상태',
    nameKo: '쿠버네티스 현황',
    description: '현재 컨텍스트의 Pod, Service, Deployment 상태를 한눈에 확인합니다',
    detailedDescription: `Kubernetes 클러스터의 전반적인 상태를 빠르게 확인합니다.

Pod 상태 유형:
- Running: 정상, Pending: 스케줄링 대기
- CrashLoopBackOff: 반복 크래시 (로그 확인 필요)
- OOMKilled: 메모리 초과 종료

문제 진단:
kubectl describe pod [pod-name]: 상세 이벤트
kubectl logs [pod-name] --previous: 이전 실행 로그
kubectl exec -it [pod-name] -- bash: 내부 접속`,
    category: 'devops',
    icon: '☸️',
    command: 'kubectl get pods,svc,deploy -A --field-selector=metadata.namespace!=kube-system',
    tags: ['K8s', 'DevOps'],
  },

  // ─── 클라우드 ─────────────────────────────────────────────────────────────────
  {
    id: 'vercel-deploy',
    name: 'Vercel 배포',
    nameKo: 'Vercel 즉시 배포',
    description: 'vercel CLI로 현재 프로젝트를 Vercel에 즉시 배포합니다',
    detailedDescription: `Vercel은 Next.js, React 등 프론트엔드 앱을 위한 배포 플랫폼입니다.

배포 명령:
• vercel: 프리뷰 배포 (브랜치 URL)
• vercel --prod: 프로덕션 배포 (main 도메인)
• vercel env add: 환경 변수 추가

배포 후:
- 자동 HTTPS + CDN 적용
- 브랜치별 고유 URL 생성
- GitHub 연동 시 자동 배포

주요 설정 (vercel.json):
{
  "functions": { "api/*.ts": { "memory": 1024 } },
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}

설치: npm install -g vercel`,
    category: 'cloud',
    icon: '▲',
    command: 'vercel 2>/dev/null || echo "vercel 미설치: npm install -g vercel"',
    tags: ['Vercel', '배포', 'Next.js', '클라우드'],
  },
  {
    id: 'supabase-check',
    name: 'Supabase 상태',
    nameKo: 'Supabase CLI 확인',
    description: 'Supabase 로컬 개발 환경 상태와 마이그레이션 현황을 확인합니다',
    detailedDescription: `Supabase는 오픈소스 Firebase 대안으로 PostgreSQL 기반의 BaaS입니다.

로컬 개발:
supabase start → 로컬 Supabase 환경 실행
supabase stop → 환경 중지
supabase status → 상태 확인 (URL, 키 등)

데이터베이스:
supabase db reset → DB 초기화 + 마이그레이션 적용
supabase migration new [name] → 새 마이그레이션 생성
supabase db diff → 스키마 변경사항 확인

타입 생성:
supabase gen types typescript --local > types/supabase.ts

설치: brew install supabase/tap/supabase`,
    category: 'cloud',
    icon: '⚡',
    command: 'supabase status 2>/dev/null || echo "supabase 미설치: brew install supabase/tap/supabase"',
    tags: ['Supabase', 'PostgreSQL', 'BaaS', '클라우드'],
  },
  {
    id: 'aws-status',
    name: 'AWS 자격증명 확인',
    nameKo: 'AWS CLI 헬스체크',
    description: 'AWS 자격증명 및 현재 리전의 기본 리소스 상태를 확인합니다',
    detailedDescription: `AWS CLI 자격증명 유효성과 현재 계정 정보를 확인합니다.

자격증명 설정:
aws configure → 대화형 설정
~/.aws/credentials 파일 직접 편집

여러 프로필 관리:
aws configure --profile production
aws s3 ls --profile production`,
    category: 'cloud',
    icon: '☁️',
    command: 'aws sts get-caller-identity 2>/dev/null || echo "AWS CLI 설정 필요: aws configure"',
    tags: ['AWS', '클라우드'],
  },
  {
    id: 'gcloud-info',
    name: 'GCP 프로젝트 정보',
    nameKo: 'gcloud 상태 확인',
    description: '현재 GCP 계정과 활성 프로젝트, 리전 설정을 확인합니다',
    detailedDescription: `Google Cloud Platform 현재 설정과 계정 정보를 확인합니다.

gcloud 기본 명령:
gcloud projects list: 전체 프로젝트 목록
gcloud config set project [ID]: 프로젝트 전환
gcloud auth login: 계정 인증

서비스 상태:
gcloud compute instances list: VM 인스턴스
gcloud run services list: Cloud Run 서비스`,
    category: 'cloud',
    icon: '🌤',
    command: 'gcloud info --format="yaml(config)" 2>/dev/null || echo "gcloud 미설치 (brew install --cask google-cloud-sdk)"',
    tags: ['GCP', '클라우드', 'gcloud'],
  },

  // ─── 모니터링 ─────────────────────────────────────────────────────────────────
  {
    id: 'htop-snapshot',
    name: '시스템 스냅샷',
    nameKo: 'CPU/메모리 현황',
    description: 'CPU, 메모리, 로드 평균을 텍스트로 빠르게 스냅샷 출력합니다',
    detailedDescription: `시스템 리소스 현황을 비인터랙티브 방식으로 빠르게 출력합니다.

로드 평균 해석:
CPU 코어 수 이하: 정상
코어 수 초과: 과부하

실시간 모니터링:
htop 설치 권장 (brew install htop)
btop: 더 예쁜 리소스 모니터 (brew install btop)`,
    category: 'monitor',
    icon: '📈',
    command: 'top -l 1 | head -12 2>/dev/null || top -b -n 1 | head -15',
    tags: ['모니터링', 'CPU', '메모리'],
  },
  {
    id: 'uptime-check',
    name: '서버 업타임',
    nameKo: '가동 시간 + 로드',
    description: '서버 가동 시간과 1분/5분/15분 로드 평균을 표시합니다',
    detailedDescription: `서버 안정성과 현재 부하 상태를 간단히 확인합니다.

로드 평균 기준 (4코어):
< 4.0: 정상 / 4.0~8.0: 주의 / > 8.0: 위험

서버 재시작 기록:
last reboot: 마지막 재시작 시간
last -x shutdown: 종료 기록`,
    category: 'monitor',
    icon: '⏱',
    command: 'uptime && echo "" && w | head -5',
    tags: ['uptime', '로드', '모니터링'],
  },
  {
    id: 'network-conn',
    name: '네트워크 연결 상태',
    nameKo: '활성 TCP 연결',
    description: '현재 ESTABLISHED 상태의 TCP 연결을 서비스별로 집계합니다',
    detailedDescription: `활성 TCP 연결을 분석하여 네트워크 부하를 파악합니다.

출력 형식:
연결 수 + IP 주소 (많은 연결 = 많은 트래픽)

DDoS 의심 패턴:
동일 IP에서 비정상적으로 많은 연결 → 방화벽 차단 검토
TIME_WAIT 상태 과다 → keep-alive 설정 검토`,
    category: 'monitor',
    icon: '📡',
    command: 'netstat -an | grep ESTABLISHED | awk \'{print $5}\' | cut -d: -f1 | sort | uniq -c | sort -rn | head -10',
    tags: ['netstat', '연결', '모니터링'],
  },
  {
    id: 'disk-io',
    name: '디스크 I/O 모니터',
    nameKo: '읽기/쓰기 속도 측정',
    description: '현재 디스크 읽기/쓰기 속도를 측정하고 I/O 병목을 탐지합니다',
    detailedDescription: `디스크 I/O 성능을 측정하여 병목 지점을 파악합니다.

측정 항목:
• 쓰기 속도 (MB/s)
• 읽기 속도 (MB/s)
• I/O 대기 시간

macOS:
iostat -w 1 -c 5 → 1초 간격 5회 측정

Linux:
iotop → 프로세스별 I/O (설치 필요)
vmstat 1 5 → 가상 메모리 + I/O 통계

디스크 유형별 기준:
HDD: 100-150 MB/s
SSD: 500-3500 MB/s
NVMe: 3000-7000 MB/s`,
    category: 'monitor',
    icon: '💿',
    command: 'iostat -w 1 -c 3 2>/dev/null || vmstat 1 3',
    tags: ['디스크', 'I/O', '성능', '모니터링'],
  },
  {
    id: 'log-error-count',
    name: '에러 로그 집계',
    nameKo: 'ERROR 패턴 카운트',
    description: '/var/log 디렉토리에서 ERROR 패턴 출현 빈도를 집계합니다',
    detailedDescription: `시스템 로그에서 오류 패턴을 집계하여 주요 문제를 파악합니다.

검색 패턴:
• ERROR: 일반 오류
• FATAL: 치명적 오류
• CRITICAL: 중요 오류

로그 위치:
/var/log/: 시스템 로그
~/.pm2/logs/: PM2 앱 로그
./logs/: 앱별 로그 디렉토리

실시간 에러 모니터링:
tail -f /var/log/syslog | grep -i error`,
    category: 'monitor',
    icon: '🚨',
    command: 'grep -rh "ERROR\\|FATAL\\|CRITICAL" /var/log/ 2>/dev/null | awk \'{print $NF}\' | sort | uniq -c | sort -rn | head -10 || echo "로그 없음 또는 접근 권한 필요"',
    tags: ['로그', 'ERROR', '집계'],
  },
]

export const CATEGORY_LABELS: Record<string, { label: string; color: string }> = {
  all:     { label: '전체',    color: '#9ca3af' },
  ai:      { label: 'AI',      color: '#a855f7' },
  dev:     { label: '개발',    color: '#3b82f6' },
  shell:   { label: 'Shell',   color: '#00ff88' },
  devops:  { label: 'DevOps',  color: '#f59e0b' },
  cloud:   { label: '클라우드', color: '#06b6d4' },
  monitor: { label: '모니터링', color: '#ef4444' },
}
