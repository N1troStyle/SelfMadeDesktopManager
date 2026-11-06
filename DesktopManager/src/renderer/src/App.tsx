import { useState, type ReactElement } from 'react'
import StoragePage from './pages/Storage'
import {
  ArrowLeft,
  ArrowRight,
  House,
  Monitor,
  HardDrive,
  Activity,
  Terminal,
  Settings,
  ChevronRight,
  Cpu,
  MemoryStick,
  Wifi,
  Search,
  Menu,
  X,
  Minus,
  Square
} from 'lucide-react'
import './App.css'

type Page = 'Home' | 'Storage' | 'System Monitor' | 'Command Center' | 'Settings'

const navigation: { label: Page; icon: typeof House }[] = [
  { label: 'Storage', icon: HardDrive },
  { label: 'System Monitor', icon: Activity },
  { label: 'Command Center', icon: Terminal },
  { label: 'Settings', icon: Settings }
]

function App(): ReactElement {
  const [page, setPage] = useState<Page>('Home')
  const [history, setHistory] = useState<Page[]>(['Home'])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  function navigate(next: Page): void {
    if (next === page) return

    const nextHistory = history.slice(0, historyIndex + 1)
    nextHistory.push(next)
    setHistory(nextHistory)
    setHistoryIndex(nextHistory.length - 1)
    setPage(next)
  }

  function goBack(): void {
    if (historyIndex > 0) {
      const index = historyIndex - 1
      setHistoryIndex(index)
      setPage(history[index])
    }
  }

  function goForward(): void {
    if (historyIndex < history.length - 1) {
      const index = historyIndex + 1
      setHistoryIndex(index)
      setPage(history[index])
    }
  }

  return (
    <div className="app-shell">
      <header className="titlebar">
        <div className="brand">
          <Monitor size={22} className="brand-icon" />
          <span>DesktopManager</span>
        </div>

        <div className="window-controls">
          <button
            className="window-button"
            aria-label="Minimize"
            onClick={() => void window.desktop.minimize()}
          >
            <Minus size={16} />
          </button>
          <button
            className="window-button"
            aria-label="Maximize"
            onClick={() => void window.desktop.toggleMaximize()}
          >
            <Square size={14} />
          </button>
          <button
            className="window-button close-button"
            aria-label="Close"
            onClick={() => void window.desktop.close()}
          >
            <X size={18} />
          </button>
        </div>
      </header>

      <div className="toolbar">
        <div className="navigation-controls">
          <button
            className="nav-button"
            aria-label="Go back"
            disabled={historyIndex === 0}
            onClick={goBack}
          >
            <ArrowLeft size={19} />
          </button>
          <button
            className={`nav-button home-button ${page === 'Home' ? 'active' : ''}`}
            aria-label="Home"
            onClick={() => navigate('Home')}
          >
            <House size={19} />
          </button>
          <button
            className="nav-button"
            aria-label="Go forward"
            disabled={historyIndex === history.length - 1}
            onClick={goForward}
          >
            <ArrowRight size={19} />
          </button>
        </div>

        <div className="toolbar-right">
          <span className="breadcrumb">DesktopManager</span>
          <ChevronRight size={14} />
          <span className="breadcrumb current">{page}</span>
        </div>
      </div>

      <div className={`workspace ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <aside className="sidebar">
          <div className="sidebar-heading">
            <span className="eyebrow">WORKSPACE</span>
            <button
              className="icon-button collapse-button"
              aria-label="Toggle sidebar"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu size={18} />
            </button>
          </div>

          <button
            className={`sidebar-home ${page === 'Home' ? 'selected' : ''}`}
            onClick={() => navigate('Home')}
          >
            <House size={19} />
            <span>Home</span>
          </button>

          <div className="sidebar-divider" />

          <span className="eyebrow modules-label">MODULES</span>

          <nav className="sidebar-nav">
            {navigation.map(({ label, icon: Icon }) => (
              <button
                key={label}
                className={`sidebar-item ${page === label ? 'selected' : ''}`}
                onClick={() => navigate(label)}
                title={label}
              >
                <Icon size={21} />
                <span>{label}</span>
                <ChevronRight size={16} className="sidebar-chevron" />
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="status-dot" />
            <div className="status-copy">
              <span>System status</span>
              <small>Desktop ready</small>
            </div>
            <span className="status-indicator">●</span>
          </div>
        </aside>

        <main className="main-panel">
          {page === 'Home' ? (
            <HomePage onNavigate={navigate} />
          ) : page === 'Storage' ? (
            <StoragePage />
          ) : (
            <ModulePage page={page} onNavigate={navigate} />
          )}
        </main>
      </div>

      <footer className="app-footer">
        <span>
          <span className="footer-dot" /> All systems ready
        </span>
        <span>
          DesktopManager <span className="footer-version">v0.1.0</span>
        </span>
      </footer>
    </div>
  )
}

function HomePage({ onNavigate }: { onNavigate: (page: Page) => void }): ReactElement {
  return (
    <div className="page-content">
      <section className="welcome-section">
        <span className="eyebrow welcome-eyebrow">YOUR PERSONAL SYSTEM HUB</span>
        <h1>
          Welcome to <span>DesktopManager.</span>
        </h1>
        <p>Your system, organized. Everything you need in one place.</p>
      </section>

      <div className="section-heading">
        <div>
          <h2>System overview</h2>
          <p>A quick look at your computer.</p>
        </div>
        <span className="demo-label">DEMO DATA</span>
      </div>

      <section className="stats-grid">
        <StatCard
          title="Storage"
          value="218 GB"
          detail="free of 465 GB"
          percent={53}
          icon={HardDrive}
          footer="53% used"
          onClick={() => onNavigate('Storage')}
        />
        <StatCard
          title="CPU usage"
          value="12%"
          detail="3.2 GHz"
          percent={12}
          icon={Cpu}
          footer="Low utilization"
          onClick={() => onNavigate('System Monitor')}
        />
        <StatCard
          title="Memory"
          value="8.1 GB"
          detail="of 16 GB"
          percent={51}
          icon={MemoryStick}
          footer="51% used"
          onClick={() => onNavigate('System Monitor')}
        />
        <StatCard
          title="Network"
          value="12.4 Mbps"
          detail="Download speed"
          percent={35}
          icon={Wifi}
          footer="Upload · 2.8 Mbps"
          onClick={() => onNavigate('System Monitor')}
        />
      </section>

      <section className="quick-section">
        <div className="section-heading">
          <div>
            <h2>Quick actions</h2>
            <p>Jump straight into your favorite tools.</p>
          </div>
        </div>

        <div className="quick-grid">
          <QuickAction
            icon={Search}
            title="Analyze storage"
            description="Find what's taking up space"
            onClick={() => onNavigate('Storage')}
          />
          <QuickAction
            icon={Activity}
            title="System monitor"
            description="Explore system performance"
            onClick={() => onNavigate('System Monitor')}
          />
          <QuickAction
            icon={Terminal}
            title="Command center"
            description="Run useful commands"
            onClick={() => onNavigate('Command Center')}
          />
          <QuickAction
            icon={Settings}
            title="Windows settings"
            description="Your shortcuts, your way"
            onClick={() => onNavigate('Settings')}
          />
        </div>
      </section>

      <section className="tip-banner">
        <div className="tip-icon">
          <Activity size={20} />
        </div>
        <div>
          <strong>One place. More control.</strong>
          <p>Your system tools are being brought together into one simple workspace.</p>
        </div>
        <ChevronRight size={18} className="tip-chevron" />
      </section>
    </div>
  )
}

function StatCard({
  title,
  value,
  detail,
  percent,
  icon: Icon,
  footer,
  onClick
}: {
  title: string
  value: string
  detail: string
  percent: number
  icon: typeof House
  footer: string
  onClick: () => void
}): ReactElement {
  return (
    <button className="stat-card" onClick={onClick}>
      <div className="stat-top">
        <div className="stat-icon">
          <Icon size={22} />
        </div>
        <span className="stat-title">{title}</span>
        <ChevronRight size={15} className="stat-chevron" />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">{detail}</div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="stat-footer">{footer}</div>
    </button>
  )
}

function QuickAction({
  icon: Icon,
  title,
  description,
  onClick
}: {
  icon: typeof House
  title: string
  description: string
  onClick: () => void
}): ReactElement {
  return (
    <button className="quick-card" onClick={onClick}>
      <div className="quick-icon">
        <Icon size={20} />
      </div>
      <div className="quick-copy">
        <strong>{title}</strong>
        <span>{description}</span>
      </div>
      <ChevronRight size={17} className="quick-chevron" />
    </button>
  )
}

function ModulePage({
  page,
  onNavigate
}: {
  page: Exclude<Page, 'Home'>
  onNavigate: (page: Page) => void
}): ReactElement {
  const modules = {
    Storage: {
      icon: HardDrive,
      eyebrow: 'FILE MANAGEMENT',
      title: 'Storage Explorer',
      description: 'Understand your disk usage and find files taking up valuable space.',
      cards: ['Disk overview', 'Largest files', 'Folder analysis']
    },
    'System Monitor': {
      icon: Activity,
      eyebrow: 'PERFORMANCE',
      title: 'System Monitor',
      description: 'Keep an eye on resource usage, performance and available hardware sensors.',
      cards: ['CPU & GPU', 'Memory usage', 'Network activity']
    },
    'Command Center': {
      icon: Terminal,
      eyebrow: 'POWER TOOLS',
      title: 'Command Center',
      description: 'Run useful Windows commands and organize your own shortcuts.',
      cards: ['IP configuration', 'Network neighbors', 'Custom commands']
    },
    Settings: {
      icon: Settings,
      eyebrow: 'PERSONALIZATION',
      title: 'Settings Hub',
      description: 'Build your own collection of shortcuts to Windows settings.',
      cards: ['Display settings', 'Network settings', 'Personal shortcuts']
    }
  } as const

  const module = modules[page]
  const Icon = module.icon

  return (
    <div className="page-content module-content">
      <div className="module-hero">
        <div className="module-icon">
          <Icon size={28} />
        </div>
        <span className="eyebrow">{module.eyebrow}</span>
        <h1>{module.title}</h1>
        <p>{module.description}</p>
        <span className="coming-soon">FOUNDATION READY · FEATURES IN DEVELOPMENT</span>
      </div>

      <div className="section-heading">
        <div>
          <h2>Explore this module</h2>
          <p>These tools will be implemented in upcoming steps.</p>
        </div>
      </div>

      <div className="module-cards">
        {module.cards.map((card, index) => (
          <div className="module-card" key={card}>
            <span className="module-card-number">0{index + 1}</span>
            <strong>{card}</strong>
            <p>Planned for a future update.</p>
          </div>
        ))}
      </div>

      <button className="back-home" onClick={() => onNavigate('Home')}>
        <ArrowLeft size={17} /> Back to overview
      </button>
    </div>
  )
}

export default App
