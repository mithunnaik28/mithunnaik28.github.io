import { monthKeyOf, toNumber } from './format.js'

/** Pure helpers for working with the transaction list. */

export function makeId() {
  return `tx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

export function round2(value) {
  return Math.round(toNumber(value) * 100) / 100
}

/** Normalises anything coming from the form / localStorage into a clean record. */
export function normalizeTransaction(input) {
  return {
    id: input.id || makeId(),
    type: input.type === 'income' ? 'income' : 'expense',
    description: String(input.description ?? '').trim() || 'Untitled',
    amount: Math.abs(round2(input.amount)),
    category: input.category || 'Other',
    date: String(input.date ?? '').slice(0, 10),
  }
}

export function sortByDateDesc(list) {
  return [...list].sort((a, b) => {
    if (a.date === b.date) return a.description.localeCompare(b.description)
    return a.date < b.date ? 1 : -1
  })
}

export function monthKeysOf(list) {
  return [...new Set(list.map((tx) => monthKeyOf(tx.date)))].filter(Boolean)
}

export function filterByMonth(list, monthKey) {
  if (!monthKey || monthKey === 'all') return list
  return list.filter((tx) => monthKeyOf(tx.date) === monthKey)
}

/** Totals + savings rate for the given list. */
export function summarize(list) {
  let income = 0
  let expense = 0

  for (const tx of list) {
    if (tx.type === 'income') income += tx.amount
    else expense += tx.amount
  }

  const balance = income - expense
  const savingsRate = income > 0 ? (balance / income) * 100 : 0

  return { income: round2(income), expense: round2(expense), balance: round2(balance), savingsRate }
}

/** [{ category, total }] sorted from largest to smallest. */
export function groupByCategory(list, type) {
  const totals = new Map()

  for (const tx of list) {
    if (tx.type !== type) continue
    totals.set(tx.category, (totals.get(tx.category) ?? 0) + tx.amount)
  }

  return [...totals.entries()]
    .map(([category, total]) => ({ category, total: round2(total) }))
    .sort((a, b) => b.total - a.total)
}

/** Turns a transaction list into a CSV document. */
export function toCsv(list) {
  const header = ['Date', 'Description', 'Category', 'Type', 'Amount']
  const lines = list.map((tx) => [tx.date, tx.description, tx.category, tx.type, tx.amount.toFixed(2)])

  return [header, ...lines]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n')
}
