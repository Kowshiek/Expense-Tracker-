import { useRef, useState, useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Download, Upload, Trash2, ShieldCheck, HardDrive, RefreshCw, CheckCircle2 } from 'lucide-react'
import GithubIcon from '../components/GithubIcon'
import { db } from '../db/database'
import { exportJSON, exportCSV, importBackupFile } from '../utils/exportImport'
import { clearAllData } from '../services/settingsService'
import { useSettings } from '../hooks/useSettings'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'
import { formatDateTime } from '../utils/dateHelpers'
import { syncDatabaseToGithub, getGithubConfig, getGithubSyncStatus } from '../services/githubSyncService'
import { Link } from 'react-router-dom'

export default function Backup() {
  const { settings, updateSettings } = useSettings()
  const toast = useToast()
  const confirm = useConfirm()
  const fileInputRef = useRef(null)
  const [busy, setBusy] = useState(false)
  const [syncingGh, setSyncingGh] = useState(false)
  const [ghStatus, setGhStatus] = useState(getGithubSyncStatus())
  const ghConfig = getGithubConfig()

  const transactionCount = useLiveQuery(() => db.transactions.count(), []) ?? 0
  const budgetCount = useLiveQuery(() => db.budgets.count(), []) ?? 0

  const [storageEstimate, setStorageEstimate] = useState(null)
  useEffect(() => {
    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then(setStorageEstimate)
    }

    const handleGh = (e) => setGhStatus(e.detail || getGithubSyncStatus())
    window.addEventListener('spendwise:github-status-updated', handleGh)
    return () => window.removeEventListener('spendwise:github-status-updated', handleGh)
  }, [])

  async function handleExportJSON() {
    await exportJSON()
    await updateSettings({ lastBackupAt: new Date().toISOString() })
    toast.success('Backup downloaded as expenses-backup.json')
  }

  async function handleExportCSV() {
    const count = await exportCSV()
    toast.success(`Exported ${count} transactions to expenses.csv`)
  }

  async function handleSyncToGithub() {
    if (!ghConfig.token) {
      toast.error('GitHub token missing. Configure token in Settings.')
      return
    }
    setSyncingGh(true)
    try {
      await syncDatabaseToGithub()
      toast.success('Database pushed to GitHub: Kowshiek/Expense-Tracker-')
      setGhStatus(getGithubSyncStatus())
    } catch (err) {
      toast.error(err.message || 'GitHub sync failed.')
    } finally {
      setSyncingGh(false)
    }
  }

  async function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    try {
      const result = await importBackupFile(file)
      toast.success('Backup restored successfully.')
      void result
    } catch (err) {
      toast.error(err.message || 'Could not import that file.')
    } finally {
      setBusy(false)
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
    toast.success('All local data has been cleared.')
  }

  const usedMB = storageEstimate ? (storageEstimate.usage / (1024 * 1024)).toFixed(2) : null
  const quotaMB = storageEstimate ? (storageEstimate.quota / (1024 * 1024)).toFixed(0) : null

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="rounded-2xl bg-forest-light dark:bg-dark-surface border border-forest/20 dark:border-dark-line p-5 flex items-start gap-3">
        <ShieldCheck size={20} className="text-forest shrink-0 mt-0.5" />
        <p className="text-sm text-ink-soft dark:text-ink-faint leading-relaxed">
          Your primary database runs directly inside this mobile browser's IndexedDB. You can export local backups or automatically sync with GitHub repository{' '}
          <strong>Kowshiek/Expense-Tracker-</strong>.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Stat label="Transactions in DB" value={transactionCount} />
        <Stat label="Budgets configured" value={budgetCount} />
        <Stat label="Last local backup" value={settings?.lastBackupAt ? formatDateTime(settings.lastBackupAt) : 'Never'} />
        <Stat label="Mobile storage used" value={usedMB ? `${usedMB} MB of ${quotaMB} MB` : 'Unavailable'} icon={HardDrive} />
      </div>

      {/* GitHub Repository Cloud Sync */}
      <div className="rounded-2xl bg-paper-raised dark:bg-dark-surface border border-line dark:border-dark-line p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GithubIcon size={18} className="text-ink dark:text-white" />
            <h3 className="font-display font-semibold text-sm text-ink dark:text-white">
              GitHub Cloud Repository Sync
            </h3>
          </div>
          <Link to="/settings" className="text-xs text-forest hover:underline">
            Configure Token
          </Link>
        </div>
        <p className="text-xs text-ink-faint">
          Target: <strong>https://github.com/Kowshiek/Expense-Tracker-</strong> (Branch: main)
        </p>
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-1">
          <div className="text-xs text-ink-soft dark:text-ink-faint flex items-center gap-1.5">
            {ghStatus.status === 'success' && <CheckCircle2 size={14} className="text-forest" />}
            {ghStatus.lastSyncedAt
              ? `Last synced: ${new Date(ghStatus.lastSyncedAt).toLocaleString()}`
              : 'Status: Idle'}
          </div>
          <button
            onClick={handleSyncToGithub}
            disabled={syncingGh}
            className="flex items-center justify-center gap-2 rounded-xl bg-forest text-white px-4 py-2.5 text-sm font-medium hover:bg-forest-dark transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={syncingGh ? 'animate-spin' : ''} />
            {syncingGh ? 'Pushing to GitHub…' : 'Sync Database to GitHub'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-paper-raised dark:bg-dark-surface border border-line dark:border-dark-line p-5 space-y-3">
        <h3 className="font-display font-semibold text-sm text-ink dark:text-white">Export Local Files</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <button onClick={handleExportJSON} className="flex items-center justify-center gap-2 rounded-xl bg-forest text-white px-4 py-2.5 text-sm font-medium hover:bg-forest-dark transition-colors">
            <Download size={16} /> Export full backup (JSON)
          </button>
          <button onClick={handleExportCSV} className="flex items-center justify-center gap-2 rounded-xl border border-line dark:border-dark-line text-ink dark:text-white px-4 py-2.5 text-sm font-medium hover:bg-paper dark:hover:bg-dark-bg transition-colors">
            <Download size={16} /> Export transactions (CSV)
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-paper-raised dark:bg-dark-surface border border-line dark:border-dark-line p-5 space-y-3">
        <h3 className="font-display font-semibold text-sm text-ink dark:text-white">Import</h3>
        <p className="text-xs text-ink-faint">Restore from a previously exported expenses-backup.json file.</p>
        <button
          onClick={handleImportClick}
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-xl border border-line dark:border-dark-line text-ink dark:text-white px-4 py-2.5 text-sm font-medium hover:bg-paper dark:hover:bg-dark-bg transition-colors disabled:opacity-50"
        >
          <Upload size={16} /> {busy ? 'Importing…' : 'Import backup file'}
        </button>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
      </div>

      <div className="rounded-2xl bg-clay-light border border-clay/20 p-5 space-y-3">
        <h3 className="font-display font-semibold text-sm text-clay">Danger zone</h3>
        <p className="text-xs text-clay/90">Permanently delete every expense, income entry, and budget from this device. This cannot be undone.</p>
        <button
          onClick={handleClearAll}
          className="flex items-center justify-center gap-2 rounded-xl bg-clay text-white px-4 py-2.5 text-sm font-medium hover:bg-clay/90 transition-colors"
        >
          <Trash2 size={16} /> Clear all data
        </button>
      </div>
    </div>
  )
}

function Stat({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl bg-paper-raised dark:bg-dark-surface border border-line dark:border-dark-line p-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">{label}</span>
        {Icon && <Icon size={14} className="text-ink-faint" />}
      </div>
      <p className="font-mono-num text-sm font-semibold text-ink dark:text-white">{value}</p>
    </div>
  )
}
