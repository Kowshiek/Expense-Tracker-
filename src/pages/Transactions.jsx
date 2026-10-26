import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Receipt, SlidersHorizontal, ShieldCheck } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import SearchBar from '../components/SearchBar'
import FilterPanel from '../components/FilterPanel'
import TransactionTable from '../components/TransactionTable'
import TransactionCard from '../components/TransactionCard'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import Modal from '../components/Modal'
import TransactionForm from '../components/TransactionForm'
import { updateTransaction, deleteTransaction } from '../services/transactionService'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'
import { getCategoryMeta } from '../utils/constants'
import { formatCurrency } from '../utils/currency'
import { formatDate, formatDateTime, getCycleDate, toLocalDateStr } from '../utils/dateHelpers'
import { useSettings } from '../hooks/useSettings'

const PAGE_SIZE = 15
const emptyFilters = { type: '', category: '', paymentMethod: '', date: '' }

export default function Transactions() {
  const { transactions, loading } = useTransactions()
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(emptyFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [sort, setSort] = useState({ field: 'date', direction: 'desc' })
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)
  const [mode, setMode] = useState(null)
  const toast = useToast()
  const confirm = useConfirm()
  const navigate = useNavigate()
  const { settings } = useSettings()
  const currency = settings?.currency || 'INR'

  const filtered = useMemo(() => {
    let list = transactions
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((t) =>
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        (t.notes || '').toLowerCase().includes(q) ||
        t.paymentMethod.toLowerCase().includes(q)
      )
    }
    if (filters.type) list = list.filter((t) => t.type === filters.type)
    if (filters.category) list = list.filter((t) => t.category === filters.category)
    if (filters.paymentMethod) list = list.filter((t) => t.paymentMethod === filters.paymentMethod)
    if (filters.date) list = list.filter((t) => t.date === filters.date)

    const sorted = [...list].sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1
      if (sort.field === 'amount') return (a.amount - b.amount) * dir
      return a.date.localeCompare(b.date) * dir
    })
    return sorted
  }, [transactions, search, filters, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function resetPageFilters(next) {
    setFilters(next)
    setPage(1)
  }

  async function handleDelete(t) {
    const ok = await confirm({
      title: 'Delete this transaction?',
      message: `"${t.title}" will be permanently removed.`,
      confirmLabel: 'Delete',
    })
    if (!ok) return
    await deleteTransaction(t.id)
    toast.success('Transaction deleted')
    if (selected?.id === t.id) { setSelected(null); setMode(null) }
  }

  async function handleEditSubmit(data) {
    await updateTransaction(selected.id, data)
    toast.success('Transaction updated')
    setSelected(null)
    setMode(null)
  }

  if (loading) return <LoadingSpinner label="Loading transactions…" />

  const todayKey = getCycleDate(new Date())
  const yesterdayDate = new Date()
  yesterdayDate.setDate(yesterdayDate.getDate() - 1)
  const yesterdayKey = toLocalDateStr(yesterdayDate)

  return (
    <div className="space-y-4">
      {/* Historical Retention Assurance Banner */}
      <div className="rounded-xl bg-forest-light/50 dark:bg-dark-surface border border-forest/20 p-3 flex items-center gap-2.5 text-xs text-ink-soft dark:text-ink-faint">
        <ShieldCheck size={16} className="text-forest shrink-0" />
        <span>
          <strong>Permanent Ledger:</strong> Previous days' logs are never deleted. When a new 12:01 AM daily cycle starts, past logs remain permanently recorded and searchable.
        </span>
      </div>

      {/* Quick History Tabs */}
      <div className="flex flex-wrap gap-2 text-xs">
        <button
          onClick={() => resetPageFilters({ ...filters, date: '' })}
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
            !filters.date
              ? 'bg-forest text-white'
              : 'border border-line dark:border-dark-line text-ink-soft dark:text-ink-faint hover:bg-paper dark:hover:bg-dark-bg'
          }`}
        >
          All History ({transactions.length})
        </button>
        <button
          onClick={() => resetPageFilters({ ...filters, date: todayKey })}
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
            filters.date === todayKey
              ? 'bg-forest text-white'
              : 'border border-line dark:border-dark-line text-ink-soft dark:text-ink-faint hover:bg-paper dark:hover:bg-dark-bg'
          }`}
        >
          Today's Cycle
        </button>
        <button
          onClick={() => resetPageFilters({ ...filters, date: yesterdayKey })}
          className={`px-3 py-1.5 rounded-xl font-medium transition-colors ${
            filters.date === yesterdayKey
              ? 'bg-forest text-white'
              : 'border border-line dark:border-dark-line text-ink-soft dark:text-ink-faint hover:bg-paper dark:hover:bg-dark-bg'
          }`}
        >
          Yesterday's Logs
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1) }} />
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors ${
            showFilters ? 'border-forest bg-forest-light text-forest' : 'border-line dark:border-dark-line text-ink-soft dark:text-ink-faint'
          }`}
        >
          <SlidersHorizontal size={15} /> Filters
        </button>
      </div>

      {showFilters && (
        <FilterPanel filters={filters} onChange={resetPageFilters} onReset={() => resetPageFilters(emptyFilters)} />
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={transactions.length === 0 ? 'No transactions yet' : 'No matching transactions'}
          message={transactions.length === 0 ? 'Start tracking your expenses to understand where your money goes.' : 'Try a different search or clear your filters.'}
          actionLabel={transactions.length === 0 ? '+ Add Expense' : undefined}
          onAction={transactions.length === 0 ? () => navigate('/add-expense') : undefined}
        />
      ) : (
        <>
          <div className="hidden md:block">
            <TransactionTable
              transactions={paged}
              onView={(t) => { setSelected(t); setMode('view') }}
              onEdit={(t) => { setSelected(t); setMode('edit') }}
              onDelete={handleDelete}
              sort={sort}
              onSortChange={setSort}
            />
          </div>
          <div className="md:hidden space-y-2">
            {paged.map((t) => (
              <TransactionCard key={t.id} transaction={t} onClick={(tx) => { setSelected(tx); setMode('view') }} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-ink-faint">Page {page} of {totalPages} · {filtered.length} results</p>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-line dark:border-dark-line text-xs font-medium text-ink-soft dark:text-ink-faint disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-line dark:border-dark-line text-xs font-medium text-ink-soft dark:text-ink-faint disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
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
        {selected && mode === 'view' && <DetailRows t={selected} currency={currency} />}
      </Modal>

      <Modal open={mode === 'edit' && !!selected} onClose={() => setMode('view')} title="Edit transaction">
        {selected && mode === 'edit' && (
          <TransactionForm transaction={selected} onSubmit={handleEditSubmit} onCancel={() => setMode('view')} />
        )}
      </Modal>
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
