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

## Requirements

- Node.js 20.19+ (Node 24 recommended)
- npm

## Getting started

```bash
cd money-manager
npm install
npm run dev
```

Then open http://localhost:5173.

## Other scripts

```bash
npm run build     # production build into dist/
npm run preview   # serve the production build locally
npm run check     # logic checks + an SSR render check of the whole app
```

`npm run check` runs two dependency-free scripts in `scripts/`:

- `check-utils.mjs` – assertions for the pure helpers (totals, month filtering, grouping, CSV escaping, formatting).
- `render-check.mjs` – builds `App.jsx` with Vite's SSR build and renders the real component tree to HTML
  (with a `localStorage` shim), so component crashes and missing content are caught without a browser.

## Project structure

```
money-manager/
├─ index.html
├─ vite.config.js
├─ scripts/
│  ├─ check-utils.mjs              # assertions for the pure helpers
│  └─ render-check.mjs             # SSR render check of the whole app
└─ src/
   ├─ main.jsx                     # React entry point
   ├─ App.jsx                      # state, persistence and page composition
   ├─ constants.js                 # currency, categories, colours, storage keys
   ├─ index.css                    # all styling (CSS variables, responsive)
   ├─ hooks/
   │  └─ useLocalStorage.js        # useState + localStorage sync
   ├─ components/
   │  ├─ Header.jsx                # brand + export / clear actions
   │  ├─ Toolbar.jsx               # period selector
   │  ├─ SummaryCards.jsx          # balance, income, expenses, savings rate
   │  ├─ TransactionForm.jsx       # add + edit form with validation
   │  ├─ TransactionList.jsx       # filters, sorting, edit/delete rows
   │  ├─ CategoryChart.jsx         # SVG donut + legend
   │  └─ BudgetPanel.jsx           # monthly budget + progress bar
   └─ utils/
      ├─ format.js                 # money / date / percent formatting
      └─ transactions.js           # pure helpers (totals, grouping, CSV)
```

## Changing the currency

Edit `CURRENCY` (and `LOCALE`) in `src/constants.js`, e.g. `'USD'` / `'en-US'`.

## Troubleshooting (Windows / PowerShell)

### `npm.ps1 cannot be loaded because running scripts is disabled on this system`

PowerShell resolves `npm` to `npm.ps1`, and a machine with no execution policy set
(`Get-ExecutionPolicy -List` shows every scope as `Undefined`) falls back to `Restricted`,
so that script is refused. Three ways around it:

1. **Per-user fix, no admin required (recommended)**

   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```

   Undo it at any time with:

   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Undefined
   ```

2. **Session-only bypass** - affects just the current terminal window:

   ```powershell
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```

3. **Do nothing** - call the `.cmd` shim instead, e.g. `npm.cmd run dev`.

### `npm warn install-scripts ... esbuild ... (postinstall)` during install

Some npm versions block dependency install scripts by default. esbuild ships a
prebuilt platform binary through optional dependencies, so `npm run build` and
`npm run dev` still work - this warning can be ignored.
