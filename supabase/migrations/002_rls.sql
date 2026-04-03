-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audition_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audition_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE audition_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- users: a rushee can only read their own row
CREATE POLICY "users_select_own"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- audition_blocks: all authenticated users can read
CREATE POLICY "blocks_select_authenticated"
  ON audition_blocks FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- audition_slots: all authenticated users can read
CREATE POLICY "slots_select_authenticated"
  ON audition_slots FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- audition_materials: all authenticated users can read
CREATE POLICY "materials_select_authenticated"
  ON audition_materials FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- faqs: all authenticated users can read
CREATE POLICY "faqs_select_authenticated"
  ON faqs FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- No anon INSERT/UPDATE/DELETE on any table.
-- All writes use the service role client which bypasses RLS.
