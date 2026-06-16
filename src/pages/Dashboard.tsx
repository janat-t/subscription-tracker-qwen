import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { monthlyEquivalent, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import SubscriptionList from '@/components/SubscriptionList'
import CategoryChart from '@/components/CategoryChart'
import CurrencyPicker from '@/components/CurrencyPicker'
import DeleteConfirmDialog from '@/components/DeleteConfirmDialog'
import { Plus } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const { subscriptions, currency, remove, setCurrency } = useSubscriptions()
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const deleteNameRef = useRef('')
  if (deleteTarget) deleteNameRef.current = deleteTarget.name

  const totalMonthly = subscriptions.reduce((sum, s) => sum + monthlyEquivalent(s), 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Subscription Tracker</h1>
          <div className="flex items-center gap-2">
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

        {/* Subscription list */}
        <SubscriptionList
          subscriptions={subscriptions}
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
