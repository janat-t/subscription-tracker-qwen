import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { syncToDatabase } from "@/lib/storage"
import type { Subscription } from "@/types"
import type { Session } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Read hash error synchronously at module load — before Supabase or StrictMode can clear it
const _hashParams = new URLSearchParams(window.location.hash.slice(1))
const _initialLinkError = _hashParams.get("error_code")
  ? (_hashParams.get("error_description") ?? "Link is invalid or has expired")
  : null

function RecoverPasswordScreen({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) { setError("Password must be at least 6 characters"); return }
    if (password !== confirm) { setError("Passwords do not match"); return }
    setSubmitting(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setSubmitting(false)
    if (err) { setError(err.message); return }
    onDone()
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-center">Set new password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="password" placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Input type="password" placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Saving..." : "Set password"}
          </Button>
        </form>
      </div>
    </div>
  )
}

const AuthContext = createContext<{ showAuth: () => void }>({ showAuth: () => {} })
export function useAuth() { return useContext(AuthContext) }

async function migrateLocalStorage() {
  const raw = localStorage.getItem("subscriptions")
  if (!raw) return
  try {
    const subs = JSON.parse(raw)
    if (!Array.isArray(subs)) return
    const allSubs: Subscription[] = subs.map((s: Subscription) => ({
      id: s.id ?? crypto.randomUUID(),
      name: s.name,
      price: s.price,
      billingCycle: s.billingCycle,
      billingDay: s.billingDay,
      billingMonth: s.billingMonth,
      paymentMethod: s.paymentMethod,
      category: s.category,
      createdAt: s.createdAt ?? new Date().toISOString(),
    }))
    await syncToDatabase(allSubs)
    localStorage.removeItem("subscriptions")
  } catch {
  }
}

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [dismissed, setDismissed] = useState(true)
  const [recovering, setRecovering] = useState(false)
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [signedUp, setSignedUp] = useState(false)
  const [forgotSent, setForgotSent] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(_initialLinkError)

  useEffect(() => {
    if (_initialLinkError) history.replaceState(null, "", window.location.pathname)

    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s)
      if (event === "PASSWORD_RECOVERY") setRecovering(true)
      if (event === "SIGNED_IN" && localStorage.getItem("subscriptions")) migrateLocalStorage()
    })
    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return null

  if (recovering) return <RecoverPasswordScreen onDone={() => setRecovering(false)} />

  if (linkError) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Link expired</h1>
        <p className="text-muted-foreground text-sm">{linkError}</p>
        <button
          type="button"
          className="text-sm underline text-foreground"
          onClick={() => { setLinkError(null); setMode("forgot"); setDismissed(false) }}
        >
          Request a new link
        </button>
      </div>
    </div>
  )

  if (session || dismissed) return (
    <AuthContext.Provider value={{ showAuth: () => setDismissed(false) }}>
      {children}
    </AuthContext.Provider>
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setAuthError(null)
    setSubmitting(true)
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) { setAuthError(error.message); return }
        await migrateLocalStorage()
        setSignedUp(true)
        return
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
        if (error) { setAuthError(error.message); return }
        setForgotSent(true)
        return
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) { setAuthError(error.message); return }
      }
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : String(e))
    } finally {
      setSubmitting(false)
    }
  }

  if (signedUp) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-muted-foreground text-sm">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then sign in.
          </p>
          <button
            type="button"
            className="text-sm underline text-foreground"
            onClick={() => { setSignedUp(false); setMode("signin") }}
          >
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  if (forgotSent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-muted-foreground text-sm">
            We sent a password reset link to <strong>{email}</strong>.
          </p>
          <button
            type="button"
            className="text-sm underline text-foreground"
            onClick={() => { setForgotSent(false); setMode("signin") }}
          >
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight text-center">Subscription Tracker</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {mode !== "forgot" && (
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}
          {authError && (
            <p className="text-sm text-destructive">{authError}</p>
          )}
          {mode === "signin" && (
            <button
              type="button"
              className="text-sm text-muted-foreground underline"
              onClick={() => { setMode("forgot"); setAuthError(null) }}
            >
              Forgot password?
            </button>
          )}
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Please wait..." : mode === "signin" ? "Sign in" : mode === "signup" ? "Sign up" : "Send reset link"}
          </Button>
        </form>
        {mode !== "forgot" && (
          <>
            <p className="text-sm text-center text-muted-foreground">
              {mode === "signin" ? "No account?" : "Already have an account?"}{" "}
              <button
                type="button"
                className="underline text-foreground"
                onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setAuthError(null) }}
              >
                {mode === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">or</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </Button>
          </>
        )}
        {mode === "forgot" && (
          <p className="text-sm text-center text-muted-foreground">
            <button
              type="button"
              className="underline text-foreground"
              onClick={() => { setMode("signin"); setAuthError(null) }}
            >
              Back to sign in
            </button>
          </p>
        )}
        <p className="text-sm text-center text-muted-foreground">
          <button
            type="button"
            className="underline"
            onClick={() => setDismissed(true)}
          >
            Continue without signing in
          </button>
        </p>
      </div>
    </div>
  )
}
