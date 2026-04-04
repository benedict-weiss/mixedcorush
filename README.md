# Mixed Company Rush App

A secure audition scheduling web app for [Mixed Company of Yale](https://mixedcompanyofyale.com). Replaces a manual workflow (forms, spreadsheets, email) for ~100–150 rushees per rush cycle.

## Features

**Rushees** can:
- Sign up and log in securely
- View their dashboard (voice part status, audition slot)
- Claim, release, or change an audition slot
- Access audition materials (PDFs and audio)
- Read FAQs

**Admins** can:
- View rush stats (total rushees, scheduled/unscheduled, unassigned voice parts)
- Manage rushees and assign voice parts
- Create and manage audition blocks and slots
- Upload and delete materials
- Create, edit, delete, and reorder FAQs

## Tech Stack

- **Framework**: Next.js App Router
- **Auth & DB**: Supabase (Auth + Postgres + Storage)
- **Deploy**: Vercel

## Getting Started

### Prerequisites

- Node.js 20+
- A Supabase project

### Environment Variables

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

The service role key is server-only — never expose it to the browser.

### Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Login and signup |
| `/dashboard` | Rushee dashboard |
| `/schedule` | Claim / release / change audition slot |
| `/materials` | Audition materials |
| `/faq` | FAQ list |
| `/admin` | Admin dashboard |
| `/admin/rushees` | Manage rushees, assign voice parts |
| `/admin/slots` | Manage audition blocks and slots |
| `/admin/materials` | Upload and delete materials |
| `/admin/faqs` | CRUD and reorder FAQs |

## Data Model

```
users(id, email, name, role, voice_part, created_at)
audition_blocks(id, date, start_time, end_time, slot_duration, created_at)
audition_slots(id, block_id, start_time, end_time, rushee_id)
audition_materials(id, title, voice_part, file_type, file_name, storage_path, uploaded_at)
faqs(id, question, answer, sort_order)
```

One rushee can hold at most one slot at a time. Claiming a new slot atomically releases the prior one.

## Security

- All authorization enforced server-side
- Role checks never trust client payloads
- Admin accounts cannot be self-registered through the public UI
- Service role key used only in server-side code
- File uploads validated by MIME type and size before storage
- No stack traces or internal errors returned to users
