# 기본적 분석 방법론 정리

이 문서는 `TradingAPP`에서 구현 우선순위가 높은 기본적 분석 지표와 해석 프레임을 정리한 실무용 노트다. 단순히 `PER`, `PBR` 같은 지표를 나열하는 수준이 아니라, 실제 스크리너, 랭킹 엔진, 백테스트, 자동 전략 발굴에 바로 연결될 수 있도록 "무엇을 봐야 하는가", "어떻게 정규화해야 하는가", "어디서 잘못 해석되기 쉬운가"까지 포함한다.

## 문서 목적

- 재무제표 데이터를 `signal`, `filter`, `ranking`, `risk` 관점에서 재구성한다.
- 가치주, 퀄리티, 성장주, 턴어라운드, 재무건전성 스크리닝을 위한 최소 지표 세트를 정의한다.
- 단순 저평가 착시를 피하기 위해 이익의 질, 현금흐름, 부채 구조까지 함께 보게 한다.
- 기술적 분석과 금융공학 문서 사이를 잇는, 중장기 종목 선택용 기준 문서 역할을 한다.

## 기본 표기

- `P_t`: 시점 `t`의 주가
- `Shares_t`: 유통주식수 또는 희석주식수
- `MarketCap_t = P_t * Shares_t`
- `Revenue_t`: 매출액
- `COGS_t`: 매출원가
- `GrossProfit_t = Revenue_t - COGS_t`
- `OpIncome_t`: 영업이익
- `EBIT_t`: 이자 및 세전이익
- `EBITDA_t = EBIT_t + DepreciationAmortization_t`
- `NetIncome_t`: 당기순이익
- `OCF_t`: 영업활동현금흐름
- `FCF_t = OCF_t - Capex_t`
- `Assets_t`: 총자산
- `Equity_t`: 자본총계
- `Debt_t`: 총차입금
- `Cash_t`: 현금 및 현금성자산
- `EV_t = MarketCap_t + Debt_t + PreferredStock_t + MinorityInterest_t - Cash_t`
- `EPS_t = NetIncome_t / DilutedShares_t`
- `BVPS_t = Equity_t / Shares_t`

기본적 분석 지표도 기술적 분석처럼 계층을 나눠 보는 편이 좋다.

- `Signal`: 매수 후보 여부를 직접 결정하는 지표
- `Filter`: 금융주 제외, 적자기업 제외, 회계 이상치 제외 같은 사전 필터
- `Ranking`: 가치, 품질, 성장, 모멘텀을 조합한 점수화
- `Risk`: 부채비율, 이익변동성, 희석 위험, 업종 집중도 같은 위험 관리 요소

---

## 1. 현재 문서에 반드시 포함해야 할 핵심 방법론

좋은 기본적 분석은 "싸다"를 찾는 작업이 아니다. "싸보이는 이유가 정당한가", "좋은 기업이 과도하게 비싸진 것은 아닌가", "회계상 이익이 실제 현금으로 이어지는가"를 함께 봐야 한다. 아래 항목은 `TradingAPP`에서 우선 구현 가치가 높은 축이다.

### 1.1. Value Screening

- 개념: 기업의 이익, 자산, 현금흐름 대비 주가가 낮은 종목을 찾는 접근이다.
- 핵심 지표:
  - `PER = P_t / EPS_t`
  - `PBR = MarketCap_t / Equity_t`
  - `PSR = MarketCap_t / Revenue_t`
  - `EV/EBITDA = EV_t / EBITDA_t`
  - `FCF Yield = FCF_t / MarketCap_t`
- 실전 포인트:
  - 낮은 밸류에이션만으로는 가치 함정에 빠지기 쉽다.
  - 반드시 수익성, 현금흐름, 부채 지표와 함께 교차 검증해야 한다.

### 1.2. Quality Investing

