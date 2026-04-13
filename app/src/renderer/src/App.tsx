import { startTransition, useEffect, useRef, useState, type RefObject } from 'react'
import { DASHBOARD_DATA, type Contributor, type MarketDriver, type PortfolioId, type PortfolioSnapshot, type TimeRange } from './dashboardMock'

const NAV_ITEMS = ['Dashboard', 'Research Lab', 'Backtests', 'Portfolio & Risk', 'Execution', 'Reports']
const RANGE_OPTIONS: TimeRange[] = ['1D', '1W', '1M', '3M', 'YTD']
type ViewMode = 'dashboard' | 'settings'

type DashboardData = {
  selectedPortfolioId: PortfolioId
  selectedRange: TimeRange
  portfolioSummary: PortfolioSnapshot['summary']
  performanceSeries: PortfolioSnapshot['seriesByRange'][TimeRange]
  topContributors: PortfolioSnapshot['topContributors']
  bottomContributors: PortfolioSnapshot['bottomContributors']
  strategyImpactItems: PortfolioSnapshot['strategyImpactItems']
  marketDrivers: PortfolioSnapshot['marketDrivers']
  allocationItems: PortfolioSnapshot['allocationItems']
}

const getDashboardData = (portfolioId: PortfolioId, range: TimeRange): DashboardData => {
  const snapshot = DASHBOARD_DATA[portfolioId]
  return {
    selectedPortfolioId: portfolioId,
    selectedRange: range,
    portfolioSummary: snapshot.summary,
    performanceSeries: snapshot.seriesByRange[range],
    topContributors: snapshot.topContributors,
    bottomContributors: snapshot.bottomContributors,
    strategyImpactItems: snapshot.strategyImpactItems,
    marketDrivers: snapshot.marketDrivers,
    allocationItems: snapshot.allocationItems
  }
}

