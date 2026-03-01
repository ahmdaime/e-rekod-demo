import type {
  DbStudent,
  DbAssessment,
  DbPbdRecord,
  DbBehaviorEvent,
  DbPsvTask,
  DbPsvEvidence,
  DbBookType,
  DbBookCheck,
} from "@/types/database";

// ============================================
// DEMO STUDENTS
// ============================================

const now = new Date().toISOString();

export const DEMO_STUDENTS: DbStudent[] = [
  // 6 Topaz (10 murid) — SEMUA NAMA & IC ADALAH REKAAN SEMATA-MATA (kod negeri 00 = tidak wujud)
  { id: "s1", nama: "DANIAL HAKIMI BIN ZULKARNAIN", no_kp: "140115-00-0123", kelas: "6 Topaz", tahun: 6, jantina: "lelaki", created_at: now, updated_at: now },
  { id: "s2", nama: "HAFIZ IRFAN BIN ROSLAN", no_kp: "140322-00-0456", kelas: "6 Topaz", tahun: 6, jantina: "lelaki", created_at: now, updated_at: now },
  { id: "s3", nama: "NUR AISYAH BINTI KAMARUDDIN", no_kp: "140518-00-0789", kelas: "6 Topaz", tahun: 6, jantina: "perempuan", created_at: now, updated_at: now },
  { id: "s4", nama: "SITI MARIAM BINTI ABDULLAH", no_kp: "140704-00-1012", kelas: "6 Topaz", tahun: 6, jantina: "perempuan", created_at: now, updated_at: now },
  { id: "s5", nama: "AIMAN HAZIQ BIN SHAHRUL", no_kp: "140901-00-1345", kelas: "6 Topaz", tahun: 6, jantina: "lelaki", created_at: now, updated_at: now },
  { id: "s6", nama: "LUQMAN HAKIM BIN ISMAIL", no_kp: "141103-00-1678", kelas: "6 Topaz", tahun: 6, jantina: "lelaki", created_at: now, updated_at: now },
  { id: "s7", nama: "NURIN BATRISYIA BINTI HAFIZ", no_kp: "140227-00-1901", kelas: "6 Topaz", tahun: 6, jantina: "perempuan", created_at: now, updated_at: now },
  { id: "s8", nama: "ADAM MIKAIL BIN NORIZHAM", no_kp: "141019-00-2234", kelas: "6 Topaz", tahun: 6, jantina: "lelaki", created_at: now, updated_at: now },
  { id: "s9", nama: "NUR ALYA SAFIYA BINTI RAMLAN", no_kp: "140613-00-2567", kelas: "6 Topaz", tahun: 6, jantina: "perempuan", created_at: now, updated_at: now },
  { id: "s10", nama: "HARITH DANIEL BIN MAZLAN", no_kp: "140830-00-2890", kelas: "6 Topaz", tahun: 6, jantina: "lelaki", created_at: now, updated_at: now },

  // 3 Pearl (10 murid) — SEMUA NAMA & IC ADALAH REKAAN SEMATA-MATA (kod negeri 00 = tidak wujud)
  { id: "s11", nama: "NUR IRDINA BINTI SAIFUL", no_kp: "170210-00-3123", kelas: "3 Pearl", tahun: 3, jantina: "perempuan", created_at: now, updated_at: now },
  { id: "s12", nama: "MIKHAIL DARWISH BIN HAMIDI", no_kp: "170425-00-3456", kelas: "3 Pearl", tahun: 3, jantina: "lelaki", created_at: now, updated_at: now },
  { id: "s13", nama: "PUTERI HANA BINTI AZMAN", no_kp: "170618-00-3789", kelas: "3 Pearl", tahun: 3, jantina: "perempuan", created_at: now, updated_at: now },
  { id: "s14", nama: "ZAFRAN AQIL BIN NORAZMI", no_kp: "170807-00-4012", kelas: "3 Pearl", tahun: 3, jantina: "lelaki", created_at: now, updated_at: now },
  { id: "s15", nama: "NUR QISTINA BINTI RAZALI", no_kp: "170103-00-4345", kelas: "3 Pearl", tahun: 3, jantina: "perempuan", created_at: now, updated_at: now },
  { id: "s16", nama: "DARWISY IMAN BIN LOKMAN", no_kp: "170520-00-4678", kelas: "3 Pearl", tahun: 3, jantina: "lelaki", created_at: now, updated_at: now },
  { id: "s17", nama: "ALEESYA DAMIA BINTI FAIZUL", no_kp: "170915-00-4901", kelas: "3 Pearl", tahun: 3, jantina: "perempuan", created_at: now, updated_at: now },
  { id: "s18", nama: "UWAIS QAYYIM BIN RIZAL", no_kp: "170312-00-5234", kelas: "3 Pearl", tahun: 3, jantina: "lelaki", created_at: now, updated_at: now },
  { id: "s19", nama: "YUSUF RAYYAN BIN KAMARUL", no_kp: "170728-00-5567", kelas: "3 Pearl", tahun: 3, jantina: "lelaki", created_at: now, updated_at: now },
  { id: "s20", nama: "DANISH IRFAN BIN ZULHAIRI", no_kp: "171130-00-5890", kelas: "3 Pearl", tahun: 3, jantina: "lelaki", created_at: now, updated_at: now },
];

