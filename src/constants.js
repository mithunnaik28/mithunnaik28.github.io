// App-wide constants. Change CURRENCY to switch the whole UI to another currency,
// e.g. 'USD' | 'EUR' | 'GBP'.

export const CURRENCY = 'INR'
export const LOCALE = 'en-IN'

export const EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Transport',
  'Bills',
  'Shopping',
  'Health',
  'Entertainment',
  'Education',
  'Other',
]

export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Interest', 'Gift', 'Other']

// Colours are used by the donut chart and the legends / category dots.
export const CATEGORY_COLORS = {
  Food: '#fb923c',
  Rent: '#38bdf8',
  Transport: '#a78bfa',
  Bills: '#f472b6',
  Shopping: '#facc15',
  Health: '#34d399',
  Entertainment: '#f87171',
  Education: '#60a5fa',
  Salary: '#22c55e',
  Freelance: '#2dd4bf',
  Interest: '#818cf8',
  Gift: '#e879f9',
  Other: '#94a3b8',
}

export const FALLBACK_COLOR = '#94a3b8'

export const STORAGE_KEYS = {
  transactions: 'money-manager.transactions',
  budgets: 'money-manager.budgets',
  month: 'money-manager.selected-month',
}

export function categoriesFor(type) {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}

export function colorFor(category) {
  return CATEGORY_COLORS[category] ?? FALLBACK_COLOR
}
