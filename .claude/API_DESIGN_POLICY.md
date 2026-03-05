# API 연동 설계 필수 정책

## 절대 규칙

프로젝트에 새로운 기능을 구현할 때, **프론트엔드와 백엔드 API 연동 설계를 반드시 먼저 수행**해야 한다.

UI 컴포넌트만 만들고 API 없이 방치하는 것은 금지한다.

---

## 적용 조건

다음 중 하나라도 해당하면 API 연동 설계가 필수:

- 새로운 탭 또는 페이지 추가
- 데이터를 저장/조회/수정/삭제하는 기능
- 외부 서비스 연동 (카카오, Notion, GitHub 등)
- 에이전트 상태 조회 또는 제어
- 자동화 트리거 또는 워크플로우 실행

---

## 설계 순서

```
1. API 엔드포인트 정의 (method, path, request/response)
2. 타입 정의 (요청/응답 인터페이스)
3. API route 구현 (src/app/api/...)
4. 프론트엔드 호출 코드 구현
5. 에러 처리 + 로딩 상태 처리
```

---

## API 설계 템플릿

새 기능을 구현하기 전에 아래 형식으로 API를 정의한다:

```
Endpoint: POST /api/{domain}/{action}
Request Body: { field1: string, field2: number }
Response: { result: string, data: T }
Error: { error: string, code: number }
```

---

## 금지 사항

- UI만 만들고 API 연동을 "나중에" 하겠다고 미루는 행위
- fetch 호출 없이 하드코딩된 mock 데이터로만 UI를 완성하는 행위
- API route 파일 없이 프론트엔드에서 직접 외부 API를 호출하는 행위
- API 응답 타입을 `any`로 처리하는 행위

---

## 허용 사항

- localStorage 기반 클라이언트 전용 기능 (설정 저장 등)은 API 불필요
- 순수 UI 컴포넌트 (스타일, 레이아웃)는 API 불필요
- 프로토타입 단계에서 mock API route를 먼저 만드는 것은 허용 (단, 실제 구현 계획 필수)

---

## 검증 체크리스트

기능 구현 완료 전 확인:

- [ ] API 엔드포인트가 정의되어 있는가
- [ ] Request/Response 타입이 명시되어 있는가
- [ ] API route 파일이 존재하는가 (src/app/api/...)
- [ ] 프론트엔드에서 fetch 호출이 구현되어 있는가
- [ ] 에러 응답 처리가 되어 있는가
- [ ] 로딩 상태가 UI에 반영되는가
