import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { getMonthlySummary } from '../services/analyticsService'
import { currentMonthKey, monthLabel, lastNMonthKeys } from '../utils/dateHelpers'
import { getCategoryMeta } from '../utils/constants'
import { formatCurrency } from '../utils/currency'
import { useSettings } from '../hooks/useSettings'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { FileText, TrendingUp, TrendingDown, PiggyBank, Receipt } from 'lucide-react'

export default function Reports() {
  const [month, setMonth] = useState(currentMonthKey())
  const { settings } = useSettings()
  const currency = settings?.currency || 'INR'
  const months = lastNMonthKeys(12)

  const summary = useLiveQuery(async () => {
    await db.transactions.toArray()
    return getMonthlySummary(month)
  }, [month])

  if (summary === undefined) return <LoadingSpinner label="Building your report…" />

  const Stat = ({ label, value, icon: Icon, tone = 'neutral' }) => {
    const tones = {
      forest: 'bg-forest-light text-forest',
      clay: 'bg-clay-light text-clay',
      amber: 'bg-amber-light text-amber',
      neutral: 'bg-paper text-ink-soft dark:bg-dark-bg dark:text-ink-faint',
    }
    return (
      <div className="rounded-2xl bg-paper-raised dark:bg-dark-surface border border-line dark:border-dark-line p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-faint">{label}</span>
          <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${tones[tone]}`}><Icon size={15} /></span>
        </div>
        <p className="font-mono-num text-xl font-semibold text-ink dark:text-white">{value}</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs font-medium text-ink-faint mb-1.5">Select month</label>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="rounded-xl border border-line dark:border-dark-line bg-paper-raised dark:bg-dark-bg text-ink dark:text-white px-3.5 py-2.5 text-sm focus:border-forest outline-none"
        >
          {months.map((m) => <option key={m} value={m}>{monthLabel(m)}</option>)}
        </select>
      </div>

      {summary.transactionCount === 0 ? (
        <EmptyState icon={FileText} title={`No activity in ${monthLabel(month)}`} message="Pick another month or add some transactions." />
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat label="Total income" value={formatCurrency(summary.totalIncome, currency)} icon={TrendingUp} tone="forest" />
            <Stat label="Total expenses" value={formatCurrency(summary.totalExpenses, currency)} icon={TrendingDown} tone="clay" />
            <Stat label="Total savings" value={formatCurrency(summary.totalSavings, currency)} icon={PiggyBank} tone="amber" />
            <Stat label="Transactions" value={summary.transactionCount} icon={Receipt} tone="neutral" />
          </div>

          <div className="rounded-2xl bg-paper-raised dark:bg-dark-surface border border-line dark:border-dark-line p-5">
            <h3 className="font-display font-semibold text-sm text-ink dark:text-white mb-4">Highlights</h3>
            <dl className="divide-y divide-line dark:divide-dark-line">
              <Row label="Highest spending category">
                {summary.highestCategory ? `${getCategoryMeta(summary.highestCategory.category).label} — ${formatCurrency(summary.highestCategory.amount, currency)}` : '—'}
              </Row>
              <Row label="Highest single transaction">
                {summary.highestTransaction ? `${summary.highestTransaction.title} — ${formatCurrency(summary.highestTransaction.amount, currency)}` : '—'}
              </Row>
              <Row label="Average daily spending">
                {formatCurrency(summary.averageDailySpending, currency)}
              </Row>
            </dl>
          </div>
        </>
      )}
    </div>
  )
}

function Row({ label, children }) {
  return (
    <div className="flex justify-between py-3 text-sm gap-4">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-ink dark:text-white font-medium text-right">{children}</dd>
    </div>
  )
}