// Export IC list for generateStaticParams
export const DEMO_STUDENT_ICS = DEMO_STUDENTS.map((s) => s.no_kp);

// ============================================
// DEMO ASSESSMENTS
// ============================================

export const DEMO_ASSESSMENTS: DbAssessment[] = [
  // BM (5 SP)
  { id: "a1", subjek: "BM", nama: "SP 1.1 - Mendengar dan Memahami", tajuk: "Kemahiran Mendengar", standard_kandungan: "1.1 Mendengar dan memberikan respons", created_at: now },
  { id: "a2", subjek: "BM", nama: "SP 2.1 - Membaca dan Memahami", tajuk: "Kemahiran Membaca", standard_kandungan: "2.1 Membaca dan memahami pelbagai bahan", created_at: now },
  { id: "a3", subjek: "BM", nama: "SP 3.1 - Menulis Pelbagai Teks", tajuk: "Kemahiran Menulis", standard_kandungan: "3.1 Menulis perkataan dan ayat", created_at: now },
  { id: "a4", subjek: "BM", nama: "SP 4.1 - Tatabahasa", tajuk: "Aspek Tatabahasa", standard_kandungan: "4.1 Menggunakan kata nama am dan kata nama khas", created_at: now },
  { id: "a5", subjek: "BM", nama: "SP 5.1 - Seni Bahasa", tajuk: "Aspek Seni Bahasa", standard_kandungan: "5.1 Menyebut dan memahami unsur seni dalam lagu", created_at: now },

  // Sejarah (5 SP)
  { id: "a6", subjek: "Sejarah", nama: "SP 1 - Kemahiran Pemikiran Sejarah", tajuk: "Kronologi", standard_kandungan: "K1 Memahami kronologi", created_at: now },
  { id: "a7", subjek: "Sejarah", nama: "SP 2 - Meneroka Bukti", tajuk: "Penerokaan Bukti", standard_kandungan: "K2 Meneroka bukti sejarah", created_at: now },
  { id: "a8", subjek: "Sejarah", nama: "SP 3 - Membuat Interpretasi", tajuk: "Interpretasi", standard_kandungan: "K3 Membuat interpretasi sejarah", created_at: now },
  { id: "a9", subjek: "Sejarah", nama: "SP 4 - Membuat Imaginasi", tajuk: "Imaginasi", standard_kandungan: "K4 Membuat imaginasi sejarah", created_at: now },
  { id: "a10", subjek: "Sejarah", nama: "SP 5 - Membuat Rasionalisasi", tajuk: "Rasionalisasi", standard_kandungan: "K5 Membuat rasionalisasi", created_at: now },

  // PSV (3 SP)
  { id: "a11", subjek: "PSV", nama: "SP 1 - Persepsi Estetik", tajuk: "Persepsi & Estetik", standard_kandungan: "1.1 Unsur seni: garisan, rupa, bentuk", created_at: now },
  { id: "a12", subjek: "PSV", nama: "SP 2 - Aplikasi Seni", tajuk: "Aplikasi Seni", standard_kandungan: "2.1 Media dan teknik dalam penghasilan", created_at: now },
  { id: "a13", subjek: "PSV", nama: "SP 3 - Ekspresi Kreatif", tajuk: "Ekspresi Kreatif", standard_kandungan: "3.1 Ekspresi kreatif dalam penghasilan karya", created_at: now },
];

