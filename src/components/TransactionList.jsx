import { useMemo, useState } from 'react'
import { colorFor } from '../constants.js'
import { formatDate, formatMoney } from '../utils/format.js'
import { summarize } from '../utils/transactions.js'

const SORTERS = {
  'date-desc': (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0),
  'date-asc': (a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0),
  'amount-desc': (a, b) => b.amount - a.amount,
  'amount-asc': (a, b) => a.amount - b.amount,
}

export default function TransactionList({ transactions, editingId, onEdit, onDelete }) {
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [sort, setSort] = useState('date-desc')

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase()

    return transactions
      .filter((tx) => (type === 'all' ? true : tx.type === type))
      .filter((tx) =>
        needle
          ? tx.description.toLowerCase().includes(needle) || tx.category.toLowerCase().includes(needle)
          : true,
      )
      .sort(SORTERS[sort] ?? SORTERS['date-desc'])
  }, [transactions, query, type, sort])

  const totals = useMemo(() => summarize(rows), [rows])

  return (
    <section className="card">
      <div className="card__head">
        <h2 className="card__title">Transactions</h2>
        <span className="pill">{rows.length} shown</span>
      </div>

      <div className="filters">
        <label className="field field--grow">
          <span className="field__label">Search</span>
          <input
            className="input"
            type="search"
            value={query}
            placeholder="Description or category"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>

        <label className="field">
          <span className="field__label">Type</span>
          <select className="input" value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>

        <label className="field">
          <span className="field__label">Sort by</span>
          <select className="input" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="date-desc">Newest first</option>
            <option value="date-asc">Oldest first</option>
            <option value="amount-desc">Highest amount</option>
            <option value="amount-asc">Lowest amount</option>
          </select>
        </label>
      </div>

      {rows.length === 0 ? (
        <p className="empty">
          {transactions.length === 0
            ? 'No transactions yet. Add your first one using the form.'
            : 'No transactions match these filters.'}
        </p>
      ) : (
        <>
          <ul className="tx-list">
            {rows.map((tx) => (
              <li key={tx.id} className={`tx-row ${editingId === tx.id ? 'is-editing' : ''}`}>
                <span className="tx-row__dot" style={{ background: colorFor(tx.category) }} aria-hidden="true" />

                <div className="tx-row__main">
                  <p className="tx-row__description">{tx.description}</p>
                  <p className="tx-row__meta">
                    {tx.category} · {formatDate(tx.date)}
                  </p>
                </div>

                <span className={`tx-row__amount tx-row__amount--${tx.type}`}>
                  {tx.type === 'income' ? '+' : '−'}
                  {formatMoney(tx.amount)}
                </span>

                <div className="tx-row__actions">
                  <button
                    type="button"
                    className="btn btn--icon"
                    onClick={() => onEdit(tx.id)}
                    aria-label={`Edit ${tx.description}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn--icon btn--danger"
                    onClick={() => onDelete(tx)}
                    aria-label={`Delete ${tx.description}`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="tx-footer">
            <span>
              Income <strong className="text-positive">{formatMoney(totals.income)}</strong>
            </span>
            <span>
              Expenses <strong className="text-negative">{formatMoney(totals.expense)}</strong>
            </span>
            <span>
              Net{' '}
              <strong className={totals.balance >= 0 ? 'text-positive' : 'text-negative'}>
                {formatMoney(totals.balance)}
              </strong>
            </span>
          </div>
        </>
      )}
    </section>
  )
}
