# Data Requirements

이 문서는 `Develop-plans/trading-strategies` 아래의 전략 문서들을 기준으로, 각 문서가 실제로 필요로 하는 데이터와 그 데이터를 가져오기 위해 사용할 수 있는 오픈소스 라이브러리를 정리한 구현용 메모다.

대상 문서:

- `Develop-plans/trading-strategies/technical-analysis.md`
- `Develop-plans/trading-strategies/fundamental-analysis.md`
- `Develop-plans/trading-strategies/macroeconomics.md`
- `Develop-plans/trading-strategies/microeconomics.md`
- `Develop-plans/trading-strategies/econometrics.md`

## 핵심 원칙

- 모든 가격 데이터는 가능하면 `OHLCV + adjusted close + split + dividend`를 함께 저장한다.
- 기본적 분석과 거시 데이터는 반드시 `point-in-time` 기준으로 저장한다.
- `보고기간`, `공시일`, `수정공시일`, `데이터 반영일`은 분리해야 한다.
- 동일 자산도 `symbol`, `exchange`, `currency`, `timezone`, `calendar`를 같이 저장해야 한다.
- 한국/미국/가상자산을 같이 다룰 가능성이 있으므로, 데이터 파이프라인을 처음부터 멀티소스 구조로 잡는 편이 낫다.
- 무료 오픈소스 라이브러리만으로는 일부 데이터가 불완전하다. 특히 `과거 옵션체인`, `애널리스트 추정치 히스토리`, `고객행동 데이터`, `산업 점유율`, `대체데이터`는 한계가 크다.

---

## 권장 라이브러리 요약

| 라이브러리 | 주 용도 | 강점 | 주의점 |
| --- | --- | --- | --- |
| `yfinance` | 미국/글로벌 가격, 옵션체인, 배당/분할, 일부 펀더멘털 | 시작이 빠르고 범위가 넓다 | Yahoo 기반, 연구/프로토타입 용도로 보는 편이 안전 |
| `yahooquery` | Yahoo 회사 정보, 재무/통계, 일부 애널리스트/프로필 | `yfinance`보다 회사 메타데이터 범위가 넓은 편 | 비공식 Yahoo API 래퍼 |
| `FinanceDataReader` | 한국/미국/지수/환율/암호화폐 가격 | 한국 시장과 글로벌 지수를 한 번에 다루기 좋다 | 크롤링 기반 소스 포함 |
| `pykrx` | 한국 주식/채권/시장 데이터 | KRX 데이터 접근성이 좋다 | 스크래핑 기반, 호출 예절 필요 |
| `OpenDartReader` | 한국 DART 공시, 재무제표, 지분/보고서 | 한국 상장사 공시에 가장 직접적 | Open DART API 키 필요 |
| `dart-fss` | 한국 DART 크롤링/공시 분석 | 공시 원문과 부속 문서까지 다루기 좋다 | Open DART / DART 호출 제한 유의 |
| `sec-edgar-downloader` | 미국 SEC EDGAR 원문 공시 다운로드 | 10-K, 10-Q, 8-K 등 원문 수집에 적합 | 구조화 파싱은 별도 작업 필요 |
| `fredapi` | FRED/ALFRED 거시 데이터 | 수정치 포함 point-in-time 거시 데이터에 강함 | FRED API 키 필요 |
| `pandas-datareader` | FRED, Fama-French, 일부 원격 금융 데이터 | 간단한 거시/팩터 데이터 접근에 편리 | 일부 커넥터는 유지보수 상태를 확인해야 함 |
| `wbgapi` | World Bank 국가/거시 데이터 | 국가 간 장기 비교에 적합 | 빈도와 커버리지가 투자용 단기 데이터와는 다름 |
| `ccxt` | 100개+ 가상자산 거래소 가격/체결/호가 | 멀티 거래소 통합 API | 거래소별 rate limit, 심볼 차이, 히스토리 한계 존재 |
| `pandas_market_calendars` | 거래소 영업일/장시간 캘린더 | 백테스트와 리샘플링에 필수 | 실시간 데이터 소스는 아님 |
| `OpenBB` | 여러 금융 데이터 커넥터 통합 | 데이터 추상화 계층으로 유용 | 일부 커넥터는 외부 provider 키 필요 |
| `pytrends` | Google Trends 기반 관심도 | 행동/관심도 대체지표에 유용 | 비공식 API |
| `playwright` | 동적 웹사이트 수집 | 리뷰, 가격, 랭킹, 경쟁사 페이지 수집에 유용 | 데이터 공급원이 아니라 브라우저 자동화 도구 |
| `beautifulsoup4` | 정적 HTML 파싱 | 간단한 경쟁사 페이지/표 추출에 유용 | 구조화 API가 없는 사이트에서만 보조적으로 사용 |