// ============================================
// DEMO PBD RECORDS (~70% coverage)
// ============================================

const currentYear = new Date().getFullYear().toString();
let pbdId = 0;

function makePbd(
  muridId: string,
  pentaksiranId: string,
  subjek: "BM" | "Sejarah" | "PSV",
  kelas: string,
  tp: number | null,
  catatan?: string
): DbPbdRecord {
  pbdId++;
  return {
    id: `pbd-${pbdId}`,
    murid_id: muridId,
    subjek,
    kelas,
    pentaksiran_id: pentaksiranId,
    tahun_akademik: currentYear,
    semester: "PBD 1",
    tp,
    catatan: catatan || "",
    created_at: now,
    updated_at: now,
  };
}

export const DEMO_PBD_RECORDS: DbPbdRecord[] = [
  // 6 Topaz - Sejarah (s1-s10, assessments a6-a10) ~70% fill
  makePbd("s1", "a6", "Sejarah", "6 Topaz", 5, "Baik"),
  makePbd("s1", "a7", "Sejarah", "6 Topaz", 4),
  makePbd("s1", "a8", "Sejarah", "6 Topaz", 5),
  makePbd("s2", "a6", "Sejarah", "6 Topaz", 3),
  makePbd("s2", "a7", "Sejarah", "6 Topaz", 3),
  makePbd("s2", "a8", "Sejarah", "6 Topaz", 4),
  makePbd("s3", "a6", "Sejarah", "6 Topaz", 6, "Cemerlang!"),
  makePbd("s3", "a7", "Sejarah", "6 Topaz", 5),
  makePbd("s3", "a8", "Sejarah", "6 Topaz", 6),
  makePbd("s3", "a9", "Sejarah", "6 Topaz", 5),
  makePbd("s4", "a6", "Sejarah", "6 Topaz", 4),
  makePbd("s4", "a7", "Sejarah", "6 Topaz", 4),
  makePbd("s5", "a6", "Sejarah", "6 Topaz", 2),
  makePbd("s5", "a7", "Sejarah", "6 Topaz", 3),
  makePbd("s5", "a8", "Sejarah", "6 Topaz", 2, "Perlu bimbingan"),
  makePbd("s6", "a6", "Sejarah", "6 Topaz", 4),
  makePbd("s6", "a7", "Sejarah", "6 Topaz", 5),
  makePbd("s7", "a6", "Sejarah", "6 Topaz", 5),
  makePbd("s7", "a7", "Sejarah", "6 Topaz", 5),
  makePbd("s7", "a8", "Sejarah", "6 Topaz", 4),
  makePbd("s8", "a6", "Sejarah", "6 Topaz", 3),
  makePbd("s8", "a7", "Sejarah", "6 Topaz", 3),
  makePbd("s9", "a6", "Sejarah", "6 Topaz", 6),
  makePbd("s9", "a7", "Sejarah", "6 Topaz", 6, "Pelajar terbaik"),
  makePbd("s10", "a6", "Sejarah", "6 Topaz", 1),
  makePbd("s10", "a7", "Sejarah", "6 Topaz", 2),

  // 6 Topaz - PSV (s1-s10, assessments a11-a13) partial
  makePbd("s1", "a11", "PSV", "6 Topaz", 4),
  makePbd("s1", "a12", "PSV", "6 Topaz", 5),
  makePbd("s2", "a11", "PSV", "6 Topaz", 3),
  makePbd("s3", "a11", "PSV", "6 Topaz", 6),
  makePbd("s3", "a12", "PSV", "6 Topaz", 5),
  makePbd("s4", "a11", "PSV", "6 Topaz", 4),
  makePbd("s5", "a11", "PSV", "6 Topaz", 2),
  makePbd("s7", "a11", "PSV", "6 Topaz", 5),
  makePbd("s9", "a11", "PSV", "6 Topaz", 6),
  makePbd("s9", "a12", "PSV", "6 Topaz", 6),

  // 3 Pearl - BM (s11-s20, assessments a1-a5) ~70% fill
  makePbd("s11", "a1", "BM", "3 Pearl", 5),
  makePbd("s11", "a2", "BM", "3 Pearl", 4),
  makePbd("s11", "a3", "BM", "3 Pearl", 5, "Tulisan kemas"),
  makePbd("s12", "a1", "BM", "3 Pearl", 3),
  makePbd("s12", "a2", "BM", "3 Pearl", 3),
  makePbd("s12", "a3", "BM", "3 Pearl", 4),
  makePbd("s13", "a1", "BM", "3 Pearl", 6),
  makePbd("s13", "a2", "BM", "3 Pearl", 6, "Cemerlang"),
  makePbd("s13", "a3", "BM", "3 Pearl", 5),
  makePbd("s13", "a4", "BM", "3 Pearl", 6),
  makePbd("s14", "a1", "BM", "3 Pearl", 2),
  makePbd("s14", "a2", "BM", "3 Pearl", 2),
  makePbd("s14", "a3", "BM", "3 Pearl", 1, "Perlu banyak latihan"),
  makePbd("s15", "a1", "BM", "3 Pearl", 4),
  makePbd("s15", "a2", "BM", "3 Pearl", 5),
  makePbd("s16", "a1", "BM", "3 Pearl", 3),
  makePbd("s16", "a2", "BM", "3 Pearl", 3),
  makePbd("s17", "a1", "BM", "3 Pearl", 5),
  makePbd("s17", "a2", "BM", "3 Pearl", 4),
  makePbd("s17", "a3", "BM", "3 Pearl", 5),
  makePbd("s18", "a1", "BM", "3 Pearl", 4),
  makePbd("s18", "a2", "BM", "3 Pearl", 3),
  makePbd("s19", "a1", "BM", "3 Pearl", 3),
  makePbd("s19", "a2", "BM", "3 Pearl", 4),
  makePbd("s20", "a1", "BM", "3 Pearl", 2),
  makePbd("s20", "a2", "BM", "3 Pearl", 2),
];

