/**
 * Date and time helper utilities
 * Timezone-aware for local dates and 12:01 AM daily expense tracking cycle.
 */

export function toLocalDateStr(d = new Date()) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayStr() {
  return toLocalDateStr(new Date())
}

/**
 * Returns the effective cycle date starting at 12:01 AM.
 * If the current time is between 00:00:00 and 00:00:59, the cycle belongs to yesterday.
 * Starting precisely at 12:01:00 AM (00:01), a new day's cycle begins!
 */
export function getCycleDate(d = new Date()) {
  const hours = d.getHours()
  const minutes = d.getMinutes()
  if (hours === 0 && minutes < 1) {
    const yesterday = new Date(d)
    yesterday.setDate(yesterday.getDate() - 1)
    return toLocalDateStr(yesterday)
  }
  return toLocalDateStr(d)
}

/**
 * Returns next 12:01 AM Date object.
 */
export function getNextCycleResetTime(from = new Date()) {
  const target = new Date(from)
  target.setHours(0, 1, 0, 0)
  // If we already passed 12:01 AM today, the next reset is tomorrow at 12:01 AM
  if (from.getTime() >= target.getTime()) {
    target.setDate(target.getDate() + 1)
  }
  return target
}

export function getTimeUntilNextReset(from = new Date()) {
  const next = getNextCycleResetTime(from)
  const diffMs = Math.max(0, next.getTime() - from.getTime())
  const diffSec = Math.floor(diffMs / 1000)
  const hours = Math.floor(diffSec / 3600)
  const minutes = Math.floor((diffSec % 3600) / 60)
  return `${hours}h ${minutes}m`
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const dateObj = new Date(y, m - 1, d)
  return dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatDateTime(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return d.toLocaleString('en-US', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function monthLabel(ym) {
  if (!ym) return ''
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1, 1)
  return d.toLocaleString('default', { month: 'long', year: 'numeric' })
}

export function currentMonthKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function lastNMonthKeys(n) {
  const now = new Date()
  const out = []
  for (let i = 0; i < n; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return out
}
