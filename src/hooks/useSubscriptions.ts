import { useState, useEffect, useCallback, useRef } from "react"
import { supabase } from "@/lib/supabase"
import {
  getLocalSubscriptions,
  saveLocalSubscriptions,
  getSubscriptions,
  addSubscription,
  updateSubscription,
  deleteSubscription,
  syncToDatabase,
  getCurrency,
  saveCurrency,
  getCurrencyDB,
  saveCurrencyDB,
  getLastSyncedAt,
  saveLastSyncedAt,
} from "@/lib/storage"
import type { Subscription } from "@/types"

export function useSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(() => getLocalSubscriptions())
  const [currency, setCurrencyState] = useState<string>(() => getCurrency())
  const [error, setError] = useState<string | null>(null)
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(() => getLastSyncedAt())
  const [syncing, setSyncing] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const syncingRef = useRef(false)
  const hasLoadedRef = useRef(false)
  const focusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthenticated(!!data.session)
      if (!data.session) { hasLoadedRef.current = true; return }
      getSubscriptions()
        .then(subs => {
          if (!subs) return
          const local = getLocalSubscriptions()
          const dbIds = new Set(subs.map(s => s.id))
          const localOnly = local.filter(s => !dbIds.has(s.id))
          const merged = localOnly.length > 0 ? [...subs, ...localOnly] : subs
          setSubscriptions(merged)
          saveLocalSubscriptions(merged)
          const now = new Date()
          saveLastSyncedAt(now)
          setLastSyncedAt(now)
          hasLoadedRef.current = true
        })
        .catch((e: unknown) => { hasLoadedRef.current = true; setError(e instanceof Error ? e.message : String(e)) })
      getCurrencyDB()
        .then(c => {
          if (c) { saveCurrency(c); setCurrencyState(c) }
        })
        .catch(() => {})
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const sync = useCallback(async () => {
    if (syncingRef.current) return
    if (!hasLoadedRef.current) return
    syncingRef.current = true
    setSyncing(true)
    try {
      await syncToDatabase(getLocalSubscriptions())
      const subs = await getSubscriptions()
      if (subs && subs.length > 0) {
        setSubscriptions(subs)
        saveLocalSubscriptions(subs)
      }
      const now = new Date()
      saveLastSyncedAt(now)
      setLastSyncedAt(now)
      setError(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      syncingRef.current = false
      setSyncing(false)
    }
  }, [])

  useEffect(() => {
    const fetchFromDb = async () => {
      try {
        const { data: { session: existing } } = await supabase.auth.getSession()
        if (!existing) return
        const { data: { session } } = await supabase.auth.refreshSession()
        if (!session) return
        const subs = await getSubscriptions()
        if (!subs || subs.length === 0) return
        setSubscriptions(subs)
        saveLocalSubscriptions(subs)
      } catch {}
    }
    const handleVisibility = () => {
      if (document.visibilityState === "visible") fetchFromDb()
    }
    const handleFocus = () => {
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current)
      focusTimerRef.current = null
      fetchFromDb()
    }
    document.addEventListener("visibilitychange", handleVisibility)
    window.addEventListener("focus", handleFocus)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility)
      window.removeEventListener("focus", handleFocus)
      if (focusTimerRef.current) clearTimeout(focusTimerRef.current)
    }
  }, [])

  const add = useCallback(async (sub: Omit<Subscription, "id" | "createdAt">) => {
    const newSub: Subscription = {
      ...sub,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setSubscriptions(prev => {
      const next = [...prev, newSub]
      saveLocalSubscriptions(next)
      return next
    })
    try {
      await addSubscription(newSub)
      setError(null)
    } catch (e: unknown) {
      setSubscriptions(prev => {
        const next = prev.filter(s => s.id !== newSub.id)
        saveLocalSubscriptions(next)
        return next
      })
      throw e
    }
  }, [])

  const update = useCallback(async (id: string, sub: Omit<Subscription, "id" | "createdAt">) => {
    let prev: Subscription | undefined
    setSubscriptions(prevList => {
      prev = prevList.find(s => s.id === id)
      const next = prevList.map(s => s.id === id ? { ...s, ...sub } : s)
      saveLocalSubscriptions(next)
      return next
    })
    try {
      await updateSubscription(id, sub)
      setError(null)
    } catch (e: unknown) {
      if (prev) {
        setSubscriptions(prevList => {
          const next = prevList.map(s => s.id === id ? prev! : s)
          saveLocalSubscriptions(next)
          return next
        })
      }
      throw e
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    let removed: Subscription | undefined
    let removedIndex = -1
    setSubscriptions(prev => {
      removedIndex = prev.findIndex(s => s.id === id)
      removed = prev[removedIndex]
      const next = prev.filter(s => s.id !== id)
      saveLocalSubscriptions(next)
      return next
    })
    try {
      await deleteSubscription(id)
      setError(null)
    } catch (e: unknown) {
      if (removed !== undefined && removedIndex !== -1) {
        setSubscriptions(prev => {
          const next = [...prev]
          next.splice(removedIndex, 0, removed!)
          saveLocalSubscriptions(next)
          return next
        })
      }
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [])

  const setCurrency = useCallback((c: string) => {
    saveCurrency(c)
    setCurrencyState(c)
    saveCurrencyDB(c).then(() => setError(null)).catch((e: unknown) => {
      setError(e instanceof Error ? e.message : String(e))
    })
  }, [])

  return { subscriptions, currency, error, add, update, remove, setCurrency, lastSyncedAt, sync, syncing, isAuthenticated }
}
