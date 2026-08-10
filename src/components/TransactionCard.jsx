import { getCategoryMeta } from '../utils/constants'
import { formatCurrency } from '../utils/currency'
import { formatDate } from '../utils/dateHelpers'
import { useSettings } from '../hooks/useSettings'

export default function TransactionCard({ transaction, onClick }) {
  const { settings } = useSettings()
  const meta = getCategoryMeta(transaction.category, transaction.type)
  const Icon = meta.icon
  const isIncome = transaction.type === 'income'

  return (
    <button
      onClick={() => onClick(transaction)}
      className="w-full flex items-center gap-3 rounded-xl bg-paper-raised dark:bg-dark-surface border border-line dark:border-dark-line p-3.5 text-left hover:border-forest/40 transition-colors"
    >
      <span
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}
      >
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-ink dark:text-white truncate">{transaction.title}</p>
        <p className="text-xs text-ink-faint">{meta.label} · {formatDate(transaction.date)}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={`font-mono-num text-sm font-semibold ${isIncome ? 'text-forest' : 'text-ink dark:text-white'}`}>
          {isIncome ? '+' : '-'}{formatCurrency(transaction.amount, settings?.currency || 'INR')}
        </p>
        <p className="text-[11px] text-ink-faint">{transaction.paymentMethod}</p>
      </div>
    </button>
  )
}
