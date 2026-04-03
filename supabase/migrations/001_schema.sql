-- Users: app profile table keyed by auth user ID
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('RUSHEE', 'ADMIN')) DEFAULT 'RUSHEE',
  voice_part TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audition blocks: a scheduled time window that generates slots
CREATE TABLE audition_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration INT NOT NULL, -- minutes
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audition slots: individual bookable time slots within a block
CREATE TABLE audition_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id UUID NOT NULL REFERENCES audition_blocks(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  rushee_id UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Audition materials: uploaded files (PDFs and audio)
CREATE TABLE audition_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  voice_part TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'audio')),
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- FAQs: ordered list of questions and answers
CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INT NOT NULL
);
