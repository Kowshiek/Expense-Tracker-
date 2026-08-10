import { useLocation } from 'react-router-dom'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'

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
  const title = TITLES[pathname] || 'SpendWise'
  const theme = settings?.theme || 'system'
  const ThemeIcon = THEME_ICON[theme]

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-line dark:border-dark-line bg-paper/90 dark:bg-dark-bg/90 backdrop-blur px-4 md:px-8 py-4">
      <h1 className="font-display font-semibold text-lg md:text-xl text-ink dark:text-white">{title}</h1>
      <button
        onClick={() => updateSettings({ theme: THEME_CYCLE[theme] })}
        aria-label="Toggle theme"
        className="w-9 h-9 rounded-full flex items-center justify-center text-ink-soft dark:text-ink-faint border border-line dark:border-dark-line hover:bg-paper-raised dark:hover:bg-dark-surface transition-colors"
        title={`Theme: ${theme}`}
      >
        <ThemeIcon size={16} />
      </button>
    </header>
  )
}
