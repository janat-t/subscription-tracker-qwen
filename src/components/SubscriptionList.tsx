import type { Subscription } from '@/types'
import { formatCurrency, formatDate, nextPaymentDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Pencil, Trash2 } from 'lucide-react'

interface SubscriptionListProps {
  subscriptions: Subscription[]
  currency: string
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

export default function SubscriptionList({
  subscriptions,
  currency,
  onEdit,
  onDelete,
}: SubscriptionListProps) {
  if (subscriptions.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        No subscriptions yet. Add your first one.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {subscriptions.map((sub) => (
        <Card key={sub.id}>
          <CardContent className="px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-base font-medium truncate">{sub.name}</div>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  <Badge variant="secondary">{sub.category}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {sub.billingCycle === 'monthly' ? 'Monthly' : 'Annually'}
                  </span>
                  <span className="text-xs text-muted-foreground">{sub.paymentMethod}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <div className="text-right mr-1">
                  <div className="text-sm font-medium">{formatCurrency(sub.price, currency)}</div>
                  <div className="text-xs text-muted-foreground">
                    Next: {formatDate(nextPaymentDate(sub))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(sub.id)}
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive"
                  onClick={() => onDelete(sub.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
