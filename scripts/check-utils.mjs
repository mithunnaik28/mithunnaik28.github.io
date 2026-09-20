/**
 * Tiny dependency-free check for the pure helper modules.
 * Run with: npm run check
 */
import assert from 'node:assert/strict'
import { formatDate, formatMoney, formatMonthLabel, monthKeyOf, todayISO } from '../src/utils/format.js'
import {
  filterByMonth,
  groupByCategory,
  normalizeTransaction,
  round2,
  sortByDateDesc,
  summarize,
  toCsv,
} from '../src/utils/transactions.js'

const data = [
  { id: 'a', type: 'income', description: 'Salary', amount: 50000, category: 'Salary', date: '2026-09-01' },
  { id: 'b', type: 'expense', description: 'Rent', amount: 15000, category: 'Rent', date: '2026-09-02' },
  { id: 'c', type: 'expense', description: 'Groceries', amount: 2500, category: 'Food', date: '2026-09-05' },
  { id: 'd', type: 'expense', description: 'Snacks', amount: 500, category: 'Food', date: '2026-08-28' },
]

// summarize
const totals = summarize(data)
assert.equal(totals.income, 50000)
assert.equal(totals.expense, 18000)
assert.equal(totals.balance, 32000)
assert.equal(Math.round(totals.savingsRate), 64)

// summarize with no income must not divide by zero
assert.equal(summarize([data[1]]).savingsRate, 0)

// month filtering + monthKeyOf
assert.equal(monthKeyOf('2026-09-05'), '2026-09')
assert.equal(filterByMonth(data, '2026-09').length, 3)
assert.equal(filterByMonth(data, 'all').length, 4)

// grouping is sorted by total, largest first
const food = groupByCategory(data, 'expense')
assert.deepEqual(food[0], { category: 'Rent', total: 15000 })
assert.deepEqual(food.find((slice) => slice.category === 'Food'), { category: 'Food', total: 3000 })
assert.equal(groupByCategory(data, 'income')[0].total, 50000)

// sorting is newest first
assert.deepEqual(sortByDateDesc(data).map((tx) => tx.id), ['c', 'b', 'a', 'd'])

// normalization handles messy input
const normalized = normalizeTransaction({ type: 'income', description: '  Bonus  ', amount: '-1200.5', date: '2026-09-30T10:00:00Z' })
assert.equal(normalized.type, 'income')
assert.equal(normalized.description, 'Bonus')
assert.equal(normalized.amount, 1200.5)
assert.equal(normalized.date, '2026-09-30')
assert.equal(normalized.category, 'Other')
assert.ok(normalized.id.startsWith('tx_'))
assert.equal(normalizeTransaction({ amount: 10 }).type, 'expense')
assert.equal(round2(0.1 + 0.2), 0.3)

// csv escaping
const csv = toCsv([{ id: 'x', type: 'expense', description: 'Cafe "Corner"', amount: 120.5, category: 'Food', date: '2026-09-06' }])
assert.equal(csv.split('\r\n')[0], '"Date","Description","Category","Type","Amount"')
assert.equal(csv.split('\r\n')[1], '"2026-09-06","Cafe ""Corner""","Food","expense","120.50"')

// formatting
assert.match(todayISO(), /^\d{4}-\d{2}-\d{2}$/)
assert.equal(formatMonthLabel('2026-09'), 'September 2026')
assert.equal(formatMonthLabel('nonsense'), 'nonsense')
assert.match(formatDate('2026-09-20'), /^20 Sep(t)? 2026$/)
assert.equal(formatDate('nonsense'), 'nonsense')
assert.match(formatMoney(1234.5), /1,234\.50/)
assert.equal(formatMoney('abc'), formatMoney(0))

console.log('All utility checks passed ✓')
