import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'

// Automatically re-renders whenever the transactions table changes,
// because it is backed by Dexie's live query engine.
export function useTransactions() {
  const transactions = useLiveQuery(() => db.transactions.orderBy('date').reverse().toArray(), [])
  return { transactions: transactions || [], loading: transactions === undefined }
}
