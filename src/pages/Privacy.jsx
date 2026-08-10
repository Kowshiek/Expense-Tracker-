import { ShieldCheck, Database, ServerOff, Lock } from 'lucide-react'

const points = [
  {
    icon: Database,
    title: 'Everything stays on your device',
    body: 'Your financial data is stored locally on your device using IndexedDB, a browser-native database. There is no central server holding your transactions.',
  },
  {
    icon: ServerOff,
    title: 'Nothing is uploaded or sold',
    body: 'We do not upload or sell your financial data. SpendWise never sends your transactions, budgets, or notes to any external server.',
  },
  {
    icon: Lock,
    title: 'No analytics on your money',
    body: 'No analytics service collects your financial information. Any product analytics, if present, never includes transaction content.',
  },
  {
    icon: ShieldCheck,
    title: 'You are in control',
    body: 'You can export, import, or permanently delete all local data at any time from Backup & Restore. Clearing your browser storage or switching devices means starting fresh unless you restore from a backup.',
  },
]

export default function Privacy() {
  return (
    <div className="max-w-2xl space-y-5">
      <div className="rounded-2xl bg-forest-light dark:bg-dark-surface border border-forest/20 dark:border-dark-line p-5">
        <p className="text-sm text-ink-soft dark:text-ink-faint leading-relaxed">
          Your financial data is stored locally on your device using IndexedDB. We do not upload or sell your financial data.
        </p>
      </div>

      {points.map((p) => (
        <div key={p.title} className="rounded-2xl bg-paper-raised dark:bg-dark-surface border border-line dark:border-dark-line p-5 flex gap-4">
          <span className="w-10 h-10 rounded-lg bg-forest-light dark:bg-dark-bg text-forest flex items-center justify-center shrink-0">
            <p.icon size={18} />
          </span>
          <div>
            <h3 className="font-display font-semibold text-sm text-ink dark:text-white mb-1">{p.title}</h3>
            <p className="text-sm text-ink-soft dark:text-ink-faint leading-relaxed">{p.body}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
