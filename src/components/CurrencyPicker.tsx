import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Settings } from 'lucide-react'

const CURRENCIES = ['USD','EUR','GBP','JPY','AUD','CAD','CHF','CNY','INR','THB']

export default function CurrencyPicker({ currency, onChangeCurrency }: { currency: string; onChangeCurrency: (currency: string) => void }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" />}>
        <Settings className="h-5 w-5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Currency</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2">
          {CURRENCIES.map((c) => (
            <Button
              key={c}
              variant={c === currency ? 'default' : 'outline'}
              onClick={() => { onChangeCurrency(c); setOpen(false) }}
            >
              {c}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
