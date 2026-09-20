/**
 * Renders the real React component tree to HTML with Vite's SSR build so that
 * component-level bugs (bad props, broken hooks, crashes) are caught without a browser.
 * Run with: npm run check
 */
import assert from 'node:assert/strict'
import { rm } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { build } from 'vite'
import { STORAGE_KEYS } from '../src/constants.js'

// Minimal browser shims - the components touch localStorage / timers / confirm.
const store = new Map()
globalThis.window = {
  localStorage: {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  },
  setTimeout,
  clearTimeout,
  confirm: () => true,
  scrollTo: () => {},
  matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }),
}

const outDir = 'dist-ssr'

await build({
  logLevel: 'warn',
  build: {
    ssr: 'src/App.jsx',
    outDir,
    emptyOutDir: true,
    minify: false,
    reportCompressedSize: false,
  },
})

const bundle = path.resolve(outDir, 'App.js')
const { default: App } = await import(pathToFileURL(bundle).href)

const render = () => renderToStaticMarkup(createElement(App))

// --- Pass 1: nothing stored yet, so the app must fall back to its empty states ---
const empty = render()
assert.ok(empty.includes('Money Manager'), 'header renders')
assert.ok(empty.includes('Breakdown by category'), 'chart card renders')
assert.ok(empty.includes('Monthly budget'), 'budget card renders')
assert.ok(empty.includes('Savings rate'), 'summary cards render')
assert.ok(empty.includes('Showing'), 'toolbar renders')
assert.ok(empty.includes('No transactions yet'), 'empty transaction state renders')
assert.ok(empty.includes('Nothing to chart yet'), 'empty chart state renders')
assert.ok(empty.includes('Set a budget to see'), 'empty budget state renders')
assert.equal(empty.includes('tx-row'), false, 'no transaction rows before any data exists')
assert.equal(empty.includes('Load demo data'), false, 'the demo action is gone')

// --- Pass 2: values already in storage are read back on mount ---
const now = new Date()
const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

store.set(
  STORAGE_KEYS.transactions,
  JSON.stringify([
    { id: 'tx_1', type: 'income', description: 'Paycheck', amount: 50000, category: 'Salary', date: `${month}-01` },
    { id: 'tx_2', type: 'expense', description: 'Rent payment', amount: 15000, category: 'Rent', date: `${month}-02` },
    { id: 'tx_3', type: 'expense', description: 'Groceries', amount: 2500, category: 'Food', date: `${month}-03` },
  ]),
)
store.set(STORAGE_KEYS.budgets, JSON.stringify({ [month]: 30000 }))
store.set(STORAGE_KEYS.month, JSON.stringify(month))

const filled = render()
assert.equal((filled.match(/<li class="tx-row/g) ?? []).length, 3, 'every stored transaction renders')
assert.ok(filled.includes('Paycheck') && filled.includes('Groceries'), 'descriptions render')
assert.ok(filled.includes('50,000') && filled.includes('15,000'), 'amounts are formatted')
assert.ok(filled.includes('+'), 'income rows render a + sign')
assert.ok(/[\u20B9]|Rs/.test(filled), 'currency symbol is formatted')
assert.ok(filled.includes('Left'), 'budget shows the amount left')
assert.equal(filled.includes('No transactions yet'), false, 'empty state disappears once data exists')

await rm(outDir, { recursive: true, force: true })
console.log('App renders correctly (empty + with data) ✓')
