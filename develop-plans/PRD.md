## Product

`TradingAPP`는 개인투자자를 위한 일반 차트 앱이 아니라, 개인이 직접 운영하는 `AI algorithm / AI agent 기반 자동화 트레이딩 연구 및 운용 플랫폼`을 목표로 한다.

핵심은 사람이 매일 종목을 직접 고르는 것이 아니라, AI가 아래 루프를 지속적으로 수행하게 만드는 것이다.

- 데이터 수집 및 정규화
- 전략 가설 생성
- 전략 DSL 변환
- 백테스트 및 워크포워드 검증
- 리스크 심사
- 포트폴리오 조합
- paper trading 또는 실거래 실행
- 성과 감시와 중단
- 실패 분석과 재학습

즉, 제품의 중심은 `추천 화면`이 아니라 `Autonomous Research + Backtest + Execution Loop`다.

## Product Goal

- 개인이 소규모 퀀트/AI 연구소처럼 자신의 전략 에이전트를 만들고 운영할 수 있게 한다.
- 기술적 분석, 기본적 분석, 거시경제, 미시경제, 금융공학 문서를 각각 독립 전략 에이전트로 변환할 수 있게 한다.
- 자동 전략 생성부터 자동 심사, 자동 감시, 자동 중지까지 이어지는 일관된 운영 체계를 만든다.

## Target User

- 자동화에 관심이 있는 개인 투자자
- 규칙 기반 또는 퀀트 기반 전략을 직접 만들고 싶은 사용자
- 여러 전략을 조합해 장기적으로 운용하고 싶은 사용자
- AI가 전략 연구를 도와주되, 검증과 통제는 엄격하게 하고 싶은 사용자

이 사용자는 단순 정보 소비자가 아니라 `AI agent operator`에 가깝다.

## Problem

개인 투자자가 자동화로 가려 할 때 보통 아래 문제를 겪는다.

- 데이터 수집, 지표 계산, 백테스트, 포트폴리오 관리가 분리되어 있다.
- AI가 아이디어는 주지만, 실제 실행 가능한 전략 정의로 연결되지 않는다.
- 백테스트는 되지만 point-in-time, 거래비용, OOS 검증이 약하다.
- 전략이 늘어날수록 리스크와 중복 노출 관리가 안 된다.
- 자동매매로 가는 순간 실패 원인 추적과 kill switch가 없어 위험하다.

`TradingAPP`는 이 문제를 해결하기 위해 전략을 단순 스크립트가 아니라, 생성되고 검증되고 감시되는 에이전트 단위로 다룬다.

## Design

Coinbase 디자인을 기반으로 하는 [DESIGN.md](/Users/lee/Desktop/Project/TradingAPP/DESIGN.md)를 활용한다.

- `npx getdesign@latest add coinbase`
- 다만 디자인은 신뢰감과 운영툴 느낌을 주되, 제품 핵심은 미려한 차트 앱이 아니라 에이전트 운영 콘솔이어야 한다.

## Product Principles

- `Local-first`
  - 핵심 분석, 전략 정의, 백테스트 결과, 에이전트 메모리는 기본적으로 로컬 우선 저장
- `Agent-first`
  - 기능은 화면이 아니라 에이전트 단위로 정의
- `Safety-first`
  - AI가 전략을 만들더라도 검증과 실행 통제 없이는 실거래 금지
- `Point-in-time`
  - 가격, 재무, 거시 데이터 모두 시점 정합성 유지
- `Composable`
  - 기술적/기본적/거시/미시/계량 전략을 조합 가능하게 설계
- `Explainable`
  - AI가 왜 이런 전략을 생성했고 왜 중단했는지 로그를 남겨야 함

## Core Product Concept

제품은 아래 5개 레이어로 구성된다.

### 1. Data Layer

- 시장 데이터
- 재무 데이터
- 거시 데이터
- 산업/기업 구조 데이터
- 브로커/거래소 데이터