---

## 1. Technical Analysis

원문: `Develop-plans/trading-strategies/technical-analysis.md`

### 필요한 데이터

- 일봉/분봉 `OHLCV`
- `Adjusted Close`
- 배당, 액면분할, 병합
- 벤치마크 지수 가격
- 섹터 ETF 가격
- 환율
- 암호화폐 가격
- 거래소 캘린더
- 가능하면 호가/체결 데이터

### 이 데이터로 구현하는 것

- `SMA`, `EMA`, `MACD`, `RSI`, `ATR`, `Bollinger Bands`
- `Time-Series Momentum`, `Relative Strength`, `Dual Momentum`
- `Donchian Breakout`, `SuperTrend`
- `VWAP`, `Anchored VWAP`
- `Volatility Targeting`, `ATR Position Sizing`
- 레짐 필터용 `ADX`, `200EMA`, 벤치마크 상대강도

### 추천 라이브러리

- `yfinance`
  - 미국/글로벌 주식, ETF, 지수, 배당/분할, 옵션체인 프로토타입
- `FinanceDataReader`
  - 한국/미국 주식, 지수, 환율, 암호화폐 가격
- `pykrx`
  - 한국 주식/지수/채권 데이터
- `ccxt`
  - 거래소별 암호화폐 `OHLCV`
- `pandas_market_calendars`
  - 거래소 휴장일, 조기마감, 세션 시간
- `OpenBB`
  - 멀티 provider 통합 계층

### 현실적인 수집 조합

- 미국/글로벌 프로토타입:
  - `yfinance` + `pandas_market_calendars`
- 한국 주식 중심:
  - `pykrx` + `FinanceDataReader`
- 멀티 자산:
  - `FinanceDataReader` + `ccxt` + `yfinance`

### 한계

- 무료 소스로 안정적인 `과거 틱 데이터`와 `깊은 과거 옵션체인`을 확보하기는 어렵다.
- `VWAP`는 진짜 체결데이터가 없으면 분봉 기준 근사치로 계산해야 한다.

---

## 2. Fundamental Analysis

원문: `Develop-plans/trading-strategies/fundamental-analysis.md`

### 필요한 데이터

- 종가, 시가총액, 유통주식수, 희석주식수
- 손익계산서, 재무상태표, 현금흐름표
- 분기값, 연간값, `TTM`
- 공시일, 보고기간, filing lag
- 정정공시/재작성 이력
- 섹터/산업 분류
- 배당, 자사주 매입/소각
- 내부자 거래, 주요주주 변동
- 애널리스트 추정치와 수정치
- 유동성 데이터

### 이 데이터로 구현하는 것

- `PER`, `PBR`, `PSR`, `EV/EBITDA`, `FCF Yield`
- `ROE`, `ROA`, `ROIC`, `Gross Margin`, `Operating Margin`
- `Debt/Equity`, `NetDebt/EBITDA`, `Interest Coverage`
- `Altman Z-Score`, `Piotroski F-Score`
- `Accruals Ratio`, `Cash Conversion`, `Dilution Risk`
- `Value / Quality / Growth / Safety Score`

### 추천 라이브러리

- `yfinance`
  - 가격, 시가총액, 일부 재무 데이터, 배당/분할, 캘린더
