export default function EmptyState({ icon: Icon, title, message, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-forest-light dark:bg-dark-surface text-forest flex items-center justify-center mb-4">
          <Icon size={26} />
        </div>
      )}
      <h3 className="font-display font-semibold text-lg text-ink dark:text-white mb-1.5">{title}</h3>
      {message && <p className="text-sm text-ink-soft dark:text-ink-faint max-w-xs mb-5 leading-relaxed">{message}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2.5 rounded-xl bg-forest text-white text-sm font-medium hover:bg-forest-dark transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
