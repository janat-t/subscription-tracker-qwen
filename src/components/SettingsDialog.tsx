import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Settings, Monitor, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { supabase } from '@/lib/supabase'

const CURRENCIES = ['USD','EUR','GBP','JPY','AUD','CAD','CHF','CNY','INR','THB']

export default function SettingsDialog({ currency, onChangeCurrency, isAuthenticated }: { currency: string; onChangeCurrency: (currency: string) => void; isAuthenticated: boolean }) {
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState('')
  const [pwSubmitting, setPwSubmitting] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="ghost" size="icon" />}>
        <Settings className="h-5 w-5" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-medium">Theme</p>
            <div className="flex gap-2">
              <Button variant={theme === 'light' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('light')}>
                <Sun className="h-4 w-4 mr-1" /> Light
              </Button>
              <Button variant={theme === 'dark' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('dark')}>
                <Moon className="h-4 w-4 mr-1" /> Dark
              </Button>
              <Button variant={theme === 'system' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('system')}>
                <Monitor className="h-4 w-4 mr-1" /> System
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Currency</p>
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
          </div>
          {isAuthenticated && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Change password</p>
              <Input type="password" placeholder="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <Input type="password" placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <Button
                className="w-full"
                size="sm"
                disabled={pwSubmitting}
                onClick={async () => {
                  setPwError('')
                  setPwSuccess('')
                  if (newPassword.length < 6) { setPwError('Password must be at least 6 characters'); return }
                  if (newPassword !== confirmPassword) { setPwError('Passwords do not match'); return }
                  setPwSubmitting(true)
                  const { error } = await supabase.auth.updateUser({ password: newPassword })
                  setPwSubmitting(false)
                  if (error) { setPwError(error.message) }
                  else { setPwSuccess('Password updated'); setNewPassword(''); setConfirmPassword('') }
                }}
              >
                {pwSubmitting ? 'Saving...' : 'Update password'}
              </Button>
              {pwError && <p className="text-sm text-destructive">{pwError}</p>}
              {pwSuccess && <p className="text-sm text-green-600">{pwSuccess}</p>}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
