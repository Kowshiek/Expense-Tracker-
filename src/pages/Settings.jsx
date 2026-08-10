import { Link } from 'react-router-dom'
import { Sun, Moon, Monitor, Sparkles, Trash2, ShieldCheck, ChevronRight } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'
import { CURRENCIES } from '../utils/constants'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'
import { loadDemoData, removeDemoData, hasDemoData } from '../utils/demoData'
import { clearAllData } from '../services/settingsService'
import { useState, useEffect } from 'react'

const DAYS = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
]

export default function Settings() {
  const { settings, updateSettings } = useSettings()
  const toast = useToast()
  const confirm = useConfirm()
  const [demoLoaded, setDemoLoaded] = useState(false)

  useEffect(() => {
    hasDemoData().then(setDemoLoaded)
  }, [])

  if (!settings) return null

  async function handleThemeChange(theme) {
    await updateSettings({ theme })
  }

  async function handleDemoToggle() {
    if (demoLoaded) {
      const removed = await removeDemoData()
      setDemoLoaded(false)
      toast.success(`Removed ${removed} demo transactions`)
    } else {
      const count = await loadDemoData()
      setDemoLoaded(true)
      toast.success(`Loaded ${count} demo transactions`)
    }
  }

  async function handleClearAll() {
    const ok = await confirm({
      title: 'Clear all data?',
      message: 'This will permanently delete all expenses, income and budgets from this device.',
      confirmLabel: 'Delete everything',
    })
    if (!ok) return
    await clearAllData()
    setDemoLoaded(false)
    toast.success('All local data has been cleared.')
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <Section title="Currency">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {CURRENCIES.map((c) => (
            <button
              key={c.code}
              onClick={() => updateSettings({ currency: c.code })}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                settings.currency === c.code
                  ? 'border-forest bg-forest-light text-forest'
                  : 'border-line dark:border-dark-line text-ink-soft dark:text-ink-faint'
              }`}
            >
              <span className="font-mono-num">{c.symbol}</span> {c.code}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Theme">
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
            { value: 'system', label: 'System', icon: Monitor },
          ].map((t) => (
            <button
              key={t.value}
              onClick={() => handleThemeChange(t.value)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-medium transition-colors ${
                settings.theme === t.value
                  ? 'border-forest bg-forest-light text-forest'
                  : 'border-line dark:border-dark-line text-ink-soft dark:text-ink-faint'
              }`}
            >
              <t.icon size={17} /> {t.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Preferences">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink dark:text-white mb-2">Default monthly budget</label>
            <input
              type="number"
              value={settings.monthlyBudget || ''}
              onChange={(e) => updateSettings({ monthlyBudget: Number(e.target.value) || 0 })}
              placeholder="0.00"
              className="w-full rounded-xl border border-line dark:border-dark-line bg-paper-raised dark:bg-dark-bg text-ink dark:text-white px-3.5 py-2.5 text-sm font-mono-num focus:border-forest outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink dark:text-white mb-2">First day of week</label>
            <select
              value={settings.firstDayOfWeek}
              onChange={(e) => updateSettings({ firstDayOfWeek: e.target.value })}
              className="w-full rounded-xl border border-line dark:border-dark-line bg-paper-raised dark:bg-dark-bg text-ink dark:text-white px-3.5 py-2.5 text-sm focus:border-forest outline-none"
            >
              {DAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </div>
        </div>
      </Section>

      <Section title="Data">
        <div className="space-y-3">
          <Link to="/backup" className="flex items-center justify-between rounded-xl border border-line dark:border-dark-line px-4 py-3 text-sm font-medium text-ink dark:text-white hover:bg-paper dark:hover:bg-dark-bg transition-colors">
            <span>Export / import data</span>
            <ChevronRight size={16} className="text-ink-faint" />
          </Link>
          <button
            onClick={handleDemoToggle}
            className="w-full flex items-center justify-between rounded-xl border border-line dark:border-dark-line px-4 py-3 text-sm font-medium text-ink dark:text-white hover:bg-paper dark:hover:bg-dark-bg transition-colors"
          >
            <span className="flex items-center gap-2"><Sparkles size={16} className="text-amber" /> {demoLoaded ? 'Remove demo data' : 'Load demo data'}</span>
          </button>
          <button
            onClick={handleClearAll}
            className="w-full flex items-center justify-between rounded-xl border border-clay/30 bg-clay-light px-4 py-3 text-sm font-medium text-clay hover:bg-clay-light/70 transition-colors"
          >
            <span className="flex items-center gap-2"><Trash2 size={16} /> Clear all data</span>
          </button>
        </div>
      </Section>

      <Section title="About">
        <Link to="/privacy" className="flex items-center justify-between rounded-xl border border-line dark:border-dark-line px-4 py-3 text-sm font-medium text-ink dark:text-white hover:bg-paper dark:hover:bg-dark-bg transition-colors">
          <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-forest" /> Privacy</span>
          <ChevronRight size={16} className="text-ink-faint" />
        </Link>
      </Section>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl bg-paper-raised dark:bg-dark-surface border border-line dark:border-dark-line p-5">
      <h3 className="font-display font-semibold text-sm text-ink dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  )
}
