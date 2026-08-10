import { db } from '../db/database'

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export function buildDemoTransactions() {
  const now = new Date().toISOString()
  const rows = [
    { type: 'income', title: 'Monthly Salary', category: 'Salary', amount: 45000, date: daysAgo(28), paymentMethod: 'Bank Transfer', notes: '' },
    { type: 'income', title: 'Freelance Project', category: 'Freelance', amount: 8000, date: daysAgo(20), paymentMethod: 'UPI', notes: 'Logo design' },
    { type: 'expense', title: 'Grocery Run', category: 'Groceries', amount: 2500, date: daysAgo(26), paymentMethod: 'Debit Card', notes: '' },
    { type: 'expense', title: 'Electricity Bill', category: 'Bills', amount: 1200, date: daysAgo(25), paymentMethod: 'UPI', notes: '' },
    { type: 'expense', title: 'Lunch with friends', category: 'Food', amount: 650, date: daysAgo(24), paymentMethod: 'UPI', notes: '' },
    { type: 'expense', title: 'Metro card top-up', category: 'Transport', amount: 300, date: daysAgo(23), paymentMethod: 'Cash', notes: '' },
    { type: 'expense', title: 'New headphones', category: 'Shopping', amount: 1500, date: daysAgo(22), paymentMethod: 'Credit Card', notes: '' },
    { type: 'expense', title: 'Movie night', category: 'Entertainment', amount: 350, date: daysAgo(20), paymentMethod: 'UPI', notes: '' },
    { type: 'expense', title: 'Online course', category: 'Education', amount: 999, date: daysAgo(19), paymentMethod: 'Credit Card', notes: '' },
    { type: 'expense', title: 'Pharmacy', category: 'Health', amount: 420, date: daysAgo(18), paymentMethod: 'Cash', notes: '' },
    { type: 'expense', title: 'Cab to airport', category: 'Travel', amount: 780, date: daysAgo(17), paymentMethod: 'UPI', notes: '' },
    { type: 'expense', title: 'House rent', category: 'Rent', amount: 12000, date: daysAgo(15), paymentMethod: 'Bank Transfer', notes: '' },
    { type: 'expense', title: 'Coffee', category: 'Food', amount: 180, date: daysAgo(14), paymentMethod: 'Cash', notes: '' },
    { type: 'expense', title: 'Bus pass', category: 'Transport', amount: 250, date: daysAgo(13), paymentMethod: 'Cash', notes: '' },
    { type: 'expense', title: 'Shoes', category: 'Shopping', amount: 2200, date: daysAgo(12), paymentMethod: 'Credit Card', notes: '' },
    { type: 'expense', title: 'Internet bill', category: 'Bills', amount: 999, date: daysAgo(10), paymentMethod: 'UPI', notes: '' },
    { type: 'expense', title: 'Streaming subscription', category: 'Entertainment', amount: 199, date: daysAgo(9), paymentMethod: 'Credit Card', notes: '' },
    { type: 'expense', title: 'Vegetables', category: 'Groceries', amount: 450, date: daysAgo(6), paymentMethod: 'Cash', notes: '' },
    { type: 'expense', title: 'Dinner out', category: 'Food', amount: 850, date: daysAgo(4), paymentMethod: 'UPI', notes: '' },
    { type: 'expense', title: 'Phone accessories', category: 'Other', amount: 350, date: daysAgo(2), paymentMethod: 'Cash', notes: '' },
  ]
  return rows.map((r) => ({ ...r, isDemo: true, createdAt: now, updatedAt: now }))
}

export async function loadDemoData() {
  const rows = buildDemoTransactions()
  await db.transactions.bulkAdd(rows)
  return rows.length
}

export async function removeDemoData() {
  const demoRows = await db.transactions.filter((t) => t.isDemo === true).toArray()
  await db.transactions.bulkDelete(demoRows.map((r) => r.id))
  return demoRows.length
}

export async function hasDemoData() {
  const count = await db.transactions.filter((t) => t.isDemo === true).count()
  return count > 0
}
