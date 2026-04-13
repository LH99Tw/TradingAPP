export type PortfolioId = 'core-alpha' | 'macro-tilt'
export type TimeRange = '1D' | '1W' | '1M' | '3M' | 'YTD'

type Point = {
  x: number
  y: number
}

export type SummaryStat = {
  label: string
  value: string
  tone?: 'positive' | 'negative' | 'neutral'
  note: string
}

export type Contributor = {
  name: string
  ticker: string
  contribution: number
  weight: string
  note: string
}

export type StrategyImpactItem = {
  name: string
  weight: string
  contribution: number
  sevenDay: string
  status: 'active' | 'warning' | 'paused'
}

export type MarketDriver = {
  name: string
  value: string
  delta: string
  tone: 'positive' | 'negative' | 'neutral'
  label: string
  impact: string
}

export type AllocationItem = {
  name: string
  weight: number
  returnText: string
  tone: 'positive' | 'negative' | 'neutral'
  color: string
}

export type PortfolioSnapshot = {
  id: PortfolioId
  name: string
  greeting: string
  lastUpdated: string
  statusBadges: string[]
  summary: SummaryStat[]
  seriesByRange: Record<TimeRange, Point[]>
  topContributors: Contributor[]
  bottomContributors: Contributor[]
  strategyImpactItems: StrategyImpactItem[]
  marketDrivers: MarketDriver[]
  allocationItems: AllocationItem[]
}

const withX = (values: number[]): Point[] => values.map((y, index) => ({ x: index, y }))

