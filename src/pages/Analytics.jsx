import { useAnalytics } from '../hooks/useAnalytics'
import { useTransactions } from '../hooks/useTransactions'
import { currentMonthKey } from '../utils/dateHelpers'
import { getCategoryMeta } from '../utils/constants'
import { formatCurrency } from '../utils/currency'
import { useSettings } from '../hooks/useSettings'
import ExpenseChart from '../charts/ExpenseChart'
import MonthlyChart from '../charts/MonthlyChart'
import IncomeExpenseChart from '../charts/IncomeExpenseChart'
import DailySpendingChart from '../charts/DailySpendingChart'
import LoadingSpinner from '../components/LoadingSpinner'
import EmptyState from '../components/EmptyState'
import { BarChart3 } from 'lucide-react'

function Section({ title, children }) {
  return (
    <div className="rounded-2xl bg-paper-raised dark:bg-dark-surface border border-line dark:border-dark-line p-5">
      <h3 className="font-display font-semibold text-sm text-ink dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  )
}

export default function Analytics() {
  const month = currentMonthKey()
  const { categoryExpenses, monthlyExpenses, incomeVsExpense, dailySpending, loading } = useAnalytics(month)
  const { transactions } = useTransactions()
  const { settings } = useSettings()
  const currency = settings?.currency || 'INR'

  if (loading) return <LoadingSpinner label="Crunching your numbers…" />

  if (transactions.length === 0) {
    return (
      <EmptyState icon={BarChart3} title="Nothing to analyze yet" message="Add a few transactions and your charts will appear here." />
    )
  }

  const total = categoryExpenses.reduce((s, c) => s + c.amount, 0)
  const topCategories = categoryExpenses.slice(0, 5)

  return (
    <div className="space-y-5">
      <div className="grid lg:grid-cols-2 gap-5">
        <Section title="Expense by category">
          <ExpenseChart data={categoryExpenses} />
        </Section>
        <Section title="Top categories">
          <div className="space-y-3">
            {topCategories.map((c) => {
              const meta = getCategoryMeta(c.category)
              const Icon = meta.icon
              const pct = total > 0 ? (c.amount / total) * 100 : 0
              return (
                <div key={c.category} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${meta.color}1A`, color: meta.color }}>
                    <Icon size={15} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-ink dark:text-white">{meta.label}</span>
                      <span className="font-mono-num text-ink-soft dark:text-ink-faint">{formatCurrency(c.amount, currency)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-paper dark:bg-dark-bg overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Section>
      </div>

      <Section title="Monthly expenses">
        <MonthlyChart data={monthlyExpenses} />
      </Section>

      <Section title="Income vs expense">
        <IncomeExpenseChart data={incomeVsExpense} />
      </Section>

      <Section title="Daily spending (last 30 days)">
        <DailySpendingChart data={dailySpending} />
      </Section>
    </div>
  )
}
