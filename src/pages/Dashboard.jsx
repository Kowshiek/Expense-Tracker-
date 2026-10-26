import { Link, useNavigate } from 'react-router-dom'
import {
  Wallet, TrendingUp, TrendingDown, CalendarDays, PiggyBank, Receipt,
  CalendarClock, HardDrive, Zap,
} from 'lucide-react'
import GithubIcon from '../components/GithubIcon'
import { useDashboard } from '../hooks/useDashboard'
import { useTransactions } from '../hooks/useTransactions'
import DashboardCard from '../components/DashboardCard'
import TransactionCard from '../components/TransactionCard'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { useState, useEffect } from 'react'
import Modal from '../components/Modal'
import TransactionForm from '../components/TransactionForm'
import DailyCycleWidget from '../components/DailyCycleWidget'
import UpiImportModal from '../components/UpiImportModal'
import { updateTransaction, deleteTransaction } from '../services/transactionService'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'
import { getCategoryMeta } from '../utils/constants'
import { formatCurrency } from '../utils/currency'
import { formatDate, formatDateTime } from '../utils/dateHelpers'
import { useSettings } from '../hooks/useSettings'
import { checkStorageStatus, requestPersistentMobileStorage } from '../services/storageService'
import { getGithubConfig, getGithubSyncStatus } from '../services/githubSyncService'

