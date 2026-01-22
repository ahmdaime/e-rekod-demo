-- ============================================
-- E-REKOD KELAS DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. STUDENTS TABLE
-- ============================================
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  no_kp TEXT UNIQUE NOT NULL,
  kelas TEXT NOT NULL,
  tahun INTEGER NOT NULL DEFAULT 2026,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookup by IC
CREATE INDEX idx_students_no_kp ON students(no_kp);
CREATE INDEX idx_students_kelas ON students(kelas);

-- ============================================
-- 2. ASSESSMENTS TABLE (Standard Pembelajaran)
-- ============================================
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subjek TEXT NOT NULL CHECK (subjek IN ('BM', 'Sejarah', 'PSV')),
  nama TEXT NOT NULL,
  tajuk TEXT,
  standard_kandungan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. PBD RECORDS TABLE
-- ============================================
CREATE TABLE pbd_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  murid_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subjek TEXT NOT NULL CHECK (subjek IN ('BM', 'Sejarah', 'PSV')),
  kelas TEXT NOT NULL,
  pentaksiran_id UUID NOT NULL REFERENCES assessments(id),
  tahun_akademik TEXT NOT NULL DEFAULT '2026',
  semester TEXT NOT NULL CHECK (semester IN ('PBD 1', 'PBD 2')),
  tp INTEGER CHECK (tp IS NULL OR tp BETWEEN 1 AND 6),
  catatan TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one record per student per assessment per semester
  UNIQUE(murid_id, pentaksiran_id, tahun_akademik, semester)
);

CREATE INDEX idx_pbd_murid ON pbd_records(murid_id);
CREATE INDEX idx_pbd_kelas ON pbd_records(kelas);
CREATE INDEX idx_pbd_subjek ON pbd_records(subjek);

-- ============================================
-- 4. BEHAVIOR EVENTS TABLE (Token System)
-- ============================================
CREATE TABLE behavior_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  murid_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  nama_murid TEXT NOT NULL,
  kelas TEXT NOT NULL,
  jenis TEXT NOT NULL,
  kategori TEXT NOT NULL CHECK (kategori IN ('Positif', 'Negatif')),
  severity TEXT CHECK (severity IN ('Low', 'Medium', 'High')),
  catatan TEXT DEFAULT '',
  is_public BOOLEAN DEFAULT true,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_behavior_murid ON behavior_events(murid_id);
CREATE INDEX idx_behavior_kelas ON behavior_events(kelas);
CREATE INDEX idx_behavior_timestamp ON behavior_events(timestamp DESC);

-- ============================================
-- 5. PSV TASKS TABLE
-- ============================================
CREATE TABLE psv_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama TEXT NOT NULL,
  kelas TEXT NOT NULL,
  tarikh_mula DATE NOT NULL DEFAULT CURRENT_DATE,
  tarikh_akhir DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_psv_tasks_kelas ON psv_tasks(kelas);

-- ============================================
-- 6. PSV EVIDENCE TABLE
-- ============================================
CREATE TABLE psv_evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tugasan_id UUID NOT NULL REFERENCES psv_tasks(id) ON DELETE CASCADE,
  murid_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  link_bukti TEXT DEFAULT '',
  gambar_url TEXT DEFAULT '',
  catatan TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Belum Hantar' CHECK (status IN ('Belum Hantar', 'Sudah Hantar', 'Dinilai')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One evidence per student per task
  UNIQUE(tugasan_id, murid_id)
);

CREATE INDEX idx_psv_evidence_murid ON psv_evidence(murid_id);
CREATE INDEX idx_psv_evidence_tugasan ON psv_evidence(tugasan_id);

-- ============================================
-- 7. APP SETTINGS TABLE
-- ============================================
CREATE TABLE app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings
INSERT INTO app_settings (key, value) VALUES
  ('pbd_visible_to_parents', '{"enabled": false}');

-- ============================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pbd_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE behavior_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE psv_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE psv_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: Allow public read for now (will add auth later)
-- ============================================

-- Students: Public can read (for IC lookup), only authenticated can modify
CREATE POLICY "Students are viewable by everyone" ON students FOR SELECT USING (true);
CREATE POLICY "Students can be modified by authenticated users" ON students FOR ALL USING (auth.role() = 'authenticated');

-- Assessments: Public read
CREATE POLICY "Assessments are viewable by everyone" ON assessments FOR SELECT USING (true);
CREATE POLICY "Assessments can be modified by authenticated users" ON assessments FOR ALL USING (auth.role() = 'authenticated');

-- PBD Records: Public read (controlled by app_settings), authenticated can modify
CREATE POLICY "PBD records are viewable by everyone" ON pbd_records FOR SELECT USING (true);
CREATE POLICY "PBD records can be modified by authenticated users" ON pbd_records FOR ALL USING (auth.role() = 'authenticated');

-- Behavior Events: Only public events are viewable, authenticated can modify
CREATE POLICY "Public behavior events are viewable" ON behavior_events FOR SELECT USING (is_public = true);
CREATE POLICY "Behavior events can be modified by authenticated users" ON behavior_events FOR ALL USING (auth.role() = 'authenticated');

-- PSV Tasks: Public read
CREATE POLICY "PSV tasks are viewable by everyone" ON psv_tasks FOR SELECT USING (true);
CREATE POLICY "PSV tasks can be modified by authenticated users" ON psv_tasks FOR ALL USING (auth.role() = 'authenticated');

-- PSV Evidence: Public can read and insert (for parent upload), authenticated can do all
CREATE POLICY "PSV evidence is viewable by everyone" ON psv_evidence FOR SELECT USING (true);
CREATE POLICY "PSV evidence can be inserted by everyone" ON psv_evidence FOR INSERT WITH CHECK (true);
CREATE POLICY "PSV evidence can be updated by everyone" ON psv_evidence FOR UPDATE USING (true);
CREATE POLICY "PSV evidence can be deleted by authenticated users" ON psv_evidence FOR DELETE USING (auth.role() = 'authenticated');

-- App Settings: Public read, authenticated modify
CREATE POLICY "App settings are viewable by everyone" ON app_settings FOR SELECT USING (true);
CREATE POLICY "App settings can be modified by authenticated users" ON app_settings FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pbd_records_updated_at BEFORE UPDATE ON pbd_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_psv_evidence_updated_at BEFORE UPDATE ON psv_evidence FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully!';
END $$;