export function App(): JSX.Element {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<PortfolioId>('core-alpha')
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M')
  const [isPortfolioMenuOpen, setIsPortfolioMenuOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard')
  const portfolioMenuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent): void => {
      if (!portfolioMenuRef.current) {
        return
      }

      if (!portfolioMenuRef.current.contains(event.target as Node)) {
        setIsPortfolioMenuOpen(false)
      }
    }

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsPortfolioMenuOpen(false)
      }
    }

    window.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const snapshot = DASHBOARD_DATA[selectedPortfolioId]
  const dashboardData = getDashboardData(selectedPortfolioId, selectedRange)

  return (
    <div className="app-shell">
      <header className="top-bar">
        <div className="top-left">
          <div className="brand-block">
            <div className="brand">
              <span className="brand-main">Trading</span>
              <span className="brand-sub">APP</span>
            </div>
          </div>
          <nav className="main-nav" aria-label="Primary">
            {NAV_ITEMS.map((item) => (
              <a
                key={item}
                href="#"
                className={item === 'Dashboard' && viewMode === 'dashboard' ? 'active' : undefined}
                onClick={(event) => {
                  event.preventDefault()
                  if (item === 'Dashboard') {
                    setViewMode('dashboard')
                  }
                }}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
        <div className="top-actions">
          <button
            className={`settings-button${viewMode === 'settings' ? ' is-active' : ''}`}
            aria-label="Open settings"
            type="button"
            onClick={() => setViewMode('settings')}
          >
            ⚙
          </button>
        </div>
      </header>

      {viewMode === 'dashboard' ? (
        <main className="dashboard-shell">
          <DashboardHeaderSummary summary={dashboardData.portfolioSummary} greeting={snapshot.greeting} lastUpdated={snapshot.lastUpdated} />

          <section className="dashboard-main-grid">
            <PortfolioPerformancePanel
              snapshot={snapshot}
              selectedRange={selectedRange}
              onRangeChange={setSelectedRange}
              selectedPortfolioId={selectedPortfolioId}
              onPortfolioChange={setSelectedPortfolioId}
              isPortfolioMenuOpen={isPortfolioMenuOpen}
              setIsPortfolioMenuOpen={setIsPortfolioMenuOpen}
              portfolioMenuRef={portfolioMenuRef}
              performanceSeries={dashboardData.performanceSeries}
            />

            <ContributionPanel
              title="Profit & Loss Breakdown"
              topContributors={dashboardData.topContributors}
              bottomContributors={dashboardData.bottomContributors}
            />
          </section>

          <section className="dashboard-secondary-grid">
            <StrategyImpactPanel items={dashboardData.strategyImpactItems} />
            <MarketPulsePanel items={dashboardData.marketDrivers} />
            <AllocationPanel items={dashboardData.allocationItems} />
          </section>
        </main>
      ) : (
        <SettingsPage onBack={() => setViewMode('dashboard')} />
      )}
    </div>
  )
}

function DashboardHeaderSummary({
  summary,
  greeting,
  lastUpdated
}: {
  summary: PortfolioSnapshot['summary']
  greeting: string
  lastUpdated: string
}): JSX.Element {
  return (
    <section className="summary-strip panel">
      <div className="summary-strip-head">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Portfolio at a glance</h1>
          <p className="summary-copy">{greeting}</p>
        </div>
        <div className="summary-meta">
          <span className="summary-updated">{lastUpdated}</span>
        </div>
      </div>
      <div className="summary-grid">
        {summary.map((item) => (
          <article key={item.label} className="summary-card">
            <p className="summary-label">{item.label}</p>
            <p className={`summary-value${item.tone ? ` is-${item.tone}` : ''}`}>{item.value}</p>
            <p className="summary-note">{item.note}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function PortfolioPerformancePanel({
  snapshot,
  selectedRange,
  onRangeChange,
  selectedPortfolioId,
  onPortfolioChange,
  isPortfolioMenuOpen,
  setIsPortfolioMenuOpen,
  portfolioMenuRef,
  performanceSeries
}: {
  snapshot: PortfolioSnapshot
  selectedRange: TimeRange
  onRangeChange: (range: TimeRange) => void
  selectedPortfolioId: PortfolioId
  onPortfolioChange: (portfolioId: PortfolioId) => void
  isPortfolioMenuOpen: boolean
  setIsPortfolioMenuOpen: (open: boolean) => void
  portfolioMenuRef: RefObject<HTMLDivElement>
  performanceSeries: PortfolioSnapshot['seriesByRange'][TimeRange]
}): JSX.Element {
  return (
    <section className="panel performance-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Portfolio Performance</p>
          <h2>{snapshot.name}</h2>
        </div>
        <div className="panel-controls">
          <div className={`portfolio-menu${isPortfolioMenuOpen ? ' is-open' : ''}`} ref={portfolioMenuRef}>
            <button
              type="button"
              className="portfolio-trigger"
              aria-expanded={isPortfolioMenuOpen}
              onClick={() => setIsPortfolioMenuOpen(!isPortfolioMenuOpen)}
            >
              <span>{snapshot.name}</span>
              <span className="portfolio-chevron" aria-hidden="true">
                ▾
              </span>
            </button>
            <div className="portfolio-drawer">
              {Object.values(DASHBOARD_DATA).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`portfolio-tab${selectedPortfolioId === item.id ? ' is-active' : ''}`}
                  aria-selected={selectedPortfolioId === item.id}
                  onClick={() => {
                    startTransition(() => {
                      onPortfolioChange(item.id)
                    })
                    setIsPortfolioMenuOpen(false)
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
          <div className="range-toggle" role="tablist" aria-label="Select time range">
            {RANGE_OPTIONS.map((range) => (
              <button
                key={range}
                type="button"
                className={`range-chip${selectedRange === range ? ' is-active' : ''}`}
                onClick={() => startTransition(() => onRangeChange(range))}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="performance-body">
        <div className="chart-header">
          <div>
            <p className="chart-kicker">Portfolio value</p>
            <p className="chart-value">{snapshot.summary[1].value}</p>
          </div>
          <a href="#" className="action-link">
            Open Portfolio & Risk
          </a>
        </div>
        <PerformanceChart points={performanceSeries} />
      </div>
    </section>
  )
}

function PerformanceChart({ points }: { points: PortfolioSnapshot['seriesByRange'][TimeRange] }): JSX.Element {
  const width = 760
  const height = 320
  const paddingX = 18
  const paddingY = 24
  const minY = Math.min(...points.map((point) => point.y))
  const maxY = Math.max(...points.map((point) => point.y))
  const xStep = (width - paddingX * 2) / Math.max(points.length - 1, 1)
  const usableHeight = height - paddingY * 2
  const yRange = Math.max(maxY - minY, 1)

  const polylinePoints = points
    .map((point, index) => {
      const x = paddingX + index * xStep
      const y = height - paddingY - ((point.y - minY) / yRange) * usableHeight
      return `${x},${y}`
    })
    .join(' ')

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg chart-svg-large" role="img" aria-label="Portfolio performance chart">
      <defs>
        <linearGradient id="performanceLine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4c8dff" />
          <stop offset="100%" stopColor="#0a6cff" />
        </linearGradient>
      </defs>
      <g className="grid">
        {[24, 88, 152, 216, 280].map((y) => (
          <line key={y} x1="0" y1={y} x2={width} y2={y}></line>
        ))}
      </g>
      <polyline fill="none" stroke="url(#performanceLine)" strokeWidth="4" points={polylinePoints}></polyline>
    </svg>
  )
}

function ContributionPanel({
  title,
  topContributors,
  bottomContributors
}: {
  title: string
  topContributors: Contributor[]
  bottomContributors: Contributor[]
}): JSX.Element {
  return (
    <section className="panel contribution-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">P&L Context</p>
          <h2>{title}</h2>
        </div>
        <a href="#" className="action-link">
          See all contributors
        </a>
      </div>
      <div className="contribution-groups">
        <div className="contribution-group">
          <div className="group-head">
            <h3>Top gains</h3>
          </div>
          {topContributors.map((item) => (
            <ContributionRow key={item.ticker} item={item} variant="positive" />
          ))}
        </div>
        <div className="contribution-group">
          <div className="group-head">
            <h3>Top drags</h3>
          </div>
          {bottomContributors.map((item) => (
            <ContributionRow key={item.ticker} item={item} variant="negative" />
          ))}
        </div>
      </div>
    </section>
  )
}

function ContributionRow({ item, variant }: { item: Contributor; variant: 'positive' | 'negative' }): JSX.Element {
  const width = Math.min(Math.max(Math.abs(item.contribution) / 42, 18), 100)
  return (
    <article className="contribution-row" title={item.note}>
      <div className="contribution-copy">
        <div>
          <p className="contribution-name">{item.name}</p>
          <p className="contribution-meta">
            {item.ticker} · {item.weight}
          </p>
        </div>
        <p className={`contribution-value is-${variant}`}>{`${item.contribution > 0 ? '+' : '-'}$${Math.abs(item.contribution).toLocaleString()}`}</p>
      </div>
      <div className="contribution-bar-track">
        <span className={`contribution-bar is-${variant}`} style={{ width: `${width}%` }}></span>
      </div>
    </article>
  )
}

function StrategyImpactPanel({ items }: { items: PortfolioSnapshot['strategyImpactItems'] }): JSX.Element {
  return (
    <section className="panel impact-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Strategy Impact</p>
          <h2>Portfolio drivers</h2>
        </div>
      </div>
      <div className="impact-list">
        {items.map((item) => (
          <article key={item.name} className="impact-card" title={`${item.name} ${item.status}`}>
            <div className="impact-head">
              <div>
                <p className="impact-name">{item.name}</p>
                <p className="impact-meta">Weight {item.weight}</p>
              </div>
              <span className={`status-dot is-${item.status}`}>{item.status}</span>
            </div>
            <div className="impact-metrics">
              <div className="impact-metric">
                <p className="impact-label">Today</p>
                <p className={`impact-value ${item.contribution >= 0 ? 'is-positive' : 'is-negative'}`}>
                  {item.contribution >= 0 ? '+' : ''}
                  {item.contribution.toFixed(2)}%
                </p>
              </div>
              <div className="impact-metric">
                <p className="impact-label">7D</p>
                <p className={`impact-value ${item.sevenDay.startsWith('-') ? 'is-negative' : 'is-positive'}`}>{item.sevenDay}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function AllocationPanel({ items }: { items: PortfolioSnapshot['allocationItems'] }): JSX.Element {
  return (
    <section className="panel allocation-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Allocation</p>
          <h2>Sector / Asset mix</h2>
        </div>
      </div>
      <div className="allocation-body">
        <div className="allocation-stack" aria-hidden="true">
          {items.map((item) => (
            <span key={item.name} style={{ width: `${item.weight}%`, background: item.color }}></span>
          ))}
        </div>
        <div className="allocation-list">
          {items.map((item) => (
            <article key={item.name} className="allocation-row">
              <div className="allocation-name-wrap">
                <span className="allocation-swatch" style={{ background: item.color }}></span>
                <div>
                  <p className="allocation-name">{item.name}</p>
                  <p className="allocation-weight">{item.weight}% weight</p>
                </div>
              </div>
              <p className={`allocation-return is-${item.tone}`}>{item.returnText}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function MarketPulsePanel({ items }: { items: MarketDriver[] }): JSX.Element {
  return (
    <section className="panel pulse-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Market Pulse</p>
          <h2>What matters today</h2>
        </div>
        <a href="#" className="action-link">
          View market details
        </a>
      </div>
      <div className="pulse-list">
        {items.map((item) => (
          <article key={item.name} className="pulse-driver-card">
            <div className="pulse-driver-head">
              <div>
                <p className="pulse-driver-name">{item.name}</p>
                <p className="pulse-driver-label">{item.label}</p>
              </div>
              <div className="pulse-driver-values">
                <p className="pulse-driver-value">{item.value}</p>
                <p className={`pulse-driver-delta is-${item.tone}`}>{item.delta}</p>
              </div>
            </div>
            <p className="pulse-driver-impact">{item.impact}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function SettingsPage({ onBack }: { onBack: () => void }): JSX.Element {
  return (
    <main className="settings-shell">
      <section className="panel settings-panel">
        <div className="panel-heading settings-heading">
          <div>
            <p className="eyebrow">Settings</p>
            <h2>Workspace configuration</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onBack}>
            Back to Dashboard
          </button>
        </div>

        <div className="settings-grid">
          <article className="settings-card">
            <h3>Broker & API</h3>
            <p>Connect broker keys, separate paper/live accounts, and control approval boundaries.</p>
          </article>
          <article className="settings-card">
            <h3>Data Providers</h3>
            <p>Manage market feeds, sync cadence, local cache freshness, and source health.</p>
          </article>
          <article className="settings-card">
            <h3>LLM Provider</h3>
            <p>Configure strategy generation models, retry policy, and prompt memory behavior.</p>
          </article>
          <article className="settings-card">
            <h3>Storage</h3>
            <p>Review local database paths, backups, and runtime data retention policy.</p>
          </article>
          <article className="settings-card">
            <h3>Alerts</h3>
            <p>Set monitoring thresholds for drawdown, volatility, and execution failures.</p>
          </article>
          <article className="settings-card">
            <h3>Schedules & Jobs</h3>
            <p>Control recurring runs, queue visibility, and agent execution windows.</p>
          </article>
        </div>
      </section>
    </main>
  )
}
