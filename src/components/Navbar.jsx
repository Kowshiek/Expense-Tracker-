import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Moon, Sun, Monitor, Download, Zap } from 'lucide-react'
import GithubIcon from './GithubIcon'
import { useSettings } from '../hooks/useSettings'
import InstallAppModal, { usePwaInstall } from './InstallAppModal'
import UpiImportModal from './UpiImportModal'
import { getGithubSyncStatus } from '../services/githubSyncService'

const TITLES = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/add-expense': 'Add expense',
  '/add-income': 'Add income',
  '/analytics': 'Analytics',
  '/budgets': 'Budgets',
  '/reports': 'Monthly report',
  '/backup': 'Backup & restore',
  '/settings': 'Settings',
  '/privacy': 'Privacy',
}

const THEME_CYCLE = { light: 'dark', dark: 'system', system: 'light' }
const THEME_ICON = { light: Sun, dark: Moon, system: Monitor }

export default function Navbar() {
  const { pathname } = useLocation()
  const { settings, updateSettings } = useSettings()
  const [showInstall, setShowInstall] = useState(false)
  const [showUpi, setShowUpi] = useState(false)
  const [ghStatus, setGhStatus] = useState(getGithubSyncStatus())
  const { isStandalone } = usePwaInstall()

  const title = TITLES[pathname] || 'SpendWise'
  const theme = settings?.theme || 'system'
  const ThemeIcon = THEME_ICON[theme]

  useEffect(() => {
    const handleStatusUpdate = (e) => {
      setGhStatus(e.detail || getGithubSyncStatus())
    }
    window.addEventListener('spendwise:github-status-updated', handleStatusUpdate)
    return () => window.removeEventListener('spendwise:github-status-updated', handleStatusUpdate)
  }, [])

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line dark:border-dark-line bg-paper/90 dark:bg-dark-bg/90 backdrop-blur px-4 md:px-8 py-3.5">
        <h1 className="font-display font-semibold text-lg md:text-xl text-ink dark:text-white truncate">
          {title}
        </h1>

        <div className="flex items-center gap-2">
          {/* Quick UPI Capture */}
          <button
            onClick={() => setShowUpi(true)}
            title="Auto-Detect UPI SMS Debit/Credit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-forest-light text-forest hover:bg-forest/20 transition-colors"
          >
            <Zap size={14} />
            <span className="hidden sm:inline">Auto-UPI</span>
          </button>

          {/* Download in Chrome */}
          <button
            onClick={() => setShowInstall(true)}
            title="Download option in Chrome"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-line dark:border-dark-line text-ink-soft dark:text-ink-faint hover:border-forest hover:text-forest transition-colors"
          >
            <Download size={14} />
            <span className="hidden sm:inline">
              {isStandalone ? 'Chrome App' : 'Download'}
            </span>
          </button>

          {/* GitHub Status Indicator */}
          <a
            href="https://github.com/Kowshiek/Expense-Tracker-"
            target="_blank"
            rel="noreferrer"
            title={
              ghStatus.lastSyncedAt
                ? `GitHub Sync: Connected (${new Date(ghStatus.lastSyncedAt).toLocaleTimeString()})`
                : 'GitHub Sync: Kowshiek/Expense-Tracker-'
            }
            className="w-9 h-9 rounded-full flex items-center justify-center text-ink-soft dark:text-ink-faint border border-line dark:border-dark-line hover:bg-paper-raised dark:hover:bg-dark-surface transition-colors relative"
          >
            <GithubIcon size={16} />
            {ghStatus.status === 'success' && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-forest border-2 border-paper dark:border-dark-bg" />
            )}
            {ghStatus.status === 'error' && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-clay border-2 border-paper dark:border-dark-bg" />
            )}
          </a>

          {/* Theme Toggle */}
          <button
            onClick={() => updateSettings({ theme: THEME_CYCLE[theme] })}
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-full flex items-center justify-center text-ink-soft dark:text-ink-faint border border-line dark:border-dark-line hover:bg-paper-raised dark:hover:bg-dark-surface transition-colors"
            title={`Theme: ${theme}`}
          >
            <ThemeIcon size={16} />
          </button>
        </div>
      </header>

      <InstallAppModal open={showInstall} onClose={() => setShowInstall(false)} />
      <UpiImportModal open={showUpi} onClose={() => setShowUpi(false)} />
    </>
  )
}
