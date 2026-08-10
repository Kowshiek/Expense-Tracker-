export default function CategorySelector({ value, onChange, options, label = 'Category', error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink dark:text-white mb-2">{label}</label>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {options.map((opt) => {
          const Icon = opt.icon
          const active = value === opt.value
          return (
            <button
              type="button"
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-colors ${
                active
                  ? 'border-forest bg-forest-light text-forest'
                  : 'border-line dark:border-dark-line text-ink-soft dark:text-ink-faint hover:border-forest/50'
              }`}
            >
              <Icon size={18} />
              <span className="truncate w-full text-center">{opt.label}</span>
            </button>
          )
        })}
      </div>
      {error && <p className="text-xs text-clay mt-1.5">{error}</p>}
    </div>
  )
}
