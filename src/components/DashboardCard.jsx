import { useSettings } from '../hooks/useSettings'
import { formatCurrency } from '../utils/currency'

export default function DashboardCard({ label, amount, icon: Icon, tone = 'neutral', change, sub }) {
  const { settings } = useSettings()
  const currency = settings?.currency || 'INR'

  const tones = {
    forest: 'bg-forest-light text-forest',
    navy: 'bg-navy-light text-navy',
    amber: 'bg-amber-light text-amber',
    clay: 'bg-clay-light text-clay',
    neutral: 'bg-paper text-ink-soft dark:bg-dark-bg dark:text-ink-faint',
  }

  const changePositiveIsGood = tone !== 'clay'
  const isUp = (change ?? 0) >= 0

  return (
    <div className="ledger-stub rounded-2xl bg-paper-raised dark:bg-dark-surface border border-line dark:border-dark-line p-5 pt-6 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</span>
        {Icon && (
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${tones[tone]}`}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <div className="font-mono-num text-2xl font-semibold text-ink dark:text-white">
        {formatCurrency(amount, currency)}
      </div>
      {(sub || change !== undefined) && (
        <div className="mt-2 text-xs text-ink-faint">
          {change !== undefined && (
            <span className={isUp === changePositiveIsGood ? 'text-forest font-medium' : 'text-clay font-medium'}>
              {isUp ? '+' : ''}{change.toFixed(1)}%{' '}
            </span>
          )}
          {sub || 'vs last month'}
        </div>
      )}
    </div>
  )
}
