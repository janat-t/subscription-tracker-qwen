export type BillingCycle = 'monthly' | 'annually'

export type Category =
  | 'Entertainment'
  | 'Productivity'
  | 'Cloud / Storage'
  | 'News & Media'
  | 'Health & Fitness'
  | 'Finance'
  | 'Shopping'
  | 'Gaming'
  | 'Utilities'
  | 'Other'

export const CATEGORIES: Category[] = [
  'Entertainment',
  'Productivity',
  'Cloud / Storage',
  'News & Media',
  'Health & Fitness',
  'Finance',
  'Shopping',
  'Gaming',
  'Utilities',
  'Other',
]

export interface Subscription {
  id: string
  name: string
  price: number
  billingCycle: BillingCycle
  billingDay: number
  paymentMethod: string
  category: Category
  createdAt: string
}