- `yahooquery`
  - 회사 프로필, 밸류에이션/통계, 일부 재무/애널리스트 데이터
- `OpenDartReader`
  - 한국 상장사 재무제표, 공시 메타데이터, 지분공시
- `dart-fss`
  - 한국 DART 공시 크롤링과 원문/첨부 문서 다운로드
- `sec-edgar-downloader`
  - 미국 SEC 원문 공시 다운로드
- `OpenBB`
  - 멀티소스 재무/시장 데이터 통합 레이어
- `pykrx`
  - 한국 시장 종목 메타/가격 보완

### 현실적인 수집 조합

- 한국 상장사:
  - `OpenDartReader` + `dart-fss` + `pykrx`
- 미국 상장사:
  - `sec-edgar-downloader` + `yahooquery` + `yfinance`
- 빠른 프로토타입:
  - `yfinance` + `yahooquery`

### 한계

- 무료 오픈소스만으로 `애널리스트 추정치 히스토리`, `정교한 point-in-time fundamentals`, `restatement full history`를 완성도 높게 만들기는 어렵다.
- 미국은 `SEC 원문 -> 직접 파싱`, 한국은 `DART 원문 -> 직접 정규화`가 결국 필요하다.
- 업종 특화 지표(`P/TBV`, `P/FFO`, `Rule of 40`)는 원문 공시 세부 항목을 추가로 파싱해야 한다.

---

## 3. Macroeconomics

원문: `Develop-plans/trading-strategies/macroeconomics.md`

### 필요한 데이터

- 성장:
  - GDP, 산업생산, 소매판매, PMI, 주택지표
- 물가:
  - CPI, Core CPI, PPI, PCE, Core PCE, 기대인플레이션
- 고용:
  - 비농업고용, 실업률, 신규실업수당청구, 임금상승률
- 금리/유동성:
  - 정책금리, 국채 전구간, OIS, 선도금리, 중앙은행 자산규모, 통화량
- 신용:
  - IG/HY 스프레드, CDS, 대출태도 조사, 디폴트율
- 대외부문:
  - 환율, DXY, 경상수지, 무역수지, 외환보유액
- 원자재/공급망:
  - 유가, 금, 구리, 농산물, 운임지수, 공급망 압력지수
- 이벤트:
  - 경제지표 발표 일정, 컨센서스, 실제 발표치, 수정치

### 이 데이터로 구현하는 것

- 경기 레짐 분류기
- 인플레이션 레짐 분류기
- 중앙은행 반응함수 추적기
- 자산배분 엔진
- 이벤트 캘린더와 발표 서프라이즈 분석

### 추천 라이브러리

- `fredapi`
  - FRED/ALFRED 거시 시계열, 수정치 포함 point-in-time 거시데이터
- `pandas-datareader`
  - FRED, Fama-French, 일부 경제/금융 원격데이터
- `wbgapi`
  - World Bank 장기 국가 데이터
- `yfinance`
  - 금리 ETF, 지수, 달러 인덱스 대용, 원자재 ETF 등 빠른 확인
- `FinanceDataReader`
  - 지수, 환율, 원자재/암호화폐 일부 가격, 한국 시장 보완
- `OpenBB`
  - 거시/경제/시장 데이터 통합

### 한국 데이터 관점 추가 메모

- 한국은행 ECOS, 통계청 KOSIS 같은 공식 데이터를 바로 쓰는 것이 가장 좋다.
- 오픈소스만 기준으로 보면 전용 래퍼 생태계가 미국 FRED만큼 표준화되어 있지는 않다.
- 따라서 한국 거시지표는 `공식 Open API + 자체 래퍼` 구조를 염두에 두는 편이 현실적이다.

### 현실적인 수집 조합

- 미국 거시:
  - `fredapi` + `pandas-datareader`
- 국가 비교:
  - `wbgapi` + `fredapi`
- 시장 반응까지 포함:
  - `fredapi` + `yfinance` + `FinanceDataReader`

### 한계

