import type { Subscription } from '@/types'

const SUBS_KEY = 'subscriptions'
const CURRENCY_KEY = 'currency'

export function getSubscriptions(): Subscription[] {
  const raw = localStorage.getItem(SUBS_KEY)
  return raw ? (JSON.parse(raw) as Subscription[]) : []
}

export function saveSubscriptions(subs: Subscription[]): void {
  localStorage.setItem(SUBS_KEY, JSON.stringify(subs))
}

export function getCurrency(): string {
  return localStorage.getItem(CURRENCY_KEY) ?? 'USD'
}

export function saveCurrency(currency: string): void {
  localStorage.setItem(CURRENCY_KEY, currency)
}
