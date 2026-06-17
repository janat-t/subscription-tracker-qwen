# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # dev server (http://localhost:5173)
npm run build      # tsc + vite build → dist/
npm run preview    # build then serve via wrangler locally
npm run deploy     # build then deploy to Cloudflare Workers
```

No test suite exists. Verify changes by running `npm run build` (catches TypeScript errors) and running the dev server.

## Architecture

**Stack:** React 18 + Vite 8 (Rolldown bundler) + TypeScript (strict) + Tailwind CSS v4 + shadcn/ui v4 + React Router v7. Deployed as a Cloudflare Worker with static assets (`wrangler.jsonc`, `not_found_handling: single-page-application`). `react-is` must be listed as an explicit dependency — Rolldown won't resolve it transitively from recharts.

**Persistence:** localStorage only. Two keys: `subscriptions` (JSON array of `Subscription`) and `currency` (string, default `"USD"`). `src/lib/storage.ts` is the only file that touches `localStorage`. `src/hooks/useSubscriptions.ts` wraps storage in React state; every mutation re-reads from storage before writing to avoid stale-closure bugs.

**Routing:** Two routes — `/` (Dashboard) and `/add` + `/edit/:id` (SubscriptionForm). `BrowserRouter` uses `basename={import.meta.env.BASE_URL}` (resolves to `/` in production via `vite.config.ts`).

**Sort & filter:** All sorting and filtering happens in `Dashboard.tsx` before passing `displayedSubscriptions` to `SubscriptionList`. The chart and total spend always use the unfiltered `subscriptions` array. `SubscriptionList` renders in whatever order it receives — no internal sorting.

**Theming:** `ThemeProvider` wraps the entire app in `App.tsx` and manages `system | light | dark` state, toggling the `dark` class on `<html>`. shadcn CSS variables in `index.css` define both `:root` and `.dark` palettes — no Tailwind `dark:` utilities needed. An inline script in `index.html` sets the class before React loads to prevent flash.

**shadcn/ui specifics:** Uses Tailwind v4 (`@tailwindcss/vite` plugin, not PostCSS). The `@theme inline` block in `index.css` maps CSS variables to Tailwind color utilities. shadcn components use `@base-ui/react` primitives — `DialogTrigger` takes a `render` prop, not `asChild`:
```tsx
<DialogTrigger render={<Button variant="ghost" size="icon" />}>
```

**Domain types** are in `src/types.ts`. Key subtlety: `billingMonth` (1–12) is only present on annually-billed subscriptions; legacy data without it falls back to the `createdAt` month. `nextPaymentDate` in `src/lib/utils.ts` uses a `clampedDate` helper to handle day 29–31 in short months.