export const DASHBOARD_DATA: Record<PortfolioId, PortfolioSnapshot> = {
  'core-alpha': {
    id: 'core-alpha',
    name: 'Core Alpha',
    greeting: 'Good morning, your portfolio is compounding steadily.',
    lastUpdated: 'Last sync 2m ago',
    statusBadges: ['paper', 'live disabled', '5 active drivers'],
    summary: [
      { label: 'Today PnL', value: '+$12,480', tone: 'positive', note: '+1.38% from yesterday close' },
      { label: 'Total Value', value: '$913,240', tone: 'neutral', note: 'Across 18 positions' },
      { label: 'Best Contributor', value: 'NVDA', tone: 'positive', note: '+$4,180 contribution' },
      { label: 'Worst Contributor', value: 'XOM', tone: 'negative', note: '-$1,220 drag today' }
    ],
    seriesByRange: {
      '1D': withX([42, 44, 47, 49, 48, 53, 57, 61, 59, 64, 66, 68]),
      '1W': withX([38, 40, 43, 41, 46, 50, 48, 52, 55, 58, 61, 64]),
      '1M': withX([28, 31, 29, 35, 38, 41, 39, 44, 47, 50, 55, 59]),
      '3M': withX([18, 20, 24, 22, 27, 31, 35, 33, 39, 46, 52, 58]),
      YTD: withX([11, 15, 19, 18, 24, 29, 32, 30, 36, 42, 49, 57])
    },
    topContributors: [
      { name: 'NVIDIA', ticker: 'NVDA', contribution: 4180, weight: '11.4%', note: 'AI momentum continued after earnings revisions' },
      { name: 'Microsoft', ticker: 'MSFT', contribution: 2960, weight: '9.8%', note: 'Cloud guidance and lower volatility supported gains' },
      { name: 'TSMC ETF', ticker: 'SOXX', contribution: 1885, weight: '7.2%', note: 'Semiconductor basket lifted portfolio beta' }
    ],
    bottomContributors: [
      { name: 'Exxon Mobil', ticker: 'XOM', contribution: -1220, weight: '5.1%', note: 'Oil cooled after inventory surprise' },
      { name: 'US Small Cap', ticker: 'IWM', contribution: -940, weight: '4.4%', note: 'Rates pressure hit cyclicals' },
      { name: 'Utilities Basket', ticker: 'XLU', contribution: -520, weight: '3.2%', note: 'Defensives lagged during risk-on rotation' }
    ],
    strategyImpactItems: [
      { name: 'AI Leaders Momentum', weight: '28%', contribution: 1.12, sevenDay: '+4.6%', status: 'active' },
      { name: 'Quality Growth Filter', weight: '22%', contribution: 0.64, sevenDay: '+2.1%', status: 'active' },
      { name: 'Rates Hedge Overlay', weight: '14%', contribution: -0.18, sevenDay: '-0.7%', status: 'warning' },
      { name: 'Energy Mean Reversion', weight: '9%', contribution: -0.31, sevenDay: '-1.4%', status: 'paused' }
    ],
    marketDrivers: [
      { name: 'DXY', value: '104.12', delta: '-0.11%', tone: 'positive', label: 'Dollar Easing', impact: 'Growth allocation supportive' },
      { name: 'VIX', value: '16.24', delta: '-1.94%', tone: 'positive', label: 'Vol Cooling', impact: 'Momentum sleeve can stay expanded' },
      { name: 'US 10Y', value: '4.27%', delta: '+0.08%', tone: 'negative', label: 'Rates Rising', impact: 'Long-duration names face mild pressure' },
      { name: 'S&P 500', value: '5,236', delta: '+0.84%', tone: 'positive', label: 'Risk-On', impact: 'Broad market confirms portfolio strength' }
    ],
    allocationItems: [
      { name: 'AI / Semis', weight: 34, returnText: '+3.8%', tone: 'positive', color: '#5b8def' },
      { name: 'Platform Tech', weight: 24, returnText: '+2.1%', tone: 'positive', color: '#7aa7ff' },
      { name: 'Macro Hedges', weight: 18, returnText: '-0.4%', tone: 'negative', color: '#9bc4ff' },
      { name: 'Energy', weight: 12, returnText: '-1.3%', tone: 'negative', color: '#d0e2ff' },
      { name: 'Cash', weight: 12, returnText: '0.0%', tone: 'neutral', color: '#eef4ff' }
    ]
  },
  'macro-tilt': {
    id: 'macro-tilt',
    name: 'Macro Tilt',
    greeting: 'Macro Tilt is holding up, but rates remain the swing factor.',
    lastUpdated: 'Last sync 4m ago',
    statusBadges: ['paper', 'macro watch', '3 active drivers'],
    summary: [
      { label: 'Today PnL', value: '-$3,940', tone: 'negative', note: '-0.42% from yesterday close' },
      { label: 'Total Value', value: '$672,810', tone: 'neutral', note: 'Across 12 positions' },
      { label: 'Best Contributor', value: 'TLT Hedge', tone: 'positive', note: '+$1,060 contribution' },
      { label: 'Worst Contributor', value: 'KOSPI Beta', tone: 'negative', note: '-$2,140 contribution' }
    ],
    seriesByRange: {
      '1D': withX([60, 58, 57, 55, 53, 54, 52, 51, 49, 48, 47, 46]),
      '1W': withX([66, 64, 63, 61, 59, 58, 56, 55, 54, 51, 49, 47]),
      '1M': withX([72, 71, 69, 67, 65, 63, 62, 59, 57, 55, 52, 49]),
      '3M': withX([78, 76, 74, 72, 71, 69, 66, 63, 61, 58, 54, 50]),
      YTD: withX([85, 82, 80, 78, 74, 72, 69, 65, 61, 58, 54, 50])
    },
    topContributors: [
      { name: 'Treasury Hedge', ticker: 'TLT', contribution: 1060, weight: '13.1%', note: 'Hedge cushioned equity weakness' },
      { name: 'Gold Basket', ticker: 'GLD', contribution: 740, weight: '8.7%', note: 'Risk hedge held gains into USD weakness' },
      { name: 'Cash Rotation', ticker: 'USD', contribution: 260, weight: '11.0%', note: 'Capital preservation remained effective' }
    ],
    bottomContributors: [
      { name: 'KOSPI Beta', ticker: 'KODEX200', contribution: -2140, weight: '19.5%', note: 'High beta sleeve pulled back sharply' },
      { name: 'Cyclical Exporters', ticker: 'KRX-EXP', contribution: -1280, weight: '10.4%', note: 'FX-sensitive names lagged guidance' },
      { name: 'Oil Rotation', ticker: 'USO', contribution: -640, weight: '6.1%', note: 'Commodities retraced on softer demand read' }
    ],
    strategyImpactItems: [
      { name: 'Rates Defense', weight: '25%', contribution: 0.22, sevenDay: '+1.1%', status: 'active' },
      { name: 'Macro Regime Filter', weight: '20%', contribution: -0.12, sevenDay: '-0.5%', status: 'warning' },
      { name: 'Korea Export Momentum', weight: '18%', contribution: -0.41, sevenDay: '-2.2%', status: 'warning' },
      { name: 'Commodity Carry', weight: '10%', contribution: -0.18, sevenDay: '-1.0%', status: 'paused' }
    ],
    marketDrivers: [
      { name: 'DXY', value: '103.88', delta: '-0.29%', tone: 'positive', label: 'Dollar Softening', impact: 'EM and gold sleeves stabilize' },
      { name: 'VIX', value: '19.44', delta: '+2.18%', tone: 'negative', label: 'Vol Rising', impact: 'Risk budget should stay tighter' },
      { name: 'US 10Y', value: '4.36%', delta: '+0.11%', tone: 'negative', label: 'Rates Rising', impact: 'Equity beta remains under pressure' },
      { name: 'KOSPI', value: '2,714', delta: '-0.92%', tone: 'negative', label: 'Local Risk-Off', impact: 'Korea sleeve is the main drag today' }
    ],
    allocationItems: [
      { name: 'Korea Beta', weight: 31, returnText: '-2.4%', tone: 'negative', color: '#7aa7ff' },
      { name: 'Rates Hedge', weight: 25, returnText: '+1.1%', tone: 'positive', color: '#9bbaff' },
      { name: 'Gold / FX', weight: 17, returnText: '+0.8%', tone: 'positive', color: '#bfd4ff' },
      { name: 'Commodity Carry', weight: 10, returnText: '-0.7%', tone: 'negative', color: '#dae8ff' },
      { name: 'Cash', weight: 17, returnText: '0.0%', tone: 'neutral', color: '#eef4ff' }
    ]
  }
}