- 개념: 높은 수익성, 안정적 이익, 건전한 재무구조를 가진 기업에 프리미엄을 부여하는 접근이다.
- 핵심 지표:
  - `ROE = NetIncome_t / AvgEquity_t`
  - `ROA = NetIncome_t / AvgAssets_t`
  - `ROIC = NOPAT_t / InvestedCapital_t`
  - `GrossMargin = GrossProfit_t / Revenue_t`
  - `OperatingMargin = OpIncome_t / Revenue_t`
- 실전 포인트:
  - `ROE`는 부채를 많이 쓰면 인위적으로 높아질 수 있으므로 `ROIC`, `Debt/Equity`와 같이 봐야 한다.
  - 퀄리티 팩터는 단기 반전보다 중기 보유 전략과 잘 맞는다.

### 1.3. Growth Investing

- 개념: 매출, 이익, 현금흐름이 지속적으로 성장하는 기업을 찾는 접근이다.
- 핵심 지표:
  - `RevenueGrowth_yoy = Revenue_t / Revenue_{t-4} - 1`
  - `EPSGrowth_yoy = EPS_t / EPS_{t-4} - 1`
  - `FCFGrowth_yoy = FCF_t / FCF_{t-4} - 1`
- 실전 포인트:
  - 성장률은 절대 수준보다 가속도와 지속성이 중요하다.
  - 적자 성장주의 경우 `매출 성장 + 마진 개선 + 현금 소진 속도`를 함께 봐야 한다.

### 1.4. Earnings Quality

- 개념: 회계상 이익이 실제 현금창출력과 얼마나 일치하는지 보는 접근이다.
- 핵심 지표:
  - `AccrualsRatio = (NetIncome_t - OCF_t) / AvgAssets_t`
  - `CashConversion = OCF_t / NetIncome_t`
  - `FCFConversion = FCF_t / NetIncome_t`
- 실전 포인트:
  - 순이익은 증가하지만 영업현금흐름이 따라오지 않으면 이익의 질이 낮을 수 있다.
  - 재고 급증, 매출채권 급증, 일회성 이익 증가를 경계해야 한다.

### 1.5. Financial Strength

- 개념: 외부 충격이 와도 버틸 수 있는 재무 체력을 보는 접근이다.
- 핵심 지표:
  - `DebtToEquity = Debt_t / Equity_t`
  - `NetDebt = Debt_t - Cash_t`
  - `NetDebt/EBITDA = NetDebt_t / EBITDA_t`
  - `InterestCoverage = EBIT_t / InterestExpense_t`
  - `CurrentRatio = CurrentAssets_t / CurrentLiabilities_t`
- 실전 포인트:
  - 금리 상승기에는 레버리지 지표의 중요도가 더 커진다.
  - 성장성보다 생존성이 먼저인 국면에서는 이 그룹을 상위 필터로 둬야 한다.

### 1.6. Shareholder Yield / Capital Allocation

- 개념: 기업이 벌어들인 현금을 배당, 자사주 매입, 부채 감축 등으로 얼마나 효율적으로 배분하는지 보는 접근이다.
- 핵심 지표:
  - `DividendYield = DPS_t / P_t`
  - `BuybackYield = (Shares_{t-1} - Shares_t) / Shares_{t-1}`
  - `ShareholderYield = DividendYield + BuybackYield + DebtPaydownYield`
- 실전 포인트:
  - 자사주 매입은 저평가 상태에서 실행될 때 효과가 크다.
  - 보상성 주식발행이 많으면 buyback 효과가 희석될 수 있다.

### 1.7. Revision / Expectation Gap

- 개념: 현재 실적 수준보다 시장 기대의 변화 방향을 보는 접근이다.
- 핵심 지표:
  - `EPSRevision_1m = ConsensusEPS_{t} / ConsensusEPS_{t-1m} - 1`
  - `Surprise = ReportedEPS_t - ExpectedEPS_t`
- 실전 포인트:
  - 기본적 분석은 느리다는 인식이 있지만, 추정치 상향과 실적 서프라이즈는 중단기 모멘텀과 직접 연결된다.
  - `fundamental momentum`은 기술적 모멘텀과 함께 쓰면 설명력이 좋아진다.

