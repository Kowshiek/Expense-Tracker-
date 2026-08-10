import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatCurrency, formatCompactNumber } from '../utils/currency'
import { useSettings } from '../hooks/useSettings'

export default function MonthlyChart({ data }) {
  const { settings } = useSettings()
  const currency = settings?.currency || 'INR'

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'var(--color-ink-faint)' }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={formatCompactNumber} tick={{ fontSize: 12, fill: 'var(--color-ink-faint)' }} axisLine={false} tickLine={false} width={44} />
        <Tooltip
          formatter={(value) => formatCurrency(value, currency)}
          contentStyle={{ borderRadius: 12, border: '1px solid var(--color-line)', fontSize: 13 }}
          cursor={{ fill: 'var(--color-forest-light)' }}
        />
        <Bar dataKey="amount" fill="var(--color-forest)" radius={[6, 6, 0, 0]} maxBarSize={36} />
      </BarChart>
    </ResponsiveContainer>
  )
}
