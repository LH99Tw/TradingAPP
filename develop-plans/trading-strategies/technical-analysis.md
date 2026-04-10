# 기술적 분석 방법론 정리

이 문서는 `TradingAPP`에서 구현 우선순위가 높은 기술적 분석 지표와 전략 방법론을 정리한 실무용 노트다. 기존의 단순 지표 목록을 넘어, 실제 구현에 필요한 공식과 함께 "무엇을 먼저 넣어야 하는가"까지 포함한다.

## 문서 목적

- 차트용 보조지표 나열이 아니라, 전략 엔진에서 재사용 가능한 `signal`, `filter`, `position sizing`, `risk control` 구성요소를 정리한다.
- 현재 문서에 빠져 있던 실전형 방법론을 추가한다.
- 최근 성과 자료 기준으로 우선순위가 높은 방법론을 따로 표시한다.
- 각 항목마다 바로 코드로 옮길 수 있는 계산식을 병기한다.

## 기본 표기

- `O_t, H_t, L_t, C_t, V_t`: 시점 `t`의 시가, 고가, 저가, 종가, 거래량
- `TP_t = (H_t + L_t + C_t) / 3`: Typical Price
- `r_t = C_t / C_{t-1} - 1`: 단순 수익률
- `lr_t = ln(C_t / C_{t-1})`: 로그 수익률
- `SMA_n(x)_t = (1 / n) * Σ_{i=0}^{n-1} x_{t-i}`
- `EMA_n(x)_t = α * x_t + (1 - α) * EMA_n(x)_{t-1}`, `α = 2 / (n + 1)`
- `RMA_n(x)_t = ((n - 1) * RMA_n(x)_{t-1} + x_t) / n`: Wilder smoothing

지표는 단독 사용보다 다음 네 계층으로 나눠 설계하는 편이 좋다.

- `Signal`: 진입/청산 방향
- `Filter`: 추세장/횡보장 같은 레짐 판별
- `Sizing`: 변동성 기반 포지션 크기 조절
- `Risk`: ATR 손절, 최대 보유 수, 최대 손실 제한

---

## 1. 현재 문서에 추가해야 할 핵심 방법론

기존 문서는 지표 목록은 넓지만, 실제 전략 성과에 직접 연결되는 방법론이 빠져 있었다. 아래 항목은 `TradingAPP` 관점에서 우선 추가할 가치가 높다.

### 1.1. Time-Series Momentum

- 개념: "자산 자신의 과거 수익률이 양수면 매수, 음수면 매도"라는 가장 기본적인 추세 추종 전략이다.
- 장점: 구현이 단순하고, 이동평균 크로스나 MACD보다 신호 정의가 명확하다.
- 기본 공식:
  - `TSMOM_{n,t} = sign(C_t / C_{t-n} - 1)`
  - 또는 `TSRET_{n,t} = C_t / C_{t-n} - 1`
- 실전형 변형:
  - `Signal_t = sign(EMA_fast(C)_t - EMA_slow(C)_t)`
  - `VolAdjSignal_t = (C_t / C_{t-n} - 1) / σ_n(r)_t`

### 1.2. Cross-Sectional Momentum / Relative Strength

- 개념: 여러 종목 중 최근 상대적으로 강한 종목을 상위 랭크로 선택하는 방식이다.
- 장점: 스크리너, 종목 순위, ETF 로테이션에 직접 연결된다.
- 기본 공식:
  - `RS_{i,t} = C_{i,t} / C_{i,t-n} - 1`
  - 각 종목 `i`에 대해 `RS_{i,t}`를 계산한 뒤 내림차순 랭킹
- 실전형 변형:
  - `RiskAdjRS_{i,t} = (C_{i,t} / C_{i,t-n} - 1) / σ_{i,n}(r)_t`

### 1.3. Dual Momentum

- 개념: 절대 모멘텀과 상대 모멘텀을 동시에 사용한다.
- 장점: 약세장 회피와 강한 자산 선택을 한 번에 처리하기 좋다.
- 기본 규칙:
  - 절대 모멘텀: `AbsMom_{i,t} = C_{i,t} / C_{i,t-n} - 1 > 0`
  - 상대 모멘텀: `RelRank_{i,t}`가 상위 `k`개
  - 매수 조건: `AbsMom_{i,t} > 0` 이면서 `RelRank_{i,t} <= k`

