# SpendWise — Personal Expense Tracker

A modern, privacy-first personal expense tracker. Every browser/device gets
its own separate local database — nothing is ever sent to a server.

## Project overview

SpendWise is a full-stack-feeling web app that runs entirely on the client.
There is no MongoDB, MySQL, PostgreSQL, Firebase, or Supabase involved — all
transactions, budgets, and settings live in the browser's own IndexedDB
database via Dexie.js. Two people opening the same deployed URL on two
different devices get two completely separate, private datasets.

## Features

- **12:01 AM Daily Tracking Cycle** — Starts a fresh daily expense cycle every morning at 12:01 AM with live countdown, rollover alert notifications, and recommended daily spending targets.
- **⚡ UPI & Banking Auto-Detection** — Automatically parses debit and credit SMS notifications from all Indian UPI apps (Google Pay, PhonePe, Paytm, BHIM, CRED) and banks (HDFC, SBI, ICICI, Axis, Kotak, PNB, etc.). Debited amounts are logged as **Expense** and credited amounts as **Income** with the bank name attached.
- **📲 Download in Chrome & Mobile Storage** — Download/install option in Google Chrome on Android & Desktop. Uses the phone's native IndexedDB as the primary private database with guaranteed persistent mobile storage.
- **🐙 Automated GitHub Repository Sync** — Automatically commits and pushes mobile transactions to [https://github.com/Kowshiek/Expense-Tracker-](https://github.com/Kowshiek/Expense-Tracker-) in real time or on schedule.
- **Dashboard** — total balance, income, expenses, savings, this month's and today's expenses (since 12:01 AM), transaction count, and month-over-month comparisons.
- **Add expense / Add income** — validated forms with 1-click UPI auto-fill, categories, sources, payment methods, dates, and notes.
- **Transactions** — search, filter (category, type, payment method, date), sort, pagination, view/edit/delete with a confirmation dialog.
- **Analytics** — category donut chart, monthly bar chart, income vs expense chart, 30-day daily spending line chart, top categories.
- **Budgets** — per-category monthly budgets with progress bars, 80% warning and 100% exceeded states.
- **Monthly reports** — income, expenses, savings, highest category, highest transaction, average daily spend, per selected month.
- **Backup & restore** — export a full JSON backup, export a CSV of transactions, import a JSON backup (validated before insert), see last backup date, storage usage, and clear all data (with a strong confirmation).
- **Currency** — INR, USD, EUR, GBP, JPY, formatted throughout the app.
- **Dark mode** — light / dark / system, persisted locally.
- **Responsive** — bottom navigation on mobile, sidebar on desktop.
- **PWA** — installable, offline-capable after first visit.
- **Demo data** — one-click sample data you can remove again at any time.

## Tech stack

- React 19 + Vite
- React Router (client-side routing)
- Dexie.js over IndexedDB (local database) + `dexie-react-hooks` for
  reactive, auto-refreshing queries
- Tailwind CSS v4
- Recharts (charts)
- Lucide React (icons)
- `vite-plugin-pwa` (manifest + service worker)

## Architecture

SpendWise is a **frontend-only** application. There is no traditional
backend database, and none is required — every dashboard number and chart
is computed live from IndexedDB via Dexie's live queries, so the UI updates
automatically the moment you add, edit, or delete a transaction.

A minimal static host (e.g. Vercel) serves the compiled app; it never sees
or stores your financial data. If you ever add a backend for something like
a health-check endpoint, it must never receive transaction data — the app
must keep working with the backend absent entirely.

### How IndexedDB works here

IndexedDB is a database built into every modern browser, scoped per
origin (domain) and per browser profile. SpendWise creates one database
called `SpendWiseDB` the first time it runs, with three object stores:
`transactions`, `budgets`, and `settings`. Because IndexedDB is local to
the browser, User A's data on Device A is invisible to User B on Device B
— there's no shared backend to leak through.

### How Dexie.js works here

Dexie is a thin, ergonomic wrapper around the native IndexedDB API. All
database access goes through `src/db/database.js` (the schema) and a
service layer (`src/services/*.js`) — components never touch Dexie
directly. Reactive hooks (`src/hooks/*.js`) use `useLiveQuery` from
`dexie-react-hooks` so any part of the UI reading from the database
re-renders automatically after a write, without manual refresh logic.

## Folder structure

```
src/
├── components/    Reusable UI building blocks
├── pages/         Route-level views
├── layouts/        AppLayout (sidebar + navbar + outlet)
├── hooks/         useTransactions, useDashboard, useBudgets, useAnalytics, useSettings
├── db/
│   └── database.js  Dexie schema
├── services/      Database access layer (transactions, budgets, settings, analytics)
├── utils/         currency, dates, CSV/JSON export-import, demo data, constants
├── context/       Settings/theme, Toast, Confirm dialog providers
├── charts/        Recharts wrapper components
├── App.jsx
└── main.jsx
```

## Local development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

`npm run build` type-checks nothing (this is a JS project) but Vite will
fail loudly on unresolved imports or syntax errors. `npm run preview`
serves the production build locally so you can smoke-test it before
deploying.

## Deployment (Vercel)

1. Push this project to a Git repository.
2. Import it in Vercel. Framework preset: **Vite**.
3. Build command: `npm run build` — Output directory: `dist`.
4. A `vercel.json` is included with a SPA rewrite so client-side routes
   like `/transactions` or `/analytics` work on refresh and direct link.

No environment variables or backend services are required.

## PWA installation

After visiting the deployed site once, most browsers will offer an
"Install" prompt (or you can find it in the browser menu). Installed,
SpendWise runs in its own window and continues to work offline — the
service worker caches the app shell, and IndexedDB already holds your
data locally.

- **Android / ChromeOS**: Chrome menu → "Install app" / "Add to Home screen".
- **Windows (Chrome/Edge)**: address bar install icon, or browser menu →
  "Install SpendWise".

## Backup and restore

Because your data is local-only, it is tied to *this browser, this
device*. Regularly exporting a backup (Backup & Restore → Export full
backup) is the only way to move your data to another device, another
browser, or recover it after clearing site data. Import validates the
file's shape before writing anything, and reports a clear error if the
file is not a valid SpendWise backup.

## Privacy

Your financial data is stored locally on your device using IndexedDB. We
do not upload or sell your financial data. No analytics service collects
financial information, and no transaction, budget, or note content is
ever sent to an external server. See the in-app **Privacy** page for
details.

## Troubleshooting

- **"IndexedDB is not available"** — this can happen in private/incognito
  windows with strict storage settings, or with browser extensions that
  block storage. Try a normal browsing window.
- **Import fails with a validation error** — the file must be a JSON
  backup previously exported from SpendWise (has an `app` and `data`
  field). CSV files are for spreadsheets, not for re-importing.
- **Data disappeared after clearing browser data** — this is expected:
  IndexedDB lives in browser storage. Restore from your last exported
  backup via Backup & Restore.
- **Charts look empty** — analytics and monthly charts only draw once
  there's at least one transaction; add one or load demo data from
  Settings.
