import { db } from '../db/database'

export async function buildBackupObject() {
  const [transactions, budgets, settings] = await Promise.all([
    db.transactions.toArray(),
    db.budgets.toArray(),
    db.settings.toArray(),
  ])
  return {
    app: 'SpendWise',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: { transactions, budgets, settings },
  }
}

function download(filename, content, mime) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function exportJSON() {
  const backup = await buildBackupObject()
  download('expenses-backup.json', JSON.stringify(backup, null, 2), 'application/json')
  return backup
}

function csvEscape(value) {
  const str = String(value ?? '')
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
  return str
}

export async function exportCSV() {
  const transactions = await db.transactions.orderBy('date').toArray()
  const headers = ['date', 'type', 'title', 'category', 'amount', 'paymentMethod', 'notes']
  const rows = transactions.map((t) => headers.map((h) => csvEscape(t[h])).join(','))
  const csv = [headers.join(','), ...rows].join('\n')
  download('expenses.csv', csv, 'text/csv')
  return transactions.length
}

export function validateBackupShape(obj) {
  if (!obj || typeof obj !== 'object') return 'File is not valid JSON.'
  if (!obj.data || typeof obj.data !== 'object') return 'Backup is missing a "data" section.'
  const { transactions, budgets } = obj.data
  if (transactions && !Array.isArray(transactions)) return '"transactions" must be a list.'
  if (budgets && !Array.isArray(budgets)) return '"budgets" must be a list.'
  if (Array.isArray(transactions)) {
    for (const t of transactions) {
      if (typeof t.amount !== 'number' || Number.isNaN(t.amount)) return 'One or more transactions has an invalid amount.'
      if (!t.date || !t.type) return 'One or more transactions is missing a date or type.'
    }
  }
  return null
}

export async function importBackupFile(file) {
  const MAX_SIZE = 20 * 1024 * 1024 // 20MB
  if (file.size > MAX_SIZE) {
    throw new Error('File is too large to import (max 20MB).')
  }
  const text = await file.text()
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('That file is not valid JSON.')
  }
  const error = validateBackupShape(parsed)
  if (error) throw new Error(error)

  const { transactions = [], budgets = [], settings = [] } = parsed.data

  await db.transaction('rw', db.transactions, db.budgets, db.settings, async () => {
    if (transactions.length) {
      await db.transactions.bulkPut(
        transactions.map(({ id, ...rest }) => rest)
      )
    }
    if (budgets.length) {
      await db.budgets.bulkPut(budgets.map(({ id, ...rest }) => rest))
    }
    if (settings.length) {
      const s = settings[0]
      if (s) await db.settings.put({ ...s, id: 1 })
    }
  })

  return { transactionCount: transactions.length, budgetCount: budgets.length }
}
