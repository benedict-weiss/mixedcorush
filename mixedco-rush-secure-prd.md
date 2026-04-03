# PRD: Mixed Company Rush App

## Overview

Build a secure web app for Mixed Company of Yale to manage rush and auditions.

The app replaces a manual workflow currently handled through forms, spreadsheets, and email. It should support roughly 100 to 150 rushees per cycle.

There are two user types:
- Rushees
- Admins

Rushees should be able to:
- create an account
- log in securely
- view their dashboard
- claim or change an audition slot
- access audition materials
- read FAQs

Admins should be able to:
- manage rushees
- assign voice parts
- create and manage audition blocks
- upload and manage materials
- create, edit, delete, and reorder FAQs

## Product Goals

- Replace manual rush coordination with a single secure tool
- Minimize privacy and security risk around user accounts and audition data
- Keep the user experience simple for rushees
- Give admins a practical operational dashboard
- Ensure the app is production-ready and safe to deploy

## Core Principles

- Security takes priority over convenience
- Minimize attack surface
- Use managed auth and managed storage
- Avoid storing secrets or sensitive auth logic in application code
- Enforce authorization on the server
- Validate all user input on the server
- Ship the simplest secure version first

## Users

### Rushee
A student going through rush.

Needs:
- easy signup and login
- clear scheduling flow
- access to materials and FAQs
- confidence that their account and audition info are private

### Admin
A Mixed Company member managing rush.

Needs:
- clear overview of all rushees
- ability to assign voice parts
- tools to manage slots, materials, and FAQs
- secure access to admin-only functionality

## Authentication And Authorization

### Authentication
Use Supabase Auth with email/password.

Requirements:
- secure signup
- secure login
- secure logout
- server-side session handling
- no custom JWT implementation
- no password hashes stored in app-owned tables

### Authorization
Use an app-level profile table with a `role` field.

Roles:
- `RUSHEE`
- `ADMIN`

Requirements:
- admin access must be enforced server-side
- do not trust client-side role checks
- do not trust request payloads for role information
- protected routes must verify both authentication and authorization
- admin accounts must not be self-registerable through the public UI

### Security requirements for auth
- use secure, httpOnly cookies
- use CSRF-safe patterns for auth/session handling
- use rate limiting or provider defaults where appropriate
- configure custom SMTP before production launch
- provide a secure admin bootstrap path

## Data Model

## `users`
App profile table keyed by auth user ID.

Fields:
- `id` UUID primary key
- `email` unique
- `name`
- `role`
- `voice_part` nullable
- `created_at`

Rules:
- auth provider is the source of truth for identity
- app profile stores application metadata only
- `id` must be the auth user UUID everywhere

## `audition_blocks`
Fields:
- `id`
- `date`
- `start_time`
- `end_time`
- `slot_duration`
- `created_at`

## `audition_slots`
Fields:
- `id`
- `block_id`
- `start_time`
- `end_time`
- `rushee_id` nullable UUID

Rules:
- one rushee can hold at most one slot
- a slot belongs to one block
- claiming a new slot releases any previous slot held by that rushee

## `audition_materials`
Fields:
- `id`
- `title`
- `voice_part`
- `file_type`
- `file_name`
- `storage_path`
- `uploaded_at`

## `faqs`
Fields:
- `id`
- `question`
- `answer`
- `sort_order`

## Functional Requirements

## Rushee Experience

### Landing page
- simple intro
- login/signup CTA

### Login / Signup
- signup fields:
  - name
  - email
  - password
- login fields:
  - email
  - password
- clear error messages
- no leaking of sensitive internal errors to users

### Dashboard
Show:
- welcome message
- assigned voice part or pending
- audition slot or unscheduled
- links to schedule, materials, and FAQ

### Schedule
- list audition days and slots
- show availability clearly
- allow claiming a slot
- allow releasing/changing a slot
- enforce one-slot-per-rushee rule on the server

### Materials
- view all relevant materials
- support PDF and audio files
- allow secure access to files
- do not expose admin-only storage operations to rushees

### FAQ
- show ordered FAQ list

## Admin Experience

### Admin Dashboard
Show:
- total rushees
- scheduled vs unscheduled
- unassigned voice parts

### Manage Rushees
- list all rushees
- search/filter if practical
- assign voice part
- view audition slot

### Manage Slots
- create audition blocks
- auto-generate slots
- view claimed/available counts
- delete blocks

### Manage Materials
- upload files
- assign title and voice part
- list existing materials
- delete materials

### Manage FAQs
- create FAQ
- edit FAQ
- delete FAQ
- reorder FAQs

## Security Requirements

### General
- all writes must be authorized server-side
- all inputs must be validated server-side
- all file uploads must be validated by type and size
- all privileged operations must be restricted to admins
- secrets must never be exposed to the client
- service-role credentials must only be used server-side
- avoid returning stack traces or internal errors to users

### Data access
- use the most restrictive access model that still allows development speed
- prefer Row Level Security where practical and understandable
- if any server-side bypass exists for admin operations, keep it isolated and minimal
- public access should be disabled by default unless explicitly intended

### File security
- use managed storage
- restrict upload capability to admins
- validate allowed MIME types and extensions
- enforce size limits
- avoid predictable public write paths
- prefer signed or controlled access where appropriate

### Operational security
- configure production env vars correctly before launch
- use separate development and production environments
- configure custom SMTP for production signup flow
- ensure logs do not leak secrets or personal data

## Privacy Requirements

- store only data needed for rush operations
- protect personal information such as names, emails, voice parts, and audition slots
- avoid unnecessary retention of sensitive data
- keep access to rushee data restricted to authorized admins

## UX Priorities

- simple, clear, low-friction flows
- mobile-friendly
- fast admin operations
- strong but restrained branding
- clear success/error states
- no confusing state around slot ownership

## Environment Requirements

Expected environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:
- storage bucket names
- app URL
- SMTP-related configuration handled in provider/dashboard as needed

Do not rely on:
- custom JWT secrets
- local password storage
- fragile custom auth middleware

## Non-Goals

- social login
- native mobile app
- payments
- multi-tenant support
- public community features
- unnecessary infrastructure complexity

## Acceptance Criteria

### Authentication
- rushee can sign up
- rushee can log in
- rushee can log out
- session persists securely
- admin login works
- admin creation is not exposed through public signup

### Rushee Flow
- rushee can view dashboard
- rushee can view current voice part status
- rushee can claim one slot
- rushee can release/change slot
- rushee can access materials
- rushee can read FAQs

### Admin Flow
- admin can access admin-only areas
- admin can assign voice parts
- admin can create/delete audition blocks
- admin can upload/delete materials
- admin can create/edit/delete/reorder FAQs

### Security
- non-admin users cannot access admin functionality
- invalid or unauthorized requests are rejected server-side
- file uploads are validated
- no auth secrets are exposed client-side
- no password data is stored outside the auth provider
- production errors are handled safely and do not expose internals

### Production Readiness
- app works in production
- signup and login function correctly
- admin tools function correctly
- no production crashes caused by missing auth or database configuration
- email delivery is production-capable via custom SMTP

## Build Guidance

Build the simplest secure version first:
1. authentication
2. profile/role model
3. scheduling
4. materials
5. FAQs
6. admin tools
7. production hardening

Make security-sensitive choices conservatively.
Do not add custom auth logic unless absolutely required.
Do not trade server-side authorization for client-side convenience.
