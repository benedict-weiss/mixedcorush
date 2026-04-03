# Mixed Company Rush App: Claude Code Brief

Build a secure web app for Mixed Company of Yale to manage rush and auditions.

This app replaces a manual workflow currently handled through forms, spreadsheets, and email. It should support about 100 to 150 rushees per cycle.

## Product Scope

There are two user types:
- rushees
- admins

Rushees need to:
- sign up
- log in
- view a dashboard
- claim, release, and change audition slots
- view audition materials
- read FAQs

Admins need to:
- view and manage rushees
- assign voice parts
- create audition blocks and auto-generate slots
- manage materials
- manage FAQs

## Security Priorities

Optimize for the most secure practical implementation.

Requirements:
- use Supabase Auth for email/password authentication
- do not build custom JWT auth
- do not store password hashes in app tables
- enforce authorization on the server
- validate all inputs server-side
- restrict all admin operations to server-side role checks
- configure the app so it is production-safe on Vercel
- design with custom SMTP in mind for production signup volume

## Technical Constraints

Use only:
- Next.js App Router
- Supabase
- Vercel

Do not use:
- Prisma
- any ORM
- custom auth middleware built around homemade tokens
- local file storage
- Vercel Blob

Use:
- Supabase Auth for identity and sessions
- Supabase Postgres for app data
- Supabase Storage for files
- Supabase JS client for data access

## Data Model

Create these tables:

### `users`
- `id` UUID primary key, tied to Supabase auth user ID
- `email` unique
- `name`
- `role` with values `RUSHEE` or `ADMIN`
- `voice_part` nullable
- `created_at`

### `audition_blocks`
- `id`
- `date`
- `start_time`
- `end_time`
- `slot_duration`
- `created_at`

### `audition_slots`
- `id`
- `block_id`
- `start_time`
- `end_time`
- `rushee_id` nullable UUID

Rules:
- one rushee can hold at most one slot at a time
- claiming a new slot should release the prior slot

### `audition_materials`
- `id`
- `title`
- `voice_part`
- `file_type`
- `file_name`
- `storage_path`
- `uploaded_at`

### `faqs`
- `id`
- `question`
- `answer`
- `sort_order`

## Required Pages

- `/`
- `/login`
- `/dashboard`
- `/schedule`
- `/materials`
- `/faq`
- `/admin`
- `/admin/rushees`
- `/admin/slots`
- `/admin/materials`
- `/admin/faqs`

## Required Features

### Rushee
- sign up
- log in
- persistent secure session
- dashboard with voice part and audition status
- slot claim/release/change flow
- materials access
- FAQ access

### Admin
- admin-only dashboard
- rushee management
- voice part assignment
- audition block creation and deletion
- material upload and deletion
- FAQ CRUD and reordering

## Access Control Expectations

- all privileged checks happen server-side
- do not trust the client for role or identity
- use the auth session plus app profile role
- choose a simple, defensible authorization model
- prefer secure defaults

## File Handling

Use Supabase Storage.

Requirements:
- only admins can upload
- validate file type and size
- support PDF and audio files
- use predictable internal paths
- expose files to rushees securely

## UX Expectations

- keep the app simple and clear
- mobile-friendly
- bold but restrained design
- clear state around slot availability
- concise error handling without leaking internal details

## Production Requirements

Must work cleanly on Vercel.

Expected env vars:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Do not depend on:
- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`

## Build Order

Implement in this order:
1. auth and session handling
2. user profile sync and role model
3. rushee dashboard and schedule flow
4. materials and FAQ
5. admin tooling
6. storage integration
7. production hardening

## Guardrails

- do not add Prisma
- do not add a custom auth system
- do not mix numeric IDs with UUIDs
- do not trust client-side auth checks
- do not expose service-role credentials to the browser
- do not return raw internal errors to users
- do not optimize for abstraction over clarity

## Deliverable

A production-ready secure rush management app using only Supabase and Vercel, with a working rushee flow, a working admin flow, and security-sensitive decisions made conservatively.
