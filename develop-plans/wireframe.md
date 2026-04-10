# Wireframe

이 문서는 [PRD.md](/Users/lee/Desktop/Project/TradingAPP/develop-plans/PRD.md), [architecture.md](/Users/lee/Desktop/Project/TradingAPP/develop-plans/architecture.md), [data-requirements.md](/Users/lee/Desktop/Project/TradingAPP/develop-plans/data-requirements.md), 전략 문서들과 [DESIGN.md](/Users/lee/Desktop/Project/TradingAPP/DESIGN.md)를 기준으로 `TradingAPP`의 화면 구조를 정의한다.

`TradingAPP`는 일반 차트 앱이 아니라 `AI agent 기반 자동화 트레이딩 운영 콘솔`이므로, 와이어프레임도 차트 소비 화면보다 아래 흐름을 중심으로 설계한다.

- 데이터 수집과 상태 확인
- 전략 생성과 DSL 관리
- 백테스트 및 심사
- 포트폴리오 승인과 실행
- 모니터링, 중단, 실패 분석

## 1. 와이어프레임 원칙

- 데스크톱 우선
  - Electron 기반 운영 콘솔이므로 `좌측 내비게이션 + 중앙 작업영역 + 우측 상세패널` 구조를 기본으로 한다.
- Agent-first
  - 메뉴 기준은 단순 "차트", "뉴스"가 아니라 `Agent`, `Research`, `Backtest`, `Execution`, `Risk` 같은 운영 단위로 잡는다.
- Safety-first
  - `paper`와 `live` 상태를 항상 구분해서 표시한다.
  - 승인되지 않은 전략은 어디서나 `live disabled` 상태가 보이도록 한다.
- Local-first
  - 데이터 동기화 시점, 로컬 캐시 상태, 마지막 백업 시점이 전역 UI에서 보이도록 한다.
- Explainable
  - AI가 전략을 만들거나 중단한 이유를 항상 볼 수 있는 `Reason / Evidence / Logs` 패널이 필요하다.

## 2. 전체 정보 구조

### 1차 네비게이션

- `Dashboard`
- `Agents`
- `Research Lab`
- `Strategies`
- `Backtests`
- `Portfolio & Risk`
- `Execution`
- `Data Hub`
- `Reports`
- `Settings`

### 공통 전역 액션

- `New Research`
- `Run Agent`
- `Import Data`
- `Approve for Paper`
- `Approve for Live`
- `Emergency Stop`

## 3. 전역 레이아웃

### 기본 데스크톱 프레임

```text
+--------------------------------------------------------------------------------------+
| Top Bar: Workspace | Global Search | Mode(Paper/Live) | Alerts | Run Agent | Profile |
+-----------+--------------------------------------------------------------------------+
| Sidebar   | Page Header: Title / Subtitle / Last Updated / Primary CTA               |
|           +--------------------------------------------------------------------------+
| Nav       | Main Content Area                                                        |
|           |                                                                          |
|           |                                                                          |
|           |                                                                          |
|           +--------------------------------------------------+-----------------------+
|           | Bottom Status Bar: data sync / queue / python / db / broker connectivity |
+-----------+--------------------------------------------------------------------------+
```

### 상단 Top Bar

- 좌측:
  - 앱 로고
  - 현재 워크스페이스 이름
- 중앙:
  - 글로벌 검색
    - 전략 이름
    - 종목
    - 에이전트
    - 리포트
    - 로그 검색
- 우측:
  - `Paper / Live` 모드 배지
  - 경고 센터
  - 실행 중 잡 수
  - `Run Agent` 버튼
  - 사용자 메뉴

### 좌측 Sidebar

- 고정 메뉴:
  - Dashboard
  - Agents
  - Research Lab
  - Strategies
  - Backtests
  - Portfolio & Risk
  - Execution
  - Data Hub
  - Reports
  - Settings
- 하단 고정 영역:
  - 로컬 DB 상태
  - 마지막 동기화 시간
  - 브로커 연결 상태
  - `Kill Switch`

### 우측 Detail Panel

페이지 공통으로 열 수 있는 슬라이드 패널이다.

- 선택한 전략 상세
- 에이전트 reasoning
- 승인 이력
- 실행 로그
- 실패 원인 분석

