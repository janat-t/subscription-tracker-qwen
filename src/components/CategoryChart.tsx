import type { Subscription } from '@/types'
import { monthlyEquivalent, formatCurrency } from '@/lib/utils'
import { CATEGORY_COLORS, PALETTE } from '@/lib/category-colors'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function CategoryChart({
  subscriptions,
  currency,
  groupBy = 'category',
}: {
  subscriptions: Subscription[]
  currency: string
  groupBy?: 'category' | 'paymentMethod'
}) {
  if (!subscriptions.length) {
    return <div className="flex items-center justify-center h-[300px]">No subscriptions yet.</div>
  }

  const grouped = subscriptions.reduce<Record<string, number>>((acc, sub) => {
    const key = sub[groupBy]
    const m = monthlyEquivalent(sub)
    acc[key] = (acc[key] ?? 0) + m
    return acc
  }, {})

  const data = Object.entries(grouped)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))

  const colorFor = (name: string, i: number) =>
    groupBy === 'category'
      ? (CATEGORY_COLORS[name] ?? PALETTE[i % PALETTE.length])
      : PALETTE[i % PALETTE.length]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} data={data}>
          {data.map((entry, i) => (
            <Cell key={i} fill={colorFor(entry.name, i)} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(value as number, currency)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
