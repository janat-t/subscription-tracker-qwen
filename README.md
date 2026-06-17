# Subscription Tracker

A minimal, modern web app to track your recurring subscriptions. Works offline with local storage; sign in to sync across devices via Supabase.

**Live:** https://subscriptions.janat-t.com

## Features

- **Dashboard** — total monthly spend (annual subs normalized to monthly), spend-by-category donut chart, full subscription list
- **Sort & filter** — sort by price, name, or next payment date; filter by category; search by name
- **Add / Edit / Delete** subscriptions with confirmation dialog
- **Payment methods** — credit card (custom label), Apple Pay, Google Pay
- **Billing cycles** — monthly or annually; next payment date auto-calculated from billing day
- **10 categories** — Entertainment, Productivity, Cloud/Storage, News & Media, Health & Fitness, Finance, Shopping, Gaming, Utilities, Other
- **Settings** — currency picker (USD, EUR, GBP, JPY, and more) + light/dark/system theme, grouped in a single gear icon
- **Auth + cloud sync** — optional Supabase sign-in (email/password); localStorage is the write-through cache, DB is authoritative on load; "Save to cloud" button + auto-sync on tab blur; forgot password + password reset flow; change password in Settings
- **Guest mode** — app opens directly to dashboard; sign in only when you want cloud sync; data stays in localStorage until then

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite 8 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (base-ui primitives) |
| Charts | Recharts |
| Routing | React Router v7 |
| Storage | localStorage (primary) + Supabase Postgres (cloud) |
| Auth | Supabase email/password |
| Deployment | Cloudflare Workers |

## Getting Started

```bash
npm install
npm run dev   # http://localhost:5173
npm run build
npm run deploy  # Cloudflare Workers
```

## Project Structure

```
src/
├── types.ts                  # Subscription, Category, BillingCycle types
├── lib/
│   ├── supabase.ts           # Supabase client
│   ├── storage.ts            # localStorage + Supabase CRUD, syncToDatabase
│   └── utils.ts              # monthlyEquivalent, nextPaymentDate, formatCurrency
├── hooks/
│   └── useSubscriptions.ts   # CRUD state; localStorage-first, background DB sync
├── pages/
│   ├── Dashboard.tsx         # / route
│   └── SubscriptionForm.tsx  # /add and /edit/:id routes
└── components/
    ├── AuthGate.tsx          # Auth form gate; "Continue without signing in"
    ├── SettingsDialog.tsx    # Theme + currency settings
    ├── SubscriptionList.tsx
    ├── CategoryChart.tsx
    └── DeleteConfirmDialog.tsx
```

## Ideas for future improvements

- **Google OAuth** — sign in with Google alongside email/password (branch `feat/google-oauth` is in progress)
- **Upcoming payments** — a "due this week / this month" section so you never get surprised by a charge
- **Pause / inactive toggle** — hide a subscription from totals without deleting it
- **Export / import JSON** — backup and restore
- **Service emoji / icon** — let the user pick an emoji per subscription to make the list scannable at a glance
- **Trial end date** — flag a subscription as a trial with a countdown to when it converts to paid
- **Budget alert** — warn when total monthly spend exceeds a user-set threshold
- **PWA** — installable to home screen; the app already works fully offline

## Domain Glossary

See [`CONTEXT.md`](./CONTEXT.md) for precise definitions of terms used throughout the codebase.

---

## How This Was Built

This project was planned and implemented entirely using AI tooling as a demonstration of the [9ARM AI Passport](https://chat.9arm.co/) workflow:

**Planning** — Requirements were gathered through a structured interview using the `grill-with-docs` skill in [Claude Code](https://claude.ai/code), powered by **Anthropic Claude Sonnet 4.6**. Every product decision (tech stack, data model, UX behavior, routing) was resolved before a single line of code was written and captured in `CONTEXT.md`.

**Implementation** — Mechanical scaffolding and boilerplate (component files, type definitions, utility functions) were delegated to the **[`qwen-agent` skill](https://github.com/thananon/9arm-skills/tree/main)**, which routes tasks to the [9ARM](https://chat.9arm.co/) gateway running **Qwen3.6-35B-A3B** (`claude-9arm`). This kept expensive Sonnet reasoning reserved for architecture decisions, debugging TypeScript errors, and verification.

**Verification** — The final app was verified end-to-end using Playwright headless Chromium, driven by the `verify` skill, before pushing.

Learn about AI Passport (by 9ARM): [youtube.com/watch?v=ZUkVeXmD-Ek](https://youtu.be/ZUkVeXmD-Ek?si=sRgz7ojAm48wne7p)

### AI tools used

| Tool | Role |
|---|---|
| Claude Sonnet 4.6 (Claude Code) | Planning, architecture, debugging, verification |
| [9ARM `qwen-agent` skill](https://github.com/thananon/9arm-skills/tree/main) | Scaffolding boilerplate component files |
| Qwen3.6-35B-A3B via [9ARM gateway](https://chat.9arm.co/) | Executing the qwen-agent tasks |
| `grill-with-docs` skill | Structured requirements interview |
| `verify` skill + Playwright | End-to-end UI verification |

> [9ARM AI Passport](https://chat.9arm.co/) lets you mix models mid-session — use a capable frontier model for reasoning and a fast/cheap model for mechanical work — without leaving your terminal.