### 1.8. Sector-Relative Analysis

- 개념: 같은 업종 내에서만 비교해야 의미가 있는 지표를 분리해서 보는 접근이다.
- 핵심 포인트:
  - 은행의 `PBR`, 반도체의 `EV/EBITDA`, 플랫폼 기업의 `PSR`, 리츠의 `P/FFO`는 서로 대체 불가능하다.
  - 따라서 절대 점수와 업종 중립 점수를 모두 제공해야 한다.

### 1.9. Composite Multi-Factor Ranking

- 개념: 가치, 품질, 성장, 모멘텀을 한 지표로 합성하는 접근이다.
- 기본 구조 예시:
  - `ValueScore = z(FCFYield) + z(EarningsYield) - z(EV/EBITDA)`
  - `QualityScore = z(ROIC) + z(GrossMargin) - z(Debt/Equity)`
  - `GrowthScore = z(RevenueGrowth) + z(EPSGrowth) + z(FCFGrowth)`
  - `CompositeScore = 0.35 * ValueScore + 0.30 * QualityScore + 0.20 * GrowthScore + 0.15 * PriceMomentumScore`
- 실전 포인트:
  - 단일 지표 기반 순위보다 훨씬 견고하다.
  - winsorizing, sector neutralization, point-in-time 데이터가 필수다.

---

## 2. TradingAPP 관점의 기본적 분석 우선순위

기본적 분석도 모든 지표를 한 번에 넣을 필요는 없다. 현재 제품 범위인 `차트 스크리닝`, `전략 백테스팅`, `자동 전략 발굴` 관점에서 구현 우선순위를 정리하면 다음과 같다.

### 2.1. 1차 구현

- `PER`, `PBR`, `PSR`, `EV/EBITDA`, `FCF Yield`
- `ROE`, `ROA`, `영업이익률`, `Gross Margin`
- `부채비율`, `Current Ratio`, `Interest Coverage`
- `Revenue YoY`, `EPS YoY`, `OCF YoY`
- 적자기업 필터, 금융주 분리, 극단값 제거

이 단계만 구현해도 기본 가치주 스크리너, 퀄리티 스크리너, 성장주 스크리너를 만들 수 있다.

### 2.2. 2차 구현

- `ROIC`, `NetDebt/EBITDA`, `Accruals Ratio`, `Cash Conversion`
- `Piotroski F-Score`
- `Altman Z-Score`
- `Shareholder Yield`
- 업종 상대 랭킹, 백분위 스코어, z-score 스코어링

이 단계부터는 단순 지표 조회를 넘어 "좋은 저평가 종목"과 "싼 이유가 있는 종목"을 구분할 수 있다.

### 2.3. 3차 구현

- 애널리스트 추정치 변화율
- 실적 서프라이즈, 가이던스 변화
- `EV/Sales`, `Rule of 40`, `P/TBV`, `P/FFO` 같은 산업 특화 지표
- 회계 경고 신호, 리스 조정, SBC 보정

이 단계는 고도화된 랭킹 엔진과 이벤트 드리븐 전략에 연결된다.

---

## 3. 재무제표를 어떻게 읽어야 하는가

기본적 분석은 지표 계산보다 연결 구조 이해가 더 중요하다. 손익계산서, 재무상태표, 현금흐름표는 따로 보는 문서가 아니라 한 기업의 상태를 다른 각도에서 보여주는 세 개의 창이다.

### 3.1. 손익계산서

- 매출이 커지는지
- 매출총이익률과 영업이익률이 유지되거나 개선되는지
- 일회성 이익이 실적을 왜곡하는지

손익계산서는 "좋아 보이는 이야기"가 가장 많이 만들어지는 영역이다. 따라서 이익 증가를 볼 때는 반드시 현금흐름표와 같이 봐야 한다.

### 3.2. 재무상태표

