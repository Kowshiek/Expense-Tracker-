export default function BudgetProgress({ spent, budget }) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0
  const overPct = budget > 0 ? (spent / budget) * 100 : 0
  let barColor = 'bg-forest'
  if (overPct >= 100) barColor = 'bg-clay'
  else if (overPct >= 80) barColor = 'bg-amber'

  return (
    <div className="w-full h-2 rounded-full bg-paper dark:bg-dark-bg overflow-hidden">
      <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
    </div>
  )
}
