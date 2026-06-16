import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import { getSubscriptions } from '@/lib/storage'
import type { BillingCycle, Category } from '@/types'
import { CATEGORIES } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function emptyState(): {
  name: string
  price: string
  billingCycle: BillingCycle
  billingDay: string
  paymentType: 'Credit Card' | 'Apple Pay' | 'Google Pay'
  cardLabel: string
  category: Category
} {
  return {
    name: '',
    price: '',
    billingCycle: 'monthly',
    billingDay: '1',
    paymentType: 'Credit Card',
    cardLabel: '',
    category: 'Entertainment',
  }
}

export default function SubscriptionForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { add, update } = useSubscriptions()

  const [state, setState] = useState(emptyState)

  useEffect(() => {
    if (!id) return

    const subs = getSubscriptions()
    const sub = subs.find(s => s.id === id)
    if (!sub) return

    setState({
      name: sub.name,
      price: String(sub.price),
      billingCycle: sub.billingCycle,
      billingDay: String(sub.billingDay),
      category: sub.category,
      paymentType:
        sub.paymentMethod === 'Apple Pay' || sub.paymentMethod === 'Google Pay'
          ? (sub.paymentMethod as 'Apple Pay' | 'Google Pay')
          : 'Credit Card',
      cardLabel:
        sub.paymentMethod === 'Apple Pay' || sub.paymentMethod === 'Google Pay'
          ? ''
          : sub.paymentMethod,
    })
  }, [id])

  const set = (patch: Partial<typeof state>) => setState(prev => ({ ...prev, ...patch }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const paymentMethod =
      state.paymentType === 'Credit Card' ? state.cardLabel : state.paymentType

    const data = {
      name: state.name,
      price: parseFloat(state.price),
      billingCycle: state.billingCycle,
      billingDay: parseInt(state.billingDay, 10),
      paymentMethod,
      category: state.category,
    }

    if (id) {
      update(id, data)
    } else {
      add(data)
    }

    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background flex items-start justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{id ? 'Edit Subscription' : 'Add Subscription'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={state.name}
                onChange={e => set({ name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={state.price}
                onChange={e => set({ price: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingCycle">Billing Cycle</Label>
              <Select
                value={state.billingCycle}
                onValueChange={v => set({ billingCycle: v as BillingCycle })}
              >
                <SelectTrigger id="billingCycle">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingDay">Billing Day</Label>
              <Input
                id="billingDay"
                type="number"
                min="1"
                max="31"
                value={state.billingDay}
                onChange={e => set({ billingDay: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentType">Payment Method</Label>
              <Select
                value={state.paymentType}
                onValueChange={v =>
                  set({
                    paymentType: v as 'Credit Card' | 'Apple Pay' | 'Google Pay',
                    cardLabel:
                      v === 'Credit Card' ? state.cardLabel : '',
                  })
                }
              >
                <SelectTrigger id="paymentType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Credit Card">Credit Card</SelectItem>
                  <SelectItem value="Apple Pay">Apple Pay</SelectItem>
                  <SelectItem value="Google Pay">Google Pay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {state.paymentType === 'Credit Card' && (
              <div className="space-y-2">
                <Label htmlFor="cardLabel">Card Label</Label>
                <Input
                  id="cardLabel"
                  placeholder="e.g. Chase Sapphire"
                  value={state.cardLabel}
                  onChange={e => set({ cardLabel: e.target.value })}
                  required={state.paymentType === 'Credit Card'}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={state.category}
                onValueChange={v => set({ category: v as Category })}
              >
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
