import { useState, useEffect } from 'react'
import { Download, Smartphone, Laptop, CheckCircle2 } from 'lucide-react'
import Modal from './Modal'

// Global install prompt capture
let deferredPrompt = null
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    window.dispatchEvent(new Event('spendwise:installable'))
  })
}

export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState(!!deferredPrompt)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true
      setIsStandalone(isStandaloneMode)
    }
    checkStandalone()

    const handleInstallable = () => setCanInstall(true)
    const handleAppInstalled = () => {
      setCanInstall(false)
      setIsStandalone(true)
      deferredPrompt = null
    }

    window.addEventListener('spendwise:installable', handleInstallable)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      window.removeEventListener('spendwise:installable', handleInstallable)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) return false
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      deferredPrompt = null
      setCanInstall(false)
      return true
    }
    return false
  }

  return { canInstall, isStandalone, promptInstall }
}

export default function InstallAppModal({ open, onClose }) {
  const { canInstall, isStandalone, promptInstall } = usePwaInstall()
  const [installing, setInstalling] = useState(false)

  const handleInstallClick = async () => {
    setInstalling(true)
    try {
      const accepted = await promptInstall()
      if (accepted) {
        onClose?.()
      }
    } finally {
      setInstalling(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Download SpendWise in Chrome">
      <div className="space-y-5">
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-forest-light dark:bg-dark-surface border border-forest/20">
          <div className="w-10 h-10 rounded-lg bg-forest text-white flex items-center justify-center shrink-0">
            <Download size={20} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-ink dark:text-white">Run Directly from Mobile Storage</h4>
            <p className="text-xs text-ink-faint">Install as a native Chrome web app. Works 100% offline with zero server dependency.</p>
          </div>
        </div>

        {isStandalone ? (
          <div className="p-4 rounded-xl bg-forest/10 border border-forest/30 flex items-center gap-3">
            <CheckCircle2 className="text-forest shrink-0" size={20} />
            <span className="text-xs font-medium text-forest">SpendWise is already downloaded and running as an installed Chrome App!</span>
          </div>
        ) : canInstall ? (
          <button
            onClick={handleInstallClick}
            disabled={installing}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-forest text-white font-medium text-sm hover:bg-forest-dark transition-colors shadow-sm"
          >
            <Download size={18} />
            {installing ? 'Opening Chrome prompt…' : 'Download / Install Now in Chrome'}
          </button>
        ) : (
          <div className="space-y-4 text-xs text-ink-soft dark:text-ink-faint leading-relaxed">
            <div className="p-3 rounded-xl border border-line dark:border-dark-line bg-paper dark:bg-dark-bg space-y-2">
              <div className="flex items-center gap-2 font-semibold text-ink dark:text-white">
                <Smartphone size={16} className="text-forest" />
                <span>On Android (Google Chrome):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 pl-1">
                <li>Tap Chrome’s three vertical dots <strong>(⋮)</strong> in the top-right corner.</li>
                <li>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
                <li>Tap <strong>Install</strong> to confirm. The icon will appear on your phone’s home screen!</li>
              </ol>
            </div>

            <div className="p-3 rounded-xl border border-line dark:border-dark-line bg-paper dark:bg-dark-bg space-y-2">
              <div className="flex items-center gap-2 font-semibold text-ink dark:text-white">
                <Laptop size={16} className="text-forest" />
                <span>On Desktop (Chrome / Edge):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 pl-1">
                <li>Click the <strong>Install SpendWise</strong> icon in the right side of the address bar.</li>
                <li>Click <strong>Install</strong> to launch it in its own native app window.</li>
              </ol>
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-line dark:border-dark-line flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium border border-line dark:border-dark-line text-ink dark:text-white hover:bg-paper dark:hover:bg-dark-bg"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  )
}
