import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { getDashboardStats } from '../services/analyticsService'

export function useDashboard() {
  // Recompute whenever the underlying transactions table changes.
  const stats = useLiveQuery(async () => {
    await db.transactions.toArray() // subscribe to changes
    return getDashboardStats()
  }, [])
  return { stats, loading: stats === undefined }
}
