import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ArrowLeftRight, PlusCircle, PieChart, Wallet2,
  FileText, ShieldCheck, Settings as SettingsIcon, Landmark,
} from 'lucide-react'

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
  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-line dark:border-dark-line bg-paper-raised dark:bg-dark-surface h-screen sticky top-0">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <span className="w-9 h-9 rounded-xl bg-forest text-white flex items-center justify-center">
          <Landmark size={18} />
        </span>
        <div>
          <p className="font-display font-semibold text-ink dark:text-white leading-none">SpendWise</p>
          <p className="text-[11px] text-ink-faint mt-1">Private &amp; local</p>
        </div>
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
      <div className="px-4 py-4 border-t border-line dark:border-dark-line">
        <p className="text-[11px] text-ink-faint leading-relaxed">
          Your data never leaves this device. No servers, no accounts.
        </p>
      </div>
    </aside>
  )
}
