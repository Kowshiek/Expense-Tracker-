import { PAYMENT_METHODS } from '../utils/constants'

export default function PaymentMethodSelector({ value, onChange, label = 'Payment method' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink dark:text-white mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line dark:border-dark-line bg-paper-raised dark:bg-dark-bg text-ink dark:text-white px-3.5 py-2.5 text-sm focus:border-forest outline-none transition-colors"
      >
        {PAYMENT_METHODS.map((m) => (
          <option key={m.value} value={m.value}>{m.label}</option>
        ))}
      </select>
    </div>
  )
}
