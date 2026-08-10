import { Pencil, Trash2 } from 'lucide-react'
import { getCategoryMeta } from '../utils/constants'
import { formatCurrency } from '../utils/currency'
import { useSettings } from '../hooks/useSettings'
import BudgetProgress from './BudgetProgress'

export default function BudgetCard({ budget, spent, onEdit, onDelete }) {
  const { settings } = useSettings()
  const currency = settings?.currency || 'INR'
  const meta = getCategoryMeta(budget.category)
  const Icon = meta.icon
  const remaining = budget.amount - spent
  const pct = budget.amount > 0 ? (spent / budget.amount) * 100 : 0

  let statusLabel = null
  if (pct >= 100) statusLabel = <span className="text-[11px] font-medium text-clay">Budget exceeded</span>
  else if (pct >= 80) statusLabel = <span className="text-[11px] font-medium text-amber">Approaching limit</span>

  return (
    <div className="ledger-stub rounded-2xl bg-paper-raised dark:bg-dark-surface border border-line dark:border-dark-line p-5 pt-6 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}>
            <Icon size={16} />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink dark:text-white">{meta.label}</p>
            {statusLabel}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(budget)} aria-label="Edit budget" className="p-1.5 rounded-lg text-ink-faint hover:text-forest hover:bg-forest-light transition-colors"><Pencil size={14} /></button>
          <button onClick={() => onDelete(budget)} aria-label="Delete budget" className="p-1.5 rounded-lg text-ink-faint hover:text-clay hover:bg-clay-light transition-colors"><Trash2 size={14} /></button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-ink-faint mb-0.5">Budget</p>
          <p className="font-mono-num text-sm font-semibold text-ink dark:text-white">{formatCurrency(budget.amount, currency)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-ink-faint mb-0.5">Spent</p>
          <p className="font-mono-num text-sm font-semibold text-ink dark:text-white">{formatCurrency(spent, currency)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wide text-ink-faint mb-0.5">Remaining</p>
          <p className={`font-mono-num text-sm font-semibold ${remaining < 0 ? 'text-clay' : 'text-forest'}`}>{formatCurrency(remaining, currency)}</p>
        </div>
      </div>

      <BudgetProgress spent={spent} budget={budget.amount} />
    </div>
  )
}
