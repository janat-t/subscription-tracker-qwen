# Subscription Tracker

A minimal, modern web app to track your recurring subscriptions — no account needed, no backend, no data leaves your browser.

**Live:** https://janat-t.github.io/subscription-tracker-qwen/

## Features

- **Dashboard** — total monthly spend (annual subs normalized to monthly), spend-by-category donut chart, full subscription list sorted by price
- **Add / Edit / Delete** subscriptions with confirmation dialog
- **Payment methods** — credit card (custom label), Apple Pay, Google Pay
- **Billing cycles** — monthly or annually; next payment date auto-calculated from billing day
- **10 categories** — Entertainment, Productivity, Cloud/Storage, News & Media, Health & Fitness, Finance, Shopping, Gaming, Utilities, Other
- **Currency picker** — switch display currency globally (USD, EUR, GBP, JPY, and more)
- **Local-only** — all data stored in `localStorage`, zero server calls

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + Vite 5 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (base-ui primitives) |
| Charts | Recharts |
| Routing | React Router v7 |
| Storage | `localStorage` |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

App runs at `http://localhost:5173` (or next available port).

## Project Structure

```
src/
├── types.ts                  # Subscription, Category, BillingCycle types
├── lib/
│   ├── storage.ts            # localStorage read/write helpers
│   └── utils.ts              # monthlyEquivalent, nextPaymentDate, formatCurrency
├── hooks/
│   └── useSubscriptions.ts   # CRUD state over localStorage
├── pages/
│   ├── Dashboard.tsx         # / route
│   └── SubscriptionForm.tsx  # /add and /edit/:id routes
└── components/
    ├── SubscriptionList.tsx
    ├── CategoryChart.tsx
    ├── CurrencyPicker.tsx
    └── DeleteConfirmDialog.tsx
```

## Domain Glossary

See [`CONTEXT.md`](./CONTEXT.md) for precise definitions of terms used throughout the codebase (Subscription, Billing Cycle, Billing Day, Monthly Equivalent, etc.).

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