// ============================================
// DEMO BEHAVIOR EVENTS (25+ events)
// ============================================

const today = new Date();
const todayStr = today.toISOString();
const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);
const twoDaysAgo = new Date(today);
twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
const threeDaysAgo = new Date(today);
threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
const lastWeek = new Date(today);
lastWeek.setDate(lastWeek.getDate() - 5);

let eventId = 0;

function makeEvent(
  muridId: string,
  namaMurid: string,
  kelas: string,
  jenis: string,
  kategori: "Positif" | "Negatif",
  severity: "Low" | "Medium" | "High",
  catatan: string,
  timestamp: Date
): DbBehaviorEvent {
  eventId++;
  return {
    id: `evt-${eventId}`,
    murid_id: muridId,
    nama_murid: namaMurid,
    kelas,
    jenis,
    kategori,
    severity,
    catatan,
    is_public: true,
    timestamp: timestamp.toISOString(),
    created_at: timestamp.toISOString(),
  };
}

export const DEMO_BEHAVIOR_EVENTS: DbBehaviorEvent[] = [
  // Today - 6 Topaz
  makeEvent("s1", "DANIAL HAKIMI BIN ZULKARNAIN", "6 Topaz", "Bagus", "Positif", "Low", "Angkat tangan jawab soalan", today),
  makeEvent("s3", "NUR AISYAH BINTI KAMARUDDIN", "6 Topaz", "Cemerlang", "Positif", "High", "Skor tertinggi dalam kuiz Sejarah", today),
  makeEvent("s5", "AIMAN HAZIQ BIN SHAHRUL", "6 Topaz", "Bising dalam kelas", "Negatif", "Low", "Bising semasa guru mengajar", today),
  makeEvent("s2", "HAFIZ IRFAN BIN ROSLAN", "6 Topaz", "Sangat Bagus", "Positif", "Medium", "Aktif dalam kerja kumpulan", today),
  makeEvent("s7", "NURIN BATRISYIA BINTI HAFIZ", "6 Topaz", "Bagus", "Positif", "Low", "Siap kerja lebih awal", today),
  makeEvent("s8", "ADAM MIKAIL BIN NORIZHAM", "6 Topaz", "Tidak siap kerja sekolah", "Negatif", "Medium", "Tidak siap latihan Sejarah", today),

  // Today - 3 Pearl
  makeEvent("s11", "NUR IRDINA BINTI SAIFUL", "3 Pearl", "Cemerlang", "Positif", "High", "Hasil kerja terbaik dalam BM", today),
  makeEvent("s14", "ZAFRAN AQIL BIN NORAZMI", "3 Pearl", "Lambat masuk kelas", "Negatif", "Low", "Lambat 10 minit", today),
  makeEvent("s17", "ALEESYA DAMIA BINTI FAIZUL", "3 Pearl", "Sangat Bagus", "Positif", "Medium", "Bantu rakan faham pelajaran", today),

  // Yesterday
  makeEvent("s4", "SITI MARIAM BINTI ABDULLAH", "6 Topaz", "Bagus", "Positif", "Low", "Kemas meja dan kerusi", yesterday),
  makeEvent("s6", "LUQMAN HAKIM BIN ISMAIL", "6 Topaz", "Sangat Bagus", "Positif", "Medium", "Jaga kebersihan kelas", yesterday),
  makeEvent("s9", "NUR ALYA SAFIYA BINTI RAMLAN", "6 Topaz", "Cemerlang", "Positif", "High", "Tolong guru urus kelas", yesterday),
  makeEvent("s12", "MIKHAIL DARWISH BIN HAMIDI", "3 Pearl", "Bagus", "Positif", "Low", "Angkat tangan jawab soalan", yesterday),
  makeEvent("s15", "NUR QISTINA BINTI RAZALI", "3 Pearl", "Bagus", "Positif", "Low", "Siap kerja lebih awal", yesterday),

  // 2 days ago
  makeEvent("s1", "DANIAL HAKIMI BIN ZULKARNAIN", "6 Topaz", "Sangat Bagus", "Positif", "Medium", "Aktif dalam kerja kumpulan", twoDaysAgo),
  makeEvent("s5", "AIMAN HAZIQ BIN SHAHRUL", "6 Topaz", "Bergaduh dalam kelas", "Negatif", "High", "Bergaduh dengan rakan semasa rehat", twoDaysAgo),
  makeEvent("s10", "HARITH DANIEL BIN MAZLAN", "6 Topaz", "Lupa bawa buku/alatan", "Negatif", "Low", "Lupa bawa buku Sejarah", twoDaysAgo),
  makeEvent("s16", "DARWISY IMAN BIN LOKMAN", "3 Pearl", "Tidur dalam kelas", "Negatif", "Medium", "Tidur semasa sesi BM", twoDaysAgo),

  // 3 days ago
  makeEvent("s3", "NUR AISYAH BINTI KAMARUDDIN", "6 Topaz", "Bagus", "Positif", "Low", "Kemas meja dan kerusi", threeDaysAgo),
  makeEvent("s7", "NURIN BATRISYIA BINTI HAFIZ", "6 Topaz", "Sangat Bagus", "Positif", "Medium", "Bantu rakan faham pelajaran", threeDaysAgo),
  makeEvent("s18", "UWAIS QAYYIM BIN RIZAL", "3 Pearl", "Bagus", "Positif", "Low", "Angkat tangan jawab soalan", threeDaysAgo),
  makeEvent("s19", "YUSUF RAYYAN BIN KAMARUL", "3 Pearl", "Bising dalam kelas", "Negatif", "Low", "Bising semasa aktiviti kumpulan", threeDaysAgo),

  // Last week
  makeEvent("s1", "DANIAL HAKIMI BIN ZULKARNAIN", "6 Topaz", "Hasil Karya PSV: Lukisan Anyaman", "Positif", "Medium", "Hasil karya memuaskan", lastWeek),
  makeEvent("s3", "NUR AISYAH BINTI KAMARUDDIN", "6 Topaz", "Hasil Karya PSV: Lukisan Anyaman", "Positif", "High", "Karya cemerlang", lastWeek),
  makeEvent("s20", "DANISH IRFAN BIN ZULHAIRI", "3 Pearl", "Ganggu pembelajaran kelas", "Negatif", "High", "Mengganggu rakan berulang kali", lastWeek),
];

