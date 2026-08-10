import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { formatCurrency, formatCompactNumber } from '../utils/currency'
import { useSettings } from '../hooks/useSettings'

export default function DailySpendingChart({ data }) {
  const { settings } = useSettings()
  const currency = settings?.currency || 'INR'

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--color-ink-faint)' }} axisLine={false} tickLine={false} interval={4} />
        <YAxis tickFormatter={formatCompactNumber} tick={{ fontSize: 12, fill: 'var(--color-ink-faint)' }} axisLine={false} tickLine={false} width={44} />
        <Tooltip
          formatter={(value) => formatCurrency(value, currency)}
          contentStyle={{ borderRadius: 12, border: '1px solid var(--color-line)', fontSize: 13 }}
        />
        <Line type="monotone" dataKey="amount" stroke="var(--color-navy)" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}
