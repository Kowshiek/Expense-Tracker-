import { db } from '../db/database'

function nowIso() {
  return new Date().toISOString()
}

// month is stored as 'YYYY-MM'
export async function addBudget(data) {
  const record = {
    month: data.month,
    category: data.category,
    amount: Number(data.amount),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
  const id = await db.budgets.add(record)
  return { id, ...record }
}

export async function getBudgets(month) {
  if (month) {
    return db.budgets.where('month').equals(month).toArray()
  }
  return db.budgets.toArray()
}

export async function updateBudget(id, data) {
  const patch = { ...data, updatedAt: nowIso() }
  if (patch.amount !== undefined) patch.amount = Number(patch.amount)
  await db.budgets.update(Number(id), patch)
  return db.budgets.get(Number(id))
}

export async function deleteBudget(id) {
  await db.budgets.delete(Number(id))
}

export async function deleteAllBudgets() {
  await db.budgets.clear()
}
