import { db } from '../db/database'
import { getCycleDate } from '../utils/dateHelpers'

function ymKey(dateStr) {
  return dateStr.slice(0, 7) // 'YYYY-MM'
}

function isSameMonth(dateStr, ym) {
  return ymKey(dateStr) === ym
}

function currentMonthKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function shiftMonth(ym, delta) {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return currentMonthKey(d)
}

export async function getDashboardStats() {
  const all = await db.transactions.toArray()
  const todayStr = getCycleDate(new Date())
  const thisMonth = currentMonthKey()
  const lastMonth = shiftMonth(thisMonth, -1)

  let income = 0
  let expenses = 0
  let thisMonthExpenses = 0
  let lastMonthExpenses = 0
  let thisMonthIncome = 0
  let lastMonthIncome = 0
  let todayExpenses = 0

  for (const t of all) {
    if (t.type === 'income') {
      income += t.amount
      if (isSameMonth(t.date, thisMonth)) thisMonthIncome += t.amount
      if (isSameMonth(t.date, lastMonth)) lastMonthIncome += t.amount
    } else {
      expenses += t.amount
      if (isSameMonth(t.date, thisMonth)) thisMonthExpenses += t.amount
      if (isSameMonth(t.date, lastMonth)) lastMonthExpenses += t.amount
      if (t.date === todayStr) todayExpenses += t.amount
    }
  }

  const pctChange = (curr, prev) => {
    if (prev === 0) return curr === 0 ? 0 : 100
    return ((curr - prev) / prev) * 100
  }

  return {
    totalBalance: income - expenses,
    totalIncome: income,
    totalExpenses: expenses,
    thisMonthExpenses,
    todayExpenses,
    savings: income - expenses,
    transactionCount: all.length,
    monthOverMonthExpenseChange: pctChange(thisMonthExpenses, lastMonthExpenses),
    monthOverMonthIncomeChange: pctChange(thisMonthIncome, lastMonthIncome),
  }
}

export async function getCategoryExpenses(month) {
  const all = await db.transactions.where('type').equals('expense').toArray()
  const filtered = month ? all.filter((t) => isSameMonth(t.date, month)) : all
  const map = {}
  for (const t of filtered) {
    map[t.category] = (map[t.category] || 0) + t.amount
  }
  return Object.entries(map)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
}

export async function getMonthlyExpenses(monthsBack = 8) {
  const all = await db.transactions.where('type').equals('expense').toArray()
  const now = new Date()
  const buckets = []
  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = currentMonthKey(d)
    const label = d.toLocaleString('default', { month: 'short' })
    buckets.push({ key, label, amount: 0 })
  }
  const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]))
  for (const t of all) {
    const key = ymKey(t.date)
    if (byKey[key]) byKey[key].amount += t.amount
  }
  return buckets
}

export async function getMonthlyIncomeVsExpense(monthsBack = 8) {
  const all = await db.transactions.toArray()
  const now = new Date()
  const buckets = []
  for (let i = monthsBack - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = currentMonthKey(d)
    const label = d.toLocaleString('default', { month: 'short' })
    buckets.push({ key, label, income: 0, expense: 0 })
  }
  const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]))
  for (const t of all) {
    const key = ymKey(t.date)
    if (!byKey[key]) continue
    if (t.type === 'income') byKey[key].income += t.amount
    else byKey[key].expense += t.amount
  }
  return buckets
}

export async function getDailySpending(daysBack = 30) {
  const all = await db.transactions.where('type').equals('expense').toArray()
  const now = new Date()
  const buckets = []
  for (let i = daysBack - 1; i >= 0; i -= 1) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const label = d.toLocaleString('default', { day: 'numeric', month: 'short' })
    buckets.push({ key, label, amount: 0 })
  }
  const byKey = Object.fromEntries(buckets.map((b) => [b.key, b]))
  for (const t of all) {
    if (byKey[t.date]) byKey[t.date].amount += t.amount
  }
  return buckets
}

export async function getMonthlySummary(month) {
  const all = await db.transactions.toArray()
  const filtered = all.filter((t) => isSameMonth(t.date, month))
  const expenses = filtered.filter((t) => t.type === 'expense')
  const income = filtered.filter((t) => t.type === 'income')

  const totalIncome = income.reduce((s, t) => s + t.amount, 0)
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0)

  const catTotals = {}
  for (const t of expenses) catTotals[t.category] = (catTotals[t.category] || 0) + t.amount
  const highestCategory = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0]

  const highestTransaction = expenses.reduce(
    (max, t) => (!max || t.amount > max.amount ? t : max),
    null
  )

  const daysWithData = new Set(expenses.map((t) => t.date)).size
  const avgDaily = daysWithData > 0 ? totalExpenses / daysWithData : 0

  return {
    month,
    totalIncome,
    totalExpenses,
    totalSavings: totalIncome - totalExpenses,
    highestCategory: highestCategory ? { category: highestCategory[0], amount: highestCategory[1] } : null,
    highestTransaction,
    averageDailySpending: avgDaily,
    transactionCount: filtered.length,
  }
}

export function getCurrentMonthKey() {
  return currentMonthKey()
}
