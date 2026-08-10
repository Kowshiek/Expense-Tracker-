import { useState } from 'react'
import { Plus, Wallet2 } from 'lucide-react'
import { useBudgets } from '../hooks/useBudgets'
import { currentMonthKey, monthLabel } from '../utils/dateHelpers'
import { EXPENSE_CATEGORIES } from '../utils/constants'
import BudgetCard from '../components/BudgetCard'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import Modal from '../components/Modal'
import { addBudget, updateBudget, deleteBudget } from '../services/budgetService'
import { useToast } from '../context/ToastContext'
import { useConfirm } from '../context/ConfirmContext'
import { useSettings } from '../hooks/useSettings'
import { getCurrencySymbol } from '../utils/currency'

export default function Budgets() {
  const month = currentMonthKey()
  const { budgets, spentByCategory, loading } = useBudgets(month)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const toast = useToast()
  const confirm = useConfirm()
  const { settings } = useSettings()
  const symbol = getCurrencySymbol(settings?.currency || 'INR')

  const usedCategories = new Set(budgets.map((b) => b.category))
  const availableCategories = editing
    ? EXPENSE_CATEGORIES
    : EXPENSE_CATEGORIES.filter((c) => !usedCategories.has(c.value))

  async function handleSubmit(form) {
    if (editing) {
      await updateBudget(editing.id, { amount: form.amount })
      toast.success('Budget updated')
    } else {
      await addBudget({ month, category: form.category, amount: form.amount })
      toast.success('Budget created')
    }
    setModalOpen(false)
    setEditing(null)
  }

  async function handleDelete(budget) {
    const ok = await confirm({
      title: 'Delete this budget?',
      message: `The budget for ${budget.category} will be removed. Your transactions are unaffected.`,
      confirmLabel: 'Delete',
    })
    if (!ok) return
    await deleteBudget(budget.id)
    toast.success('Budget deleted')
  }

  if (loading) return <LoadingSpinner label="Loading budgets…" />

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-faint">{monthLabel(month)}</p>
        <button
          onClick={() => { setEditing(null); setModalOpen(true) }}
          disabled={availableCategories.length === 0}
          className="flex items-center gap-1.5 rounded-xl bg-forest text-white px-4 py-2 text-sm font-medium hover:bg-forest-dark transition-colors disabled:opacity-40"
        >
          <Plus size={16} /> New budget
        </button>
      </div>

      {budgets.length === 0 ? (
        <EmptyState
          icon={Wallet2}
          title="No budgets set for this month"
          message="Set a monthly limit per category to keep your spending in check."
          actionLabel="+ New budget"
          onAction={() => setModalOpen(true)}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              spent={spentByCategory[b.category] || 0}
              onEdit={(bud) => { setEditing(bud); setModalOpen(true) }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null) }} title={editing ? 'Edit budget' : 'New budget'}>
        <BudgetForm
          symbol={symbol}
          categories={availableCategories}
          editing={editing}
          onSubmit={handleSubmit}
          onCancel={() => { setModalOpen(false); setEditing(null) }}
        />
      </Modal>
    </div>
  )
}

function BudgetForm({ symbol, categories, editing, onSubmit, onCancel }) {
  const [category, setCategory] = useState(editing?.category || categories[0]?.value || '')
  const [amount, setAmount] = useState(editing?.amount || '')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!category) { setError('Choose a category.'); return }
    if (!amount || Number(amount) <= 0) { setError('Enter an amount greater than 0.'); return }
    onSubmit({ category, amount })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-ink dark:text-white mb-2">Category</label>
        <select
          value={category}
          disabled={!!editing}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-xl border border-line dark:border-dark-line bg-paper-raised dark:bg-dark-bg text-ink dark:text-white px-3.5 py-2.5 text-sm focus:border-forest outline-none disabled:opacity-60"
        >
          {categories.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-ink dark:text-white mb-2">Monthly limit</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint font-mono-num">{symbol}</span>
          <input
            type="number" inputMode="decimal" step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full rounded-xl border border-line dark:border-dark-line bg-paper-raised dark:bg-dark-bg text-ink dark:text-white pl-8 pr-3.5 py-2.5 text-sm font-mono-num focus:border-forest outline-none"
          />
        </div>
        {error && <p className="text-xs text-clay mt-1.5">{error}</p>}
      </div>
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-line dark:border-dark-line text-sm font-medium text-ink-soft dark:text-ink-faint hover:bg-paper dark:hover:bg-dark-bg transition-colors">Cancel</button>
        <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-forest text-white text-sm font-medium hover:bg-forest-dark transition-colors">{editing ? 'Save changes' : 'Create budget'}</button>
      </div>
    </form>
  )
}