### 2. Strategy Agent Layer

- `Technical Signal Agent`
- `Fundamental Ranking Agent`
- `Macro Regime Agent`
- `Micro Structure Agent`
- `Econometric Portfolio & Risk Agent`

### 3. Research Automation Layer

- 전략 DSL 생성기
- 전략 조합기
- 자동 백테스트 에이전트
- 자동 전략 심사 에이전트
- 실패 분석 에이전트

### 4. Execution Control Layer

- 포트폴리오 구성기
- 리밸런싱 에이전트
- 리스크 가드레일
- kill switch
- paper/live mode 분리

### 5. Operator Console Layer

- 에이전트 상태 모니터링
- 전략 후보 비교
- 리포트와 승인 흐름
- 실행 로그

## Primary Use Cases

### Use Case 1. 자동 전략 연구

- 사용자가 목표를 입력한다.
- AI가 여러 전략 DSL 초안을 생성한다.
- 자동 백테스트와 워크포워드 테스트를 수행한다.
- 전략 심사 에이전트가 후보를 채점한다.
- 상위 전략만 후보 저장소에 남긴다.

### Use Case 2. 멀티전략 자동 포트폴리오 운영

- 기본적 분석 에이전트가 종목군을 필터링한다.
- 기술적 분석 에이전트가 진입/청산 타이밍을 계산한다.
- 거시 에이전트가 전략 활성/비활성 여부를 정한다.
- 금융공학 에이전트가 가중치와 리스크 한도를 적용한다.
- 리밸런싱 에이전트가 포트폴리오 변경안을 만든다.

### Use Case 3. 자동 감시와 중단

- 모니터링 에이전트가 drawdown, 변동성, 데이터 이상, 레짐 전환을 감시한다.
- 위험 기준 위반 시 자동으로 전략을 중단하거나 비중을 축소한다.
- 실패 분석 에이전트가 원인을 정리한다.

### Use Case 4. paper trading에서 live trading으로 승격

- 새 전략은 paper trading으로 먼저 검증한다.
- 일정 기간 기준을 만족해야만 live trading 후보가 된다.
- operator가 승인한 전략만 제한적으로 실거래에 올라간다.

## Functional Requirements

### 1. Data Ingestion & Normalization

- 가격 데이터 수집 및 로컬 캐시
- 기업 재무 데이터 수집 및 point-in-time 정규화
- 거시 데이터 수집 및 발표 일정 관리
- 데이터 품질 검증
- 심볼, 거래소, 통화, 캘린더 표준화

### 2. Strategy DSL

- AI가 직접 코드를 생성하지 않고 제한된 DSL을 생성해야 한다.
- DSL은 최소 아래 요소를 지원해야 한다.
  - universe
  - features
  - entry rules
  - exit rules
  - sizing rules
  - rebalance rules
  - risk rules
- DSL은 JSON 또는 YAML 기반으로 저장 가능해야 한다.

### 3. Strategy Generation

- 자연어 목표를 전략 초안으로 변환
- 단일 전략과 멀티전략 조합 전략 모두 생성
- 기술적/기본적/거시/미시/계량 전략 조합 지원
- 전략 생성 시 필요한 데이터 요구사항도 함께 출력

### 4. Backtest Automation

- AI가 생성한 전략을 즉시 백테스트 가능해야 한다.
- 인샘플/OOS 분리
- 워크포워드 테스트
- 거래비용/슬리피지 반영
- 벤치마크 비교
- 파라미터 민감도 분석

### 5. Strategy Review

- 자동 심사 기준을 내장해야 한다.
- 최소 평가 항목:
  - CAGR
  - MDD
  - Sharpe
  - turnover
  - alpha / beta
  - OOS 유지력
  - 종목/섹터 편중도
- 심사 통과 전에는 실거래 불가

### 6. Portfolio Construction

