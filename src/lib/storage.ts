import { supabase } from "./supabase"
import type { Subscription } from "@/types"

const SUBS_KEY = "subscriptions"
const CURRENCY_KEY = "currency"
const LAST_SYNCED_KEY = "lastSyncedAt"

type DbRow = {
  id: string
  user_id: string
  name: string
  price: number
  billing_cycle: string
  billing_day: number
  billing_month: number | null
  payment_method: string
  category: string
  created_at: string
}

function dbToSub(row: DbRow): Subscription {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    billingCycle: row.billing_cycle as Subscription["billingCycle"],
    billingDay: row.billing_day,
    billingMonth: row.billing_month ?? undefined,
    paymentMethod: row.payment_method,
    category: row.category as Subscription["category"],
    createdAt: row.created_at,
  }
}

function subToDbFull(sub: Subscription, userId: string) {
  return {
    id: sub.id,
    user_id: userId,
    name: sub.name,
    price: sub.price,
    billing_cycle: sub.billingCycle,
    billing_day: sub.billingDay,
    billing_month: sub.billingMonth ?? null,
    payment_method: sub.paymentMethod,
    category: sub.category,
    created_at: sub.createdAt,
  }
}

function subToDbUpdate(sub: Omit<Subscription, "id" | "createdAt">) {
  return {
    name: sub.name,
    price: sub.price,
    billing_cycle: sub.billingCycle,
    billing_day: sub.billingDay,
    billing_month: sub.billingMonth ?? null,
    payment_method: sub.paymentMethod,
    category: sub.category,
  }
}

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}

export function getLocalSubscriptions(): Subscription[] {
  const raw = localStorage.getItem(SUBS_KEY)
  return raw ? (JSON.parse(raw) as Subscription[]) : []
}

export function saveLocalSubscriptions(subs: Subscription[]): void {
  localStorage.setItem(SUBS_KEY, JSON.stringify(subs))
}

export function getLastSyncedAt(): Date | null {
  const raw = localStorage.getItem(LAST_SYNCED_KEY)
  return raw ? new Date(raw) : null
}

export function saveLastSyncedAt(d: Date): void {
  localStorage.setItem(LAST_SYNCED_KEY, d.toISOString())
}

export async function getSubscriptions(): Promise<Subscription[] | null> {
  const userId = await getUserId()
  if (!userId) return null
  const { data, error } = await supabase.from("subscriptions").select("*")
  if (error) throw new Error(error.message)
  return (data as DbRow[]).map(dbToSub)
}

export async function addSubscription(sub: Subscription): Promise<void> {
  const userId = await getUserId()
  if (!userId) return
  const { error } = await supabase
    .from("subscriptions")
    .insert([subToDbFull(sub, userId)])
  if (error) throw new Error(error.message)
}

export async function updateSubscription(
  id: string,
  sub: Omit<Subscription, "id" | "createdAt">
): Promise<void> {
  const userId = await getUserId()
  if (!userId) return
  const { error } = await supabase
    .from("subscriptions")
    .update(subToDbUpdate(sub))
    .eq("id", id)
  if (error) throw new Error(error.message)
}

export async function deleteSubscription(id: string): Promise<void> {
  const userId = await getUserId()
  if (!userId) return
  const { error } = await supabase.from("subscriptions").delete().eq("id", id)
  if (error) throw new Error(error.message)
}

export async function syncToDatabase(subs: Subscription[]): Promise<void> {
  const userId = await getUserId()
  if (!userId) return
  const { error: delErr } = await supabase
    .from("subscriptions")
    .delete()
    .eq("user_id", userId)
  if (delErr) throw new Error(delErr.message)
  if (subs.length > 0) {
    const { error: insErr } = await supabase
      .from("subscriptions")
      .insert(subs.map(s => subToDbFull(s, userId)))
    if (insErr) throw new Error(insErr.message)
  }
}

export function getCurrency(): string {
  return localStorage.getItem(CURRENCY_KEY) ?? "USD"
}

export function saveCurrency(currency: string): void {
  localStorage.setItem(CURRENCY_KEY, currency)
}

export async function getCurrencyDB(): Promise<string | null> {
  const userId = await getUserId()
  if (!userId) return null
  const { data } = await supabase.auth.getUser()
  return (data.user?.user_metadata?.currency as string) ?? null
}

export async function saveCurrencyDB(currency: string): Promise<void> {
  const userId = await getUserId()
  if (!userId) return
  const { error } = await supabase.auth.updateUser({ data: { currency } })
  if (error) throw new Error(error.message)
}