// ============================================
// DEMO PSV TASKS
// ============================================

const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);
const twoWeeksFromNow = new Date(today);
twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
const oneWeekAgo = new Date(today);
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

export const DEMO_PSV_TASKS: DbPsvTask[] = [
  {
    id: "task-1",
    nama: "Lukisan Anyaman",
    kelas: "6 Topaz",
    tarikh_mula: oneWeekAgo.toISOString().split("T")[0],
    tarikh_akhir: nextWeek.toISOString().split("T")[0],
    created_at: oneWeekAgo.toISOString(),
  },
  {
    id: "task-2",
    nama: "Kolaj Haiwan",
    kelas: "6 Topaz",
    tarikh_mula: today.toISOString().split("T")[0],
    tarikh_akhir: twoWeeksFromNow.toISOString().split("T")[0],
    created_at: today.toISOString(),
  },
];

// ============================================
// DEMO PSV EVIDENCE
// ============================================

export const DEMO_PSV_EVIDENCE: DbPsvEvidence[] = [
  // Task 1: Lukisan Anyaman - mixed status
  { id: "ev-1", tugasan_id: "task-1", murid_id: "s1", link_bukti: "", gambar_url: "/psv/karya-1.jpg", catatan: "Corak anyaman kemas dan kreatif", status: "Dinilai", created_at: now, updated_at: now },
  { id: "ev-2", tugasan_id: "task-1", murid_id: "s2", link_bukti: "", gambar_url: "/psv/karya-2.jpg", catatan: "", status: "Sudah Hantar", created_at: now, updated_at: now },
  { id: "ev-3", tugasan_id: "task-1", murid_id: "s3", link_bukti: "", gambar_url: "/psv/karya-3.jpg", catatan: "Sangat kreatif! Warna harmoni", status: "Dinilai", created_at: now, updated_at: now },
  { id: "ev-4", tugasan_id: "task-1", murid_id: "s4", link_bukti: "", gambar_url: "/psv/karya-4.jpg", catatan: "", status: "Sudah Hantar", created_at: now, updated_at: now },
  // s5, s6 - Belum Hantar (no evidence entry needed, they just won't have one)
  { id: "ev-5", tugasan_id: "task-1", murid_id: "s7", link_bukti: "https://drive.google.com/demo-link", gambar_url: "/psv/karya-1.jpg", catatan: "", status: "Sudah Hantar", created_at: now, updated_at: now },
  { id: "ev-6", tugasan_id: "task-1", murid_id: "s9", link_bukti: "", gambar_url: "/psv/karya-2.jpg", catatan: "Perlu perbaiki teknik anyaman", status: "Dinilai", created_at: now, updated_at: now },

  // Task 2: Kolaj Haiwan - mostly pending (baru dibuat)
  { id: "ev-7", tugasan_id: "task-2", murid_id: "s1", link_bukti: "", gambar_url: "/psv/karya-3.jpg", catatan: "", status: "Sudah Hantar", created_at: now, updated_at: now },
  { id: "ev-8", tugasan_id: "task-2", murid_id: "s3", link_bukti: "", gambar_url: "/psv/karya-4.jpg", catatan: "", status: "Sudah Hantar", created_at: now, updated_at: now },
];

