export default function Header({ hasData, onExport, onClearAll }) {
  return (
    <header className="header">
      <div className="container header__inner">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            ₹
          </span>
          <div>
            <h1 className="brand__title">Money Manager</h1>
            <p className="brand__subtitle">Track income, expenses and monthly budgets - stored right in your browser.</p>
          </div>
        </div>

        <div className="header__actions">
          <button type="button" className="btn btn--ghost" onClick={onExport} disabled={!hasData}>
            Export CSV
          </button>
          <button type="button" className="btn btn--danger" onClick={onClearAll} disabled={!hasData}>
            Clear all
          </button>
        </div>
      </div>
    </header>
  )
}
