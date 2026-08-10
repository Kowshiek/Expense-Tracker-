import { useNavigate } from 'react-router-dom'
import { Landmark, ShieldCheck } from 'lucide-react'
import { useSettings } from '../hooks/useSettings'
import { useToast } from '../context/ToastContext'
import { loadDemoData } from '../utils/demoData'

export default function Onboarding() {
  const navigate = useNavigate()
  const { updateSettings } = useSettings()
  const toast = useToast()

  async function finish() {
    await updateSettings({ onboarded: true })
    navigate('/dashboard')
  }

  async function startTracking() {
    await finish()
  }

  async function loadDemo() {
    const count = await loadDemoData()
    toast.success(`Loaded ${count} demo transactions`)
    await finish()
  }

  return (
    <div className="min-h-screen bg-paper dark:bg-dark-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-forest text-white flex items-center justify-center mx-auto mb-6">
          <Landmark size={28} />
        </div>
        <h1 className="font-display font-semibold text-3xl text-ink dark:text-white mb-3">Welcome to SpendWise</h1>
        <p className="text-ink-soft dark:text-ink-faint leading-relaxed mb-8">
          Track your money privately. Your data stays on your device.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={startTracking}
            className="w-full px-5 py-3 rounded-xl bg-forest text-white font-medium hover:bg-forest-dark transition-colors"
          >
            Start Tracking
          </button>
          <button
            onClick={loadDemo}
            className="w-full px-5 py-3 rounded-xl border border-line dark:border-dark-line text-ink dark:text-white font-medium hover:bg-paper-raised dark:hover:bg-dark-surface transition-colors"
          >
            Load Demo Data
          </button>
        </div>

        <div className="mt-8 flex items-start gap-2.5 text-left rounded-xl bg-forest-light dark:bg-dark-surface p-4">
          <ShieldCheck size={18} className="text-forest shrink-0 mt-0.5" />
          <p className="text-xs text-ink-soft dark:text-ink-faint leading-relaxed">
            Every transaction is saved to an IndexedDB database that lives only in this browser.
            Nothing is ever uploaded to a server.
          </p>
        </div>
      </div>
    </div>
  )
}