### 1.4. Breakout / Donchian Trend Following

- 개념: 최근 `n`일 고점 돌파를 매수, 저점 이탈을 매도 신호로 쓴다.
- 장점: 추세 지속 구간에서 단순하고 강한 로직이다.
- 기본 공식:
  - `Upper_t = max(H_{t-n}, ..., H_{t-1})`
  - `Lower_t = min(L_{t-n}, ..., L_{t-1})`
  - `LongEntry_t = 1 if C_t > Upper_t`
  - `ShortEntry_t = 1 if C_t < Lower_t`
- Turtle 스타일 청산 예시:
  - `ExitLong_t = 1 if C_t < min(L_{t-m}, ..., L_{t-1})`

### 1.5. Volatility Targeting

- 개념: 신호 강도보다 실현 변동성에 맞춰 포지션 크기를 조절한다.
- 장점: 같은 전략이라도 손익곡선이 더 안정적이 된다.
- 기본 공식:
  - `σ_realized,t = std(r_{t-n+1}, ..., r_t) * sqrt(annualization_factor)`
  - `Weight_t = min(LeverageCap, TargetVol / σ_realized,t)`

### 1.6. ATR Position Sizing / ATR Stop

- 개념: 변동성이 큰 종목은 적게, 작은 종목은 많이 들고 가는 방식이다.
- 장점: 종목 간 손절 폭을 표준화할 수 있다.
- 기본 공식:
  - `PositionSize_t = RiskBudget / (k * ATR_t)`
  - `LongStop_t = EntryPrice - k * ATR_t`
  - `ShortStop_t = EntryPrice + k * ATR_t`

### 1.7. Anchored VWAP

- 개념: 특정 이벤트 시점부터 누적한 VWAP를 기준선으로 삼는다.
- 장점: 실적 발표일, 급등 시작일, 월초, 고점/저점 pivot 이후 평균 단가를 추적하기 좋다.
- 기본 공식:
  - 앵커 시점 `t0`에 대해
  - `AVWAP_t = Σ_{i=t0}^{t} (TP_i * V_i) / Σ_{i=t0}^{t} V_i`

### 1.8. SuperTrend

- 개념: ATR 기반 추세 추종 밴드다.
- 장점: 이동평균보다 손절과 추세 전환이 직관적이다.
- 기본 공식:
  - `Mid_t = (H_t + L_t) / 2`
  - `BasicUpper_t = Mid_t + m * ATR_t`
  - `BasicLower_t = Mid_t - m * ATR_t`
  - `FinalUpper_t = BasicUpper_t` if `BasicUpper_t < FinalUpper_{t-1}` or `C_{t-1} > FinalUpper_{t-1}`, else `FinalUpper_{t-1}`
  - `FinalLower_t = BasicLower_t` if `BasicLower_t > FinalLower_{t-1}` or `C_{t-1} < FinalLower_{t-1}`, else `FinalLower_{t-1}`
  - `SuperTrend_t = FinalLower_t` if `C_t > FinalUpper_{t-1}`, `SuperTrend_t = FinalUpper_t` if `C_t < FinalLower_{t-1}`, 아니면 직전 추세 유지

### 1.9. Regime Filter

- 개념: 추세장에서는 추세 전략, 횡보장에서는 평균회귀 전략을 쓰도록 시장 상태를 먼저 분류한다.
- 장점: 지표 하나를 만능처럼 쓰는 오류를 줄인다.
- 구현 예시:
  - 추세장 조건: `ADX_t > 25` 그리고 `C_t > EMA_200_t`
  - 횡보장 조건: `ADX_t < 20` 그리고 `|zscore_t| < threshold`
  - 볼린저 평균회귀용 `zscore_t = (C_t - SMA_n(C)_t) / σ_n(C)_t`

---

## 2. 최근 성과 기준으로 우선순위가 높은 방법론

아래는 "항상 이긴다"는 뜻이 아니라, 최근 공개 자료 기준으로 상대적으로 강세가 확인된 축이다. 기준 시점은 `2026년 3월 31일`과 `2026년 1분기` 공개 자료다.

### 2.1. 우선순위 상

