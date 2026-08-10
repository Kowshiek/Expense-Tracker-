export default function DatePicker({ value, onChange, label = 'Date', error, max }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink dark:text-white mb-2">{label}</label>
      <input
        type="date"
        value={value}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line dark:border-dark-line bg-paper-raised dark:bg-dark-bg text-ink dark:text-white px-3.5 py-2.5 text-sm focus:border-forest outline-none transition-colors font-mono-num"
      />
      {error && <p className="text-xs text-clay mt-1.5">{error}</p>}
    </div>
  )
}
