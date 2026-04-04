# Mixed Company Rush App — Build Progress

**GitHub:** https://github.com/benedict-weiss/mixedcorush  
**Plan:** `docs/superpowers/plans/2026-04-03-mixedcorush.md`  
**Spec:** `docs/superpowers/specs/2026-04-03-mixedcorush-design.md`  
**Working directory:** `/Users/benweiss/mixedcorush`

## How to Resume

1. Read this file to see which tasks are done
2. Read the plan at `docs/superpowers/plans/2026-04-03-mixedcorush.md`
3. Find the first task that is not ✅ Done
4. Dispatch an implementer subagent with the full task text from the plan
5. Run spec compliance review, then code quality review
6. Mark the task done here and push to GitHub

## Task Status

| # | Task | Status | Commit |
|---|------|--------|--------|
| 1 | Project Scaffold | ✅ Done | 8750b54 |
| 2 | Database Schema, RLS, and Functions | ✅ Done | 022502b |
| 3 | Supabase Clients and Auth Utilities | ✅ Done | f80bf3f |
| 4 | Auth Server Actions | ✅ Done | 8084ddb |
| 5 | Auth Pages (Landing + Login/Signup) | ✅ Done | 6269620 |
| 6 | Rushee Dashboard | ⏳ Pending | — |
| 7 | Schedule Page (Slot Claim/Release) | ⏳ Pending | — |
| 8 | Materials and FAQ Pages | ⏳ Pending | — |
| 9 | Admin Layout and Dashboard | ⏳ Pending | — |
| 10 | Admin — Manage Rushees | ⏳ Pending | — |
| 11 | Admin — Manage Slots | ⏳ Pending | — |
| 12 | Admin — Manage Materials (with Storage) | ⏳ Pending | — |
| 13 | Admin — Manage FAQs | ⏳ Pending | — |
| 14 | Production Hardening | ⏳ Pending | — |

## Notes

- All tasks depend on Task 2 (DB schema) being applied manually in Supabase dashboard
- Task 2 is SQL-only — no code changes, but SQL must be run before Task 3 onwards will work
- Admin accounts: sign up normally, then set `role = 'ADMIN'` in Supabase table editor
- Env vars needed in `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **shadcn/ui style is `base-nova` (Base UI primitives)** — not the Radix-backed Default style. All future `shadcn add` commands will use this style.
- **Stack is Next.js 16.2.2 + Tailwind v4** — future tasks must use Tailwind v4 CSS-based config (no `tailwind.config.ts`, use `@theme` directive in CSS)
- **Use `proxy.ts` (not `middleware.ts`)** for request interception/session refresh in Next.js 16+
- **`claim_slot` RPC takes only `p_slot_id`** — rushee ID derived from `auth.uid()` internally. Must be called via the **user session client** (`createClient()` from `lib/supabase/server.ts`), NOT the admin client. Plan updated to reflect this.
