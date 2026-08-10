import { db } from '../db/database'

const DEFAULT_SETTINGS = {
  id: 1,
  currency: 'INR',
  theme: 'system',
  monthlyBudget: 0,
  firstDayOfWeek: 'monday',
  onboarded: false,
  lastBackupAt: null,
}

export async function getSettings() {
  const existing = await db.settings.get(1)
  if (existing) return existing
  await db.settings.put(DEFAULT_SETTINGS)
  return DEFAULT_SETTINGS
}

export async function updateSettings(patch) {
  const current = await getSettings()
  const next = { ...current, ...patch, id: 1 }
  await db.settings.put(next)
  return next
}

export async function clearAllData() {
  await Promise.all([
    db.transactions.clear(),
    db.budgets.clear(),
  ])
  await updateSettings({ lastBackupAt: null })
}