- 부채가 통제 가능한 수준인지
- 운전자본 구조가 악화되고 있지 않은지
- 재고, 매출채권, 차입금이 매출 성장보다 더 빨리 늘지 않는지

재무상태표는 위기 시 생존 확률을 보여준다. 성장주라도 재무구조가 약하면 높은 할인율을 받아야 한다.

### 3.3. 현금흐름표

- 영업현금흐름이 순이익과 비슷한 방향으로 움직이는지
- 투자지출이 미래 성장을 위한 것인지, 단순 유지보수 수준인지
- 외부조달 없이 버틸 수 있는지

현금흐름표는 회계 이익의 진실성을 검증하는 장치다. 실전에서는 `NetIncome`보다 `OCF`, `FCF`를 더 중시하는 경우가 많다.

---

## 4. 핵심 밸류에이션 지표 및 공식

밸류에이션 지표는 기업의 "가격표"다. 다만 싼 가격표가 항상 좋은 거래는 아니므로 품질 지표와 반드시 결합해야 한다.

### 4.1. PER

- `PER = P_t / EPS_t`
- 또는 `PER = MarketCap_t / NetIncome_t`
- 장점: 가장 대중적이고 이해가 쉽다.
- 한계:
  - 적자기업에는 적용이 어렵다.
  - 경기 민감주에서는 이익 사이클에 따라 왜곡이 크다.
  - 일회성 이익/손실에 크게 흔들린다.

### 4.2. PBR

- `PBR = MarketCap_t / Equity_t`
- 장점: 은행, 보험, 자본집약 업종에서 유용하다.
- 한계:
  - 무형자산 중심 기업에는 설명력이 떨어질 수 있다.
  - 자산 재평가와 감가상각 정책에 따라 왜곡될 수 있다.

### 4.3. PSR

- `PSR = MarketCap_t / Revenue_t`
- 장점: 적자 성장주 비교에 유용하다.
- 한계:
  - 마진 구조가 전혀 반영되지 않는다.
  - 매출만 큰 저수익 기업을 고평가할 위험이 있다.

### 4.4. EV/EBITDA

- `EV/EBITDA = EV_t / EBITDA_t`
- 장점: 자본구조 차이를 일부 중립화해 비교하기 좋다.
- 한계:
  - 설비투자가 큰 기업에서는 `Capex` 부담이 숨겨질 수 있다.
  - 금융업에는 부적절한 경우가 많다.

### 4.5. Earnings Yield

- `EarningsYield = EPS_t / P_t`
- 또는 `EarningsYield = NetIncome_t / MarketCap_t`
- 장점: PER의 역수라서 다른 수익률 지표와 비교하기 쉽다.
- 실전 포인트:
  - 채권금리와 비교해 주식의 상대 매력을 보는 데 사용할 수 있다.

### 4.6. Free Cash Flow Yield

- `FCFYield = FCF_t / MarketCap_t`
- 장점: 실제 현금창출력을 가격과 연결한다.
- 한계:
  - 대규모 투자 직전/직후 기업은 일시적으로 왜곡될 수 있다.
  - 순환 업종은 경기 고점에서 과도하게 좋아 보일 수 있다.

### 4.7. PEG

- `PEG = PER / EPSGrowth`
- 장점: 성장 대비 밸류에이션을 비교하기 쉽다.
- 한계:
  - 성장률 추정이 불안정하면 의미가 약해진다.
  - 음수 이익이나 음수 성장에서는 해석이 깨진다.

---

## 5. 수익성, 효율성, 성장성 지표

밸류에이션이 가격표라면, 수익성과 성장성은 기업의 엔진 상태를 보여준다.

### 5.1. Gross Margin

- `GrossMargin = GrossProfit_t / Revenue_t`
- 제품 경쟁력과 가격 결정력을 가늠하는 기본 지표다.
- 하락 추세가 지속되면 비용 압박 또는 경쟁 심화를 의심해야 한다.

