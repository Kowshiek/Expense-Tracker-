import { CURRENCIES } from './constants'

const LOCALE_BY_CURRENCY = {
  INR: 'en-IN',
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  JPY: 'ja-JP',
}

export function getCurrencySymbol(code) {
  return CURRENCIES.find((c) => c.code === code)?.symbol || '₹'
}

export function formatCurrency(amount, currencyCode = 'INR') {
  const locale = LOCALE_BY_CURRENCY[currencyCode] || 'en-IN'
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: currencyCode === 'JPY' ? 0 : 2,
      minimumFractionDigits: currencyCode === 'JPY' ? 0 : 2,
    }).format(amount || 0)
  } catch {
    return `${getCurrencySymbol(currencyCode)}${Number(amount || 0).toFixed(2)}`
  }
}

export function formatCompactNumber(amount) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(amount || 0)
}
