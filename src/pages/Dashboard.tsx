import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { monthlyEquivalent, formatCurrency, nextPaymentDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import SubscriptionList from '@/components/SubscriptionList'
import CategoryChart from '@/components/CategoryChart'
import CurrencyPicker from '@/components/CurrencyPicker'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { CATEGORIES, type Category } from '@/types'
import { Plus, Search } from 'lucide-react'
import ThemeToggle from '@/components/ThemeToggle'

export default function Dashboard() {
  const navigate = useNavigate()
  const { subscriptions, currency, remove, setCurrency } = useSubscriptions()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const deleteNameRef = useRef('')
  if (deleteTarget) deleteNameRef.current = deleteTarget.name

  const [sortBy, setSortBy] = useState<'price-desc' | 'price-asc' | 'name' | 'next-payment'>('price-desc')
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All')
  const [search, setSearch] = useState('')

  const totalMonthly = subscriptions.reduce((sum, s) => sum + monthlyEquivalent(s), 0)

  const displayedSubscriptions = subscriptions
    .filter(s => filterCategory === 'All' || s.category === filterCategory)
    .filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price-desc') return b.price - a.price
      if (sortBy === 'price-asc') return a.price - b.price
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      return nextPaymentDate(a).getTime() - nextPaymentDate(b).getTime()
    })

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Subscription Tracker</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <CurrencyPicker currency={currency} onChangeCurrency={setCurrency} />
            <Button size="sm" onClick={() => navigate('/add')}>
              <Plus className="size-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Total monthly spend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total monthly spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formatCurrency(totalMonthly, currency)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatCurrency(totalMonthly * 12, currency)} / year
            </p>
          </CardContent>
        </Card>

        {/* Category breakdown */}
        {subscriptions.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Spend by category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryChart subscriptions={subscriptions} currency={currency} />
            </CardContent>
          </Card>
        )}

        {/* Sort + Filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search subscriptions…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-desc">Price: High → Low</SelectItem>
              <SelectItem value="price-asc">Price: Low → High</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="next-payment">Next payment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          <Button
            variant={filterCategory === 'All' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterCategory('All')}
          >
            All
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={filterCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>

        <SubscriptionList
          subscriptions={displayedSubscriptions}
          currency={currency}
          onEdit={(id) => navigate(`/edit/${id}`)}
          onDelete={(id) => {
            const sub = subscriptions.find(s => s.id === id)
            if (sub) setDeleteTarget({ id, name: sub.name })
          }}
        />

        <DeleteConfirmDialog
          open={deleteTarget !== null}
          subscriptionName={deleteNameRef.current}
          onConfirm={() => {
            if (deleteTarget) remove(deleteTarget.id)
            setDeleteTarget(null)
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </div>
  )
}