- `컨센서스 대비 서프라이즈 데이터`, `정교한 이벤트 캘린더`, `실시간 중앙은행 발언 파싱`은 무료 오픈소스만으로는 완전하지 않다.
- 국가별 월간/분기 데이터 빈도가 제각각이므로 nowcasting에는 별도 정규화가 필요하다.

---

## 4. Microeconomics

원문: `Develop-plans/trading-strategies/microeconomics.md`

### 필요한 데이터

- 수요:
  - 판매량, 평균판매가격, 주문수, 고객수, 제품 믹스
- 공급/비용:
  - 생산능력, 가동률, 원재료비, 인건비, 물류비, 재고
- 경쟁:
  - 시장점유율, 경쟁사 수, 가격정책, 신규 진입/퇴출
- 고객행동:
  - 해지율, 재구매율, MAU/DAU, ARPU, GMV, 코호트 유지율
- 거버넌스:
  - 내부자 거래, SBC, 자사주 매입/소각, 배당, 대주주 지분
- 정성데이터:
  - 리뷰, 평점, 검색 트렌드, 경쟁사 웹사이트 가격/프로모션

### 이 데이터로 구현하는 것

- 가격결정력 스코어
- 산업구조 스코어
- 운영레버리지 스코어
- 거버넌스 / 인센티브 스코어
- 플랫폼 / 네트워크 스코어

### 추천 라이브러리

- `OpenDartReader`
  - 한국 기업의 공시, 지분, 재무, 사업보고서
- `dart-fss`
  - 한국 공시 원문과 첨부파일
- `sec-edgar-downloader`
  - 미국 10-K, 10-Q, 8-K, proxy 문서
- `yahooquery`
  - 회사 프로필, 섹터, 일부 통계
- `yfinance`
  - 시장 데이터와 일부 기업 메타데이터
- `pytrends`
  - 관심도, 검색 추세
- `playwright`
  - 동적 웹에서 가격, 리뷰, 랭킹, 프로모션 페이지 수집
- `beautifulsoup4`
  - 정적 HTML 파싱
- `OpenBB`
  - 일부 기업/시장/뉴스 커넥터 통합

### 현실적인 수집 조합

- 공시 기반 미시분석:
  - `OpenDartReader` 또는 `sec-edgar-downloader` + 자체 파서
- 행동/관심도 보강:
  - `pytrends` + `playwright` + `beautifulsoup4`
- 시장/섹터 메타 보강:
  - `yahooquery` + `yfinance`

### 한계

- `시장점유율`, `고객 코호트`, `실제 가격탄력성`, `경쟁사 프로모션 히스토리`, `POS 데이터`는 대부분 오픈소스만으로는 완전한 수집이 어렵다.
- 미시경제 데이터는 결국 `공시 파싱 + 웹 수집 + 수동 정제`가 섞인다.
- 이 문서 영역은 다른 전략 문서보다 비정형 데이터 비중이 높다.

---

## 5. Econometrics / Financial Engineering

원문: `Develop-plans/trading-strategies/econometrics.md`

### 필요한 데이터

- 자산별 가격 시계열
- 벤치마크 수익률
- 무위험금리
- 환율
- 포트폴리오 구성 종목의 공분산/상관관계용 시계열
- 팩터 수익률
- 옵션체인:
  - 만기, 행사가, 콜/풋, 옵션가격, 기초자산 가격, 배당, 금리
- 채권/금리곡선:
  - 3M, 2Y, 5Y, 10Y, 30Y 등
- 신용스프레드
- 거시 수정치 시계열
- 가능하면 선물/파생 가격

### 이 데이터로 구현하는 것

- 수익률, 변동성, drawdown, Sharpe, Sortino
- CAPM `alpha`, `beta`
- 팩터 노출 분석
- 평균분산 최적화
- VaR / ES
- Regime switching
- 옵션 가격계산, Greeks, Black-Scholes
- Monte Carlo 시뮬레이션

### 추천 라이브러리

- `yfinance`
  - 가격, 벤치마크, 현재 옵션체인, 배당
- `pandas-datareader`
  - FRED 금리, Fama-French 팩터 데이터
