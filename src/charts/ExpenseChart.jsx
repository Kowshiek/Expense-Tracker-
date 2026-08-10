import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getCategoryMeta } from '../utils/constants'
import { formatCurrency } from '../utils/currency'
import { useSettings } from '../hooks/useSettings'
import EmptyState from '../components/EmptyState'
import { PieChart as PieIcon } from 'lucide-react'

export default function ExpenseChart({ data }) {
  const { settings } = useSettings()
  const currency = settings?.currency || 'INR'

  if (!data.length) {
    return <EmptyState icon={PieIcon} title="No expenses yet" message="Add an expense to see your category breakdown." />
  }

  const chartData = data.map((d) => ({ ...d, meta: getCategoryMeta(d.category) }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="amount"
          nameKey="category"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={2}
        >
          {chartData.map((entry) => (
            <Cell key={entry.category} fill={entry.meta.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => formatCurrency(value, currency)}
          contentStyle={{ borderRadius: 12, border: '1px solid var(--color-line)', fontSize: 13 }}
        />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{ fontSize: 12, lineHeight: '22px' }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
