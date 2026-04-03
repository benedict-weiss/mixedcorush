# Mixed Company Rush App — Design Spec

**Date:** 2026-04-03
**Status:** Approved

## Overview

A secure audition scheduling web app for Mixed Company of Yale. Replaces a manual workflow (forms, spreadsheets, email) for ~100–150 rushees per rush cycle. Two user types: Rushee and Admin.

## Tech Stack

- **Framework:** Next.js App Router (Vercel)
- **Auth + DB + Storage:** Supabase (`@supabase/ssr` for cookie-based sessions)
- **UI:** Tailwind CSS + shadcn/ui (basic, improvable later)

No Prisma, no ORMs, no custom auth, no Vercel Blob, no local file storage.

## Architecture

```
Browser
  ↓ (httpOnly cookie session)
Next.js App Router (Vercel)
  ├── Server Components → Supabase anon client + RLS (rushee reads)
  ├── Server Actions / Route Handlers → Supabase service role (all writes, all admin ops)
  └── Client Components → UI state only, no direct Supabase calls
        ↓
Supabase
  ├── Auth (email/password, session cookies via @supabase/ssr)
  ├── Postgres (users, audition_blocks, audition_slots, audition_materials, faqs)
  └── Storage (materials bucket, private, signed URLs for rushee access)
```

**Key rules:**
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` used in Server Components for RLS-scoped reads only
- `SUPABASE_SERVICE_ROLE_KEY` used only in Server Actions and Route Handlers, never imported client-side
- Every Server Action verifies `auth.getUser()` + `users.role` before any privileged operation
- Slot claim/release is an atomic Postgres RPC

## Authorization Model (Option C — Hybrid)

RLS handles rushee-to-rushee data isolation. Service role handles all admin operations server-side.

- Rushee reads use the anon client scoped by RLS (`auth.uid()`)
- Admin operations always use the service role key in server code
- No middleware-based auth — checks happen at the data layer in each route via a shared `getAuthenticatedUser()` server utility

## Auth & Session Flow

**Signup:**
1. Rushee submits name + email + password
2. Server Action calls `supabase.auth.signUp()`
3. Postgres trigger (`after insert on auth.users`) creates a `users` row with `role = 'RUSHEE'`
4. User confirms email, redirected to `/dashboard`

**Login:**
1. Server Action calls `supabase.auth.signInWithPassword()`
2. Session cookie set by `@supabase/ssr`
3. Redirect to `/dashboard`

**Admin promotion:**
- Admin signs up normally via public UI
- An existing admin (or developer) manually sets `role = 'ADMIN'` in the Supabase table editor
- No UI for this — intentional, keeps admin creation out of the app

## Data Model

```sql
users(
  id UUID PRIMARY KEY,         -- equals auth.uid()
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,          -- 'RUSHEE' | 'ADMIN'
  voice_part TEXT,             -- nullable
  created_at TIMESTAMPTZ DEFAULT now()
)

audition_blocks(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration INT NOT NULL,  -- minutes
  created_at TIMESTAMPTZ DEFAULT now()
)

audition_slots(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL REFERENCES audition_blocks(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  rushee_id UUID REFERENCES users(id) ON DELETE SET NULL
)

audition_materials(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  voice_part TEXT NOT NULL,
  file_type TEXT NOT NULL,     -- 'pdf' | 'audio'
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
)

faqs(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL
)
```

## RLS Policies

| Table | Policy |
|---|---|
| `users` | `SELECT` where `auth.uid() = id` |
| `audition_slots` | `SELECT` for all authenticated users |
| `audition_blocks` | `SELECT` for all authenticated users |
| `audition_materials` | `SELECT` for all authenticated users |
| `faqs` | `SELECT` for all authenticated users |
| All tables | No anon INSERT/UPDATE/DELETE — service role only |

## Slot Claiming

Handled by a Postgres RPC `claim_slot(p_slot_id uuid, p_rushee_id uuid)` that:
1. Releases any slot currently held by `p_rushee_id`
2. Claims `p_slot_id` for `p_rushee_id` if it is available
3. Raises an exception if the slot is already taken

Called from a Server Action that first verifies the authenticated user via `auth.getUser()`. The `p_rushee_id` parameter is always sourced from the server session — never from the request body.

## Storage

- Bucket: `materials` (private)
- Upload: admin-only Server Action; validates MIME type and extension before storing
  - PDF: `application/pdf`, `.pdf`, ≤ 20MB
  - Audio: `audio/mpeg`, `audio/mp4`, `audio/wav`, `.mp3`, `.m4a`, `.wav`, ≤ 50MB
- Access: server-side generates signed URLs (1-hour expiry) on rushee request; no direct bucket access from client
- Paths: `{voice_part}/{uuid}-{filename}`

## Pages

### Rushee

| Route | Description |
|---|---|
| `/` | Landing page with login/signup CTA |
| `/login` | Combined login + signup tabs |
| `/dashboard` | Voice part status, slot status, nav links |
| `/schedule` | Slots grouped by date; claim/release |
| `/materials` | List materials; click generates signed URL |
| `/faq` | Ordered FAQ list |

### Admin (all verify `role = 'ADMIN'` server-side)

| Route | Description |
|---|---|
| `/admin` | Stats: total rushees, scheduled %, unassigned voice parts |
| `/admin/rushees` | Rushee table with inline voice part assignment |
| `/admin/slots` | Create blocks (auto-generates slots), view fill rate, delete |
| `/admin/materials` | Upload/delete files with title + voice part |
| `/admin/faqs` | Create/edit/delete/reorder FAQs |

## Slot UX

- Slots listed by date in a simple list
- Available slots and rushee's current slot clearly distinguished
- Claim button on any available slot → Server Action → `claim_slot()` RPC → page revalidated
- Claiming a new slot automatically releases the old one (no confirmation required)

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

No `DATABASE_URL`, `DIRECT_URL`, or `JWT_SECRET`.

## Build Order

1. Project scaffold + Supabase client setup
2. Database schema + RLS + `claim_slot` RPC + auth trigger
3. Auth flow (signup, login, logout, session utilities)
4. Rushee dashboard + schedule (slot claim/release)
5. Materials + FAQ (rushee read access)
6. Admin tooling (all `/admin/*` pages)
7. Storage integration (upload, signed URL access)
8. Production hardening (error handling, env validation, RLS audit)
