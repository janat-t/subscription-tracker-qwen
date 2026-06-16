import { useState, useCallback } from 'react'
import { getSubscriptions, saveSubscriptions, getCurrency, saveCurrency } from '@/lib/storage'
import type { Subscription } from '@/types'

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => getSubscriptions())
  const [currency, setCurrencyState] = useState<string>(() => getCurrency())

  const add = useCallback((sub: Omit<Subscription, 'id' | 'createdAt'>) => {
    const next = [
      ...getSubscriptions(),
      { ...sub, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
    ]
    saveSubscriptions(next)
    setSubscriptions(next)
  }, [])

  const update = useCallback((id: string, sub: Omit<Subscription, 'id' | 'createdAt'>) => {
    const current = getSubscriptions()
    const next = current.map(s => s.id === id ? { ...s, ...sub } : s)
    saveSubscriptions(next)
    setSubscriptions(next)
  }, [])

  const remove = useCallback((id: string) => {
    const next = getSubscriptions().filter(s => s.id !== id)
    saveSubscriptions(next)
    setSubscriptions(next)
  }, [])

  const setCurrency = useCallback((c: string) => {
    saveCurrency(c)
    setCurrencyState(c)
  }, [])

  return { subscriptions, currency, add, update, remove, setCurrency }
}
