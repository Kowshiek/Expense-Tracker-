import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { currentMonthKey } from '../utils/dateHelpers'

export function useBudgets(month = currentMonthKey()) {
  const budgets = useLiveQuery(() => db.budgets.where('month').equals(month).toArray(), [month])

  const spentByCategory = useLiveQuery(async () => {
    const txns = await db.transactions.where('type').equals('expense').toArray()
    const map = {}
    for (const t of txns) {
      if (t.date.slice(0, 7) === month) {
        map[t.category] = (map[t.category] || 0) + t.amount
      }
    }
    return map
  }, [month])

  return {
    budgets: budgets || [],
    spentByCategory: spentByCategory || {},
    loading: budgets === undefined,
  }
}