- `Momentum / Relative Strength`
  - 최근 자료에서 모멘텀은 여전히 핵심 축이지만, 단기와 중기 성과를 분리해서 봐야 한다.
  - `S&P Dow Jones Indices`의 `March 2026` 대시보드 기준 `S&P 500 Momentum`의 최근 `12개월 총수익률`은 `22.5%`로 `S&P 500`의 `17.8%`를 상회했다.
  - 반면 같은 자료에서 최근 `1개월`과 `3개월` 성과는 각각 `-5.8%`, `-5.7%`로 단기 구간은 둔화됐다.
  - 해석: 중기 추세/상대강도는 아직 유효하지만, 단기 반전 구간에 대비한 레짐 필터가 필요하다.
  - 제품 반영 우선순위: `12-1 모멘텀`, `상대강도 랭킹`, `듀얼 모멘텀`

- `Trend Following / Time-Series Momentum`
  - `J.P. Morgan Asset Management`의 `Factor Views 1Q 2026` 요약에서는 매크로 모멘텀이 플러스였고, 여러 시장에서 트렌드가 강화됐다고 정리한다.
  - 같은 자료는 미국보다 국제 주식과 일부 원자재에서 모멘텀/트렌드 신호가 더 양호했다고 본다.
  - 제품 반영 우선순위: `EMA 크로스`, `Donchian breakout`, `SuperTrend`, `ADX 필터`

- `Commodity Trend / Momentum`
  - `J.P. Morgan` 자료 요약에서는 금속 강세와 일부 농산물 약세처럼 자산별 방향성이 갈린 구간에서 상품 모멘텀이 잘 작동했다고 설명한다.
  - 주식만 볼 것이 아니라 자산군 확장 가능한 구조로 설계하는 편이 낫다.
  - 제품 반영 우선순위: 자산군 공통의 `TSMOM`, `Donchian`, `Volatility Targeting`

### 2.2. 우선순위 중

- `Anchored VWAP`
  - 기관/단기 트레이더가 함께 보는 가격 기준선으로 활용도가 높다.
  - 최근 강한 추세 종목에서도 눌림목 기준선으로 자주 쓰인다.

- `Volatility Targeting / ATR Sizing`
  - 독립적인 알파 소스라기보다, 좋은 시그널의 실전 성과를 보존하는 데 효과적이다.
  - `S&P`의 `March 2026` 자료에서 `High Dividend`, `Low Volatility`, `Dividend Aristocrats` 같은 방어형 팩터가 강했던 점을 보면, 현재 시장은 순수 방향성보다 변동성 관리 계층이 중요하다고 해석할 수 있다.
  - 위 해석은 팩터 성과를 기술적 분석 구현 우선순위에 연결한 추론이다.

### 2.3. 주의

- `RSI`, `Stochastic`, `Williams %R` 같은 오실레이터는 횡보장에서는 유용하지만 강한 추세장에서는 역추세 진입을 너무 빨리 만들 수 있다.
- 따라서 최근 우선순위는 `추세 + 모멘텀 + 변동성 관리` 조합이 더 높다.

출처:

