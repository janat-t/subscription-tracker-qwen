import type { Subscription } from '@/types'
import { monthlyEquivalent, formatCurrency } from '@/lib/utils'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const PALETTE = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#eab308','#22c55e','#14b8a6','#0ea5e9','#64748b']

export default function CategoryChart({ subscriptions, currency }: { subscriptions: Subscription[]; currency: string }) {
  if (!subscriptions.length) {
    return <div className="flex items-center justify-center h-[300px]">No subscriptions yet.</div>
  }

  const grouped = subscriptions.reduce<Record<string, number>>((acc, sub) => {
    const m = monthlyEquivalent(sub)
    acc[sub.category] = (acc[sub.category] ?? 0) + m
    return acc
  }, {})

  const data = Object.entries(grouped)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} data={data}>
          {data.map((_entry, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(value as number, currency)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
