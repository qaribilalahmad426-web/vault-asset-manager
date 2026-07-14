# Vault — Personal AI Asset Manager

Your digital headquarters for every AI tool, SaaS subscription, API, domain,
and license you pay for: what's active, what's expiring, what it's costing
you, and what you can probably cancel.

This is being built in phases (see [`ROADMAP.md`](./ROADMAP.md)). This
delivery includes **Phase 1 (foundation)** and **Phase 3's calendar and
notifications**, pulled forward because they're small, self-contained, and
high-value.

## What's included right now

- **Auth** — email/password via Better Auth, sessions stored in Postgres
- **Assets** — full CRUD with categories, billing details, encrypted
  license/API keys, tags, priority, favorites, quick actions (duplicate,
  archive, delete, copy secret, open website/billing)
- **Dashboard** — 10 live stat cards computed from your real data (active
  count, expired, renewing this week/month, monthly/yearly spend, average
  cost, stored licenses, credits remaining, possibly-unused subscriptions)
- **Renewal calendar** — month grid with urgency dot indicators and a
  click-to-open popover per day (tool, price, email used, quick actions)
- **Notification bell** — computed in real time from renewal/expiry/credit
  dates, with mark-as-read / dismiss (kept in a client store for now — see
  roadmap for the persisted version)
- **Settings** — profile summary + notification preferences
- **Dark/light theme**, responsive layout, command-palette-ready search bar

## Tech stack & why

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) + React 19 + TypeScript (strict) | Server Actions remove the need for a separate API layer for CRUD |
| Styling | Tailwind + a small shadcn/ui-style primitive set (Radix underneath) | Full control over the design tokens instead of a generic admin theme |
| Database | PostgreSQL + Prisma | Typed queries, easy migrations, mature ecosystem |
| Auth | **Better Auth** | See `src/lib/auth.ts` for the full reasoning — short version: it's open-source, typed, and maps directly onto the same Postgres database as everything else, unlike Clerk (hosted/closed) or the extra adapter ceremony Auth.js needs with Server Actions |
| Validation | Zod | One schema (`src/features/assets/schema.ts`) shared by the form and the server action — they cannot drift |
| Forms | React Hook Form | Minimal re-renders on a form with 30+ fields |
| State | Zustand | Sidebar/view-mode/filters/notifications — anything that needs to survive a navigation without a server round trip |
| Charts | Recharts (wired in Phase 2) | Already a dependency; analytics dashboards land next |

## Project structure

```
src/
  app/                    # Routes only — no business logic lives here
    (auth)/               # sign-in, sign-up
    (dashboard)/          # dashboard, assets, settings — behind requireSession()
    api/auth/[...all]/    # Better Auth's catch-all handler
  features/               # Business logic, grouped by domain
    assets/                actions.ts (server actions), schema.ts (Zod), components/
    categories/
    dashboard/              aggregation queries for the stat cards + calendar feed
    notifications/          computed alerts
    settings/
    auth/
  components/
    ui/                    # Primitives: button, card, dialog, select, popover, ...
    layout/                # Sidebar, Topbar
    dashboard/             # StatCard, RenewalCalendar, NotificationBell
    assets/                # CountdownBadge
  lib/                     # prisma client, auth config, encryption, session helper, utils
  store/                   # Zustand (ui-store.ts)
  types/                   # Shared frontend types
prisma/
  schema.prisma            # Full data model — see comments at the top of the file
  seed.ts                  # Sample data for an existing user
```

## Security

- **Secrets never touch the database in plaintext.** License keys, API keys,
  and notes are encrypted with AES-256-GCM (`src/lib/encryption.ts`) before
  they're written, and only decrypted server-side for the authenticated
  owner (e.g. the "copy API key" action).
- **Every query is scoped to the authenticated user.** Server actions call
  `requireSession()` and filter every Prisma query by `userId`; there is no
  endpoint that returns another user's data.
- **Money is stored as integer cents**, never floats, to avoid rounding
  drift in spend totals.
- Session cookies are managed by Better Auth (httpOnly, rotated on a 30-day
  expiry with daily refresh).

## Setup

See the step-by-step guide at the end of the assistant's message for the
fastest path. In short:

```bash
npm install
cp .env.example .env        # fill in DATABASE_URL, BETTER_AUTH_SECRET, ENCRYPTION_KEY
npx prisma generate
npx prisma db push
npm run dev
```

Then visit `http://localhost:3000`, sign up, and optionally run
`npm run db:seed` to populate sample assets for the account you just created.

## Known Phase-1 scope boundaries

These are intentional, not bugs — they're on the roadmap:

- Credit balances have a data model and show up in notifications, but there's
  no dedicated Credits UI yet (Phase 3).
- Attachments (receipts/invoices/screenshots) have a schema but no upload UI
  yet (Phase 4) — needs a storage adapter decision (S3-compatible) first.
- Analytics charts, CSV/Excel/JSON import/export, and the integration
  adapters (Stripe, Gmail, Slack, etc.) are Phase 2/4/5.
- Notification read/dismiss state is client-side (Zustand) for now; a
  persisted reminder log with real email delivery is Phase 3.
