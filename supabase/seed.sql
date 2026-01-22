-- ============================================
-- E-REKOD KELAS SEED DATA
-- Run this AFTER schema.sql
-- ============================================

-- ============================================
-- ASSESSMENTS (Standard Pembelajaran)
-- ============================================

INSERT INTO assessments (id, subjek, nama, tajuk, standard_kandungan) VALUES
-- BAHASA MELAYU TAHUN 3
('bm-1.1.1', 'BM', '1.1.1', 'Dengar Tutur', '1.1 Mendengar dan memberikan respons'),
('bm-1.1.2', 'BM', '1.1.2', 'Dengar Tutur', '1.1 Mendengar dan memberikan respons'),
('bm-1.1.3', 'BM', '1.1.3', 'Dengar Tutur', '1.1 Mendengar dan memberikan respons'),
('bm-1.2.1', 'BM', '1.2.1', 'Dengar Tutur', '1.2 Bertutur untuk menyampaikan maklumat'),
('bm-1.2.2', 'BM', '1.2.2', 'Dengar Tutur', '1.2 Bertutur untuk menyampaikan maklumat'),
('bm-1.2.3', 'BM', '1.2.3', 'Dengar Tutur', '1.2 Bertutur untuk menyampaikan maklumat'),
('bm-2.1.1', 'BM', '2.1.1', 'Membaca', '2.1 Membaca dengan sebutan yang betul'),
('bm-2.1.2', 'BM', '2.1.2', 'Membaca', '2.1 Membaca dengan sebutan yang betul'),
('bm-2.2.1', 'BM', '2.2.1', 'Membaca', '2.2 Memahami bahan yang dibaca'),
('bm-2.3.1', 'BM', '2.3.1', 'Membaca', '2.3 Membaca dan memahami bahan sastera'),
('bm-2.3.2', 'BM', '2.3.2', 'Membaca', '2.3 Membaca dan memahami bahan sastera'),
('bm-3.1.1', 'BM', '3.1.1', 'Menulis', '3.1 Menulis secara mekanis'),
('bm-3.2.1', 'BM', '3.2.1', 'Menulis', '3.2 Membina dan menulis ayat'),
('bm-3.2.2', 'BM', '3.2.2', 'Menulis', '3.2 Membina dan menulis ayat'),
('bm-3.2.3', 'BM', '3.2.3', 'Menulis', '3.2 Membina dan menulis ayat'),
('bm-3.2.4', 'BM', '3.2.4', 'Menulis', '3.2 Membina dan menulis ayat'),
('bm-3.3.1', 'BM', '3.3.1', 'Menulis', '3.3 Menghasilkan penulisan'),
('bm-3.3.2', 'BM', '3.3.2', 'Menulis', '3.3 Menghasilkan penulisan'),

-- SEJARAH TAHUN 6
-- Tajuk 10: Negara Malaysia
('sej-10.1.1', 'Sejarah', '10.1.1', 'Tajuk 10: Negara Malaysia', '10.1 Pembentukan Malaysia'),
('sej-10.1.2', 'Sejarah', '10.1.2', 'Tajuk 10: Negara Malaysia', '10.1 Pembentukan Malaysia'),
('sej-10.1.3', 'Sejarah', '10.1.3', 'Tajuk 10: Negara Malaysia', '10.1 Pembentukan Malaysia'),
('sej-10.1.4', 'Sejarah', '10.1.4', 'Tajuk 10: Negara Malaysia', '10.1 Pembentukan Malaysia'),
('sej-10.2.1', 'Sejarah', '10.2.1', 'Tajuk 10: Negara Malaysia', '10.2 Negeri-negeri di Malaysia'),
('sej-10.2.2', 'Sejarah', '10.2.2', 'Tajuk 10: Negara Malaysia', '10.2 Negeri-negeri di Malaysia'),
('sej-10.2.3', 'Sejarah', '10.2.3', 'Tajuk 10: Negara Malaysia', '10.2 Negeri-negeri di Malaysia'),
('sej-10.2.4', 'Sejarah', '10.2.4', 'Tajuk 10: Negara Malaysia', '10.2 Negeri-negeri di Malaysia'),
('sej-10.3.1', 'Sejarah', '10.3.1', 'Tajuk 10: Negara Malaysia', '10.3 Rukun Negara'),
('sej-10.3.2', 'Sejarah', '10.3.2', 'Tajuk 10: Negara Malaysia', '10.3 Rukun Negara'),
('sej-10.3.3', 'Sejarah', '10.3.3', 'Tajuk 10: Negara Malaysia', '10.3 Rukun Negara'),