// ============================================
// DEMO BOOK TYPES
// ============================================

const d1 = new Date(today);
d1.setDate(d1.getDate() - 14);
const d2 = new Date(today);
d2.setDate(d2.getDate() - 7);
const d3 = new Date(today);
d3.setDate(d3.getDate() - 2);

const dateStr1 = d1.toISOString().split("T")[0];
const dateStr2 = d2.toISOString().split("T")[0];
const dateStr3 = d3.toISOString().split("T")[0];

export const DEMO_BOOK_TYPES: DbBookType[] = [
  {
    id: "bt-1",
    nama: "Buku Latihan BM",
    kelas: "3 Pearl",
    subjek: "BM",
    tarikh_list: [dateStr1, dateStr2, dateStr3],
    created_at: now,
    updated_at: now,
  },
  {
    id: "bt-2",
    nama: "Buku Latihan Sejarah",
    kelas: "6 Topaz",
    subjek: "Sejarah",
    tarikh_list: [dateStr1, dateStr2, dateStr3],
    created_at: now,
    updated_at: now,
  },
];

// ============================================
// DEMO BOOK CHECKS (~15 records)
// ============================================

let bookCheckId = 0;

function makeBookCheck(
  bookTypeId: string,
  muridId: string,
  tarikh: string,
  status: "hantar" | "tidak_lengkap" | "tidak_hantar"
): DbBookCheck {
  bookCheckId++;
  return {
    id: `bc-${bookCheckId}`,
    book_type_id: bookTypeId,
    murid_id: muridId,
    tarikh,
    status,
    created_at: now,
    updated_at: now,
  };
}

