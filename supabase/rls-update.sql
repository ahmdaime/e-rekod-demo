-- ============================================
-- RLS POLICIES UPDATE - Pilihan B
-- Guru: Perlu auth untuk modify
-- Parent: Boleh read dengan IC
-- ============================================

-- ============================================
-- STEP 1: DROP EXISTING POLICIES
-- ============================================

-- Students
DROP POLICY IF EXISTS "Students are viewable by everyone" ON students;
DROP POLICY IF EXISTS "Students can be modified by authenticated users" ON students;

-- Assessments
DROP POLICY IF EXISTS "Assessments are viewable by everyone" ON assessments;
DROP POLICY IF EXISTS "Assessments can be modified by authenticated users" ON assessments;

-- PBD Records
DROP POLICY IF EXISTS "PBD records are viewable by everyone" ON pbd_records;
DROP POLICY IF EXISTS "PBD records can be modified by authenticated users" ON pbd_records;

-- Behavior Events
DROP POLICY IF EXISTS "Public behavior events are viewable" ON behavior_events;
DROP POLICY IF EXISTS "Behavior events can be modified by authenticated users" ON behavior_events;

-- PSV Tasks
DROP POLICY IF EXISTS "PSV tasks are viewable by everyone" ON psv_tasks;
DROP POLICY IF EXISTS "PSV tasks can be modified by authenticated users" ON psv_tasks;

-- PSV Evidence
DROP POLICY IF EXISTS "PSV evidence is viewable by everyone" ON psv_evidence;
DROP POLICY IF EXISTS "PSV evidence can be inserted by everyone" ON psv_evidence;
DROP POLICY IF EXISTS "PSV evidence can be updated by everyone" ON psv_evidence;
DROP POLICY IF EXISTS "PSV evidence can be deleted by authenticated users" ON psv_evidence;

-- App Settings
DROP POLICY IF EXISTS "App settings are viewable by everyone" ON app_settings;
DROP POLICY IF EXISTS "App settings can be modified by authenticated users" ON app_settings;

-- ============================================
-- STEP 2: CREATE NEW POLICIES
-- ============================================

-- ----------------------------------------
-- STUDENTS TABLE
-- Parent: Boleh lookup by IC (SELECT)
-- Guru: Full access bila authenticated
-- ----------------------------------------
CREATE POLICY "Anyone can view students"
  ON students FOR SELECT
  USING (true);

CREATE POLICY "Only teachers can insert students"
  ON students FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only teachers can update students"
  ON students FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only teachers can delete students"
  ON students FOR DELETE
  USING (auth.role() = 'authenticated');

-- ----------------------------------------
-- ASSESSMENTS TABLE
-- Public read (untuk parent lihat nama assessment)
-- Guru: Full modify
-- ----------------------------------------
CREATE POLICY "Anyone can view assessments"
  ON assessments FOR SELECT
  USING (true);

CREATE POLICY "Only teachers can insert assessments"
  ON assessments FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only teachers can update assessments"
  ON assessments FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only teachers can delete assessments"
  ON assessments FOR DELETE
  USING (auth.role() = 'authenticated');

-- ----------------------------------------
-- PBD RECORDS TABLE
-- Parent: Boleh view bila setting enabled
-- Guru: Full access
-- ----------------------------------------
CREATE POLICY "PBD viewable when setting enabled or by teachers"
  ON pbd_records FOR SELECT
  USING (
    auth.role() = 'authenticated'
    OR
    (SELECT (value->>'enabled')::boolean FROM app_settings WHERE key = 'pbd_visible_to_parents') = true
  );

CREATE POLICY "Only teachers can insert PBD"
  ON pbd_records FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only teachers can update PBD"
  ON pbd_records FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only teachers can delete PBD"
  ON pbd_records FOR DELETE
  USING (auth.role() = 'authenticated');

-- ----------------------------------------
-- BEHAVIOR EVENTS TABLE
-- Parent: Hanya boleh lihat public events
-- Guru: Full access
-- ----------------------------------------
CREATE POLICY "Public behavior events viewable by all"
  ON behavior_events FOR SELECT
  USING (
    auth.role() = 'authenticated'
    OR
    is_public = true
  );

CREATE POLICY "Only teachers can insert behavior events"
  ON behavior_events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only teachers can update behavior events"
  ON behavior_events FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only teachers can delete behavior events"
  ON behavior_events FOR DELETE
  USING (auth.role() = 'authenticated');

-- ----------------------------------------
-- PSV TASKS TABLE
-- Public read (untuk parent lihat tugasan)
-- Guru: Full modify
-- ----------------------------------------
CREATE POLICY "Anyone can view PSV tasks"
  ON psv_tasks FOR SELECT
  USING (true);

CREATE POLICY "Only teachers can insert PSV tasks"
  ON psv_tasks FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only teachers can update PSV tasks"
  ON psv_tasks FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only teachers can delete PSV tasks"
  ON psv_tasks FOR DELETE
  USING (auth.role() = 'authenticated');

-- ----------------------------------------
-- PSV EVIDENCE TABLE
-- Parent: Boleh view, insert, update (untuk upload bukti)
-- Guru: Full access termasuk delete
-- ----------------------------------------
CREATE POLICY "Anyone can view PSV evidence"
  ON psv_evidence FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert PSV evidence"
  ON psv_evidence FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update PSV evidence"
  ON psv_evidence FOR UPDATE
  USING (true);

CREATE POLICY "Only teachers can delete PSV evidence"
  ON psv_evidence FOR DELETE
  USING (auth.role() = 'authenticated');

-- ----------------------------------------
-- APP SETTINGS TABLE
-- Public read (untuk check settings)
-- Guru: Full modify
-- ----------------------------------------
CREATE POLICY "Anyone can view app settings"
  ON app_settings FOR SELECT
  USING (true);

CREATE POLICY "Only teachers can modify app settings"
  ON app_settings FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only teachers can insert app settings"
  ON app_settings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only teachers can delete app settings"
  ON app_settings FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- VERIFICATION
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'RLS policies updated successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Summary:';
  RAISE NOTICE '- Students: Public read, Teachers modify';
  RAISE NOTICE '- Assessments: Public read, Teachers modify';
  RAISE NOTICE '- PBD Records: Conditional read (setting), Teachers modify';
  RAISE NOTICE '- Behavior Events: Public read (if is_public), Teachers modify';
  RAISE NOTICE '- PSV Tasks: Public read, Teachers modify';
  RAISE NOTICE '- PSV Evidence: Public read/insert/update, Teachers delete';
  RAISE NOTICE '- App Settings: Public read, Teachers modify';
END $$;