### 5.2. Operating Margin

- `OperatingMargin = OpIncome_t / Revenue_t`
- 영업 레버리지와 비용 통제 능력을 확인하는 지표다.
- 성장주도 장기적으로는 영업이익률 개선 경로가 필요하다.

### 5.3. Net Margin

- `NetMargin = NetIncome_t / Revenue_t`
- 세금, 이자, 일회성 요인의 영향을 모두 포함한다.
- 업종 간 비교보다 같은 업종 내 비교가 더 안전하다.

### 5.4. ROE

- `ROE = NetIncome_t / AvgEquity_t`
- 자본 대비 수익성을 보여주는 대표 지표다.
- 고ROE가 부채 확대로 나온 것인지 분해해서 봐야 한다.

### 5.5. ROA

- `ROA = NetIncome_t / AvgAssets_t`
- 자산 효율성을 보는 지표다.
- 자산집약 업종 비교에 적합하다.

### 5.6. ROIC

- `NOPAT_t = EBIT_t * (1 - TaxRate_t)`
- `InvestedCapital_t = Equity_t + Debt_t - Cash_t`
- `ROIC = NOPAT_t / AvgInvestedCapital_t`
- 실전 포인트:
  - `ROIC > WACC`가 지속되면 가치 창출 기업일 가능성이 높다.
  - 장기 보유 전략에서 매우 중요한 품질 지표다.

### 5.7. Asset Turnover

- `AssetTurnover = Revenue_t / AvgAssets_t`
- 자산을 얼마나 효율적으로 매출로 전환하는지 보여준다.
- 저마진 고회전 모델과 고마진 저회전 모델을 구분하는 데 유용하다.

### 5.8. Growth Metrics

- `RevenueGrowth_yoy = Revenue_t / Revenue_{t-4} - 1`
- `OpIncomeGrowth_yoy = OpIncome_t / OpIncome_{t-4} - 1`
- `EPSGrowth_yoy = EPS_t / EPS_{t-4} - 1`
- `3YRevenueCAGR = (Revenue_t / Revenue_{t-12})^(1/3) - 1`
- 실전 포인트:
  - 단기 급성장보다 `지속성`, `마진 개선`, `현금 전환`이 중요하다.

---

## 6. 재무건전성과 생존 가능성

시장이 좋을 때는 성장성이, 시장이 나쁠 때는 재무구조가 가격을 결정하는 경우가 많다. 따라서 기본적 분석 엔진은 항상 부채와 유동성을 별도 축으로 평가해야 한다.

### 6.1. Debt to Equity

- `DebtToEquity = Debt_t / Equity_t`
- 장점: 자본 대비 레버리지 수준을 빠르게 파악할 수 있다.
- 한계: 업종별 정상 범위가 크게 다르다.

### 6.2. Net Debt to EBITDA

- `NetDebt/EBITDA = (Debt_t - Cash_t) / EBITDA_t`
- 차입금 상환 가능성을 보는 대표 지표다.
- 경기 하강기에는 보수적으로 해석해야 한다.

### 6.3. Interest Coverage

- `InterestCoverage = EBIT_t / InterestExpense_t`
- 영업이익으로 이자비용을 얼마나 감당할 수 있는지 보여준다.
- 낮을수록 금리 충격과 실적 하락에 취약하다.

### 6.4. Current Ratio

- `CurrentRatio = CurrentAssets_t / CurrentLiabilities_t`
- 단기 유동성 점검 지표다.
- 재고 비중이 높으면 숫자만 보고 안심하면 안 된다.

### 6.5. Quick Ratio

- `QuickRatio = (Cash_t + ShortTermInvestments_t + Receivables_t) / CurrentLiabilities_t`
- 재고를 제외한 단기 지급 여력을 본다.
- 유통, 제조보다 소프트웨어 기업에서 해석이 더 단순한 경우가 많다.

### 6.6. Altman Z-Score