export const DEMO_BOOK_CHECKS: DbBookCheck[] = [
  // Buku Latihan BM (bt-1) — 3 Pearl students (s11-s20)
  makeBookCheck("bt-1", "s11", dateStr1, "hantar"),
  makeBookCheck("bt-1", "s12", dateStr1, "hantar"),
  makeBookCheck("bt-1", "s13", dateStr1, "hantar"),
  makeBookCheck("bt-1", "s14", dateStr1, "tidak_hantar"),
  makeBookCheck("bt-1", "s15", dateStr1, "hantar"),
  makeBookCheck("bt-1", "s11", dateStr2, "hantar"),
  makeBookCheck("bt-1", "s12", dateStr2, "tidak_lengkap"),
  makeBookCheck("bt-1", "s13", dateStr2, "hantar"),
  makeBookCheck("bt-1", "s14", dateStr2, "tidak_hantar"),

  // Buku Latihan Sejarah (bt-2) — 6 Topaz students (s1-s10)
  makeBookCheck("bt-2", "s1", dateStr1, "hantar"),
  makeBookCheck("bt-2", "s2", dateStr1, "hantar"),
  makeBookCheck("bt-2", "s3", dateStr1, "hantar"),
  makeBookCheck("bt-2", "s5", dateStr1, "tidak_hantar"),
  makeBookCheck("bt-2", "s1", dateStr2, "hantar"),
  makeBookCheck("bt-2", "s3", dateStr2, "tidak_lengkap"),
  makeBookCheck("bt-2", "s7", dateStr2, "hantar"),
];

// ============================================
// DEMO APP SETTINGS
// ============================================

export const DEMO_APP_SETTINGS = {
  pbdVisibleToParents: true,
};
