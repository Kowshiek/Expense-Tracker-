import Dexie from 'dexie'

// Each browser/device that opens SpendWise gets its own private IndexedDB
// database. There is no server component involved in reading or writing
// this data, so a user's transactions never leave their device.
export const db = new Dexie('SpendWiseDB')

db.version(1).stores({
  // '++id' = auto-incrementing primary key
  transactions: '++id, type, category, date, paymentMethod, createdAt',
  budgets: '++id, month, category, [month+category]',
  settings: '++id',
})

export default db
