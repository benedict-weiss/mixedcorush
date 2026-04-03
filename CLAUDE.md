# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mixed Company Rush App — a secure audition scheduling web app for Mixed Company of Yale. Replaces a manual workflow (forms, spreadsheets, email) for ~100–150 rushees per rush cycle. Full spec in `mixedco-rush-secure-prd.md`, implementation brief in `mixedco-rush-claude-code-brief.md`.

## Tech Stack

- **Framework**: Next.js App Router (no Pages Router)
- **Auth & DB**: Supabase (Auth + Postgres + Storage)
- **Deploy**: Vercel

Nothing else. No Prisma, no ORMs, no custom auth, no Vercel Blob, no local file storage.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Never use `DATABASE_URL`, `DIRECT_URL`, or `JWT_SECRET`. Service role key is server-only — never expose to the browser.

## Architecture Decisions

### Auth
- Supabase Auth with email/password only (no social login)
- Sessions via secure httpOnly cookies (Supabase SSR helpers)
- No custom JWT implementation
- No password hashes in app tables

### Authorization
- Two roles: `RUSHEE` and `ADMIN`
- Role stored in `users` table (app profile), keyed to auth user UUID
- **All role checks happen server-side** — never trust client payloads or client-side role state
- Admin accounts cannot be self-registered through public UI

### Data Access
- Use Supabase JS client (not raw SQL connections)
- Row Level Security where practical
- Service role key only used in server-side code (Route Handlers, Server Actions, Server Components)
- Anon key used client-side, scoped by RLS

### File Handling
- Supabase Storage only
- Admins upload; rushees get controlled/signed access
- Validate MIME type and file size server-side before storage operations
- Allowed types: PDF and audio files

## Data Model

```
users(id UUID PK = auth.uid, email, name, role ENUM('RUSHEE','ADMIN'), voice_part nullable, created_at)
audition_blocks(id, date, start_time, end_time, slot_duration, created_at)
audition_slots(id, block_id FK, start_time, end_time, rushee_id nullable UUID FK)
audition_materials(id, title, voice_part, file_type, file_name, storage_path, uploaded_at)
faqs(id, question, answer, sort_order)
```

Key constraint: one rushee can hold at most one slot at a time. Claiming a new slot must atomically release the prior one (enforce server-side, ideally via DB transaction or RPC).

## Pages

```
/                    Landing
/login               Login + signup
/dashboard           Rushee dashboard
/schedule            Slot claim/release/change
/materials           File access
/faq                 FAQ list
/admin               Admin dashboard (stats)
/admin/rushees       Manage rushees, assign voice parts
/admin/slots         Manage audition blocks and slots
/admin/materials     Upload/delete materials
/admin/faqs          CRUD + reorder FAQs
```

## Build Order

Implement in this sequence — each phase depends on the previous:

1. Auth and session handling (Supabase SSR setup, login/signup pages)
2. User profile sync and role model (`users` table, profile creation on signup)
3. Rushee dashboard and schedule flow (slot claim/release/change)
4. Materials and FAQ (read access for rushees)
5. Admin tooling (all `/admin/*` pages)
6. Storage integration (file upload/download with Supabase Storage)
7. Production hardening (error handling, RLS audit, env validation)

## Security Non-Negotiables

- Return generic error messages to users — never expose stack traces or internal details
- All writes are authorized server-side before execution
- All inputs validated server-side (don't trust client-provided data)
- Admin-only operations double-check role in the server handler, not just middleware
- No `SUPABASE_SERVICE_ROLE_KEY` usage in client components or browser-reachable code
