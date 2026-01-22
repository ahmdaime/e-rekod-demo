-- ============================================
-- E-REKOD KELAS SEED DATA
-- Run this AFTER schema.sql
-- ============================================

-- ============================================
-- ASSESSMENTS (Standard Pembelajaran)
-- UUID will be auto-generated
-- ============================================

INSERT INTO assessments (subjek, nama, tajuk, standard_kandungan) VALUES
-- BAHASA MELAYU TAHUN 3
('BM', '1.1.1', 'Dengar Tutur', '1.1 Mendengar dan memberikan respons'),
('BM', '1.1.2', 'Dengar Tutur', '1.1 Mendengar dan memberikan respons'),
('BM', '1.1.3', 'Dengar Tutur', '1.1 Mendengar dan memberikan respons'),
('BM', '1.2.1', 'Dengar Tutur', '1.2 Bertutur untuk menyampaikan maklumat'),
('BM', '1.2.2', 'Dengar Tutur', '1.2 Bertutur untuk menyampaikan maklumat'),
('BM', '1.2.3', 'Dengar Tutur', '1.2 Bertutur untuk menyampaikan maklumat'),
('BM', '2.1.1', 'Membaca', '2.1 Membaca dengan sebutan yang betul'),
('BM', '2.1.2', 'Membaca', '2.1 Membaca dengan sebutan yang betul'),
('BM', '2.2.1', 'Membaca', '2.2 Memahami bahan yang dibaca'),
('BM', '2.3.1', 'Membaca', '2.3 Membaca dan memahami bahan sastera'),
('BM', '2.3.2', 'Membaca', '2.3 Membaca dan memahami bahan sastera'),
('BM', '3.1.1', 'Menulis', '3.1 Menulis secara mekanis'),
('BM', '3.2.1', 'Menulis', '3.2 Membina dan menulis ayat'),
('BM', '3.2.2', 'Menulis', '3.2 Membina dan menulis ayat'),
('BM', '3.2.3', 'Menulis', '3.2 Membina dan menulis ayat'),
('BM', '3.2.4', 'Menulis', '3.2 Membina dan menulis ayat'),
('BM', '3.3.1', 'Menulis', '3.3 Menghasilkan penulisan'),
('BM', '3.3.2', 'Menulis', '3.3 Menghasilkan penulisan'),

-- SEJARAH TAHUN 6
-- Tajuk 10: Negara Malaysia
('Sejarah', '10.1.1', 'Tajuk 10: Negara Malaysia', '10.1 Pembentukan Malaysia'),
('Sejarah', '10.1.2', 'Tajuk 10: Negara Malaysia', '10.1 Pembentukan Malaysia'),
('Sejarah', '10.1.3', 'Tajuk 10: Negara Malaysia', '10.1 Pembentukan Malaysia'),
('Sejarah', '10.1.4', 'Tajuk 10: Negara Malaysia', '10.1 Pembentukan Malaysia'),
('Sejarah', '10.2.1', 'Tajuk 10: Negara Malaysia', '10.2 Negeri-negeri di Malaysia'),
('Sejarah', '10.2.2', 'Tajuk 10: Negara Malaysia', '10.2 Negeri-negeri di Malaysia'),
('Sejarah', '10.2.3', 'Tajuk 10: Negara Malaysia', '10.2 Negeri-negeri di Malaysia'),
('Sejarah', '10.2.4', 'Tajuk 10: Negara Malaysia', '10.2 Negeri-negeri di Malaysia'),
('Sejarah', '10.3.1', 'Tajuk 10: Negara Malaysia', '10.3 Rukun Negara'),
('Sejarah', '10.3.2', 'Tajuk 10: Negara Malaysia', '10.3 Rukun Negara'),
('Sejarah', '10.3.3', 'Tajuk 10: Negara Malaysia', '10.3 Rukun Negara'),

-- Tajuk 11: Kita Rakyat Malaysia
('Sejarah', '11.1.1', 'Tajuk 11: Kita Rakyat Malaysia', '11.1 Kaum di Malaysia'),
('Sejarah', '11.1.2', 'Tajuk 11: Kita Rakyat Malaysia', '11.1 Kaum di Malaysia'),
('Sejarah', '11.1.3', 'Tajuk 11: Kita Rakyat Malaysia', '11.1 Kaum di Malaysia'),
('Sejarah', '11.1.4', 'Tajuk 11: Kita Rakyat Malaysia', '11.1 Kaum di Malaysia'),
('Sejarah', '11.1.5', 'Tajuk 11: Kita Rakyat Malaysia', '11.1 Kaum di Malaysia'),
('Sejarah', '11.2.1', 'Tajuk 11: Kita Rakyat Malaysia', '11.2 Agama dan Kepercayaan di Malaysia'),
('Sejarah', '11.2.2', 'Tajuk 11: Kita Rakyat Malaysia', '11.2 Agama dan Kepercayaan di Malaysia'),
('Sejarah', '11.2.3', 'Tajuk 11: Kita Rakyat Malaysia', '11.2 Agama dan Kepercayaan di Malaysia'),
('Sejarah', '11.2.4', 'Tajuk 11: Kita Rakyat Malaysia', '11.2 Agama dan Kepercayaan di Malaysia'),
('Sejarah', '11.3.1', 'Tajuk 11: Kita Rakyat Malaysia', '11.3 Perayaan Masyarakat di Malaysia'),
('Sejarah', '11.3.2', 'Tajuk 11: Kita Rakyat Malaysia', '11.3 Perayaan Masyarakat di Malaysia'),
('Sejarah', '11.3.3', 'Tajuk 11: Kita Rakyat Malaysia', '11.3 Perayaan Masyarakat di Malaysia'),