- `fredapi`
  - 무위험금리, 장단기 금리, 크레딧 관련 거시 시계열, ALFRED 수정치
- `FinanceDataReader`
  - 지수, 환율, 일부 자산 가격
- `ccxt`
  - 가상자산/거래소 시계열
- `OpenBB`
  - 다양한 자산군의 통합 접근 계층
- `pandas_market_calendars`
  - 세션 정렬과 리밸런싱 캘린더

### 현실적인 수집 조합

- 퀀트/리스크 기초:
  - `yfinance` + `pandas-datareader` + `fredapi`
- 멀티 자산:
  - `yfinance` + `FinanceDataReader` + `ccxt`
- 파생 프로토타입:
  - `yfinance` 옵션체인 + `fredapi` 금리

### 한계

- 무료 소스로는 `과거 옵션체인 히스토리`가 거의 비어 있다.
- `실제 거래가능한 선물/옵션 틱데이터`는 오픈소스만으로 충족되기 어렵다.
- 팩터 연구를 정밀하게 하려면 가격 외에 `survivorship-free universe`와 `point-in-time constituents`가 필요하다.

---

## 권장 저장 스키마

전략 문서들을 모두 만족시키려면 최소 아래 테이블이 필요하다.

- `assets`
  - 종목코드, 거래소, 자산군, 통화, 국가, 섹터, 산업
- `ohlcv_daily`
  - 일봉 가격과 거래량
- `ohlcv_intraday`
  - 분봉 이상
- `corporate_actions`
  - 배당, 분할, 병합
- `fundamentals_quarterly`
  - 분기 재무제표 원천 데이터
- `fundamentals_ttm`
  - TTM 파생 지표
- `filings`
  - 보고기간, 공시일, 접수번호, 원문 URL, 정정 여부
- `macro_series`
  - 시계열 ID, 국가, 빈도, 원천, 수정차수
- `market_rates`
  - 무위험금리, 수익률곡선, 크레딧 스프레드
- `options_snapshot`
  - 옵션체인 스냅샷
- `benchmarks`
  - 벤치마크와 팩터 수익률
- `alt_behavioral`
  - 검색량, 리뷰, 랭킹, 고객행동 보조지표

---

## 우선 구현 제안

가장 현실적인 초기 조합은 아래와 같다.

- 한국 주식 + 미국 ETF + 지수:
  - `pykrx` + `FinanceDataReader` + `yfinance`
- 기본적 분석:
  - 한국은 `OpenDartReader`, 미국은 `sec-edgar-downloader`, 보조는 `yahooquery`
- 거시경제:
  - `fredapi` + `pandas-datareader`
- 가상자산:
  - `ccxt`
- 캘린더:
  - `pandas_market_calendars`

이 조합이면 현재 전략 문서들의 1차 구현 범위는 대부분 커버할 수 있다.

---

## 즉시 결론

현재 문서 기준으로 `TradingAPP`가 먼저 확보해야 할 데이터는 아래 다섯 묶음이다.

- `OHLCV + Corporate Actions`
- `Quarterly / Annual Fundamentals + Filing Metadata`
- `Macro Time Series + Revisions`
- `Benchmarks / Factor Returns / Risk-Free Curve`
- `Session Calendars + Symbol Metadata`

그리고 라이브러리 조합은 아래가 가장 실용적이다.

- 시장 데이터: `yfinance`, `FinanceDataReader`, `pykrx`, `ccxt`
- 기본적 분석: `OpenDartReader`, `dart-fss`, `sec-edgar-downloader`, `yahooquery`
- 거시경제: `fredapi`, `pandas-datareader`, `wbgapi`
- 통합 계층: `OpenBB`
- 보조 수집: `pandas_market_calendars`, `pytrends`, `playwright`, `beautifulsoup4`

오픈소스만으로도 1차 제품은 충분히 만들 수 있지만, `point-in-time fundamentals`, `historical options`, `analyst revisions history`, `micro/behavioral alt data`는 초기에부터 "부분 커버"로 보는 편이 현실적이다.
