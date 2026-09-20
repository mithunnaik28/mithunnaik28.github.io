import { useEffect, useState } from 'react'
import { categoriesFor } from '../constants.js'
import { todayISO } from '../utils/format.js'

function emptyDraft() {
  return {
    type: 'expense',
    description: '',
    amount: '',
    category: categoriesFor('expense')[0],
    date: todayISO(),
  }
}

function draftFrom(transaction) {
  return {
    type: transaction.type,
    description: transaction.description,
    amount: String(transaction.amount),
    category: transaction.category,
    date: transaction.date,
  }
}

export default function TransactionForm({ editing, onSubmit, onCancelEdit }) {
  const [draft, setDraft] = useState(emptyDraft)
  const [error, setError] = useState('')

  useEffect(() => {
    if (editing) {
      setDraft(draftFrom(editing))
      setError('')
    }
  }, [editing])

  const categories = categoriesFor(draft.type)

  function change(field, value) {
    setDraft((prev) => {
      const next = { ...prev, [field]: value }

      // Keep the category valid when switching between income and expense.
      if (field === 'type') {
        const allowed = categoriesFor(value)
        if (!allowed.includes(next.category)) next.category = allowed[0]
      }

      return next
    })
  }

  function handleSubmit(event) {
    event.preventDefault()

    const amount = Number.parseFloat(draft.amount)

    if (!draft.description.trim()) {
      setError('Please enter a short description.')
      return
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Amount must be a number greater than 0.')
      return
    }
    if (!draft.date) {
      setError('Please pick a date.')
      return
    }

    onSubmit({ ...draft, amount, description: draft.description.trim() })
    setError('')
    setDraft({ ...emptyDraft(), type: draft.type, category: draft.category, date: draft.date })
  }

  return (
    <section className="card">
      <div className="card__head">
        <h2 className="card__title">{editing ? 'Edit transaction' : 'Add transaction'}</h2>
        {editing ? <span className="pill pill--warn">editing</span> : null}
      </div>

      <form className="form" onSubmit={handleSubmit} noValidate>
        <fieldset className="segmented" aria-label="Transaction type">
          {['expense', 'income'].map((type) => (
            <label key={type} className={`segmented__option ${draft.type === type ? 'is-active' : ''}`}>
              <input
                type="radio"
                name="type"
                value={type}
                checked={draft.type === type}
                onChange={() => change('type', type)}
              />
              <span>{type === 'expense' ? 'Expense' : 'Income'}</span>
            </label>
          ))}
        </fieldset>

        <label className="field">
          <span className="field__label">Description</span>
          <input
            className="input"
            type="text"
            value={draft.description}
            placeholder="e.g. Groceries"
            maxLength={80}
            onChange={(event) => change('description', event.target.value)}
          />
        </label>

        <div className="field-row">
          <label className="field">
            <span className="field__label">Amount</span>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={draft.amount}
              placeholder="0.00"
              onChange={(event) => change('amount', event.target.value)}
            />
          </label>

          <label className="field">
            <span className="field__label">Category</span>
            <select
              className="input"
              value={draft.category}
              onChange={(event) => change('category', event.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span className="field__label">Date</span>
          <input
            className="input"
            type="date"
            value={draft.date}
            onChange={(event) => change('date', event.target.value)}
          />
        </label>

        {error ? (
          <p className="form__error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="form__actions">
          <button type="submit" className="btn btn--primary">
            {editing ? 'Save changes' : 'Add transaction'}
          </button>
          {editing ? (
            <button type="button" className="btn btn--ghost" onClick={onCancelEdit}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </section>
  )
}
