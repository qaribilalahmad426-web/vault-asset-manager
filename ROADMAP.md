# Implementation Roadmap — Personal AI Asset Manager

This is the living plan for the full build. Each phase is designed to be
complete and functional on its own, and to integrate cleanly with the next.

## Phase 1 — Foundation (this delivery)
- [x] Project scaffolding: Next.js 15 App Router, TypeScript strict, Tailwind, ESLint
- [x] Design system: tokens, dark/light theme, base primitives (button, card, input, badge, dialog, dropdown, progress, tabs)
- [x] Full Prisma schema: Users, Assets, Categories, Credits, Attachments, Reminders, CalendarEvents, CustomFields, ActivityLog
- [x] Auth: Better Auth (email/password + session), protected route group
- [x] Encryption utilities for secrets (API keys, license keys) — AES-256-GCM at rest
- [x] App shell: collapsible sidebar, topbar, command palette shortcut, theme toggle
- [x] Dashboard page wired to real data: stat cards, upcoming renewals, spending snapshot
- [x] Assets module: list (table + card view), create/edit form (React Hook Form + Zod), detail drawer, delete/archive/favorite actions, days-remaining + status color logic
- [x] Server actions layer + Zod validation schemas shared client/server
- [x] Zustand store for UI state (sidebar, view mode, filters)
- [x] Seed script with realistic sample data
- [x] README, SETUP.md, .env.example, architecture notes

## Phase 2 — Analytics & Money
- Recharts-powered spending dashboards (monthly/yearly/category/vendor)
- Forecast & "unused subscription" waste detection heuristics
- Budget tracking, savings vs. last period
- CSV/Excel/JSON export of reports

## Phase 3 — Credits, Calendar & Reminders
- Credit tracking UI (daily/monthly/lifetime, resets, progress bars, auto-reset cron)
- Interactive calendar (renewals, resets, invoices, custom events) via a lightweight calendar component
- Reminder engine (30/14/7/3/1-day + custom) with in-app notification center; email-ready interface

## Phase 4 — Attachments, Import/Export & Search
- File attachments (invoices, receipts, screenshots) via S3-compatible storage adapter
- Global search (Postgres full-text) + advanced filter/sort bar
- CSV/Excel/JSON import with column mapping + validation preview
- Bulk actions (duplicate, archive, export selection)

## Phase 5 — Integrations & AI Hooks
- Pluggable "integration provider" interface (Stripe, Paddle, Gmail, Slack, Zapier, n8n, GitHub, etc.) — adapters stubbed behind a clean interface, not fake UI
- AI module interface (waste detection, duplicate detection, invoice OCR) — designed so a real model call can be dropped in
- Hardening pass: rate limiting, audit log viewer, accessibility & Lighthouse pass, full QA checklist

---

**Status:** Phase 1 delivered below. Say "continue" or name a phase to keep going.