## 4. 핵심 사용자 플로우

### 플로우 A. 자동 전략 연구

1. `Research Lab`에서 목표 입력
2. AI가 전략 DSL 초안 여러 개 생성
3. `Backtests`에서 자동 검증 실행
4. `Review Score`로 후보 비교
5. `Strategies`에 채택

### 플로우 B. paper trading 운영

1. 승인된 전략을 `Execution`에서 `paper`로 배포
2. `Portfolio & Risk`에서 비중과 제약 확인
3. `Dashboard`와 `Reports`에서 성과 감시
4. 문제 발생 시 `Emergency Stop`

### 플로우 C. live 승격

1. `paper` 성과 기준 충족
2. operator가 `Portfolio & Risk`에서 최종 확인
3. `Execution`에서 live 승인
4. `Monitoring` 경고를 지속 추적

## 5. 페이지별 와이어프레임

## 5.1. Dashboard

가장 먼저 열리는 화면이다. 사용자가 요청한 메인화면 아이디어는 이 페이지에 반영한다. 단, 단순 시세 홈이 아니라 `운영 상태 + 시장 컨텍스트 + 액션 대기 항목` 중심으로 구성한다.

### 목적

- 오늘 확인해야 할 운영 상태를 한 화면에서 본다.
- 시장 레짐과 리스크 환경을 빠르게 파악한다.
- 승인/중단/재실행이 필요한 항목을 즉시 처리한다.

### 레이아웃

```text
+----------------------------------------------------------------------------------+
| Header: Good Morning / Portfolio State / Today PnL / Open Alerts / Last Sync     |
+----------------------------------------------------------------------------------+
| Row 1: KPI Cards                                                                  |
| [Active Agents] [Running Strategies] [Paper PnL] [Live PnL] [Open Risk Alerts]   |
+----------------------------------------------------------------------------------+
| Row 2 Left: Market Overview Ticker Strip                                          |
| Row 2 Right: Action Queue                                                         |
+----------------------------------------------------------------------------------+
| Row 3 Left: Trending Sectors                                                      |
| Row 3 Right: Macro Regime / Risk Gauges                                           |
+----------------------------------------------------------------------------------+
| Row 4 Left: Portfolio Snapshot                                                    |
| Row 4 Right: Agent Health / Data Feed Health                                      |
+----------------------------------------------------------------------------------+
| Row 5 Full: Recent Events / Logs / Approval Needed                                |
+----------------------------------------------------------------------------------+
```

### 핵심 컴포넌트

- `증권사 API Key 등록 카드`
  - 최초 진입 시 상단 경고 배너 또는 onboarding 카드로 노출
  - 한 번 등록 후에는 `Settings > Broker & API`에서 수정 가능
  - 상태:
    - 미등록
    - 연결 확인 중
    - 정상
    - 실패

- `Market Overview Ticker Strip`
  - 위험지표, 금리, 달러, 변동성, 주요 지수, 신용스프레드 등을 가로 카드로 배치
  - 한 번에 최대 `5개` 표시
  - 좌우 화살표 또는 수평 페이지네이션으로 다음 세트 탐색
  - 예시 카드:
    - `KOSPI`
    - `S&P 500`
    - `NASDAQ`
    - `DXY`
    - `VIX`
    - `US 10Y`
    - `HY Spread`
    - `WTI`

- `Trending Sectors`
  - 탭:
    - `오늘`
    - `3일`
    - `7일`
    - `1개월`
  - 시장 토글:
    - `한국`
    - `미국`
  - 섹터 카드에 포함할 정보:
    - 섹터명
    - 수익률
    - 거래대금/상승 종목 비율
    - 대표 ETF 또는 대표 종목

- `Macro Regime / Risk Gauges`
  - `Risk-On / Neutral / Risk-Off`
  - 성장, 물가, 금리, 신용, 달러 상태를 게이지 또는 배지로 표시
  - 전략 활성화 플래그에 직접 연결

- `Action Queue`
  - 승인 대기 전략
  - 실패한 데이터 잡
  - 중단 권고 전략
  - 검토 필요한 paper 전략

- `Agent Health`
  - `Data Agent`
  - `Backtest Agent`
  - `Review Agent`
  - `Monitoring Agent`
  - 상태:
    - idle
    - running
    - warning
    - failed

