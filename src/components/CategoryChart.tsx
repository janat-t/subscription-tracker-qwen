import type { Subscription } from '@/types'
import { monthlyEquivalent, formatCurrency } from '@/lib/utils'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const CATEGORY_COLORS: Record<string, string> = {
  'Entertainment':    '#6366f1',
  'Productivity':     '#22c55e',
  'Cloud / Storage':  '#0ea5e9',
  'News & Media':     '#f97316',
  'Health & Fitness': '#ec4899',
  'Finance':          '#eab308',
  'Shopping':         '#f43f5e',
  'Gaming':           '#8b5cf6',
  'Utilities':        '#14b8a6',
  'Other':            '#94a3b8',
}

const PALETTE = ['#6366f1','#0ea5e9','#22c55e','#f97316','#ec4899','#eab308','#8b5cf6','#14b8a6','#f43f5e','#94a3b8']

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