- 전통적 파산 위험 경고 모델이다.
- 일반형 예시:
  - `Z = 1.2 * (WorkingCapital / Assets) + 1.4 * (RetainedEarnings / Assets) + 3.3 * (EBIT / Assets) + 0.6 * (MarketCap / Liabilities) + 1.0 * (Revenue / Assets)`
- 실전 포인트:
  - 소형주, 제조업, 위기 기업 필터링에 특히 유용하다.

### 6.7. Piotroski F-Score

- 가치주 내부에서 재무 개선 기업을 골라내는 데 유용한 9점 척도다.
- 핵심 범주:
  - 수익성 개선
  - 레버리지 및 유동성 개선
  - 운영 효율 개선
- 실전 포인트:
  - `저PBR + 고F-Score` 조합은 전통적인 가치 보완 방식이다.

---

## 7. 현금흐름과 이익의 질

기본적 분석에서 가장 자주 놓치는 부분이 이익의 질이다. 회계 이익은 좋아 보이는데 주가가 반응하지 않는다면, 현금흐름이 그 이유를 먼저 말해주는 경우가 많다.

### 7.1. OCF vs Net Income

- `CashConversion = OCF_t / NetIncome_t`
- `1`에 가까울수록 이익의 현금 전환이 양호하다고 볼 수 있다.
- 장기간 `1` 이하가 지속되면 회계상 이익의 질을 점검해야 한다.

### 7.2. Free Cash Flow

- `FCF_t = OCF_t - Capex_t`
- 진짜 남는 현금에 가까운 지표다.
- 배당, 자사주 매입, 부채 상환의 원천이 된다.

### 7.3. Accruals Ratio

- `AccrualsRatio = (NetIncome_t - OCF_t) / AvgAssets_t`
- 값이 클수록 이익의 현금 전환이 약할 가능성이 있다.
- 높은 accrual 기업은 이후 실적 실망 가능성이 커지는 경향이 자주 관찰된다.

### 7.4. Working Capital Build

- `WorkingCapital = CurrentAssets_t - CurrentLiabilities_t`
- 매출은 늘지만 운전자본이 과도하게 묶이면 현금흐름이 악화될 수 있다.
- 특히 재고와 매출채권 증가를 분리해서 봐야 한다.

### 7.5. Dilution Risk

- `ShareChange = Shares_t / Shares_{t-4} - 1`
- 스톡옵션, 전환사채, 유상증자로 주식 수가 증가하면 주당 가치가 희석된다.
- 성장주의 경우 `SBC`와 희석주식수를 반드시 같이 봐야 한다.

---

## 8. 산업별 해석 차이

기본적 분석은 범용 공식만으로 끝나지 않는다. 산업마다 정상 지표와 핵심 지표가 다르므로 업종별 템플릿이 필요하다.

### 8.1. 금융주

- 중요 지표:
  - `PBR`
  - `ROE`
  - `NIM`
  - `대손비용`, `BIS 비율`
- 주의:
  - `EV/EBITDA` 같은 제조업식 지표는 부적절할 수 있다.

### 8.2. 반도체 / 제조업

- 중요 지표:
  - `Gross Margin`
  - `영업이익률`
  - `재고회전`
  - `Capex`
  - `EV/EBITDA`
- 주의:
  - 경기 사이클 고점에서 이익이 과대평가될 수 있다.

### 8.3. 소프트웨어 / 플랫폼

- 중요 지표:
  - `Revenue Growth`
  - `Gross Margin`
  - `FCF Margin`
  - `Rule of 40`
  - `NRR` 같은 운영지표
- `Rule of 40 = RevenueGrowth + FCFMargin`
- 주의:
  - 초기에는 `PER`보다 `PSR`, `EV/Sales`가 더 유용할 수 있다.

### 8.4. 리츠 / 부동산

- 중요 지표:
  - `P/FFO`
  - `배당수익률`
  - `LTV`
  - 공실률, 임대료 성장
- 주의:
  - 감가상각 때문에 일반 순이익 기준 PER가 왜곡될 수 있다.