## 5.2. Agents

각 에이전트의 상태와 역할을 관리하는 운영 화면이다.

### 목적

- 현재 어떤 에이전트가 살아 있고 무엇을 수행 중인지 본다.
- 에이전트별 입력 데이터, 출력, 실패 이력을 추적한다.

### 레이아웃

```text
+----------------------------------------------------------------------------------+
| Header: Agents / Total / Running / Failed / Auto-run Toggle                       |
+----------------------------------------------------------------------------------+
| Left: Agent List Table                                                            |
| Right: Selected Agent Detail                                                      |
|                                                                                   |
| Table columns: Name / Role / Status / Last Run / Next Run / Owner / Mode         |
| Detail tabs: Overview / Inputs / Outputs / Logs / Memory / Settings              |
+----------------------------------------------------------------------------------+
```

### 기본 에이전트 카드

- `Technical Signal Agent`
- `Fundamental Ranking Agent`
- `Macro Regime Agent`
- `Micro Structure Agent`
- `Econometric Portfolio & Risk Agent`
- `Backtest Agent`
- `Review Agent`
- `Execution Agent`
- `Monitoring Agent`
- `Failure Analysis Agent`

### 상세 패널 요소

- 에이전트 설명
- 최근 실행 로그
- 최근 결과물
- 의존 데이터셋
- 실패 원인
- 자동 실행 주기
- `Run now`, `Pause`, `Open Logs`

## 5.3. Research Lab

전략 아이디어를 AI와 함께 만드는 화면이다.

### 목적

- 자연어 목표를 입력하고 전략 후보를 생성한다.
- 생성된 전략을 DSL 초안으로 확인하고 비교한다.

### 레이아웃

```text
+----------------------------------------------------------------------------------+
| Header: Research Lab / Goal Input / Strategy Domain Filters                       |
+----------------------------------------------------------------------------------+
| Left Panel: Prompt Builder                                                        |
| Center Panel: Generated Strategy Candidates                                       |
| Right Panel: Reasoning / Data Requirements / Risk Notes                           |
+----------------------------------------------------------------------------------+
```

### 좌측 입력 패널

- 전략 목표 입력
- 시장 선택:
  - 한국 주식
  - 미국 주식
  - ETF
  - 멀티자산
- 전략 축 선택:
  - 기술적
  - 기본적
  - 거시
  - 미시
  - 계량
- 운용 모드:
  - 스윙
  - 중기
  - 월간 리밸런싱
- 리스크 제한:
  - 최대 MDD
  - 회전율
  - 섹터 편중

### 후보 카드

- 전략 이름
- 한 줄 가설
- 필요한 데이터
- 예상 리밸런싱 주기
- 예상 리스크 수준
- `Generate DSL`
- `Run Backtest`
- `Save Draft`

## 5.4. Strategy Detail / DSL Editor

생성된 전략을 구조화된 형태로 보는 화면이다.

### 목적

- AI가 만든 전략을 operator가 검토 가능하게 만든다.
- 자연어가 아니라 제한된 DSL로 전략을 확정한다.

### 레이아웃

```text
+----------------------------------------------------------------------------------+
| Header: Strategy Name / Status Draft-Reviewed-Approved / Version                  |
+----------------------------------------------------------------------------------+
| Left: DSL Editor                                                                  |
| Right: Explanation / Required Data / Rule Summary / Validation                    |
+----------------------------------------------------------------------------------+
| Bottom: Save Draft | Validate DSL | Send to Backtest | Request Review             |
+----------------------------------------------------------------------------------+
```

### DSL 구성 섹션

- `universe`
- `features`
- `entry rules`
- `exit rules`
- `sizing rules`
- `rebalance rules`
- `risk rules`

### 우측 검증 패널

- 스키마 검증 상태
- 누락 데이터 경고
- look-ahead bias 가능성 경고
- 거래비용 민감도 경고
- 설명 가능한 규칙 요약

## 5.5. Backtests

전략 후보 검증의 중심 화면이다.

### 목적

- 전략을 즉시 백테스트하고 후보 간 성능을 비교한다.
- 인샘플, OOS, 워크포워드 결과를 분리해 보여준다.

### 레이아웃

