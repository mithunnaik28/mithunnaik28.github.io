import { CURRENCY, LOCALE } from '../constants.js'

const moneyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  maximumFractionDigits: 2,
})

const compactMoneyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
  notation: 'compact',
  maximumFractionDigits: 1,
})

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const monthFormatter = new Intl.DateTimeFormat(LOCALE, {
  month: 'long',
  year: 'numeric',
})

/** "₹1,250.00" */
export function formatMoney(value) {
  return moneyFormatter.format(toNumber(value))
}

/** Short form for chart labels, e.g. "₹12.5K" */
export function formatCompactMoney(value) {
  return compactMoneyFormatter.format(toNumber(value))
}

/** "20 Sep 2026" */
export function formatDate(isoDate) {
  const date = toDate(isoDate)
  return date ? dateFormatter.format(date) : String(isoDate ?? '')
}

/** "September 2026" (from a "YYYY-MM" key) */
export function formatMonthLabel(monthKey) {
  const match = /^(\d{4})-(\d{2})$/.exec(String(monthKey ?? ''))
  if (!match) return String(monthKey ?? '')
  return monthFormatter.format(new Date(Number(match[1]), Number(match[2]) - 1, 1))
}

export function formatPercent(value) {
  const number = toNumber(value)
  return `${Math.round(number)}%`
}

/** Today's date as "YYYY-MM-DD" in local time (not UTC). */
export function todayISO() {
  const now = new Date()
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60 * 1000)
  return local.toISOString().slice(0, 10)
}

/** "2026-09-20" -> "2026-09" */
export function monthKeyOf(isoDate) {
  return String(isoDate ?? '').slice(0, 7)
}

export function currentMonthKey() {
  return monthKeyOf(todayISO())
}

export function toNumber(value) {
  const number = typeof value === 'number' ? value : Number.parseFloat(value)
  return Number.isFinite(number) ? number : 0
}

function toDate(value) {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value

  const text = String(value)
  // Only parse strict "YYYY-MM-DD" strings as local dates so that odd input
  // can never be turned into a wrong date by the engine's lenient parser.
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
  if (!iso) return null

  const date = new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
  return Number.isNaN(date.getTime()) ? null : date
}