### 8.5. 유통 / 소비재

- 중요 지표:
  - `Same Store Sales`
  - `재고회전`
  - `Gross Margin`
  - `Operating Margin`
- 주의:
  - 재고 증가와 할인판매 압박이 실적 둔화의 선행신호일 수 있다.

---

## 9. 팩터화와 랭킹 엔진 설계

`TradingAPP`의 핵심 기능은 지표를 보여주는 것이 아니라, 비교 가능한 점수로 바꿔주는 것이다. 기본적 분석은 특히 극단값과 업종 차이의 영향을 많이 받기 때문에 정규화 단계가 중요하다.

### 9.1. 기본 점수화 절차

- 원시 지표 계산
- 결측치 처리
- 이상치 winsorizing
- 업종 내 백분위 또는 z-score 변환
- 방향성 통일
- 가중합 또는 랭킹 합산

예시:

- `Higher is better`: `ROIC`, `GrossMargin`, `FCFYield`
- `Lower is better`: `Debt/Equity`, `EV/EBITDA`, `AccrualsRatio`
- `Score(x)`는 `z(x)` 또는 percentile rank 사용

### 9.2. 업종 중립화

- `SectorNeutralScore_{i,t} = z(x_{i,t} within sector s)`
- 장점:
  - 금융주와 소프트웨어 기업을 같은 밸류에이션 잣대로 비교하는 오류를 줄인다.
- 실전 포인트:
  - 전체 점수와 업종 중립 점수를 둘 다 제공하면 해석이 쉬워진다.

### 9.3. Composite Ranking 예시

- `ValueScore = z(EarningsYield) + z(FCFYield) + z(BookToMarket)`
- `QualityScore = z(ROIC) + z(GrossMargin) + z(CashConversion) - z(NetDebt/EBITDA)`
- `GrowthScore = z(RevenueGrowth) + z(EPSGrowth) + z(FCFGrowth)`
- `SafetyScore = -z(AccrualsRatio) - z(EarningsVolatility) - z(DebtToEquity)`
- `TotalScore = 0.30 * ValueScore + 0.30 * QualityScore + 0.20 * GrowthScore + 0.20 * SafetyScore`

### 9.4. Rebalance 주기

- 기본적 데이터는 가격 데이터보다 느리게 변한다.
- 따라서 일간 리밸런싱보다 월간 또는 분기 리밸런싱이 더 자연스럽다.
- 실적 발표 직후 리밸런싱 규칙을 별도 옵션으로 두는 것이 좋다.

---

## 10. 백테스트에서 반드시 피해야 할 오류

기본적 분석 전략은 데이터 정렬을 잘못하면 성과가 매우 과대평가된다. 이 영역에서는 지표 설계보다 `point-in-time` 처리와 공시 지연 반영이 더 중요할 수 있다.

### 10.1. Look-Ahead Bias

- 아직 발표되지 않은 실적을 과거 시점의 매수 판단에 쓰면 안 된다.
- 반드시 `보고기간 종료일`이 아니라 `실제 공시일` 또는 보수적인 `가용일` 기준으로 매핑해야 한다.

### 10.2. Filing Lag

- 분기 실적은 회계기간 종료 즉시 시장이 아는 정보가 아니다.
- 예시:
  - `2026-03-31` 결산 수치는 `2026-04-01`에 바로 사용할 수 없다.
  - 보통 국가와 시장별 공시 지연을 반영해야 한다.

### 10.3. Survivorship Bias

- 현재 살아남은 종목만 과거에 넣으면 전략 성과가 왜곡된다.
- 상장폐지, 합병, 거래정지 종목을 포함한 유니버스를 유지해야 한다.

### 10.4. Restatement Risk

- 과거 재무제표가 수정 공시될 수 있다.
- 백테스트는 가능하면 당시 시점에 알려진 버전의 데이터를 써야 한다.

### 10.5. Missing Data Bias