```text
+----------------------------------------------------------------------------------+
| Header: Backtests / Queue / Running Jobs / Filters                                |
+----------------------------------------------------------------------------------+
| Top: Job Queue + Run Controls                                                     |
+----------------------------------------------------------------------------------+
| Middle Left: Equity Curve / Drawdown / Rolling Metrics                            |
| Middle Right: Summary Metrics                                                     |
+----------------------------------------------------------------------------------+
| Bottom: Trade List / Parameter Sensitivity / Benchmark Compare / Factor Exposure   |
+----------------------------------------------------------------------------------+
```

### 필수 지표 카드

- CAGR
- MDD
- Sharpe
- Sortino
- turnover
- win rate
- alpha
- beta
- OOS 성과

### 비교 모드

- 전략 vs 벤치마크
- 전략 A vs 전략 B
- 단일전략 vs 조합전략

### 탭 구성

- `Overview`
- `In-sample`
- `Out-of-sample`
- `Walk-forward`
- `Trades`
- `Sensitivity`
- `Review Notes`

## 5.6. Strategies

저장된 전략 저장소이자 승인 상태를 관리하는 화면이다.

### 목적

- 전략 전체 목록을 관리한다.
- 초안, 검토 중, paper 승인, live 승인 상태를 한눈에 본다.

### 레이아웃

```text
+----------------------------------------------------------------------------------+
| Header: Strategies / Filters / Bulk Actions                                       |
+----------------------------------------------------------------------------------+
| Table: Name / Type / Market / Status / Last Backtest / Review Score / Mode        |
+----------------------------------------------------------------------------------+
| Side Detail: Thesis / DSL Summary / Performance / Risks / Approval History        |
+----------------------------------------------------------------------------------+
```

### 상태 배지

- `draft`
- `validated`
- `reviewed`
- `paper approved`
- `live approved`
- `paused`
- `stopped`

## 5.7. Portfolio & Risk

전략 조합과 리스크 심사를 담당하는 화면이다.

### 목적

- 여러 전략을 조합해 최종 포트폴리오를 구성한다.
- 집중도, 변동성, VaR, 노출 한도를 관리한다.

### 레이아웃

```text
+----------------------------------------------------------------------------------+
| Header: Portfolio & Risk / Current NAV / Target Vol / Alert Count                 |
+----------------------------------------------------------------------------------+
| Left Top: Portfolio Allocation                                                    |
| Right Top: Risk Limits                                                            |
+----------------------------------------------------------------------------------+
| Left Bottom: Strategy Contribution                                                 |
| Right Bottom: Exposure Analysis                                                   |
+----------------------------------------------------------------------------------+
| Footer: Approve for Paper | Approve for Live | Reduce Risk | Freeze Changes       |
+----------------------------------------------------------------------------------+
```

### 주요 위젯

- 자산군 비중
- 전략별 비중
- 종목 집중도
- 섹터 집중도
- 팩터 노출
- 예상 변동성
- VaR / ES
- 현금 비중

### 경고 항목

- 단일 종목 비중 초과
- 섹터 편중 초과
- 전략 간 상관관계 과다
- liquidity 부족
- macro regime 부적합

## 5.8. Execution

paper/live 주문 실행과 운영 제어 화면이다.

### 목적

- 어떤 전략이 어느 모드로 배포되어 있는지 확인한다.
- 주문 실패, 재시도, 중단 상태를 추적한다.

### 레이아웃

```text
+----------------------------------------------------------------------------------+
| Header: Execution / Paper or Live / Broker Status / Kill Switch                   |
+----------------------------------------------------------------------------------+
| Left: Deployment List                                                             |
| Right: Order Blotter / Execution Logs                                             |
+----------------------------------------------------------------------------------+
| Bottom: Pending Orders / Filled Orders / Rejected Orders / Retry Queue            |
+----------------------------------------------------------------------------------+
```

### 필수 요소

- `paper`와 `live`를 색상과 배지로 강하게 구분
- 브로커 연결 상태
- 주문 전 리스크 재검증 결과
- 주문 실패 사유
- 재시도 버튼
- `Emergency Stop`

## 5.9. Data Hub

데이터 적재와 품질 상태를 확인하는 화면이다.

### 목적

- 어떤 데이터 소스가 연결되어 있고 최신 상태인지 본다.
- point-in-time 정합성과 누락 데이터를 관리한다.

