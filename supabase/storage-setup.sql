-- ============================================
-- SUPABASE STORAGE: Bucket untuk bukti PSV
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Cipta bucket (public supaya gambar boleh dipaparkan)
INSERT INTO storage.buckets (id, name, public)
VALUES ('psv-evidence', 'psv-evidence', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Policy: Sesiapa boleh muat naik gambar (untuk ibu bapa)
CREATE POLICY "Anyone can upload PSV evidence"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'psv-evidence');

-- 3. Policy: Sesiapa boleh lihat gambar
CREATE POLICY "Anyone can view PSV evidence"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'psv-evidence');

-- 4. Policy: Sesiapa boleh padam gambar sendiri (untuk tukar gambar)
CREATE POLICY "Anyone can delete PSV evidence"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'psv-evidence');

-- 5. Policy: Sesiapa boleh update (untuk upsert)
CREATE POLICY "Anyone can update PSV evidence"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'psv-evidence');
