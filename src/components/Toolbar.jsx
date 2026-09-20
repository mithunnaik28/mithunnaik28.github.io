import { formatMonthLabel } from '../utils/format.js'

export default function Toolbar({ month, months, onMonthChange, shownCount, totalCount }) {
  return (
    <section className="toolbar" aria-label="Period toolbar">
      <label className="field field--inline">
        <span className="field__label">Period</span>
        <select className="input" value={month} onChange={(event) => onMonthChange(event.target.value)}>
          <option value="all">All time</option>
          {months.map((monthKey) => (
            <option key={monthKey} value={monthKey}>
              {formatMonthLabel(monthKey)}
            </option>
          ))}
        </select>
      </label>

      <p className="toolbar__meta">
        Showing <strong>{shownCount}</strong> of {totalCount} transactions
      </p>
    </section>
  )
}
