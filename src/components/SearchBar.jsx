import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search transactions…' }) {
  return (
    <div className="relative flex-1">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line dark:border-dark-line bg-paper-raised dark:bg-dark-bg text-ink dark:text-white pl-9 pr-9 py-2.5 text-sm focus:border-forest outline-none transition-colors"
      />
      {value && (
        <button onClick={() => onChange('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink dark:hover:text-white">
          <X size={14} />
        </button>
      )}
    </div>
  )
}
