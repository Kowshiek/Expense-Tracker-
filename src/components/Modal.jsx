import { X } from 'lucide-react'
import { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const widths = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }

  return (
    <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center bg-ink/40 backdrop-blur-sm p-0 md:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div
        className={`w-full ${widths[size]} bg-paper-raised dark:bg-dark-surface rounded-t-2xl md:rounded-2xl border border-line dark:border-dark-line shadow-xl max-h-[92vh] flex flex-col`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-line dark:border-dark-line shrink-0">
          <h2 className="font-display font-semibold text-base text-ink dark:text-white">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-ink-faint hover:text-ink dark:hover:text-white transition-colors p-1 -mr-1">
            <X size={20} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto scrollbar-thin">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-line dark:border-dark-line shrink-0">{footer}</div>}
      </div>
    </div>
  )
}
