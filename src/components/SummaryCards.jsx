import { formatMoney, formatPercent } from '../utils/format.js'

export default function SummaryCards({ totals, budget }) {
  const { income, expense, balance, savingsRate } = totals

  const cards = [
    {
      key: 'balance',
      label: 'Balance',
      value: formatMoney(balance),
      hint: 'Income minus expenses',
      tone: balance >= 0 ? 'positive' : 'negative',
    },
    {
      key: 'income',
      label: 'Income',
      value: formatMoney(income),
      hint: 'Money in',
      tone: 'positive',
    },
    {
      key: 'expense',
      label: 'Expenses',
      value: formatMoney(expense),
      hint: budget > 0 ? `Budget ${formatMoney(budget)}` : 'Money out',
      tone: 'negative',
    },
    {
      key: 'rate',
      label: 'Savings rate',
      value: formatPercent(savingsRate),
      hint: 'Share of income kept',
      tone: savingsRate >= 0 ? 'positive' : 'negative',
    },
  ]

  return (
    <section className="summary-grid" aria-label="Summary">
      {cards.map((card) => (
        <article className="card summary-card" key={card.key}>
          <p className="summary-card__label">{card.label}</p>
          <p className={`summary-card__value summary-card__value--${card.tone}`}>{card.value}</p>
          <p className="summary-card__hint">{card.hint}</p>
        </article>
      ))}
    </section>
  )
}