-- Tajuk 11: Kita Rakyat Malaysia
('sej-11.1.1', 'Sejarah', '11.1.1', 'Tajuk 11: Kita Rakyat Malaysia', '11.1 Kaum di Malaysia'),
('sej-11.1.2', 'Sejarah', '11.1.2', 'Tajuk 11: Kita Rakyat Malaysia', '11.1 Kaum di Malaysia'),
('sej-11.1.3', 'Sejarah', '11.1.3', 'Tajuk 11: Kita Rakyat Malaysia', '11.1 Kaum di Malaysia'),
('sej-11.1.4', 'Sejarah', '11.1.4', 'Tajuk 11: Kita Rakyat Malaysia', '11.1 Kaum di Malaysia'),
('sej-11.1.5', 'Sejarah', '11.1.5', 'Tajuk 11: Kita Rakyat Malaysia', '11.1 Kaum di Malaysia'),
('sej-11.2.1', 'Sejarah', '11.2.1', 'Tajuk 11: Kita Rakyat Malaysia', '11.2 Agama dan Kepercayaan di Malaysia'),
('sej-11.2.2', 'Sejarah', '11.2.2', 'Tajuk 11: Kita Rakyat Malaysia', '11.2 Agama dan Kepercayaan di Malaysia'),
('sej-11.2.3', 'Sejarah', '11.2.3', 'Tajuk 11: Kita Rakyat Malaysia', '11.2 Agama dan Kepercayaan di Malaysia'),
('sej-11.2.4', 'Sejarah', '11.2.4', 'Tajuk 11: Kita Rakyat Malaysia', '11.2 Agama dan Kepercayaan di Malaysia'),
('sej-11.3.1', 'Sejarah', '11.3.1', 'Tajuk 11: Kita Rakyat Malaysia', '11.3 Perayaan Masyarakat di Malaysia'),
('sej-11.3.2', 'Sejarah', '11.3.2', 'Tajuk 11: Kita Rakyat Malaysia', '11.3 Perayaan Masyarakat di Malaysia'),
('sej-11.3.3', 'Sejarah', '11.3.3', 'Tajuk 11: Kita Rakyat Malaysia', '11.3 Perayaan Masyarakat di Malaysia'),

