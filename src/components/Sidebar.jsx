import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, PlusCircle, PieChart, Wallet2,
  FileText, ShieldCheck, Settings as SettingsIcon, Landmark,
  Download, Zap,
} from 'lucide-react'
import GithubIcon from './GithubIcon'
import InstallAppModal from './InstallAppModal'
import UpiImportModal from './UpiImportModal'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/add-expense', label: 'Add expense', icon: PlusCircle },
  { to: '/add-income', label: 'Add income', icon: PlusCircle },
  { to: '/analytics', label: 'Analytics', icon: PieChart },
  { to: '/budgets', label: 'Budgets', icon: Wallet2 },
  { to: '/reports', label: 'Monthly report', icon: FileText },
  { to: '/backup', label: 'Backup & restore', icon: ShieldCheck },
  { to: '/settings', label: 'Settings', icon: SettingsIcon },
]

export default function Sidebar() {
  const [showInstall, setShowInstall] = useState(false)
  const [showUpi, setShowUpi] = useState(false)

  return (
    <>
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-line dark:border-dark-line bg-paper-raised dark:bg-dark-surface h-screen sticky top-0">
        <div className="flex items-center gap-2.5 px-6 py-6">
          <span className="w-9 h-9 rounded-xl bg-forest text-white flex items-center justify-center">
            <Landmark size={18} />
          </span>
          <div>
            <p className="font-display font-semibold text-ink dark:text-white leading-none">SpendWise</p>
            <p className="text-[11px] text-ink-faint mt-1">Mobile DB · Offline First</p>
          </div>
        </div>

        <div className="px-3 mb-2 space-y-1">
          <button
            onClick={() => setShowUpi(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold bg-forest-light text-forest hover:bg-forest/20 transition-colors"
          >
            <Zap size={15} />
            <span>⚡ Auto-Detect UPI</span>
          </button>
          <button
            onClick={() => setShowInstall(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium border border-line dark:border-dark-line text-ink-soft dark:text-ink-faint hover:border-forest hover:text-forest transition-colors"
          >
            <Download size={15} />
            <span>Download in Chrome</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-6 space-y-0.5">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-forest-light text-forest'
                    : 'text-ink-soft dark:text-ink-faint hover:bg-paper dark:hover:bg-dark-bg'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-line dark:border-dark-line space-y-1.5">
          <a
            href="https://github.com/Kowshiek/Expense-Tracker-"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-xs font-medium text-ink-soft dark:text-ink-faint hover:text-forest transition-colors"
          >
            <GithubIcon size={14} />
            <span>GitHub Sync: Kowshiek</span>
          </a>
          <p className="text-[10px] text-ink-faint leading-tight">
            Data resides in Mobile Storage (IndexedDB).
          </p>
        </div>
      </aside>

      <InstallAppModal open={showInstall} onClose={() => setShowInstall(false)} />
      <UpiImportModal open={showUpi} onClose={() => setShowUpi(false)} />
    </>
  )
}
