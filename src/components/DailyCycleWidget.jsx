import { useState, useEffect } from 'react'
import { Clock, Plus, Zap, ShieldCheck, ChevronDown, ChevronUp, Calendar, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { getDailyCycleMetrics, initDailyCycleWatcher, getPreviousDaysLogs } from '../services/dailyCycleService'
import { formatCurrency } from '../utils/currency'
import { formatDate } from '../utils/dateHelpers'
import { useSettings } from '../hooks/useSettings'
import { useToast } from '../context/ToastContext'

export default function DailyCycleWidget({ onOpenUpi, onAddExpense, onAutoAddClipboard }) {
  const [metrics, setMetrics] = useState(null)
  const [pastLogs, setPastLogs] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [expandedDate, setExpandedDate] = useState(null)
  const { settings } = useSettings()
  const currency = settings?.currency || 'INR'
  const toast = useToast()

  const refreshMetrics = async () => {
    try {
      const data = await getDailyCycleMetrics()
      setMetrics(data)
      const logs = await getPreviousDaysLogs(7)
      setPastLogs(logs)
    } catch (err) {
      console.warn('Failed to load daily cycle metrics:', err)
    }
  }

  useEffect(() => {
    refreshMetrics()

    const interval = setInterval(refreshMetrics, 60000)

    const cleanupWatcher = initDailyCycleWatcher((info) => {
      toast.success(info.message)
      refreshMetrics()
    })

    const handleWindowReset = () => refreshMetrics()
    window.addEventListener('spendwise:daily-cycle-reset', handleWindowReset)

    return () => {
      clearInterval(interval)
      cleanupWatcher()
      window.removeEventListener('spendwise:daily-cycle-reset', handleWindowReset)
    }
  }, [])

  if (!metrics) return null

  const isOverBudget =
    metrics.recommendedDaily > 0 && metrics.todayExpenses > metrics.recommendedDaily

  // Past days excluding today
  const historicalDays = pastLogs.filter((log) => !log.isToday)

  return (
    <div className="rounded-2xl bg-paper-raised dark:bg-dark-surface border border-line dark:border-dark-line p-5 shadow-xs relative overflow-hidden space-y-4">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-forest via-amber to-clay" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-forest-light text-forest">
              <Clock size={12} />
              Daily Cycle · 12:01 AM Start
            </span>
            <span className="text-xs text-ink-faint font-mono-num">
              Cycle Date: {metrics.cycleDate}
            </span>
          </div>
          <h3 className="font-display font-semibold text-lg text-ink dark:text-white mt-1">
            Today's Expense Tracker
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onAutoAddClipboard || onOpenUpi}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest/10 hover:bg-forest/20 text-forest text-xs font-semibold transition-colors"
            title="Auto-detect and add copied SMS transaction"
          >
            <Zap size={14} /> ⚡ Auto-Add SMS
          </button>
          <button
            onClick={onAddExpense}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest text-white text-xs font-semibold hover:bg-forest-dark transition-colors"
          >
            <Plus size={14} /> New Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-paper dark:bg-dark-bg border border-line/60 dark:border-dark-line">
          <span className="text-[11px] font-medium text-ink-faint block uppercase">Today's Spent</span>
          <span className="font-mono-num text-xl font-bold text-clay block mt-0.5">
            {formatCurrency(metrics.todayExpenses, currency)}
          </span>
          <span className="text-[10px] text-ink-faint block">Since 12:01 AM</span>
        </div>

        <div className="p-3 rounded-xl bg-paper dark:bg-dark-bg border border-line/60 dark:border-dark-line">
          <span className="text-[11px] font-medium text-ink-faint block uppercase">Daily Target</span>
          <span className="font-mono-num text-xl font-bold text-ink dark:text-white block mt-0.5">
            {metrics.recommendedDaily > 0 ? formatCurrency(metrics.recommendedDaily, currency) : 'No limit set'}
          </span>
          <span className="text-[10px] text-ink-faint block">Recommended pace</span>
        </div>

        <div className="p-3 rounded-xl bg-paper dark:bg-dark-bg border border-line/60 dark:border-dark-line">
          <span className="text-[11px] font-medium text-ink-faint block uppercase">Remaining</span>
          <span
            className={`font-mono-num text-xl font-bold block mt-0.5 ${
              isOverBudget ? 'text-clay' : 'text-forest'
            }`}
          >
            {metrics.remainingDaily !== null
              ? formatCurrency(metrics.remainingDaily, currency)
              : '—'}
          </span>
          <span className="text-[10px] text-ink-faint block">
            {isOverBudget ? 'Exceeded target' : 'Within budget'}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-paper dark:bg-dark-bg border border-line/60 dark:border-dark-line">
          <span className="text-[11px] font-medium text-ink-faint block uppercase">Next 12:01 AM Reset</span>
          <span className="font-mono-num text-xl font-bold text-amber block mt-0.5">
            {metrics.timeUntilReset}
          </span>
          <span className="text-[10px] text-ink-faint block">Resets today's tracker</span>
        </div>
      </div>

      {/* Permanence & Retention Guarantee Banner */}
      <div className="pt-2 border-t border-line/60 dark:border-dark-line flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2 text-ink-soft dark:text-ink-faint">
          <ShieldCheck size={15} className="text-forest shrink-0" />
          <span>
            <strong>Historical logs are never deleted.</strong> Past days remain permanently preserved in your mobile database.
          </span>
        </div>

        {historicalDays.length > 0 && (
          <button
            onClick={() => setShowHistory((prev) => !prev)}
            className="flex items-center gap-1 font-semibold text-forest hover:text-forest-dark transition-colors self-start sm:self-auto"
          >
            <span>{showHistory ? 'Hide Previous Days' : `View Past Days (${historicalDays.length})`}</span>
            {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      {/* Collapsible Previous Days Logs View */}
      {showHistory && historicalDays.length > 0 && (
        <div className="mt-3 pt-3 border-t border-line dark:border-dark-line space-y-2">
          <h4 className="text-xs font-semibold text-ink dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={13} className="text-forest" />
            Previous Days Logs (Safely Preserved)
          </h4>
          <div className="space-y-1.5">
            {historicalDays.map((log) => {
              const isExpanded = expandedDate === log.date
              return (
                <div
                  key={log.date}
                  className="rounded-xl border border-line dark:border-dark-line bg-paper dark:bg-dark-bg overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedDate(isExpanded ? null : log.date)}
                    className="w-full p-2.5 flex items-center justify-between text-xs hover:bg-paper-raised dark:hover:bg-dark-surface transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-ink dark:text-white">
                        {formatDate(log.date)}
                      </span>
                      <span className="text-[11px] text-ink-faint">
                        ({log.transactionCount} transaction{log.transactionCount > 1 ? 's' : ''})
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {log.expenses > 0 && (
                        <span className="font-mono-num font-semibold text-clay">
                          -{formatCurrency(log.expenses, currency)}
                        </span>
                      )}
                      {log.income > 0 && (
                        <span className="font-mono-num font-semibold text-forest">
                          +{formatCurrency(log.income, currency)}
                        </span>
                      )}
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-3 border-t border-line dark:border-dark-line bg-paper-raised/50 dark:bg-dark-surface/50 space-y-1.5">
                      {log.transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between py-1 text-xs border-b border-line/40 dark:border-dark-line/40 last:border-0"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            {tx.type === 'income' ? (
                              <ArrowDownLeft size={13} className="text-forest shrink-0" />
                            ) : (
                              <ArrowUpRight size={13} className="text-clay shrink-0" />
                            )}
                            <span className="text-ink dark:text-white truncate font-medium">
                              {tx.title}
                            </span>
                            <span className="text-[10px] text-ink-faint">({tx.paymentMethod})</span>
                          </div>
                          <span
                            className={`font-mono-num font-semibold ml-2 shrink-0 ${
                              tx.type === 'income' ? 'text-forest' : 'text-clay'
                            }`}
                          >
                            {tx.type === 'income' ? '+' : '-'}
                            {formatCurrency(tx.amount, currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