- 결측치를 `0`으로 대체하면 순위가 크게 왜곡될 수 있다.
- 지표별 결측 처리 원칙이 필요하다.

### 10.6. Microcap / Liquidity Trap

- 기본적 스크리닝은 초소형주에 과도하게 유리한 결과를 줄 수 있다.
- 최소 시가총액, 최소 거래대금, 최소 거래일수 필터가 필요하다.

---

## 11. 기술적 분석과 결합하는 방법

기본적 분석만으로 진입 타이밍을 정확히 잡기 어렵고, 기술적 분석만으로 기업의 질을 확인하기 어렵다. 두 문서는 경쟁 관계가 아니라 역할 분담 관계다.

### 11.1. Quality + Momentum

- 기본적 분석으로 좋은 기업군을 먼저 고른다.
- 기술적 분석으로 추세가 확인된 시점만 진입한다.
- 예시:
  - `ROIC 상위 30%`
  - `NetDebt/EBITDA 하위 50%`
  - `12개월 상대강도 상위 20%`

### 11.2. Value + Trend Filter

- 저평가 종목 중 장기 하락 추세가 완화된 종목만 선택한다.
- 예시:
  - `FCF Yield 상위 20%`
  - `PBR 하위 30%`
  - `가격 > 200일 이동평균`

### 11.3. Earnings Revision + Breakout

- 추정치 상향 또는 실적 서프라이즈가 나온 종목만 본다.
- 이후 기술적 돌파가 나오면 진입한다.
- 이벤트 드리븐 전략과 궁합이 좋다.

---

## 12. TradingAPP 구현 체크리스트

- 재무 데이터는 반드시 `point-in-time` 구조로 저장할 것
- `보고기간`, `공시일`, `수정공시일`, `데이터 반영일` 필드를 분리할 것
- 밸류에이션 지표와 품질 지표를 같은 화면에서 교차 확인할 수 있게 할 것
- 업종 중립 점수와 전체 점수를 함께 제공할 것
- 적자기업, 금융주, 지주사, 리츠 등은 별도 해석 규칙을 둘 것
- `PER`, `PBR`만으로 랭킹하지 말고 `FCF`, `ROIC`, `Debt`를 반드시 함께 사용할 것
- 희석주식수 기준 `EPS`와 자사주 매입 효과를 분리해서 보여줄 것
- 분기값과 TTM 값을 둘 다 지원할 것
- 백테스트에서는 최소 시가총액과 유동성 필터를 기본값으로 둘 것
- 스크리너 결과에 최근 가격 모멘텀을 함께 표시해 `좋은 기업`과 `좋은 주식`의 간극을 줄일 것

## 13. 한 번에 구현할 추천 스코어

초기 버전에서 가장 효율적인 것은 아래 네 개 스코어를 먼저 만드는 것이다.

### 13.1. Value Score

- `FCF Yield`
- `Earnings Yield`
- `Book-to-Market`
- `EV/EBITDA`

### 13.2. Quality Score

- `ROIC`
- `Gross Margin`
- `Operating Margin`
- `Cash Conversion`

### 13.3. Growth Score

- `Revenue Growth`
- `EPS Growth`
- `FCF Growth`

### 13.4. Safety Score

- `Debt/Equity`
- `NetDebt/EBITDA`
- `Interest Coverage`
- `Accruals Ratio`

이 네 개만 안정적으로 계산해도, 이후 가치주, 퀄리티, 성장주, GARP, 턴어라운드 전략을 거의 모두 파생할 수 있다.

## 한 줄 정리

좋은 기본적 분석은 싸 보이는 종목을 찾는 작업이 아니라, 가격, 수익성, 현금흐름, 성장, 재무건전성을 함께 점수화해 "좋은 기업", "좋은 가격", "좋은 타이밍" 사이의 간극을 줄이는 작업이다. `TradingAPP`에서는 이를 스크리닝과 랭킹 엔진의 형태로 구현하는 것이 핵심이다.
