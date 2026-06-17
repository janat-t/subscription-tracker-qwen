import { useState, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
import SettingsDialog from '@/components/SettingsDialog'
import { useAuth } from '@/components/AuthGate'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { CATEGORIES, type Category } from '@/types'
import { Plus, Search, LogOut, UploadCloud } from 'lucide-react'
import { supabase } from '@/lib/supabase'

function formatRelativeTime(date: Date): string {
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { subscriptions, currency, remove, setCurrency, error, lastSyncedAt, sync, syncing, isAuthenticated } = useSubscriptions()
  const { showAuth } = useAuth()
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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6 flex-1 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/icon.svg" alt="" className="size-7 rounded-lg" />
            <h1 className="text-2xl font-semibold tracking-tight">Subscription Tracker</h1>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-1">
                {lastSyncedAt && (
                  <span className="text-xs text-muted-foreground">Saved {formatRelativeTime(lastSyncedAt)}</span>
                )}
                <Button variant="ghost" size="sm" onClick={sync} disabled={syncing}>
                  <UploadCloud className="size-4 mr-1" />
                  {syncing ? 'Saving...' : 'Save to cloud'}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => supabase.auth.signOut()}>
                  <LogOut className="size-4" />
                </Button>
                <SettingsDialog currency={currency} onChangeCurrency={setCurrency} isAuthenticated={isAuthenticated} />
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" onClick={showAuth}>
                  Sign in to save
                </Button>
                <SettingsDialog currency={currency} onChangeCurrency={setCurrency} isAuthenticated={false} />
              </div>
            )}
            <Button size="sm" onClick={() => navigate('/add')}>
              <Plus className="size-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm px-3 py-2 rounded">{error}</div>
        )}

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

        {/* Payment method breakdown */}
        {subscriptions.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Spend by payment method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryChart subscriptions={subscriptions} currency={currency} groupBy="paymentMethod" />
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
              <SelectValue>
                {({'price-desc': 'Price: High → Low', 'price-asc': 'Price: Low → High', 'name': 'Name', 'next-payment': 'Next payment'} as Record<string, string>)[sortBy]}
              </SelectValue>
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
          {CATEGORIES.filter(cat => subscriptions.some(s => s.category === cat)).map((cat) => (
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
      <footer className='mt-auto max-w-3xl mx-auto w-full px-4 py-6 flex items-center justify-between text-xs text-muted-foreground border-t'>
          <a href='https://github.com/janat-t/subscription-tracker-qwen' target='_blank' rel='noopener noreferrer' className='flex items-center gap-1.5 hover:text-foreground transition-colors'>
            <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' className='h-4 w-4' fill='currentColor'>
              <path d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z' />
            </svg>
            GitHub
          </a>
          <div className='flex items-center gap-4'>
            <a href='https://github.com/janat-t/subscription-tracker-qwen/issues/new' target='_blank' rel='noopener noreferrer' className='hover:text-foreground transition-colors'>Feedback</a>
            <Link to='/terms' className='hover:text-foreground transition-colors'>Terms</Link>
            <Link to='/privacy' className='hover:text-foreground transition-colors'>Privacy</Link>
          </div>
        </footer>
    </div>
  )
}
