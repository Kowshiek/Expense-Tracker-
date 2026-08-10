import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import {
  getCategoryExpenses, getMonthlyExpenses, getMonthlyIncomeVsExpense, getDailySpending,
} from '../services/analyticsService'

export function useAnalytics(month) {
  const categoryExpenses = useLiveQuery(async () => {
    await db.transactions.toArray()
    return getCategoryExpenses(month)
  }, [month])

  const monthlyExpenses = useLiveQuery(async () => {
    await db.transactions.toArray()
    return getMonthlyExpenses(8)
  }, [])

  const incomeVsExpense = useLiveQuery(async () => {
    await db.transactions.toArray()
    return getMonthlyIncomeVsExpense(8)
  }, [])

  const dailySpending = useLiveQuery(async () => {
    await db.transactions.toArray()
    return getDailySpending(30)
  }, [])

  return {
    categoryExpenses: categoryExpenses || [],
    monthlyExpenses: monthlyExpenses || [],
    incomeVsExpense: incomeVsExpense || [],
    dailySpending: dailySpending || [],
    loading: categoryExpenses === undefined,
  }
}
