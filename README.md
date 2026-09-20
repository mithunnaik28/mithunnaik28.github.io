# Money Manager (React)

A small, dependency-light money management dashboard built with **React 19 + Vite**.

## Features

- Add, edit and delete income / expense transactions (description, amount, category, date).
- Summary cards: balance, income, expenses and savings rate for the selected period.
- Period selector (any month with data, or "All time") shared by the charts, budget and list.
- Transactions list with search, type filter and sorting (newest / oldest / highest / lowest).
- Expense & income breakdown by category drawn as a **hand-rolled SVG donut chart** (no chart library).
- Per-month budget with a progress bar, remaining amount and over-budget warning.
- Export the visible transactions to CSV.
- Everything is persisted in `localStorage`, so the data survives a page reload.
- Starts empty and only ever holds your own data - no sample data is pre-loaded.
