import { Link } from 'react-router-dom'
import {
  Sun, Moon, Monitor, Sparkles, Trash2, ShieldCheck, ChevronRight,
  Clock, Zap, HardDrive, Download, CheckCircle2, RefreshCw,
  ExternalLink, Key,
} from 'lucide-react'
import GithubIcon from '../components/GithubIcon'
import { useSettings } from '../hooks/useSettings'
import { CURRENCIES } from '../utils/constants'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'
import { loadDemoData, removeDemoData, hasDemoData } from '../utils/demoData'
import { clearAllData } from '../services/settingsService'
import { useState, useEffect } from 'react'
import { getDailyCycleConfig, saveDailyCycleConfig } from '../services/dailyCycleService'
import {
  checkStorageStatus,
  requestPersistentMobileStorage,
} from '../services/storageService'
import {
  getGithubConfig,
  saveGithubConfig,
  getGithubSyncStatus,
  syncDatabaseToGithub,
} from '../services/githubSyncService'
import InstallAppModal from '../components/InstallAppModal'
import UpiImportModal from '../components/UpiImportModal'

const DAYS = [
  { value: 'sunday', label: 'Sunday' },
  { value: 'monday', label: 'Monday' },
]

export default function Settings() {
  const { settings, updateSettings } = useSettings()
  const toast = useToast()
  const confirm = useConfirm()
  const [demoLoaded, setDemoLoaded] = useState(false)

  // 12:01 AM Daily Cycle State
  const [cycleConfig, setCycleConfig] = useState(getDailyCycleConfig())

  // Storage State
  const [storageInfo, setStorageInfo] = useState(null)
  const [persisting, setPersisting] = useState(false)

  // GitHub Auto-Sync State
  const [ghConfig, setGhConfig] = useState(getGithubConfig())
  const [ghStatus, setGhStatus] = useState(getGithubSyncStatus())
  const [syncingGh, setSyncingGh] = useState(false)

  // Modals
  const [showInstall, setShowInstall] = useState(false)
  const [showUpi, setShowUpi] = useState(false)

  useEffect(() => {
    hasDemoData().then(setDemoLoaded)
    checkStorageStatus().then(setStorageInfo)

    const handleGhUpdate = (e) => setGhStatus(e.detail || getGithubSyncStatus())
    window.addEventListener('spendwise:github-status-updated', handleGhUpdate)
    return () => window.removeEventListener('spendwise:github-status-updated', handleGhUpdate)
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

  // Daily cycle update
  function updateCycle(patch) {
    const next = { ...cycleConfig, ...patch }
    setCycleConfig(next)
    saveDailyCycleConfig(next)
    toast.success('Daily cycle settings saved.')
  }

  // Persistent storage request
  async function handleRequestPersistence() {
    setPersisting(true)
    try {
      const res = await requestPersistentMobileStorage()
      if (res.persisted) {
        toast.success('Persistent mobile storage granted! Chrome will never clear your data.')
      } else {
        toast.info(res.message || 'Browser persistence requested.')
      }
      const fresh = await checkStorageStatus()
      setStorageInfo(fresh)
    } finally {
      setPersisting(false)
    }
  }

  // GitHub token and config save
  function handleSaveGhConfig(patch) {
    const next = { ...ghConfig, ...patch }
    setGhConfig(next)
    saveGithubConfig(next)
    toast.success('GitHub configuration updated.')
  }

  // Manual Push to GitHub
  async function handleSyncToGithubNow() {
    if (!ghConfig.token) {
      toast.error('Please enter your GitHub Personal Access Token first.')
      return
    }
    setSyncingGh(true)
    try {
      await syncDatabaseToGithub()
      toast.success('Database successfully committed and pushed to GitHub!')
      setGhStatus(getGithubSyncStatus())
    } catch (err) {
      toast.error(err.message || 'Failed to sync with GitHub.')
    } finally {
      setSyncingGh(false)
    }
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* 12:01 AM Daily Cycle Management */}
      <Section title="🕒 Daily Tracking Cycle (12:01 AM)">
        <div className="space-y-3">
          <p className="text-xs text-ink-faint leading-relaxed">
            Your expense tracker operates on a 24-hour daily cycle that starts each day at exactly <strong>12:01 AM</strong>. Today's expenses and budget counters automatically cycle at 12:01 AM.
          </p>

          <div className="p-3.5 rounded-xl bg-paper dark:bg-dark-bg border border-line dark:border-dark-line flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock size={18} className="text-forest" />
              <div>
                <p className="text-sm font-semibold text-ink dark:text-white">Daily Cycle Start Time</p>
                <p className="text-xs text-ink-faint">Resets today's expense counter every morning</p>
              </div>
            </div>
            <span className="font-mono-num font-bold text-sm text-forest px-2.5 py-1 rounded-lg bg-forest-light">
              12:01 AM
            </span>
          </div>

          <label className="flex items-center justify-between p-3.5 rounded-xl border border-line dark:border-dark-line cursor-pointer hover:bg-paper dark:hover:bg-dark-bg transition-colors">
            <div>
              <span className="text-sm font-medium text-ink dark:text-white block">Reset Notification</span>
              <span className="text-xs text-ink-faint">Display alert when daily cycle begins at 12:01 AM</span>
            </div>
            <input
              type="checkbox"
              checked={cycleConfig.notifyOnReset}
              onChange={(e) => updateCycle({ notifyOnReset: e.target.checked })}
              className="accent-forest w-4 h-4 cursor-pointer"
            />
          </label>
        </div>
      </Section>

      {/* UPI & Bank SMS Auto-Detection */}
      <Section title="⚡ UPI & Banking Auto-Detection">
        <div className="space-y-3">
          <p className="text-xs text-ink-faint leading-relaxed">
            Automatically reads transaction SMS messages from any Indian UPI app (Google Pay, PhonePe, Paytm, BHIM, CRED) and banks (HDFC, SBI, ICICI, Axis, Kotak, PNB, etc.). Money debited is recorded as an <strong>Expense</strong>, and money credited is recorded as <strong>Income</strong> with the detected bank name.
          </p>

          <button
            onClick={() => setShowUpi(true)}
            className="w-full flex items-center justify-between rounded-xl bg-forest-light dark:bg-forest/15 border border-forest/30 p-3.5 text-sm font-semibold text-forest hover:bg-forest/20 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Zap size={18} />
              Open UPI & SMS Auto-Detector
            </span>
            <ChevronRight size={16} />
          </button>
        </div>
      </Section>

      {/* Chrome App Download */}
      <Section title="📲 Chrome App Download & PWA">
        <div className="space-y-3">
          <p className="text-xs text-ink-faint leading-relaxed">
            Download SpendWise directly in Google Chrome on your phone or PC. It installs as a native, standalone app that launches instantly from your home screen and operates 100% offline.
          </p>

          <button
            onClick={() => setShowInstall(true)}
            className="w-full flex items-center justify-between rounded-xl border border-line dark:border-dark-line px-4 py-3 text-sm font-medium text-ink dark:text-white hover:bg-paper dark:hover:bg-dark-bg transition-colors"
          >
            <span className="flex items-center gap-2">
              <Download size={16} className="text-forest" />
              Download / Install SpendWise in Chrome
            </span>
            <ChevronRight size={16} className="text-ink-faint" />
          </button>
        </div>
      </Section>

      {/* Mobile Storage as Database */}
      <Section title="💾 Mobile Storage Database">
        <div className="space-y-3">
          <p className="text-xs text-ink-faint leading-relaxed">
            SpendWise stores all transactions directly inside your mobile device storage via <strong>IndexedDB</strong>. No remote servers ever see your financial data.
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-paper dark:bg-dark-bg border border-line dark:border-dark-line">
              <span className="text-ink-faint block uppercase text-[10px] font-semibold">Storage Engine</span>
              <span className="font-semibold text-ink dark:text-white text-sm">IndexedDB (Local)</span>
            </div>
            <div className="p-3 rounded-xl bg-paper dark:bg-dark-bg border border-line dark:border-dark-line">
              <span className="text-ink-faint block uppercase text-[10px] font-semibold">Chrome Persistence</span>
              <span className="font-semibold text-forest text-sm flex items-center gap-1">
                {storageInfo?.persisted ? (
                  <>
                    <CheckCircle2 size={13} /> Guaranteed
                  </>
                ) : (
                  'Standard'
                )}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-paper dark:bg-dark-bg border border-line dark:border-dark-line">
              <span className="text-ink-faint block uppercase text-[10px] font-semibold">Storage Used</span>
              <span className="font-mono-num font-semibold text-ink dark:text-white text-sm">
                {storageInfo ? `${storageInfo.usageMB} MB` : 'Calculating…'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-paper dark:bg-dark-bg border border-line dark:border-dark-line">
              <span className="text-ink-faint block uppercase text-[10px] font-semibold">Total Quota</span>
              <span className="font-mono-num font-semibold text-ink dark:text-white text-sm">
                {storageInfo ? `${storageInfo.quotaMB} MB` : 'Calculating…'}
              </span>
            </div>
          </div>

          {!storageInfo?.persisted && (
            <button
              onClick={handleRequestPersistence}
              disabled={persisting}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-forest text-white hover:bg-forest-dark transition-colors flex items-center justify-center gap-2"
            >
              <HardDrive size={15} />
              {persisting ? 'Requesting…' : 'Guarantee Mobile Storage Persistence in Chrome'}
            </button>
          )}
        </div>
      </Section>

      {/* GitHub Auto-Sync Engine */}
      <Section
        title={(
          <span className="flex items-center gap-2">
            <GithubIcon size={16} /> GitHub Cloud Auto-Sync
          </span>
        )}
      >
        <div className="space-y-4">
          <p className="text-xs text-ink-faint leading-relaxed">
            Automatically commit and push your mobile transactions directly to your GitHub repository:{' '}
            <a
              href="https://github.com/Kowshiek/Expense-Tracker-"
              target="_blank"
              rel="noreferrer"
              className="text-forest underline font-mono inline-flex items-center gap-1"
            >
              https://github.com/Kowshiek/Expense-Tracker- <ExternalLink size={11} />
            </a>
          </p>

          <div>
            <label className="block text-xs font-semibold text-ink dark:text-white mb-1.5 flex items-center gap-1.5">
              <Key size={13} className="text-forest" />
              GitHub Personal Access Token (PAT)
            </label>
            <input
              type="password"
              value={ghConfig.token}
              onChange={(e) => handleSaveGhConfig({ token: e.target.value })}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (Requires 'repo' scope)"
              className="w-full rounded-xl border border-line dark:border-dark-line bg-paper dark:bg-dark-bg text-ink dark:text-white px-3.5 py-2 text-xs font-mono focus:border-forest outline-none"
            />
            <p className="text-[11px] text-ink-faint mt-1">
              Create a token at <strong>GitHub &gt; Settings &gt; Developer settings &gt; Personal access tokens</strong> with <code>repo</code> permissions.
            </p>
          </div>

          <label className="flex items-center justify-between p-3 rounded-xl border border-line dark:border-dark-line cursor-pointer hover:bg-paper dark:hover:bg-dark-bg transition-colors">
            <div>
              <span className="text-sm font-medium text-ink dark:text-white block">Auto-Sync on Every Transaction</span>
              <span className="text-xs text-ink-faint">Pushes backup to GitHub whenever UPI or manual entries are recorded</span>
            </div>
            <input
              type="checkbox"
              checked={ghConfig.autoSync}
              onChange={(e) => handleSaveGhConfig({ autoSync: e.target.checked })}
              className="accent-forest w-4 h-4 cursor-pointer"
            />
          </label>

          <div className="p-3.5 rounded-xl bg-paper dark:bg-dark-bg border border-line dark:border-dark-line flex items-center justify-between">
            <div>
              <span className="text-xs text-ink-faint block uppercase font-semibold">Sync Status</span>
              <span className="text-xs font-semibold text-ink dark:text-white flex items-center gap-1.5 mt-0.5">
                {ghStatus.status === 'syncing' && <RefreshCw size={12} className="animate-spin text-forest" />}
                {ghStatus.status === 'success' && <CheckCircle2 size={12} className="text-forest" />}
                {ghStatus.lastSyncedAt
                  ? `Last synced: ${new Date(ghStatus.lastSyncedAt).toLocaleString()}`
                  : 'Not synced yet'}
              </span>
              {ghStatus.errorMessage && (
                <span className="text-[11px] text-clay block mt-1">{ghStatus.errorMessage}</span>
              )}
            </div>

            <button
              onClick={handleSyncToGithubNow}
              disabled={syncingGh}
              className="px-3.5 py-2 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-dark transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw size={13} className={syncingGh ? 'animate-spin' : ''} />
              {syncingGh ? 'Syncing…' : 'Sync to GitHub Now'}
            </button>
          </div>
        </div>
      </Section>

      {/* Currency */}
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

      {/* Theme */}
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

      {/* Preferences */}
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

      {/* Data */}
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

      {/* About */}
      <Section title="About">
        <Link to="/privacy" className="flex items-center justify-between rounded-xl border border-line dark:border-dark-line px-4 py-3 text-sm font-medium text-ink dark:text-white hover:bg-paper dark:hover:bg-dark-bg transition-colors">
          <span className="flex items-center gap-2"><ShieldCheck size={16} className="text-forest" /> Privacy</span>
          <ChevronRight size={16} className="text-ink-faint" />
        </Link>
      </Section>

      <InstallAppModal open={showInstall} onClose={() => setShowInstall(false)} />
      <UpiImportModal open={showUpi} onClose={() => setShowUpi(false)} />
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
