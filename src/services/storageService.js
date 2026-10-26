import { db } from '../db/database'

/**
 * Mobile Storage Management Service
 * Ensures SpendWise leverages persistent device storage via IndexedDB.
 */

export async function requestPersistentMobileStorage() {
  if (typeof window === 'undefined' || !navigator.storage || !navigator.storage.persist) {
    return { supported: false, persisted: false }
  }

  try {
    const isAlreadyPersisted = await navigator.storage.persisted()
    if (isAlreadyPersisted) {
      return { supported: true, persisted: true, message: 'Mobile storage is already persistent.' }
    }

    const granted = await navigator.storage.persist()
    return {
      supported: true,
      persisted: granted,
      message: granted
        ? 'Persistent mobile storage granted! Chrome will not clear your data.'
        : 'Browser opted for default storage quota.',
    }
  } catch (err) {
    console.error('Failed to request persistent storage:', err)
    return { supported: false, persisted: false, error: err.message }
  }
}

export async function checkStorageStatus() {
  const result = {
    supported: !!(navigator.storage && navigator.storage.estimate),
    persisted: false,
    usageMB: 0,
    quotaMB: 0,
    percentUsed: 0,
    transactionCount: 0,
    budgetCount: 0,
    isMobile: /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || ''),
  }

  try {
    if (navigator.storage?.persisted) {
      result.persisted = await navigator.storage.persisted()
    }
    if (navigator.storage?.estimate) {
      const estimate = await navigator.storage.estimate()
      const usage = estimate.usage || 0
      const quota = estimate.quota || 1
      result.usageMB = parseFloat((usage / (1024 * 1024)).toFixed(2))
      result.quotaMB = parseFloat((quota / (1024 * 1024)).toFixed(0))
      result.percentUsed = parseFloat(((usage / quota) * 100).toFixed(2))
    }
    result.transactionCount = await db.transactions.count()
    result.budgetCount = await db.budgets.count()
  } catch (err) {
    console.warn('Error reading storage estimate:', err)
  }

  return result
}
