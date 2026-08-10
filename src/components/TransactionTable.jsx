import { ArrowUpDown, Eye, Pencil, Trash2 } from 'lucide-react'
import { getCategoryMeta } from '../utils/constants'
import { formatCurrency } from '../utils/currency'
import { formatDate } from '../utils/dateHelpers'
import { useSettings } from '../hooks/useSettings'

export default function TransactionTable({ transactions, onView, onEdit, onDelete, sort, onSortChange }) {
  const { settings } = useSettings()
  const currency = settings?.currency || 'INR'

  function toggleSort(field) {
    if (sort.field === field) {
      onSortChange({ field, direction: sort.direction === 'asc' ? 'desc' : 'asc' })
    } else {
      onSortChange({ field, direction: 'desc' })
    }
  }

  const Th = ({ field, children, className = '' }) => (
    <th className={`text-left text-xs font-semibold uppercase tracking-wide text-ink-faint px-4 py-3 ${className}`}>
      {field ? (
        <button onClick={() => toggleSort(field)} className="inline-flex items-center gap-1 hover:text-ink dark:hover:text-white transition-colors">
          {children} <ArrowUpDown size={12} className={sort.field === field ? 'text-forest' : ''} />
        </button>
      ) : children}
    </th>
  )

  return (
    <div className="overflow-x-auto rounded-2xl border border-line dark:border-dark-line bg-paper-raised dark:bg-dark-surface">
      <table className="w-full min-w-[720px] border-collapse">
        <thead className="border-b border-line dark:border-dark-line">
          <tr>
            <Th field="date">Date</Th>
            <Th>Description</Th>
            <Th>Category</Th>
            <Th>Type</Th>
            <Th>Payment</Th>
            <Th field="amount" className="text-right">Amount</Th>
            <Th className="text-right">Actions</Th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => {
            const meta = getCategoryMeta(t.category, t.type)
            const Icon = meta.icon
            const isIncome = t.type === 'income'
            return (
              <tr key={t.id} className="border-b border-line dark:border-dark-line last:border-0 hover:bg-paper dark:hover:bg-dark-bg/60 transition-colors">
                <td className="px-4 py-3 text-sm text-ink-soft dark:text-ink-faint font-mono-num whitespace-nowrap">{formatDate(t.date)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-[160px]">
                    <span className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}>
                      <Icon size={14} />
                    </span>
                    <span className="text-sm font-medium text-ink dark:text-white truncate">{t.title}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-ink-soft dark:text-ink-faint whitespace-nowrap">{meta.label}</td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${isIncome ? 'bg-forest-light text-forest' : 'bg-clay-light text-clay'}`}>
                    {isIncome ? 'Income' : 'Expense'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-ink-soft dark:text-ink-faint whitespace-nowrap">{t.paymentMethod}</td>
                <td className={`px-4 py-3 text-right font-mono-num text-sm font-semibold whitespace-nowrap ${isIncome ? 'text-forest' : 'text-ink dark:text-white'}`}>
                  {isIncome ? '+' : '-'}{formatCurrency(t.amount, currency)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => onView(t)} aria-label="View details" className="p-1.5 rounded-lg text-ink-faint hover:text-navy hover:bg-navy-light transition-colors"><Eye size={15} /></button>
                    <button onClick={() => onEdit(t)} aria-label="Edit" className="p-1.5 rounded-lg text-ink-faint hover:text-forest hover:bg-forest-light transition-colors"><Pencil size={15} /></button>
                    <button onClick={() => onDelete(t)} aria-label="Delete" className="p-1.5 rounded-lg text-ink-faint hover:text-clay hover:bg-clay-light transition-colors"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