export default function Dashboard() {
  const { stats, loading } = useDashboard()
  const { transactions } = useTransactions()
  const [selected, setSelected] = useState(null)
  const [mode, setMode] = useState(null) // 'view' | 'edit'
  const [showUpiModal, setShowUpiModal] = useState(false)
  const [sharedUpiText, setSharedUpiText] = useState('')
  const [storageInfo, setStorageInfo] = useState(null)
  const [ghStatus, setGhStatus] = useState(getGithubSyncStatus())
  const toast = useToast()
  const confirm = useConfirm()
  const { settings } = useSettings()
  const currency = settings?.currency || 'INR'
  const navigate = useNavigate()
  const ghConfig = getGithubConfig()

  useEffect(() => {
    checkStorageStatus().then(setStorageInfo)
    requestPersistentMobileStorage().catch(() => {})

    // Check if opened via Web Share Target (e.g. from SMS app)
    const urlParams = new URLSearchParams(window.location.search)
    const textParam = urlParams.get('text') || urlParams.get('title')
    if (textParam) {
      setSharedUpiText(textParam)
      setShowUpiModal(true)
      window.history.replaceState({}, document.title, window.location.pathname)
    }

    const handleGhUpdate = (e) => setGhStatus(e.detail || getGithubSyncStatus())
    window.addEventListener('spendwise:github-status-updated', handleGhUpdate)
    return () => window.removeEventListener('spendwise:github-status-updated', handleGhUpdate)
  }, [])

  if (loading) return <LoadingSpinner label="Loading your dashboard…" />

  const recent = transactions.slice(0, 5)

  async function handleDelete(t) {
    const ok = await confirm({
      title: 'Delete this transaction?',
      message: `"${t.title}" will be permanently removed.`,
      confirmLabel: 'Delete',
    })
    if (!ok) return
    await deleteTransaction(t.id)
    toast.success('Transaction deleted')
    setSelected(null)
    setMode(null)
  }

  async function handleEditSubmit(data) {
    await updateTransaction(selected.id, data)
    toast.success('Transaction updated')
    setSelected(null)
    setMode(null)
  }

  return (
    <div className="space-y-6">
      {/* 12:01 AM Daily Tracking Cycle Widget */}
      <DailyCycleWidget
        onOpenUpi={() => setShowUpiModal(true)}
        onAddExpense={() => navigate('/add-expense')}
      />

      {/* System Status Banner: Mobile DB & GitHub Auto-Sync */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-paper-raised dark:bg-dark-surface border border-line dark:border-dark-line">
          <HardDrive size={16} className="text-forest shrink-0" />
          <div className="truncate">
            <span className="font-semibold text-ink dark:text-white">Mobile Storage: </span>
            <span className="text-ink-soft dark:text-ink-faint">
              IndexedDB Active {storageInfo?.persisted ? '· Persistent' : ''} (
              {storageInfo ? `${storageInfo.usageMB} MB` : 'Checking…'})
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-paper-raised dark:bg-dark-surface border border-line dark:border-dark-line">
          <div className="flex items-center gap-2.5 truncate">
            <GithubIcon size={16} className="text-ink-faint shrink-0" />
            <div className="truncate">
              <span className="font-semibold text-ink dark:text-white">GitHub: </span>
              <span className="text-ink-soft dark:text-ink-faint">
                {ghConfig.token
                  ? ghStatus.lastSyncedAt
                    ? `Synced (${new Date(ghStatus.lastSyncedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`
                    : 'Auto-Sync Active'
                  : 'Not Connected'}
              </span>
            </div>
          </div>
          <Link
            to="/settings"
            className="text-forest hover:text-forest-dark font-medium shrink-0 ml-2"
          >
            {ghConfig.token ? 'Manage' : 'Connect'}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard label="Total balance" amount={stats.totalBalance} icon={Wallet} tone="navy" sub="income minus expenses" />
        <DashboardCard label="Total income" amount={stats.totalIncome} icon={TrendingUp} tone="forest" change={stats.monthOverMonthIncomeChange} />
        <DashboardCard label="Total expenses" amount={stats.totalExpenses} icon={TrendingDown} tone="clay" change={stats.monthOverMonthExpenseChange} />
        <DashboardCard label="Savings" amount={stats.savings} icon={PiggyBank} tone="amber" sub="lifetime" />
        <DashboardCard label="This month's expenses" amount={stats.thisMonthExpenses} icon={CalendarDays} tone="clay" />
        <DashboardCard label="Today's expenses" amount={stats.todayExpenses} icon={CalendarClock} tone="navy" sub="since 12:01 AM" />
        <div className="col-span-2 ledger-stub rounded-2xl bg-paper-raised dark:bg-dark-surface border border-line dark:border-dark-line p-5 pt-6 shadow-sm flex items-center gap-4">
          <span className="w-10 h-10 rounded-lg bg-forest-light text-forest flex items-center justify-center shrink-0">
            <Receipt size={18} />
          </span>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink-faint">Transactions logged</p>
            <p className="font-mono-num text-2xl font-semibold text-ink dark:text-white">{stats.transactionCount}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-display font-semibold text-lg text-ink dark:text-white">Recent activity</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUpiModal(true)}
            className="text-xs font-semibold text-forest flex items-center gap-1 hover:underline"
          >
            <Zap size={13} />
            <span>Auto-UPI</span>
          </button>
          <Link to="/transactions" className="text-sm font-medium text-forest hover:text-forest-dark transition-colors">
            View all
          </Link>
        </div>
      </div>

      {recent.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No transactions yet"
          message="Start tracking your expenses to understand where your money goes."
          actionLabel="+ Add Expense"
          onAction={() => navigate('/add-expense')}
        />
      ) : (
        <div className="space-y-2">
          {recent.map((t) => (
            <TransactionCard key={t.id} transaction={t} onClick={(tx) => { setSelected(tx); setMode('view') }} />
          ))}
        </div>
      )}

      <Modal
        open={mode === 'view' && !!selected}
        onClose={() => { setSelected(null); setMode(null) }}
        title="Transaction details"
        footer={selected && (
          <div className="flex gap-3">
            <button onClick={() => handleDelete(selected)} className="flex-1 px-4 py-2.5 rounded-xl border border-clay text-clay text-sm font-medium hover:bg-clay-light transition-colors">Delete</button>
            <button onClick={() => setMode('edit')} className="flex-1 px-4 py-2.5 rounded-xl bg-forest text-white text-sm font-medium hover:bg-forest-dark transition-colors">Edit</button>
          </div>
        )}
      >
        {selected && mode === 'view' && (
          <DetailRows t={selected} currency={currency} />
        )}
      </Modal>

      <Modal open={mode === 'edit' && !!selected} onClose={() => setMode('view')} title="Edit transaction">
        {selected && mode === 'edit' && (
          <TransactionForm transaction={selected} onSubmit={handleEditSubmit} onCancel={() => setMode('view')} />
        )}
      </Modal>

      <UpiImportModal
        open={showUpiModal}
        onClose={() => {
          setShowUpiModal(false)
          setSharedUpiText('')
        }}
        initialText={sharedUpiText}
      />
    </div>
  )
}

function DetailRows({ t, currency }) {
  const meta = getCategoryMeta(t.category, t.type)
  const rows = [
    ['Description', t.title],
    ['Amount', formatCurrency(t.amount, currency)],
    ['Category', meta.label],
    ['Date', formatDate(t.date)],
    ['Type', t.type === 'income' ? 'Income' : 'Expense'],
    ['Payment method', t.paymentMethod],
    ['Notes', t.notes || '—'],
    ['Created', formatDateTime(t.createdAt)],
  ]
  return (
    <dl className="divide-y divide-line dark:divide-dark-line">
      {rows.map(([label, value]) => (
        <div key={label} className="flex justify-between py-2.5 text-sm gap-4">
          <dt className="text-ink-faint">{label}</dt>
          <dd className="text-ink dark:text-white font-medium text-right">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
