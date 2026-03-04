# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Partiful-inspired event planning SPA built as a portfolio piece. See `docs/plans/2026-03-04-architecture-design.md` for full design decisions.

## Commands

```bash
npm run dev          # start dev server (http://localhost:5173)
npm run build        # production build (outputs to dist/)
npm run preview      # serve production build locally (http://localhost:4173)
npm run test         # unit tests in watch mode (Vitest)
npm run test:run     # unit tests single run
npm run test:e2e     # E2E tests (Playwright, requires built app)
npm run lint         # ESLint
```

To run a single unit test file: `npm run test:run src/sdk/events.test.ts`

Regenerate Supabase types after schema changes:
```bash
SUPABASE_ACCESS_TOKEN=<token> npx supabase gen types typescript --project-id lspwjortevrlkklnykgy > src/sdk/types.ts
# Then re-append the convenience aliases at the bottom of src/sdk/types.ts
```

## Stack

- **Frontend:** React 19 + Vite 7, TypeScript (strict)
- **Routing:** React Router v7 with `HashRouter` (required for GitHub Pages)
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite` plugin, `@import "tailwindcss"` syntax) + shadcn/ui (New York style)
- **Animations:** Framer Motion
- **Backend:** Supabase (Auth, Postgres, Realtime, Storage) — no custom backend
- **Hosting:** GitHub Pages via GitHub Actions

## Architecture

**No backend server.** The browser talks directly to Supabase for everything. All permissions enforced via Postgres Row Level Security.

**SDK wrapper pattern:** The app never imports from `@supabase/supabase-js` directly — only `src/supabase.ts` does. All data access goes through `src/sdk/`:
- `sdk/events.ts`, `sdk/rsvps.ts`, `sdk/posts.ts`, `sdk/boops.ts`, `sdk/profiles.ts` — typed CRUD
- `sdk/realtime.ts` — Supabase Realtime subscriptions
- `sdk/types.ts` — generated Database type + convenience aliases (`Event`, `Rsvp`, `EventPost`, etc.)

**Auth:** Magic link email via Supabase Auth. Session in localStorage. `src/hooks/useAuth.ts` wraps the session. `src/components/RequireAuth.tsx` guards protected routes.

**Routes (HashRouter):**
- `/#/` — HomePage (auth required)
- `/#/e/:token` — EventPage (public, token = `invite_link_token` not UUID)
- `/#/e/:token/edit` — EventEditPage (host only, auth-checked client-side + RLS)
- `/#/e/new/edit` — EventEditPage in create mode
- `/#/profile` — ProfilePage
- `/#/login` — AuthPage

**Realtime:** `useEvent` hook subscribes to RSVP changes for live count updates. `ActivityFeed` subscribes to posts and boops. Subscriptions cleaned up on unmount.

## Key Conventions

- Mobile-first. All touch targets `min-h-[44px]`.
- Dark theme: `bg-black`, `bg-zinc-900`, `text-white`, `text-zinc-400`.
- `@/` path alias maps to `src/` (configured in both `vite.config.ts` and `tsconfig.app.json`).
- Vitest test files: `*.test.ts(x)` in `src/`. Playwright E2E tests: `e2e/*.spec.ts`.
- `e2e/` is excluded from Vitest via `vite.config.ts` exclude list.
- `vite.config.ts` imports `defineConfig` from `vitest/config` (not `vite`) for proper `test` typing.
- Base path is `/partiful-claude/` in production (set in `vite.config.ts`).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:
- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Supabase publishable/anon key

GitHub Actions secrets also need `SUPABASE_SERVICE_ROLE_KEY` for E2E seed scripts.

## Database

Supabase project: `lspwjortevrlkklnykgy`
Schema migration: `supabase/migrations/20260304000000_initial_schema.sql`
Tables: `profiles`, `events`, `rsvps`, `event_posts`, `boops`
Realtime enabled on: `rsvps`, `event_posts`, `boops`
