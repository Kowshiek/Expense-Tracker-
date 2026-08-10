export default function LoadingSpinner({ label = 'Loading…', className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-12 text-ink-faint ${className}`}>
      <div className="w-8 h-8 rounded-full border-2 border-line dark:border-dark-line border-t-forest animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  )
}
