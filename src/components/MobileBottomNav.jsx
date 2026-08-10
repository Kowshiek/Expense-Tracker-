import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ArrowLeftRight, Plus, PieChart, Settings as SettingsIcon } from 'lucide-react'
import { useState } from 'react'

export default function MobileBottomNav() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const Item = ({ to, label, icon: Icon }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex flex-col items-center gap-0.5 py-2 px-2 text-[11px] font-medium transition-colors ${
          isActive ? 'text-forest' : 'text-ink-faint'
        }`
      }
    >
      <Icon size={20} />
      {label}
    </NavLink>
  )

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)}>
          <div
            className="absolute bottom-20 left-4 right-4 rounded-2xl bg-paper-raised dark:bg-dark-surface border border-line dark:border-dark-line shadow-xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setOpen(false); navigate('/add-expense') }}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-ink dark:text-white hover:bg-paper dark:hover:bg-dark-bg"
            >
              Add expense
            </button>
            <button
              onClick={() => { setOpen(false); navigate('/add-income') }}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium text-ink dark:text-white hover:bg-paper dark:hover:bg-dark-bg"
            >
              Add income
            </button>
          </div>
        </div>
      )}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-paper-raised dark:bg-dark-surface border-t border-line dark:border-dark-line px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-5 items-center">
          <Item to="/dashboard" label="Home" icon={LayoutDashboard} />
          <Item to="/transactions" label="History" icon={ArrowLeftRight} />
          <div className="flex justify-center -mt-5">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Add transaction"
              className="w-14 h-14 rounded-full bg-forest text-white flex items-center justify-center shadow-lg border-4 border-paper dark:border-dark-bg"
            >
              <Plus size={24} />
            </button>
          </div>
          <Item to="/analytics" label="Analytics" icon={PieChart} />
          <Item to="/settings" label="Settings" icon={SettingsIcon} />
        </div>
      </nav>
    </>
  )
}
