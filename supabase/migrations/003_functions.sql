-- Trigger function: auto-create a users profile row on auth signup
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
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    'RUSHEE'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- RPC: atomically release prior slot and claim a new one
-- Derives the caller's identity from auth.uid() internally — never accepts a rushee ID
-- from the caller, so this cannot be spoofed even if the RPC endpoint is publicly reachable.
CREATE OR REPLACE FUNCTION claim_slot(p_slot_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rushee_id UUID;
BEGIN
  v_rushee_id := auth.uid();

  IF v_rushee_id IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  -- Release any slot currently held by this rushee
  UPDATE audition_slots
  SET rushee_id = NULL
  WHERE rushee_id = v_rushee_id;

  -- Claim the target slot if it is still available
  UPDATE audition_slots
  SET rushee_id = v_rushee_id
  WHERE id = p_slot_id
    AND rushee_id IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'slot_unavailable';
  END IF;
END;
$$;
