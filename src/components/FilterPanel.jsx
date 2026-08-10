import { EXPENSE_CATEGORIES, INCOME_SOURCES, PAYMENT_METHODS } from '../utils/constants'

const allCategories = [...new Map([...EXPENSE_CATEGORIES, ...INCOME_SOURCES].map((c) => [c.value, c])).values()]

export default function FilterPanel({ filters, onChange, onReset }) {
  const Select = ({ field, label, options }) => (
    <div>
      <label className="block text-xs font-medium text-ink-faint mb-1.5">{label}</label>
      <select
        value={filters[field]}
        onChange={(e) => onChange({ ...filters, [field]: e.target.value })}
        className="w-full rounded-lg border border-line dark:border-dark-line bg-paper-raised dark:bg-dark-bg text-ink dark:text-white px-3 py-2 text-sm focus:border-forest outline-none transition-colors"
      >
        <option value="">All</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl border border-line dark:border-dark-line bg-paper-raised dark:bg-dark-surface p-4">
      <Select field="type" label="Type" options={['expense', 'income']} />
      <Select field="category" label="Category" options={allCategories.map((c) => c.value)} />
      <Select field="paymentMethod" label="Payment" options={PAYMENT_METHODS.map((p) => p.value)} />
      <div>
        <label className="block text-xs font-medium text-ink-faint mb-1.5">Date</label>
        <input
          type="date"
          value={filters.date}
          onChange={(e) => onChange({ ...filters, date: e.target.value })}
          className="w-full rounded-lg border border-line dark:border-dark-line bg-paper-raised dark:bg-dark-bg text-ink dark:text-white px-3 py-2 text-sm font-mono-num focus:border-forest outline-none transition-colors"
        />
      </div>
      <div className="col-span-2 sm:col-span-4 flex justify-end">
        <button onClick={onReset} className="text-xs font-medium text-forest hover:text-forest-dark transition-colors">
          Reset filters
        </button>
      </div>
    </div>
  )
}