-- Tajuk 12: Pencapaian dan Kebanggaan Negara
('sej-12.1.1', 'Sejarah', '12.1.1', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.1 Pemimpin Negara di Malaysia'),
('sej-12.1.2', 'Sejarah', '12.1.2', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.1 Pemimpin Negara di Malaysia'),
('sej-12.1.3', 'Sejarah', '12.1.3', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.1 Pemimpin Negara di Malaysia'),
('sej-12.2.1', 'Sejarah', '12.2.1', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.2 Kemajuan Ekonomi di Malaysia'),
('sej-12.2.2', 'Sejarah', '12.2.2', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.2 Kemajuan Ekonomi di Malaysia'),
('sej-12.2.3', 'Sejarah', '12.2.3', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.2 Kemajuan Ekonomi di Malaysia'),
('sej-12.3.1', 'Sejarah', '12.3.1', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.3 Sukan Kebanggaan Malaysia'),
('sej-12.3.2', 'Sejarah', '12.3.2', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.3 Sukan Kebanggaan Malaysia'),
('sej-12.3.3', 'Sejarah', '12.3.3', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.3 Sukan Kebanggaan Malaysia'),
('sej-12.3.4', 'Sejarah', '12.3.4', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.3 Sukan Kebanggaan Malaysia'),
('sej-12.4.1', 'Sejarah', '12.4.1', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.4 Malaysia dan Dunia'),
('sej-12.4.2', 'Sejarah', '12.4.2', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.4 Malaysia dan Dunia'),
('sej-12.4.3', 'Sejarah', '12.4.3', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.4 Malaysia dan Dunia'),
('sej-12.4.4', 'Sejarah', '12.4.4', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.4 Malaysia dan Dunia'),
('sej-12.4.5', 'Sejarah', '12.4.5', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.4 Malaysia dan Dunia'),

-- PSV
('psv-catair', 'PSV', 'Lukisan Cat Air', NULL, NULL),
('psv-kolaj', 'PSV', 'Kolaj', NULL, NULL),
('psv-origami', 'PSV', 'Origami', NULL, NULL),
('psv-anyaman', 'PSV', 'Anyaman', NULL, NULL),
('psv-cetakan', 'PSV', 'Cetakan', NULL, NULL);

-- ============================================
-- SAMPLE STUDENTS (Demo)
-- Anda boleh tambah murid sebenar kemudian
-- ============================================

INSERT INTO students (nama, no_kp, kelas, tahun) VALUES
-- 6 Topaz
('Ahmad bin Abu', '170523-14-1234', '6 Topaz', 6),
('Raj Kumar a/l Muthu', '170205-02-3333', '6 Topaz', 6),
('Nurul Fatimah binti Osman', '170315-08-1111', '6 Topaz', 6),
('Lee Jun Wei', '170428-01-2222', '6 Topaz', 6),
('Muhammad Hafiz bin Ibrahim', '170612-14-3333', '6 Topaz', 6),

-- 6 Ruby
('Siti Aminah binti Ali', '170812-10-5678', '6 Ruby', 6),
('Muhammad Adam bin Ismail', '170630-08-6666', '6 Ruby', 6),
('Tan Mei Ling', '170720-01-4444', '6 Ruby', 6),
('Ananya a/p Sharma', '170905-03-5555', '6 Ruby', 6),
('Nur Izzah binti Kamal', '170118-14-6666', '6 Ruby', 6),

-- 6 Pearl
('Muhammad Haziq bin Hassan', '170115-01-9012', '6 Pearl', 6),
('Lim Hui Ling', '170503-08-7777', '6 Pearl', 6),
('Vikram a/l Pillai', '170827-02-8888', '6 Pearl', 6),
('Aisyah binti Rahman', '170214-14-9999', '6 Pearl', 6),
('Wong Jia Wen', '170709-01-1010', '6 Pearl', 6),

-- 6 Sapphire
('Nurul Huda binti Kamal', '170918-14-4444', '6 Sapphire', 6),
('Muhammad Danish bin Razak', '170401-08-1212', '6 Sapphire', 6),
('Ng Zhi Hao', '170622-01-1313', '6 Sapphire', 6),
('Priya a/p Nair', '170811-03-1414', '6 Sapphire', 6),
('Syafiqah binti Omar', '170130-14-1515', '6 Sapphire', 6),

-- 6 Jade
('Tan Mei Ling', '170411-01-5555', '6 Jade', 6),
('Muhammad Irfan bin Yusof', '170525-08-1616', '6 Jade', 6),
('Deepa a/p Kumar', '170703-02-1717', '6 Jade', 6),
('Nur Alya binti Hassan', '170916-14-1818', '6 Jade', 6),
('Chan Yi Xuan', '170208-01-1919', '6 Jade', 6),

-- 6 Emerald
('Lee Wei Ming', '170720-08-7890', '6 Emerald', 6),
('Muhammad Arif bin Kassim', '170314-14-2020', '6 Emerald', 6),
('Goh Jia Hui', '170507-01-2121', '6 Emerald', 6),
('Lakshmi a/p Mohan', '170819-03-2222', '6 Emerald', 6),
('Balqis binti Ahmad', '170102-08-2323', '6 Emerald', 6),

-- 3 Pearl
('Nur Aisyah binti Rahman', '150303-14-3456', '3 Pearl', 3),
('Anis binti Razak', '150128-14-7777', '3 Pearl', 3),
('Muhammad Zaid bin Ali', '150415-08-2424', '3 Pearl', 3),
('Ong Kai Ming', '150622-01-2525', '3 Pearl', 3),
('Arjun a/l Rajan', '150809-02-2626', '3 Pearl', 3);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE 'Total students: 35';
  RAISE NOTICE 'Total assessments: 63';
END $$;