-- Tajuk 12: Pencapaian dan Kebanggaan Negara
('Sejarah', '12.1.1', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.1 Pemimpin Negara di Malaysia'),
('Sejarah', '12.1.2', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.1 Pemimpin Negara di Malaysia'),
('Sejarah', '12.1.3', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.1 Pemimpin Negara di Malaysia'),
('Sejarah', '12.2.1', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.2 Kemajuan Ekonomi di Malaysia'),
('Sejarah', '12.2.2', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.2 Kemajuan Ekonomi di Malaysia'),
('Sejarah', '12.2.3', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.2 Kemajuan Ekonomi di Malaysia'),
('Sejarah', '12.3.1', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.3 Sukan Kebanggaan Malaysia'),
('Sejarah', '12.3.2', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.3 Sukan Kebanggaan Malaysia'),
('Sejarah', '12.3.3', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.3 Sukan Kebanggaan Malaysia'),
('Sejarah', '12.3.4', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.3 Sukan Kebanggaan Malaysia'),
('Sejarah', '12.4.1', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.4 Malaysia dan Dunia'),
('Sejarah', '12.4.2', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.4 Malaysia dan Dunia'),
('Sejarah', '12.4.3', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.4 Malaysia dan Dunia'),
('Sejarah', '12.4.4', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.4 Malaysia dan Dunia'),
('Sejarah', '12.4.5', 'Tajuk 12: Pencapaian dan Kebanggaan Negara', '12.4 Malaysia dan Dunia'),

-- PSV
('PSV', 'Lukisan Cat Air', NULL, NULL),
('PSV', 'Kolaj', NULL, NULL),
('PSV', 'Origami', NULL, NULL),
('PSV', 'Anyaman', NULL, NULL),
('PSV', 'Cetakan', NULL, NULL);

-- ============================================
-- SAMPLE STUDENTS (Demo)
-- UUID will be auto-generated
-- ============================================

INSERT INTO students (nama, no_kp, kelas, tahun) VALUES
-- 6 Topaz
('Ahmad bin Abu', '170523-14-1234', '6 Topaz', 6),
('Raj Kumar a/l Muthu', '170205-02-3333', '6 Topaz', 6),
('Nurul Fatimah binti Osman', '170315-08-1111', '6 Topaz', 6),
('Lee Jun Wei', '170428-01-2222', '6 Topaz', 6),
('Muhammad Hafiz bin Ibrahim', '170612-14-3334', '6 Topaz', 6),

-- 6 Ruby
('Siti Aminah binti Ali', '170812-10-5678', '6 Ruby', 6),
('Muhammad Adam bin Ismail', '170630-08-6666', '6 Ruby', 6),
('Tan Jia Wen', '170720-01-4444', '6 Ruby', 6),
('Ananya a/p Sharma', '170905-03-5555', '6 Ruby', 6),
('Nur Izzah binti Kamal', '170118-14-6667', '6 Ruby', 6),

-- 6 Pearl
('Muhammad Haziq bin Hassan', '170115-01-9012', '6 Pearl', 6),
('Lim Hui Ling', '170503-08-7777', '6 Pearl', 6),
('Vikram a/l Pillai', '170827-02-8888', '6 Pearl', 6),
('Aisyah binti Rahman', '170214-14-9999', '6 Pearl', 6),
('Wong Kai Ming', '170709-01-1010', '6 Pearl', 6),

-- 6 Sapphire
('Nurul Huda binti Kamal', '170918-14-4445', '6 Sapphire', 6),
('Muhammad Danish bin Razak', '170401-08-1212', '6 Sapphire', 6),
('Ng Zhi Hao', '170622-01-1313', '6 Sapphire', 6),
('Priya a/p Nair', '170811-03-1414', '6 Sapphire', 6),
('Syafiqah binti Omar', '170130-14-1515', '6 Sapphire', 6),

-- 6 Jade
('Tan Mei Ling', '170411-01-5556', '6 Jade', 6),
('Muhammad Irfan bin Yusof', '170525-08-1616', '6 Jade', 6),
('Deepa a/p Kumar', '170703-02-1717', '6 Jade', 6),
('Nur Alya binti Hassan', '170916-14-1818', '6 Jade', 6),
('Chan Yi Xuan', '170208-01-1919', '6 Jade', 6),

-- 6 Emerald
('Lee Wei Ming', '170720-08-7890', '6 Emerald', 6),
('Muhammad Arif bin Kassim', '170314-14-2020', '6 Emerald', 6),
('Goh Jia Hui', '170507-01-2121', '6 Emerald', 6),
('Lakshmi a/p Mohan', '170819-03-2223', '6 Emerald', 6),
('Balqis binti Ahmad', '170102-08-2323', '6 Emerald', 6),

-- 3 Pearl
('Nur Aisyah binti Rahman', '150303-14-3456', '3 Pearl', 3),
('Anis binti Razak', '150128-14-7778', '3 Pearl', 3),
('Muhammad Zaid bin Ali', '150415-08-2424', '3 Pearl', 3),
('Ong Xin Yi', '150622-01-2525', '3 Pearl', 3),
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