- 여러 전략을 조합해 최종 포트폴리오를 만들 수 있어야 한다.
- 전략별 가중치
- 자산별 최대 비중
- 섹터/팩터/변동성 제약
- 현금 비중 규칙
- volatility targeting

### 7. Monitoring & Risk Control

- 실시간 또는 배치 기준으로 감시
- 감시 대상:
  - MDD 초과
  - 포트폴리오 변동성 초과
  - VaR / ES 경고
  - factor drift
  - macro regime shift
  - data feed failure
- 이상 발생 시 자동 조치:
  - 신규 진입 중지
  - 비중 축소
  - 전략 정지
  - operator 알림

### 8. Execution

- 초기에는 paper trading 중심
- 이후 브로커/거래소 adapter를 통한 live execution 지원
- 주문 전 리스크 재검증
- 실패 주문 재시도 및 로그 기록
- live mode는 승인된 전략만 허용

### 9. Agent Memory & Reporting

- 전략 초안, 백테스트 결과, 실패 사례, 중단 이유를 기억해야 한다.
- AI는 같은 실패를 반복하지 않도록 과거 결과를 참조해야 한다.
- 모든 전략은 생성 이유와 최근 성과 변화가 자동 리포트로 남아야 한다.

## Non-Goals

- 초기에 초단타 HFT 플랫폼을 목표로 하지 않는다.
- 초기에 복잡한 옵션 마켓메이킹 시스템을 목표로 하지 않는다.
- 초기에 모든 브로커/거래소를 지원하지 않는다.
- AI 자유 코딩 기반의 무제한 전략 실행은 허용하지 않는다.

## MVP Scope

### MVP 1. Research Loop

- 가격 데이터 적재
- 기술적 분석 기반 `Technical Signal Agent`
- 전략 DSL 생성기
- 자동 백테스트
- 전략 리포트

목표:

- "AI가 전략을 만들고 검증하는 루프"를 먼저 완성한다.

### MVP 2. Portfolio Loop

- 기본적 분석 랭킹 에이전트
- 전략 조합기
- 리스크 가드레일
- 포트폴리오 최적화
- 자동 리밸런싱 초안

목표:

- "좋은 전략"을 "운용 가능한 포트폴리오"로 바꾼다.

### MVP 3. Monitoring Loop

- 거시 레짐 에이전트
- 라이브 모니터링
- kill switch
- 실패 분석 에이전트

목표:

- "돌리는 것"보다 "망가지면 멈추는 것"을 먼저 확보한다.

### MVP 4. Controlled Execution

- paper trading
- 브로커 adapter
- 제한적 live trading
- 승인 워크플로우

목표:

- 검증된 전략만 제한적으로 자동 실행한다.

## Success Metrics

- AI가 생성한 전략 중 백테스트까지 성공적으로 연결되는 비율
- 자동 심사 통과 전략의 OOS 유지율
- 포트폴리오 최대 낙폭 통제 성능
- paper trading과 backtest 성과 괴리
- 전략 중단 사유의 자동 분류 정확도
- operator가 수동으로 개입해야 하는 빈도 감소

## Open Questions

- 초기 자산군 범위를 한국 주식, 미국 주식, ETF, 암호화폐 중 어디까지 둘 것인가
- 기본적 분석과 미시 구조 데이터의 무료 공급원 한계를 어떻게 보완할 것인가
- paper trading과 live trading 사이 승격 정책을 얼마나 엄격하게 둘 것인가
- 에이전트 메모리와 승인 로그를 어떤 저장 구조로 관리할 것인가

## Final Direction

`TradingAPP`의 최종 방향은 "AI가 종목을 몇 개 추천해주는 앱"이 아니라, 여러 전략 문서를 독립적인 에이전트로 분해하고, 그 에이전트들이 `생성 -> 검증 -> 조합 -> 실행 -> 감시 -> 중단 -> 재학습`을 반복하는 `AI trading operations platform`이다.
