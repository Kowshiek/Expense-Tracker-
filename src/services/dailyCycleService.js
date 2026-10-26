import { db } from '../db/database'
import { getCycleDate, getNextCycleResetTime, getTimeUntilNextReset } from '../utils/dateHelpers'

const STORAGE_KEY_LAST_CYCLE = 'spendwise_last_cycle_date'
const STORAGE_KEY_DAILY_CONFIG = 'spendwise_daily_cycle_config'

export function getDailyCycleConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DAILY_CONFIG)
    if (raw) return JSON.parse(raw)
  } catch {
    // fallback
  }
  return {
    enabled: true,
    resetTime: '00:01', // 12:01 AM
    notifyOnReset: true,
    dailySpendingTarget: 0, // 0 = auto-calculate from monthly budget
    autoRecurringEnabled: false,
  }
}

export function saveDailyCycleConfig(config) {
  localStorage.setItem(STORAGE_KEY_DAILY_CONFIG, JSON.stringify(config))
}

export async function getDailyCycleMetrics() {
  const currentCycleDate = getCycleDate(new Date())
  const transactions = await db.transactions
    .where('date')
    .equals(currentCycleDate)
    .toArray()

  const todayExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

  const todayIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)

  // Get monthly settings for daily budget calculation
  const settingsList = await db.settings.toArray()
  const settings = settingsList[0] || {}
  const monthlyBudget = settings.monthlyBudget || 0

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate()
  const recommendedDaily = monthlyBudget > 0 ? Math.round(monthlyBudget / daysInMonth) : 0

  const timeUntilReset = getTimeUntilNextReset()
  const nextReset = getNextCycleResetTime()

  return {
    cycleDate: currentCycleDate,
    cycleStartTime: '12:01 AM',
    nextResetTime: nextReset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timeUntilReset,
    todayExpenses,
    todayIncome,
    transactionCount: transactions.length,
    transactions,
    recommendedDaily,
    remainingDaily: recommendedDaily > 0 ? recommendedDaily - todayExpenses : null,
  }
}

/**
 * SpendWise Data Persistence Guarantee:
 * Previous days' transaction logs are NEVER deleted or cleared when a new daily cycle starts at 12:01 AM.
 * All historical records remain permanently stored in IndexedDB and viewable in History.
 */
export async function getPreviousDaysLogs(limit = 7) {
  const currentCycleDate = getCycleDate(new Date())
  const all = await db.transactions.orderBy('date').reverse().toArray()

  // Group by date (excluding or separating current cycle date)
  const map = new Map()
  for (const t of all) {
    if (!map.has(t.date)) {
      map.set(t.date, {
        date: t.date,
        isToday: t.date === currentCycleDate,
        expenses: 0,
        income: 0,
        transactionCount: 0,
        transactions: [],
      })
    }
    const day = map.get(t.date)
    day.transactionCount += 1
    if (t.type === 'expense') day.expenses += Number(t.amount) || 0
    else day.income += Number(t.amount) || 0
    day.transactions.push(t)
  }

  return Array.from(map.values()).slice(0, limit)
}

/**
 * Initializes the background 12:01 AM cycle watcher.
 * Triggers a callback or dispatches a window event when 12:01 AM is reached.
 */
export function initDailyCycleWatcher(onResetCallback) {
  // Check if we entered a new cycle since last visit
  const lastCycle = localStorage.getItem(STORAGE_KEY_LAST_CYCLE)
  const currentCycle = getCycleDate(new Date())

  if (lastCycle && lastCycle !== currentCycle) {
    if (onResetCallback) {
      onResetCallback({
        previousCycle: lastCycle,
        newCycle: currentCycle,
        message: 'New daily cycle started at 12:01 AM! Ready to track today’s expenses.',
      })
    }
  }
  localStorage.setItem(STORAGE_KEY_LAST_CYCLE, currentCycle)

  // Schedule timer for next 12:01 AM
  const nextTarget = getNextCycleResetTime()
  const msUntilReset = Math.max(1000, nextTarget.getTime() - Date.now())

  const timeoutId = setTimeout(() => {
    const freshCycle = getCycleDate(new Date())
    localStorage.setItem(STORAGE_KEY_LAST_CYCLE, freshCycle)

    window.dispatchEvent(
      new CustomEvent('spendwise:daily-cycle-reset', {
        detail: {
          cycleDate: freshCycle,
          timestamp: new Date().toISOString(),
        },
      })
    )

    if (onResetCallback) {
      onResetCallback({
        newCycle: freshCycle,
        message: 'Midnight has passed! New 12:01 AM expense cycle started.',
      })
    }

    // Reschedule for next day
    initDailyCycleWatcher(onResetCallback)
  }, msUntilReset)

  return () => clearTimeout(timeoutId)
}
