import { useMemo, useState } from 'react'
import { colorFor } from '../constants.js'
import { formatMoney, formatPercent } from '../utils/format.js'
import { groupByCategory } from '../utils/transactions.js'

const SIZE = 200
const STROKE = 26
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function CategoryChart({ transactions }) {
  const [mode, setMode] = useState('expense')

  const slices = useMemo(() => groupByCategory(transactions, mode), [transactions, mode])
  const total = useMemo(() => slices.reduce((sum, slice) => sum + slice.total, 0), [slices])

  let offset = 0
  const arcs = slices.map((slice) => {
    const share = total > 0 ? slice.total / total : 0
    const length = share * CIRCUMFERENCE
    const arc = {
      ...slice,
      share,
      dashArray: `${length} ${Math.max(CIRCUMFERENCE - length, 0)}`,
      dashOffset: -offset,
    }
    offset += length
    return arc
  })

  return (
    <section className="card">
      <div className="card__head">
        <h2 className="card__title">Breakdown by category</h2>
        <div className="segmented segmented--small" role="group" aria-label="Breakdown type">
          {['expense', 'income'].map((option) => (
            <button
              key={option}
              type="button"
              className={`segmented__option ${mode === option ? 'is-active' : ''}`}
              aria-pressed={mode === option}
              onClick={() => setMode(option)}
            >
              {option === 'expense' ? 'Expenses' : 'Income'}
            </button>
          ))}
        </div>
      </div>

      {arcs.length === 0 ? (
        <p className="empty">
          Nothing to chart yet. {mode === 'expense' ? 'Expenses' : 'Income'} for this period will show up here.
        </p>
      ) : (
        <div className="chart">
          <svg
            className="chart__donut"
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            width={SIZE}
            height={SIZE}
            role="img"
            aria-label={`${mode === 'expense' ? 'Expenses' : 'Income'} by category, total ${formatMoney(total)}`}
          >
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="rgba(148, 163, 184, 0.15)"
              strokeWidth={STROKE}
            />
            {arcs.map((arc) => (
              <circle
                key={arc.category}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={colorFor(arc.category)}
                strokeWidth={STROKE}
                strokeDasharray={arc.dashArray}
                strokeDashoffset={arc.dashOffset}
                transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              />
            ))}
            <text x={SIZE / 2} y={SIZE / 2 - 4} className="chart__total" textAnchor="middle">
              {formatMoney(total)}
            </text>
            <text x={SIZE / 2} y={SIZE / 2 + 18} className="chart__caption" textAnchor="middle">
              {mode === 'expense' ? 'total spent' : 'total earned'}
            </text>
          </svg>

          <ul className="legend">
            {arcs.map((arc) => (
              <li className="legend__item" key={arc.category}>
                <span className="legend__dot" style={{ background: colorFor(arc.category) }} aria-hidden="true" />
                <span className="legend__name">{arc.category}</span>
                <span className="legend__value">{formatMoney(arc.total)}</span>
                <span className="legend__share">{formatPercent(arc.share * 100)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
