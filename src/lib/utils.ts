import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Subscription } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function monthlyEquivalent(sub: Subscription): number {
  return sub.billingCycle === 'annually' ? sub.price / 12 : sub.price
}

export function nextPaymentDate(sub: Subscription): Date {
  const today = new Date()
  const day = sub.billingDay

  if (sub.billingCycle === 'monthly') {
    const candidate = new Date(today.getFullYear(), today.getMonth(), day)
    if (candidate >= today) return candidate
    return new Date(today.getFullYear(), today.getMonth() + 1, day)
  }

  const created = new Date(sub.createdAt)
  const month = created.getMonth()
  const thisYear = new Date(today.getFullYear(), month, day)
  if (thisYear >= today) return thisYear
  return new Date(today.getFullYear() + 1, month, day)
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}