- [S&P Dow Jones Indices, Index Dashboard: S&P 500 Factor Indices, March 2026](https://www.spglobal.com/spdji/tc/documents/performance-reports/dashboard-sp-500-factor.pdf)
- [J.P. Morgan Asset Management, Factor Views 1Q 2026](https://am.jpmorgan.com/gb/en/asset-management/institutional/insights/portfolio-insights/asset-class-views/factor/)
- [Leuthold Group, 2024 Factor Performance, January 8, 2025](https://research.leutholdgroup.com/section/quant/articles/2025/01/07/2024-factor-performance.25055)

---

## 3. 핵심 구현 세트 제안

`TradingAPP`에서 바로 우선 구현할 세트는 아래 조합이 효율적이다.

### 3.1. 1차 구현

- `SMA`, `EMA`, `MACD`
- `RSI`
- `ATR`
- `Bollinger Bands`
- `OBV`
- `Pivot Point`

이 조합만으로도 기본 차트, 필터, 손절, 알림은 충분히 구성된다.

### 3.2. 2차 구현

- `Time-Series Momentum`
- `Dual Momentum`
- `Donchian Breakout`
- `Anchored VWAP`
- `SuperTrend`
- `ATR Position Sizing`
- `Volatility Targeting`

이 단계부터는 단순 보조지표 앱이 아니라 실제 전략 빌더에 가까워진다.

### 3.3. 3차 구현

- `Ichimoku Cloud`
- `ADX`
- `MFI`, `CMF`, `A/D`
- `Keltner Channel`
- `Regime Filter`

---

## 4. 추세(Trend) 지표 및 공식

### 4.1. 이동평균(MA: Moving Average)

- `SMA_n,t = (1 / n) * Σ_{i=0}^{n-1} C_{t-i}`
- `EMA_n,t = α * C_t + (1 - α) * EMA_{n,t-1}`, `α = 2 / (n + 1)`
- `WMA_n,t = Σ_{i=0}^{n-1} w_i * C_{t-i} / Σ_{i=0}^{n-1} w_i`

### 4.2. MACD

- `MACD_t = EMA_12(C)_t - EMA_26(C)_t`
- `Signal_t = EMA_9(MACD)_t`
- `Histogram_t = MACD_t - Signal_t`

### 4.3. ADX

- `TR_t = max(H_t - L_t, |H_t - C_{t-1}|, |L_t - C_{t-1}|)`
- `+DM_t = H_t - H_{t-1}` if `(H_t - H_{t-1}) > (L_{t-1} - L_t)` and positive, else `0`
- `-DM_t = L_{t-1} - L_t` if `(L_{t-1} - L_t) > (H_t - H_{t-1})` and positive, else `0`
- `ATR_t = RMA_n(TR)_t`
- `+DI_t = 100 * RMA_n(+DM)_t / ATR_t`
- `-DI_t = 100 * RMA_n(-DM)_t / ATR_t`
- `DX_t = 100 * |+DI_t - -DI_t| / (+DI_t + -DI_t)`
- `ADX_t = RMA_n(DX)_t`

### 4.4. Parabolic SAR

- `SAR_t = SAR_{t-1} + AF_{t-1} * (EP_{t-1} - SAR_{t-1})`
- `EP`: 상승 추세면 최고가, 하락 추세면 최저가
- `AF`: 기본 `0.02`, 새로운 extreme point가 나오면 `0.02`씩 증가, 보통 최대 `0.20`

### 4.5. Ichimoku Cloud

- `Tenkan_t = (max(H, 9) + min(L, 9)) / 2`
- `Kijun_t = (max(H, 26) + min(L, 26)) / 2`
- `SenkouA_t = (Tenkan_t + Kijun_t) / 2`, 차트상 `+26` 이동
- `SenkouB_t = (max(H, 52) + min(L, 52)) / 2`, 차트상 `+26` 이동
- `Chikou_t = C_t`, 차트상 `-26` 이동

### 4.6. CCI

- `TP_t = (H_t + L_t + C_t) / 3`
- `CCI_t = (TP_t - SMA_n(TP)_t) / (0.015 * MAD_n(TP)_t)`
- `MAD_n(TP)_t = (1 / n) * Σ_{i=0}^{n-1} |TP_{t-i} - SMA_n(TP)_t|`

### 4.7. SuperTrend

- `Mid_t = (H_t + L_t) / 2`
- `BasicUpper_t = Mid_t + m * ATR_t`
- `BasicLower_t = Mid_t - m * ATR_t`
- `FinalUpper_t = BasicUpper_t` if `BasicUpper_t < FinalUpper_{t-1}` or `C_{t-1} > FinalUpper_{t-1}`, else `FinalUpper_{t-1}`
- `FinalLower_t = BasicLower_t` if `BasicLower_t > FinalLower_{t-1}` or `C_{t-1} < FinalLower_{t-1}`, else `FinalLower_{t-1}`
- `SuperTrend_t = FinalLower_t` if `C_t > FinalUpper_{t-1}`
- `SuperTrend_t = FinalUpper_t` if `C_t < FinalLower_{t-1}`
- 그 외에는 직전 `SuperTrend` 방향 유지

### 4.8. Time-Series Momentum

- `TSRET_{n,t} = C_t / C_{t-n} - 1`
- `TSMOM_{n,t} = sign(TSRET_{n,t})`
- 대안:
  - `TSMOM_EMA_t = sign(EMA_fast(C)_t - EMA_slow(C)_t)`

### 4.9. Donchian Breakout

- `DonchianUpper_t = max(H_{t-n}, ..., H_{t-1})`
- `DonchianLower_t = min(L_{t-n}, ..., L_{t-1})`
- `DonchianMid_t = (DonchianUpper_t + DonchianLower_t) / 2`

---

## 5. 모멘텀(Momentum) 지표 및 공식

### 5.1. RSI

- `Gain_t = max(C_t - C_{t-1}, 0)`
- `Loss_t = max(C_{t-1} - C_t, 0)`
- `AvgGain_t = RMA_n(Gain)_t`
- `AvgLoss_t = RMA_n(Loss)_t`
- `RS_t = AvgGain_t / AvgLoss_t`
- `RSI_t = 100 - 100 / (1 + RS_t)`

### 5.2. Stochastic Oscillator

- `%K_t = 100 * (C_t - min(L, n)) / (max(H, n) - min(L, n))`
- `%D_t = SMA_3(%K)_t`

### 5.3. MFI

- `TP_t = (H_t + L_t + C_t) / 3`
- `RawMF_t = TP_t * V_t`
- `PositiveMF_t = RawMF_t` if `TP_t > TP_{t-1}`, else `0`
- `NegativeMF_t = RawMF_t` if `TP_t < TP_{t-1}`, else `0`
- `MFR_t = Σ PositiveMF / Σ NegativeMF`
- `MFI_t = 100 - 100 / (1 + MFR_t)`

### 5.4. Williams %R

- `%R_t = -100 * (max(H, n) - C_t) / (max(H, n) - min(L, n))`

### 5.5. ROC

- `ROC_{n,t} = 100 * (C_t / C_{t-n} - 1)`

### 5.6. PPO

- `PPO_t = 100 * (EMA_fast(C)_t - EMA_slow(C)_t) / EMA_slow(C)_t`
- `PPO_Signal_t = EMA_9(PPO)_t`

### 5.7. Relative Strength

- `RS_{i,t} = C_{i,t} / C_{i,t-n} - 1`
- 여러 자산에 대해 `RS_{i,t}`를 계산하고 랭킹

### 5.8. Dual Momentum

- `AbsMom_{i,t} = C_{i,t} / C_{i,t-n} - 1`
- `RelMomRank_{i,t} = rank_desc(AbsMom_{i,t})`
- `Select_i = 1` if `AbsMom_{i,t} > 0` and `RelMomRank_{i,t} <= k`

---

## 6. 변동성(Volatility) 지표 및 공식

### 6.1. Bollinger Bands

- `Middle_t = SMA_n(C)_t`
- `σ_t = std(C_{t-n+1}, ..., C_t)`
- `Upper_t = Middle_t + k * σ_t`
- `Lower_t = Middle_t - k * σ_t`
- `ZScore_t = (C_t - Middle_t) / σ_t`

### 6.2. ATR

- `TR_t = max(H_t - L_t, |H_t - C_{t-1}|, |L_t - C_{t-1}|)`
- `ATR_t = RMA_n(TR)_t`

### 6.3. Donchian Channel

- `Upper_t = max(H_{t-n+1}, ..., H_t)`
- `Lower_t = min(L_{t-n+1}, ..., L_t)`
- `Middle_t = (Upper_t + Lower_t) / 2`

### 6.4. Keltner Channel

- `Middle_t = EMA_n(C)_t`
- `Upper_t = Middle_t + m * ATR_t`
- `Lower_t = Middle_t - m * ATR_t`

### 6.5. 표준편차(σ)

- `σ_t = sqrt((1 / n) * Σ_{i=0}^{n-1} (C_{t-i} - SMA_n(C)_t)^2)`

### 6.6. 실현 변동성(Realized Volatility)

- `σ_realized,t = std(r_{t-n+1}, ..., r_t) * sqrt(annualization_factor)`

### 6.7. Volatility Targeting

- `Weight_t = min(LeverageCap, TargetVol / σ_realized,t)`

### 6.8. ATR Position Sizing

- `Units_t = RiskBudget / (k * ATR_t)`
- `StopDistance_t = k * ATR_t`

---

## 7. 거래량(Volume) 지표 및 공식

### 7.1. OBV

- `OBV_t = OBV_{t-1} + V_t` if `C_t > C_{t-1}`
- `OBV_t = OBV_{t-1} - V_t` if `C_t < C_{t-1}`
- `OBV_t = OBV_{t-1}` if `C_t = C_{t-1}`

### 7.2. CMF

- `MFM_t = ((C_t - L_t) - (H_t - C_t)) / (H_t - L_t)`
- `MFV_t = MFM_t * V_t`
- `CMF_t = Σ MFV / Σ V`

### 7.3. Accumulation / Distribution

- `ADL_t = ADL_{t-1} + MFV_t`
- 여기서 `MFV_t = MFM_t * V_t`

### 7.4. VWAP

- `Price_t = TP_t = (H_t + L_t + C_t) / 3`
- `VWAP_t = Σ (Price_i * V_i) / Σ V_i`
- 보통 장중 누적 기준으로 계산

### 7.5. Anchored VWAP

- 앵커 시점 `t0`에 대해
- `AVWAP_t = Σ_{i=t0}^{t} (TP_i * V_i) / Σ_{i=t0}^{t} V_i`

---

## 8. 지지/저항(Support & Resistance) 툴 및 공식

### 8.1. Pivot Point

- `PP = (H_prev + L_prev + C_prev) / 3`
- `R1 = 2 * PP - L_prev`
- `S1 = 2 * PP - H_prev`
- `R2 = PP + (H_prev - L_prev)`
- `S2 = PP - (H_prev - L_prev)`
- `R3 = H_prev + 2 * (PP - L_prev)`
- `S3 = L_prev - 2 * (H_prev - PP)`

### 8.2. Fibonacci Retracement

- 상승 구간의 저점 `LowSwing`, 고점 `HighSwing`에 대해
- `Level(r) = HighSwing - r * (HighSwing - LowSwing)`
- 일반 비율 `r`: `0.236`, `0.382`, `0.500`, `0.618`, `0.786`

### 8.3. Trendline

- 두 기준점 `(t1, P1)`, `(t2, P2)`를 지나는 선
- `Slope = (P2 - P1) / (t2 - t1)`
- `Trendline_t = P1 + Slope * (t - t1)`

### 8.4. Channel

- 기준 추세선 `Trendline_t`가 있을 때
- `UpperChannel_t = Trendline_t + d`
- `LowerChannel_t = Trendline_t - d`
- `d`는 고정 폭, `ATR`, 또는 회귀 잔차 표준편차 `k * σ_residual`

### 8.5. Gann

- 실무 우선순위는 높지 않지만 기존 목록에 있으므로 남긴다.
- 기본 아이디어는 가격 변화와 시간 변화의 비율이다.
- 단순 구현 예:
  - `SlopeRatio = ΔPrice / ΔTime`
  - 대표 각도는 `1x1`, `2x1`, `1x2` 같은 비율선
- 다만 다른 도구와 달리 표준화된 현대 구현 관행이 약하므로 후순위로 두는 편이 좋다.

---

## 9. 레짐별 추천 조합

### 9.1. 추세장

- 진입: `Donchian Breakout` 또는 `EMA Fast > EMA Slow`
- 필터: `ADX > 25`
- 리스크: `ATR Stop`, `Volatility Targeting`
- 보조 확인: `Anchored VWAP` 위 유지 여부

### 9.2. 횡보장

- 진입: `RSI < 30`, `Bollinger ZScore < -2`
- 청산: `Middle Band` 회귀 또는 `RSI > 50`
- 필터: `ADX < 20`

### 9.3. 종목 로테이션

- 선별: `Relative Strength` 상위 랭크
- 방어: `Dual Momentum`으로 절대 모멘텀 음수 자산 제외
- 크기 조절: `Volatility Targeting`

---

## 10. 구현 우선순위 결론

문서 기준으로 가장 먼저 넣어야 할 것은 다음 다섯 축이다.

- `Time-Series Momentum`
- `Relative Strength / Dual Momentum`
- `Donchian Breakout`
- `ATR 기반 손절 및 포지션 사이징`
- `Anchored VWAP`

이유는 명확하다.

- 기존 문서의 다수 항목은 "지표" 수준이지만, 위 항목들은 바로 전략 규칙으로 연결된다.
- 최근 성과 관점에서도 추세와 모멘텀 계열의 우선순위가 높다.
- 구현 난도 대비 실전 활용도가 높다.

즉 `TradingAPP`는 "보조지표 모음"보다 `추세`, `모멘텀`, `브레이크아웃`, `변동성 관리`, `거래량 기준선`의 다섯 블록을 중심으로 설계하는 편이 더 낫다.
