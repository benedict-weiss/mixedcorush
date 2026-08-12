-- Ensure the materials bucket exists and is private (signed URLs only)
INSERT INTO storage.buckets (id, name, public)
VALUES ('materials', 'materials', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- No storage.objects policies: with RLS enabled and no policies, anon/authenticated
-- clients cannot read or write objects directly. All access goes through the
-- service role (server-side uploads and signed URL generation).

-- Bound the profile name copied from signup metadata. The app validates name
-- length, but the anon key is public and supabase.auth.signUp can be called
-- directly with arbitrary metadata, bypassing app-level validation.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    LEFT(COALESCE(NEW.raw_user_meta_data->>'name', ''), 100),
    'RUSHEE'
  );
  RETURN NEW;
END;
$$;
