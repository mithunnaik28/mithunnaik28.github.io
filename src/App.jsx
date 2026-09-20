import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Header from './components/Header.jsx'
import Toolbar from './components/Toolbar.jsx'
import SummaryCards from './components/SummaryCards.jsx'
import TransactionForm from './components/TransactionForm.jsx'
import TransactionList from './components/TransactionList.jsx'
import CategoryChart from './components/CategoryChart.jsx'
import BudgetPanel from './components/BudgetPanel.jsx'
import { useLocalStorage } from './hooks/useLocalStorage.js'
import { STORAGE_KEYS } from './constants.js'
import { currentMonthKey, formatMonthLabel, monthKeyOf } from './utils/format.js'
import { filterByMonth, makeId, normalizeTransaction, round2, summarize, toCsv } from './utils/transactions.js'

export default function App() {
  const [transactions, setTransactions] = useLocalStorage(STORAGE_KEYS.transactions, [])
  const [budgets, setBudgets] = useLocalStorage(STORAGE_KEYS.budgets, {})
  const [month, setMonth] = useLocalStorage(STORAGE_KEYS.month, currentMonthKey)
  const [editingId, setEditingId] = useState(null)
  const [status, setStatus] = useState('')

  const statusTimer = useRef(null)

  const flash = useCallback((message) => {
    setStatus(message)
    window.clearTimeout(statusTimer.current)
    statusTimer.current = window.setTimeout(() => setStatus(''), 2600)
  }, [])

  useEffect(() => () => window.clearTimeout(statusTimer.current), [])

  /** All months that have data, plus the current month so it is always selectable. */
  const months = useMemo(() => {
    const keys = new Set(transactions.map((tx) => monthKeyOf(tx.date)).filter(Boolean))
    keys.add(currentMonthKey())
    return [...keys].sort().reverse()
  }, [transactions])

  const visible = useMemo(() => filterByMonth(transactions, month), [transactions, month])
  const totals = useMemo(() => summarize(visible), [visible])
  const editing = useMemo(
    () => (editingId ? (transactions.find((tx) => tx.id === editingId) ?? null) : null),
    [editingId, transactions],
  )
  const budget = month === 'all' ? 0 : round2(budgets[month] ?? 0)

  function handleSubmit(draft) {
    const record = normalizeTransaction(draft)

    if (editing) {
      setTransactions((prev) => prev.map((tx) => (tx.id === editing.id ? { ...record, id: editing.id } : tx)))
      setEditingId(null)
      flash(`Updated "${record.description}".`)
      return
    }

    setTransactions((prev) => [...prev, { ...record, id: makeId() }])
    flash(`Added ${record.type} of ${record.amount.toFixed(2)} for "${record.description}".`)
  }

  function handleDelete(transaction) {
    const confirmed = window.confirm(`Delete "${transaction.description}"?`)
    if (!confirmed) return

    setTransactions((prev) => prev.filter((tx) => tx.id !== transaction.id))
    if (editingId === transaction.id) setEditingId(null)
    flash(`Deleted "${transaction.description}".`)
  }

  function handleBudgetChange(rawValue) {
    const value = round2(Number.parseFloat(rawValue) || 0)

    setBudgets((prev) => {
      const next = { ...prev }
      if (value > 0) next[month] = value
      else delete next[month]
      return next
    })
  }

  function handleExport() {
    const csv = toCsv(visible)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `transactions-${month}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    flash(`Exported ${visible.length} transactions to CSV.`)
  }

  function handleClearAll() {
    const confirmed = window.confirm('Remove every transaction and budget? This cannot be undone.')
    if (!confirmed) return

    setTransactions([])
    setBudgets({})
    setEditingId(null)
    flash('All data cleared.')
  }

  return (
    <div className="app">
      <Header
        hasData={transactions.length > 0}
        onExport={handleExport}
        onClearAll={handleClearAll}
      />

      <main className="container">
        <Toolbar
          month={month}
          months={months}
          onMonthChange={setMonth}
          shownCount={visible.length}
          totalCount={transactions.length}
        />

        <SummaryCards totals={totals} budget={budget} />

        <div className="layout">
          <div className="layout__side">
            <TransactionForm
              editing={editing}
              onSubmit={handleSubmit}
              onCancelEdit={() => {
                setEditingId(null)
                flash('Edit cancelled.')
              }}
            />
            <BudgetPanel
              monthKey={month}
              monthLabel={month === 'all' ? 'All time' : formatMonthLabel(month)}
              budget={budget}
              spent={totals.expense}
              onBudgetChange={handleBudgetChange}
            />
          </div>

          <div className="layout__main">
            <CategoryChart transactions={visible} />
            <TransactionList
              transactions={visible}
              editingId={editingId}
              onEdit={(id) => {
                setEditingId(id)
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              onDelete={handleDelete}
            />
          </div>
        </div>

        <p className="status" role="status" aria-live="polite">
          {status}
        </p>
      </main>

      <footer className="footer">
        <div className="container">
          <p>
            Data lives only in this browser&apos;s localStorage - nothing is uploaded anywhere. Use{' '}
            <strong>Export CSV</strong> to take a copy with you.
          </p>
        </div>
      </footer>
    </div>
  )
}
