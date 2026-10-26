import { useState } from 'react'
import { EXPENSE_CATEGORIES } from '../utils/constants'
import { todayStr } from '../utils/dateHelpers'
import { useSettings } from '../hooks/useSettings'
import { getCurrencySymbol } from '../utils/currency'
import CategorySelector from './CategorySelector'
import PaymentMethodSelector from './PaymentMethodSelector'
import DatePicker from './DatePicker'
import { Zap } from 'lucide-react'
import { parseUpiMessage } from '../services/upiService'
import { useToast } from '../context/ToastContext'

const emptyState = {
  amount: '', title: '', category: 'Food', date: todayStr(), paymentMethod: 'UPI', notes: '',
}

export default function ExpenseForm({ initial, onSubmit, onCancel, submitLabel = 'Add expense' }) {
  const [form, setForm] = useState(initial ? { ...emptyState, ...initial } : emptyState)
  const [errors, setErrors] = useState({})
  const { settings } = useSettings()
  const toast = useToast()
  const symbol = getCurrencySymbol(settings?.currency || 'INR')

  function handleAutoDetectUpi() {
    if (!navigator.clipboard?.readText) {
      toast.error('Clipboard reading not supported in this browser.')
      return
    }
    navigator.clipboard.readText().then((text) => {
      if (!text || !text.trim()) {
        toast.error('Clipboard is empty. Copy a UPI SMS first!')
        return
      }
      const parsed = parseUpiMessage(text)
      if (!parsed) {
        toast.error('Could not parse a UPI amount from clipboard.')
        return
      }
      setForm((prev) => ({
        ...prev,
        amount: parsed.amount,
        title: parsed.title,
        category: parsed.category !== 'Other' ? parsed.category : prev.category,
        paymentMethod: 'UPI',
        date: parsed.date || prev.date,
        notes: parsed.notes,
      }))
      toast.success(`Auto-filled from ${parsed.bankName}: ₹${parsed.amount}`)
    }).catch(() => {
      toast.error('Could not access clipboard.')
    })
  }

  function validate() {
    const next = {}
    if (!form.amount || Number(form.amount) <= 0) next.amount = 'Enter an amount greater than 0.'
    if (!form.title.trim()) next.title = 'Title is required.'
    if (!form.category) next.category = 'Choose a category.'
    if (!form.date) next.date = 'Date is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ ...form, type: 'expense' })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between pb-2 border-b border-line dark:border-dark-line">
        <span className="text-xs text-ink-faint">Daily cycle: 12:01 AM</span>
        <button
          type="button"
          onClick={handleAutoDetectUpi}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-forest/10 hover:bg-forest/20 text-forest text-xs font-semibold transition-colors"
        >
          <Zap size={13} /> Auto-Fill from UPI SMS
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink dark:text-white mb-2">Amount</label>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint font-mono-num">{symbol}</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            placeholder="0.00"
            className="w-full rounded-xl border border-line dark:border-dark-line bg-paper-raised dark:bg-dark-bg text-ink dark:text-white pl-8 pr-3.5 py-2.5 text-sm font-mono-num focus:border-forest outline-none transition-colors"
          />
        </div>
        {errors.amount && <p className="text-xs text-clay mt-1.5">{errors.amount}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-ink dark:text-white mb-2">Expense title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Lunch with friends"
          className="w-full rounded-xl border border-line dark:border-dark-line bg-paper-raised dark:bg-dark-bg text-ink dark:text-white px-3.5 py-2.5 text-sm focus:border-forest outline-none transition-colors"
        />
        {errors.title && <p className="text-xs text-clay mt-1.5">{errors.title}</p>}
      </div>

      <CategorySelector
        value={form.category}
        onChange={(v) => setForm({ ...form, category: v })}
        options={EXPENSE_CATEGORIES}
        error={errors.category}
      />

      <div className="grid grid-cols-2 gap-4">
        <DatePicker value={form.date} onChange={(v) => setForm({ ...form, date: v })} max={todayStr()} error={errors.date} />
        <PaymentMethodSelector value={form.paymentMethod} onChange={(v) => setForm({ ...form, paymentMethod: v })} />
      </div>

      <div>
        <label className="block text-sm font-medium text-ink dark:text-white mb-2">Notes <span className="text-ink-faint font-normal">(optional)</span></label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          rows={2}
          placeholder="Any extra detail…"
          className="w-full rounded-xl border border-line dark:border-dark-line bg-paper-raised dark:bg-dark-bg text-ink dark:text-white px-3.5 py-2.5 text-sm focus:border-forest outline-none transition-colors resize-none"
        />
      </div>

      <div className="flex gap-3 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-line dark:border-dark-line text-sm font-medium text-ink-soft dark:text-ink-faint hover:bg-paper dark:hover:bg-dark-bg transition-colors">
            Cancel
          </button>
        )}
        <button type="submit" className="flex-1 px-4 py-2.5 rounded-xl bg-clay text-white text-sm font-medium hover:bg-clay/90 transition-colors">
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
