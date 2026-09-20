import { formatMoney, formatPercent } from '../utils/format.js'

export default function BudgetPanel({ monthKey, monthLabel, budget, spent, onBudgetChange }) {
  const isSingleMonth = monthKey !== 'all'
  const remaining = budget - spent
  const usedShare = budget > 0 ? (spent / budget) * 100 : 0
  const barShare = Math.min(Math.max(usedShare, 0), 100)
  const overBudget = budget > 0 && spent > budget

  return (
    <section className="card">
      <div className="card__head">
        <h2 className="card__title">Monthly budget</h2>
        {isSingleMonth ? <span className="pill">{monthLabel}</span> : null}
      </div>

      {isSingleMonth ? (
        <>
          <label className="field">
            <span className="field__label">Budget for {monthLabel}</span>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              min="0"
              step="100"
              value={budget > 0 ? budget : ''}
              placeholder="e.g. 30000"
              onChange={(event) => onBudgetChange(event.target.value)}
            />
          </label>

          <div className="progress">
            <div
              className={`progress__bar ${overBudget ? 'progress__bar--over' : ''}`}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(barShare)}
              aria-label="Share of budget used"
              style={{ width: `${barShare}%` }}
            />
          </div>

          <div className="budget__stats">
            <span>
              Spent <strong>{formatMoney(spent)}</strong>
            </span>
            <span>
              {overBudget ? 'Over by' : 'Left'}{' '}
              <strong className={overBudget ? 'text-negative' : 'text-positive'}>
                {formatMoney(Math.abs(remaining))}
              </strong>
            </span>
            {budget > 0 ? <span>{formatPercent(usedShare)} used</span> : null}
          </div>

          <p className={`budget__note ${overBudget ? 'budget__note--warn' : ''}`}>
            {budget <= 0
              ? 'Set a budget to see how much of it you have used this month.'
              : overBudget
                ? 'You have gone past this month’s budget - worth reviewing the biggest categories.'
                : 'You are within budget. Keep going!'}
          </p>
        </>
      ) : (
        <p className="empty">Pick a single month in the Period selector above to set and track a budget.</p>
      )}
    </section>
  )
}
