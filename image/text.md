# Agent Control Tower

Topology 기반 NOC 관제 대시보드
Agent Execution Graph

이 UI의 핵심 구조

이 화면의 설계 패턴은 4개 레이어로 나뉜다.

1️⃣ 좌측 (Traffic / Top Metrics)

회선 트래픽

백본 트래픽 TOP5

장비 트래픽 TOP5

➡ 에이전트 관제로 치환하면
| 기존  | 에이전트 관제   |
| --- | --------- |
| 트래픽 | 토큰 사용량    |
| 회선  | 워크플로우     |
| 장비  | 에이전트      |
| BPS | Token/sec |

Agent Load Metrics Panel

2️⃣ 중앙 (Topology Map)

이 UI의 핵심이다.

현재는
Internet
  ↓
Router
  ↓
Firewall
  ↓
Server
  ↓
Database

같은 네트워크 토폴로지를 보여준다.

에이전트 관제에서는 이것을
User Request
      ↓
Planner Agent
      ↓
Executor Agent
      ↓
Tool
      ↓
Verifier Agent
      ↓
Result
같은 Agent Execution Graph로 바꾸면 된다.

3️⃣ 우측 (실시간 그래프)

현재는
Network Usage
Firewall
Switch

같은 장비 그래프

에이전트 관제에서는
Agent Latency
LLM Response Time
Tool Latency
Workflow Duration

같은 그래프가 들어간다.

4️⃣ 하단 (Event Log)

현재
CPU 사용률 이벤트
서버 장애
알람 로그

에이전트 관제에서는
Agent Task Started
Tool Call
Policy Block
Approval Required
Run Failed
같은 이벤트 스트림.


중앙 Topology Map을 어떻게 구현하냐

이게 이 UI의 핵심 기술이다.

추천 라이브러리

가장 좋음

React Flow

https://reactflow.dev

이유

노드 기반 그래프

Edge 연결

실시간 업데이트

상태 변경 애니메이션 가능

이 UI 스타일 거의 그대로 구현 가능.


그리고, LLM 모델은 claude cli 기반이다.
터미널은 kaku로 연동되어야 한다.