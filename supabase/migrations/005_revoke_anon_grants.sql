-- All reads happen as authenticated users; anon needs no table access.
-- RLS already returns zero rows to anon, but revoking SELECT also hides the
-- schema from unauthenticated GraphQL/REST introspection.
REVOKE SELECT ON users, audition_blocks, audition_slots, audition_materials, faqs FROM anon;

-- handle_new_user is a trigger function; it should never be callable via RPC
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;

-- claim_slot is called by signed-in users only; it already rejects anon
-- callers internally, but remove the anon entry point entirely
REVOKE EXECUTE ON FUNCTION public.claim_slot(uuid) FROM anon, public;
