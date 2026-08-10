import { createContext, useCallback, useContext, useState } from 'react'
import { AlertTriangle } from 'lucide-react'

const ConfirmContext = createContext(null)

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null) // { title, message, confirmLabel, danger, resolve }

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setState({
        title: options.title || 'Are you sure?',
        message: options.message || '',
        confirmLabel: options.confirmLabel || 'Confirm',
        cancelLabel: options.cancelLabel || 'Cancel',
        danger: options.danger !== false,
        resolve,
      })
    })
  }, [])

  const close = (result) => {
    state?.resolve(result)
    setState(null)
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-2xl bg-paper-raised dark:bg-dark-surface border border-line dark:border-dark-line shadow-xl p-6">
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-4 ${state.danger ? 'bg-clay-light text-clay' : 'bg-forest-light text-forest'}`}>
              <AlertTriangle size={20} />
            </div>
            <h2 className="font-display font-semibold text-lg text-ink dark:text-white mb-1.5">{state.title}</h2>
            <p className="text-sm text-ink-soft dark:text-ink-faint leading-relaxed mb-6">{state.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => close(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-ink-soft hover:bg-paper dark:hover:bg-dark-bg transition-colors"
              >
                {state.cancelLabel}
              </button>
              <button
                onClick={() => close(true)}
                className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors ${state.danger ? 'bg-clay hover:bg-clay/90' : 'bg-forest hover:bg-forest-dark'}`}
              >
                {state.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider')
  return ctx
}