### 레이아웃

```text
+----------------------------------------------------------------------------------+
| Header: Data Hub / Sources / Last Sync / Failed Jobs                              |
+----------------------------------------------------------------------------------+
| Top: Source Cards                                                                 |
+----------------------------------------------------------------------------------+
| Middle Left: Dataset Catalog                                                      |
| Middle Right: Data Quality Panel                                                  |
+----------------------------------------------------------------------------------+
| Bottom: Sync Logs / Schedule / Retry                                              |
+----------------------------------------------------------------------------------+
```

### 소스 카드 예시

- `yfinance`
- `pykrx`
- `OpenDartReader`
- `fredapi`
- `ccxt`
- 브로커 시세 API

### 데이터 품질 패널

- 최신 적재 시각
- 누락 비율
- symbol mapping 오류
- split/dividend 반영 여부
- `published_at`, `effective_at`, `as_of_date` 보유 여부

## 5.10. Reports

전략과 운용 결과를 설명 가능한 문서 형태로 보는 화면이다.

### 목적

- 자동 생성된 리포트를 검토하고 비교한다.
- 실패 분석과 중단 이유를 저장한다.

### 구성

- `Daily Ops Report`
- `Strategy Review Report`
- `Paper Performance Report`
- `Live Monitoring Report`
- `Failure Analysis Report`

### 리포트 상세 패널

- 요약
- 핵심 수치
- 주요 이벤트 타임라인
- AI 해석
- operator 메모

## 5.11. Settings

연결, 보안, 환경설정 화면이다.

### 섹션

- `Broker & API`
  - 증권사 API Key 등록 / 수정 / 삭제
  - paper/live 계정 분리
- `LLM Provider`
- `Data Providers`
- `Storage`
- `Schedule & Jobs`
- `Alerts`
- `Permissions`

## 6. 페이지 간 연결 규칙

- `Dashboard`의 경고 카드 클릭 시 해당 상세 화면으로 이동해야 한다.
- `Research Lab`에서 생성한 후보는 `Strategy Detail`로 바로 열린다.
- `Strategy Detail`에서 `Run Backtest`를 누르면 `Backtests`의 새 작업으로 생성된다.
- `Backtests`에서 심사 통과 시 `Strategies` 상태가 자동 갱신된다.
- `Portfolio & Risk` 승인 후에만 `Execution`의 live 배포 버튼이 활성화된다.
- 어느 화면에서든 `Emergency Stop` 실행 후 `Execution`으로 포커스 이동한다.

## 7. MVP 우선 구현 화면

### MVP 1

- Dashboard
- Agents
- Research Lab
- Strategy Detail / DSL Editor
- Backtests
- Reports
- Settings

설명:
- `AI가 전략을 만들고 검증하는 루프`를 먼저 완성하기 위한 최소 세트다.

### MVP 2

- Strategies
- Portfolio & Risk
- Execution
- Data Hub 고도화

설명:
- 자동 조합, 승인, paper/live 운영 단계로 확장하는 세트다.

## 8. 디자인 방향 메모

[DESIGN.md](/Users/lee/Desktop/Project/TradingAPP/DESIGN.md)의 Coinbase 스타일을 따른다.

- 밝은 기본 배경 + 일부 다크 섹션 조합
- 파란색은 강조 CTA와 상태 액션에만 사용
- 운영 콘솔답게 카드보다 `표 + 상태 배지 + 로그 패널` 비중이 높아야 한다
- CTA는 pill 스타일을 사용하되, 과도하게 소비자 앱처럼 보이지 않게 한다
- 차트 화면보다 `상태`, `승인`, `위험`, `로그` 정보가 더 중요하게 보여야 한다

## 9. 결론

이 제품의 메인화면은 단순 시세판이 아니라 `운영 통제 대시보드`여야 한다. 따라서 와이어프레임의 중심도 아래 순서가 맞다.

1. 상태를 본다
2. 전략을 생성한다
3. 검증한다
4. 승인한다
5. 실행한다
6. 감시하고 중단한다

이 문서를 기준으로 다음 단계에서는 각 페이지별 `low-fidelity ASCII wireframe` 또는 실제 `React 컴포넌트 트리`로 세분화할 수 있다.
