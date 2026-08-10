import { db } from '../db/database'

function nowIso() {
  return new Date().toISOString()
}

export async function addTransaction(data) {
  const record = {
    type: data.type,
    amount: Number(data.amount),
    title: data.title.trim(),
    category: data.category,
    date: data.date,
    paymentMethod: data.paymentMethod || 'Other',
    notes: data.notes ? data.notes.trim() : '',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
  const id = await db.transactions.add(record)
  return { id, ...record }
}

export async function getTransactions() {
  return db.transactions.orderBy('date').reverse().toArray()
}

export async function getTransactionById(id) {
  return db.transactions.get(Number(id))
}

export async function updateTransaction(id, data) {
  const patch = { ...data, updatedAt: nowIso() }
  if (patch.amount !== undefined) patch.amount = Number(patch.amount)
  await db.transactions.update(Number(id), patch)
  return db.transactions.get(Number(id))
}

export async function deleteTransaction(id) {
  await db.transactions.delete(Number(id))
}

export async function deleteAllTransactions() {
  await db.transactions.clear()
}

export async function bulkAddTransactions(records) {
  const withDates = records.map((r) => ({
    ...r,
    amount: Number(r.amount),
    createdAt: r.createdAt || nowIso(),
    updatedAt: r.updatedAt || nowIso(),
  }))
  await db.transactions.bulkAdd(withDates)
}

export async function countTransactions() {
  return db.transactions.count()
}
