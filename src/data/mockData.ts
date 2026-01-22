import { Student, Assessment, BehaviorEvent, PsvTask, ALL_CLASSES } from "@/types";

// ============================================
// SEEDED RANDOM NUMBER GENERATOR
// Untuk elak hydration error (server & client sama)
// ============================================

function createSeededRandom(seed: number) {
  let state = seed;
  return function() {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

// ============================================
// NAMA-NAMA UNTUK GENERATE MURID
// ============================================

const FIRST_NAMES_MALAY_MALE = [
  "Ahmad", "Muhammad", "Adam", "Aiman", "Amin", "Arif", "Azman", "Danish",
  "Farhan", "Hafiz", "Haziq", "Irfan", "Ismail", "Luqman", "Nazri", "Rashid",
  "Syafiq", "Zaid", "Zahid", "Firdaus"
];

const FIRST_NAMES_MALAY_FEMALE = [
  "Siti", "Nur", "Aisyah", "Fatimah", "Aminah", "Nurul", "Syafiqah", "Izzah",
  "Alya", "Hana", "Maisarah", "Nadhirah", "Safiya", "Zara", "Adlina", "Balqis",
  "Husna", "Irdina", "Jasmine", "Kamila"
];

const LAST_NAMES_MALAY = [
  "Abu", "Ali", "Hassan", "Ibrahim", "Ismail", "Kamal", "Rahman", "Razak",
  "Yusof", "Zakaria", "Ahmad", "Omar", "Osman", "Hamid", "Kassim"
];

const FIRST_NAMES_CHINESE = [
  "Wei Ming", "Jia Wen", "Xin Yi", "Jun Wei", "Mei Ling", "Kai Ming",
  "Hui Ling", "Zhi Hao", "Yi Xuan", "Jia Hui"
];

const LAST_NAMES_CHINESE = ["Tan", "Lee", "Lim", "Wong", "Ng", "Ong", "Goh", "Chan"];

const FIRST_NAMES_INDIAN = [
  "Raj", "Vikram", "Priya", "Ananya", "Arjun", "Deepa", "Kumar", "Lakshmi",
  "Mohan", "Nisha"
];

const LAST_NAMES_INDIAN = ["Kumar", "Muthu", "Rajan", "Pillai", "Nair", "Sharma"];

// ============================================
// DEMO STUDENTS (untuk Parent View testing)
// ============================================

const DEMO_STUDENTS: Omit<Student, "id">[] = [
  { nama: "Ahmad bin Abu", noKp: "170523-14-1234", kelas: "6 Topaz", tahun: 6 },
  { nama: "Siti Aminah binti Ali", noKp: "170812-10-5678", kelas: "6 Ruby", tahun: 6 },
  { nama: "Muhammad Haziq bin Hassan", noKp: "170115-01-9012", kelas: "6 Pearl", tahun: 6 },
  { nama: "Nur Aisyah binti Rahman", noKp: "150303-14-3456", kelas: "3 Pearl", tahun: 3 },
  { nama: "Lee Wei Ming", noKp: "170720-08-7890", kelas: "6 Emerald", tahun: 6 },
  { nama: "Raj Kumar a/l Muthu", noKp: "170205-02-3333", kelas: "6 Topaz", tahun: 6 },
  { nama: "Nurul Huda binti Kamal", noKp: "170918-14-4444", kelas: "6 Sapphire", tahun: 6 },
  { nama: "Tan Mei Ling", noKp: "170411-01-5555", kelas: "6 Jade", tahun: 6 },
  { nama: "Muhammad Adam bin Ismail", noKp: "170630-08-6666", kelas: "6 Ruby", tahun: 6 },
  { nama: "Anis binti Razak", noKp: "150128-14-7777", kelas: "3 Pearl", tahun: 3 },
];

// ============================================
// GENERATE RANDOM STUDENT NAME (with seeded random)
// ============================================

function generateRandomName(random: () => number): { nama: string; gender: "M" | "F"; ethnicity: "Malay" | "Chinese" | "Indian" } {
  const rand = random();
  const gender = random() > 0.5 ? "M" : "F";

  if (rand < 0.6) {
    // 60% Malay
    const firstName = gender === "M"
      ? FIRST_NAMES_MALAY_MALE[Math.floor(random() * FIRST_NAMES_MALAY_MALE.length)]
      : FIRST_NAMES_MALAY_FEMALE[Math.floor(random() * FIRST_NAMES_MALAY_FEMALE.length)];
    const lastName = LAST_NAMES_MALAY[Math.floor(random() * LAST_NAMES_MALAY.length)];
    const connector = gender === "M" ? "bin" : "binti";
    return { nama: `${firstName} ${connector} ${lastName}`, gender, ethnicity: "Malay" };
  } else if (rand < 0.85) {
    // 25% Chinese
    const firstName = FIRST_NAMES_CHINESE[Math.floor(random() * FIRST_NAMES_CHINESE.length)];
    const lastName = LAST_NAMES_CHINESE[Math.floor(random() * LAST_NAMES_CHINESE.length)];
    return { nama: `${lastName} ${firstName}`, gender, ethnicity: "Chinese" };
  } else {
    // 15% Indian
    const firstName = FIRST_NAMES_INDIAN[Math.floor(random() * FIRST_NAMES_INDIAN.length)];
    const lastName = LAST_NAMES_INDIAN[Math.floor(random() * LAST_NAMES_INDIAN.length)];
    const connector = gender === "M" ? "a/l" : "a/p";
    return { nama: `${firstName} ${connector} ${lastName}`, gender, ethnicity: "Indian" };
  }
}

// ============================================
// GENERATE NO KP (with seeded random)
// ============================================

function generateNoKp(tahun: number, random: () => number): string {
  const yearPrefix = tahun === 3 ? "15" : "17"; // Tahun 3 = lahir 2015, Tahun 6 = lahir 2017 (approx)
  const month = String(Math.floor(random() * 12) + 1).padStart(2, "0");
  const day = String(Math.floor(random() * 28) + 1).padStart(2, "0");
  const state = String(Math.floor(random() * 14) + 1).padStart(2, "0");
  const last = String(Math.floor(random() * 9000) + 1000);
  return `${yearPrefix}${month}${day}-${state}-${last}`;
}

// ============================================
// GENERATE ALL STUDENTS (deterministic)
// ============================================

function generateStudents(): Student[] {
  const random = createSeededRandom(12345); // Fixed seed for consistency
  const students: Student[] = [];
  let idCounter = 0;

  // Add demo students first
  DEMO_STUDENTS.forEach((demo) => {
    students.push({ id: `student-${idCounter++}`, ...demo });
  });

  // Generate remaining students for each class to reach ~40 per class
  ALL_CLASSES.forEach((kelas) => {
    const tahun = kelas.startsWith("3") ? 3 : 6;
    const currentCount = students.filter((s) => s.kelas === kelas).length;
    const remaining = 40 - currentCount;

    for (let i = 0; i < remaining; i++) {
      const { nama } = generateRandomName(random);
      students.push({
        id: `student-${idCounter++}`,
        nama,
        noKp: generateNoKp(tahun, random),
        kelas,
        tahun,
      });
    }
  });

  return students;
}

// ============================================
// EXPORTED DATA
// ============================================

export const MOCK_STUDENTS: Student[] = generateStudents();

export const MOCK_ASSESSMENTS: Assessment[] = [
  // ============================================
  // BAHASA MELAYU TAHUN 3 (berdasarkan Rekod Transit T3)
  // ============================================
  // DENGAR TUTUR
  { id: "bm-1.1.1", subjek: "BM", nama: "1.1.1", tajuk: "Dengar Tutur", standardKandungan: "1.1 Mendengar dan memberikan respons" },
  { id: "bm-1.1.2", subjek: "BM", nama: "1.1.2", tajuk: "Dengar Tutur", standardKandungan: "1.1 Mendengar dan memberikan respons" },
  { id: "bm-1.1.3", subjek: "BM", nama: "1.1.3", tajuk: "Dengar Tutur", standardKandungan: "1.1 Mendengar dan memberikan respons" },
  { id: "bm-1.2.1", subjek: "BM", nama: "1.2.1", tajuk: "Dengar Tutur", standardKandungan: "1.2 Bertutur untuk menyampaikan maklumat" },
  { id: "bm-1.2.2", subjek: "BM", nama: "1.2.2", tajuk: "Dengar Tutur", standardKandungan: "1.2 Bertutur untuk menyampaikan maklumat" },
  { id: "bm-1.2.3", subjek: "BM", nama: "1.2.3", tajuk: "Dengar Tutur", standardKandungan: "1.2 Bertutur untuk menyampaikan maklumat" },
  // MEMBACA
  { id: "bm-2.1.1", subjek: "BM", nama: "2.1.1", tajuk: "Membaca", standardKandungan: "2.1 Membaca dengan sebutan yang betul" },
  { id: "bm-2.1.2", subjek: "BM", nama: "2.1.2", tajuk: "Membaca", standardKandungan: "2.1 Membaca dengan sebutan yang betul" },
  { id: "bm-2.2.1", subjek: "BM", nama: "2.2.1", tajuk: "Membaca", standardKandungan: "2.2 Memahami bahan yang dibaca" },
  { id: "bm-2.3.1", subjek: "BM", nama: "2.3.1", tajuk: "Membaca", standardKandungan: "2.3 Membaca dan memahami bahan sastera" },
  { id: "bm-2.3.2", subjek: "BM", nama: "2.3.2", tajuk: "Membaca", standardKandungan: "2.3 Membaca dan memahami bahan sastera" },
  // MENULIS
  { id: "bm-3.1.1", subjek: "BM", nama: "3.1.1", tajuk: "Menulis", standardKandungan: "3.1 Menulis secara mekanis" },
  { id: "bm-3.2.1", subjek: "BM", nama: "3.2.1", tajuk: "Menulis", standardKandungan: "3.2 Membina dan menulis ayat" },
  { id: "bm-3.2.2", subjek: "BM", nama: "3.2.2", tajuk: "Menulis", standardKandungan: "3.2 Membina dan menulis ayat" },
  { id: "bm-3.2.3", subjek: "BM", nama: "3.2.3", tajuk: "Menulis", standardKandungan: "3.2 Membina dan menulis ayat" },
  { id: "bm-3.2.4", subjek: "BM", nama: "3.2.4", tajuk: "Menulis", standardKandungan: "3.2 Membina dan menulis ayat" },
  { id: "bm-3.3.1", subjek: "BM", nama: "3.3.1", tajuk: "Menulis", standardKandungan: "3.3 Menghasilkan penulisan" },
  { id: "bm-3.3.2", subjek: "BM", nama: "3.3.2", tajuk: "Menulis", standardKandungan: "3.3 Menghasilkan penulisan" },

  // ============================================
  // SEJARAH TAHUN 6 (berdasarkan Rekod Transit PBD SEJ THN 6)
  // ============================================
  // TAJUK 10: NEGARA MALAYSIA
  // 10.1 Pembentukan Malaysia
  { id: "sej-10.1.1", subjek: "Sejarah", nama: "10.1.1", tajuk: "Tajuk 10: Negara Malaysia", standardKandungan: "10.1 Pembentukan Malaysia" },
  { id: "sej-10.1.2", subjek: "Sejarah", nama: "10.1.2", tajuk: "Tajuk 10: Negara Malaysia", standardKandungan: "10.1 Pembentukan Malaysia" },
  { id: "sej-10.1.3", subjek: "Sejarah", nama: "10.1.3", tajuk: "Tajuk 10: Negara Malaysia", standardKandungan: "10.1 Pembentukan Malaysia" },
  { id: "sej-10.1.4", subjek: "Sejarah", nama: "10.1.4", tajuk: "Tajuk 10: Negara Malaysia", standardKandungan: "10.1 Pembentukan Malaysia" },
  // 10.2 Negeri-negeri di Malaysia
  { id: "sej-10.2.1", subjek: "Sejarah", nama: "10.2.1", tajuk: "Tajuk 10: Negara Malaysia", standardKandungan: "10.2 Negeri-negeri di Malaysia" },
  { id: "sej-10.2.2", subjek: "Sejarah", nama: "10.2.2", tajuk: "Tajuk 10: Negara Malaysia", standardKandungan: "10.2 Negeri-negeri di Malaysia" },
  { id: "sej-10.2.3", subjek: "Sejarah", nama: "10.2.3", tajuk: "Tajuk 10: Negara Malaysia", standardKandungan: "10.2 Negeri-negeri di Malaysia" },
  { id: "sej-10.2.4", subjek: "Sejarah", nama: "10.2.4", tajuk: "Tajuk 10: Negara Malaysia", standardKandungan: "10.2 Negeri-negeri di Malaysia" },
  // 10.3 Rukun Negara
  { id: "sej-10.3.1", subjek: "Sejarah", nama: "10.3.1", tajuk: "Tajuk 10: Negara Malaysia", standardKandungan: "10.3 Rukun Negara" },
  { id: "sej-10.3.2", subjek: "Sejarah", nama: "10.3.2", tajuk: "Tajuk 10: Negara Malaysia", standardKandungan: "10.3 Rukun Negara" },
  { id: "sej-10.3.3", subjek: "Sejarah", nama: "10.3.3", tajuk: "Tajuk 10: Negara Malaysia", standardKandungan: "10.3 Rukun Negara" },

  // TAJUK 11: KITA RAKYAT MALAYSIA
  // 11.1 Kaum di Malaysia
  { id: "sej-11.1.1", subjek: "Sejarah", nama: "11.1.1", tajuk: "Tajuk 11: Kita Rakyat Malaysia", standardKandungan: "11.1 Kaum di Malaysia" },
  { id: "sej-11.1.2", subjek: "Sejarah", nama: "11.1.2", tajuk: "Tajuk 11: Kita Rakyat Malaysia", standardKandungan: "11.1 Kaum di Malaysia" },
  { id: "sej-11.1.3", subjek: "Sejarah", nama: "11.1.3", tajuk: "Tajuk 11: Kita Rakyat Malaysia", standardKandungan: "11.1 Kaum di Malaysia" },
  { id: "sej-11.1.4", subjek: "Sejarah", nama: "11.1.4", tajuk: "Tajuk 11: Kita Rakyat Malaysia", standardKandungan: "11.1 Kaum di Malaysia" },
  { id: "sej-11.1.5", subjek: "Sejarah", nama: "11.1.5", tajuk: "Tajuk 11: Kita Rakyat Malaysia", standardKandungan: "11.1 Kaum di Malaysia" },
  // 11.2 Agama dan Kepercayaan di Malaysia
  { id: "sej-11.2.1", subjek: "Sejarah", nama: "11.2.1", tajuk: "Tajuk 11: Kita Rakyat Malaysia", standardKandungan: "11.2 Agama dan Kepercayaan di Malaysia" },
  { id: "sej-11.2.2", subjek: "Sejarah", nama: "11.2.2", tajuk: "Tajuk 11: Kita Rakyat Malaysia", standardKandungan: "11.2 Agama dan Kepercayaan di Malaysia" },
  { id: "sej-11.2.3", subjek: "Sejarah", nama: "11.2.3", tajuk: "Tajuk 11: Kita Rakyat Malaysia", standardKandungan: "11.2 Agama dan Kepercayaan di Malaysia" },
  { id: "sej-11.2.4", subjek: "Sejarah", nama: "11.2.4", tajuk: "Tajuk 11: Kita Rakyat Malaysia", standardKandungan: "11.2 Agama dan Kepercayaan di Malaysia" },
  // 11.3 Perayaan Masyarakat di Malaysia
  { id: "sej-11.3.1", subjek: "Sejarah", nama: "11.3.1", tajuk: "Tajuk 11: Kita Rakyat Malaysia", standardKandungan: "11.3 Perayaan Masyarakat di Malaysia" },
  { id: "sej-11.3.2", subjek: "Sejarah", nama: "11.3.2", tajuk: "Tajuk 11: Kita Rakyat Malaysia", standardKandungan: "11.3 Perayaan Masyarakat di Malaysia" },
  { id: "sej-11.3.3", subjek: "Sejarah", nama: "11.3.3", tajuk: "Tajuk 11: Kita Rakyat Malaysia", standardKandungan: "11.3 Perayaan Masyarakat di Malaysia" },

  // TAJUK 12: PENCAPAIAN DAN KEBANGGAAN NEGARA
  // 12.1 Pemimpin Negara di Malaysia
  { id: "sej-12.1.1", subjek: "Sejarah", nama: "12.1.1", tajuk: "Tajuk 12: Pencapaian dan Kebanggaan Negara", standardKandungan: "12.1 Pemimpin Negara di Malaysia" },
  { id: "sej-12.1.2", subjek: "Sejarah", nama: "12.1.2", tajuk: "Tajuk 12: Pencapaian dan Kebanggaan Negara", standardKandungan: "12.1 Pemimpin Negara di Malaysia" },
  { id: "sej-12.1.3", subjek: "Sejarah", nama: "12.1.3", tajuk: "Tajuk 12: Pencapaian dan Kebanggaan Negara", standardKandungan: "12.1 Pemimpin Negara di Malaysia" },
  // 12.2 Kemajuan Ekonomi di Malaysia
  { id: "sej-12.2.1", subjek: "Sejarah", nama: "12.2.1", tajuk: "Tajuk 12: Pencapaian dan Kebanggaan Negara", standardKandungan: "12.2 Kemajuan Ekonomi di Malaysia" },
  { id: "sej-12.2.2", subjek: "Sejarah", nama: "12.2.2", tajuk: "Tajuk 12: Pencapaian dan Kebanggaan Negara", standardKandungan: "12.2 Kemajuan Ekonomi di Malaysia" },
  { id: "sej-12.2.3", subjek: "Sejarah", nama: "12.2.3", tajuk: "Tajuk 12: Pencapaian dan Kebanggaan Negara", standardKandungan: "12.2 Kemajuan Ekonomi di Malaysia" },
  // 12.3 Sukan Kebanggaan Malaysia
  { id: "sej-12.3.1", subjek: "Sejarah", nama: "12.3.1", tajuk: "Tajuk 12: Pencapaian dan Kebanggaan Negara", standardKandungan: "12.3 Sukan Kebanggaan Malaysia" },
  { id: "sej-12.3.2", subjek: "Sejarah", nama: "12.3.2", tajuk: "Tajuk 12: Pencapaian dan Kebanggaan Negara", standardKandungan: "12.3 Sukan Kebanggaan Malaysia" },
  { id: "sej-12.3.3", subjek: "Sejarah", nama: "12.3.3", tajuk: "Tajuk 12: Pencapaian dan Kebanggaan Negara", standardKandungan: "12.3 Sukan Kebanggaan Malaysia" },
  { id: "sej-12.3.4", subjek: "Sejarah", nama: "12.3.4", tajuk: "Tajuk 12: Pencapaian dan Kebanggaan Negara", standardKandungan: "12.3 Sukan Kebanggaan Malaysia" },
  // 12.4 Malaysia dan Dunia
  { id: "sej-12.4.1", subjek: "Sejarah", nama: "12.4.1", tajuk: "Tajuk 12: Pencapaian dan Kebanggaan Negara", standardKandungan: "12.4 Malaysia dan Dunia" },
  { id: "sej-12.4.2", subjek: "Sejarah", nama: "12.4.2", tajuk: "Tajuk 12: Pencapaian dan Kebanggaan Negara", standardKandungan: "12.4 Malaysia dan Dunia" },
  { id: "sej-12.4.3", subjek: "Sejarah", nama: "12.4.3", tajuk: "Tajuk 12: Pencapaian dan Kebanggaan Negara", standardKandungan: "12.4 Malaysia dan Dunia" },
  { id: "sej-12.4.4", subjek: "Sejarah", nama: "12.4.4", tajuk: "Tajuk 12: Pencapaian dan Kebanggaan Negara", standardKandungan: "12.4 Malaysia dan Dunia" },
  { id: "sej-12.4.5", subjek: "Sejarah", nama: "12.4.5", tajuk: "Tajuk 12: Pencapaian dan Kebanggaan Negara", standardKandungan: "12.4 Malaysia dan Dunia" },

  // ============================================
  // PSV (kekal seperti asal - tiada template Excel)
  // ============================================
  { id: "psv-catair", subjek: "PSV", nama: "Lukisan Cat Air" },
  { id: "psv-kolaj", subjek: "PSV", nama: "Kolaj" },
  { id: "psv-origami", subjek: "PSV", nama: "Origami" },
  { id: "psv-anyaman", subjek: "PSV", nama: "Anyaman" },
  { id: "psv-cetakan", subjek: "PSV", nama: "Cetakan" },
];

export const MOCK_PSV_TASKS: PsvTask[] = [
  {
    id: "task-1",
    nama: "Lukisan Alam Semulajadi",
    kelas: "6 Topaz",
    tarikhMula: "2026-01-06",
    tarikhAkhir: "2026-01-20",
  },
  {
    id: "task-2",
    nama: "Corak Batik",
    kelas: "6 Ruby",
    tarikhMula: "2026-01-10",
    tarikhAkhir: "2026-01-24",
  },
  {
    id: "task-3",
    nama: "Anyaman Kertas",
    kelas: "6 Pearl",
    tarikhMula: "2026-01-13",
    tarikhAkhir: "2026-01-27",
  },
];

// Initial behavior events for demo (dengan token values)
export const INITIAL_EVENTS: BehaviorEvent[] = [
  // ===== 6 Topaz =====
  {
    id: "evt-1",
    muridId: "student-0", // Ahmad bin Abu
    namaMurid: "Ahmad bin Abu",
    kelas: "6 Topaz",
    jenis: "Tolong guru urus kelas",
    kategori: "Positif",
    severity: "High", // +5 token
    catatan: "Membantu guru mengangkat buku ke kelas",
    timestamp: new Date().toISOString(),
    isPublic: true,
  },
  {
    id: "evt-2",
    muridId: "student-0",
    namaMurid: "Ahmad bin Abu",
    kelas: "6 Topaz",
    jenis: "Tidak siap kerja sekolah",
    kategori: "Negatif",
    severity: "Medium", // -3 token
    catatan: "Matematik mukasurat 45 tidak disiapkan",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    isPublic: true,
  },
  {
    id: "evt-3",
    muridId: "student-0",
    namaMurid: "Ahmad bin Abu",
    kelas: "6 Topaz",
    jenis: "Angkat tangan jawab soalan",
    kategori: "Positif",
    severity: "Low", // +1 token
    catatan: "",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isPublic: true,
  },
  {
    id: "evt-4",
    muridId: "student-5", // Raj Kumar
    namaMurid: "Raj Kumar a/l Muthu",
    kelas: "6 Topaz",
    jenis: "Skor tertinggi dalam kuiz",
    kategori: "Positif",
    severity: "High", // +5 token
    catatan: "100% dalam kuiz Sejarah",
    timestamp: new Date().toISOString(),
    isPublic: true,
  },
  {
    id: "evt-5",
    muridId: "student-5",
    namaMurid: "Raj Kumar a/l Muthu",
    kelas: "6 Topaz",
    jenis: "Aktif dalam kerja kumpulan",
    kategori: "Positif",
    severity: "Medium", // +3 token
    catatan: "",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    isPublic: true,
  },
  {
    id: "evt-6",
    muridId: "student-5",
    namaMurid: "Raj Kumar a/l Muthu",
    kelas: "6 Topaz",
    jenis: "Bantu rakan faham pelajaran",
    kategori: "Positif",
    severity: "Medium", // +3 token
    catatan: "Ajar kawan topik Sejarah",
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    isPublic: true,
  },

  // ===== 6 Ruby =====
  {
    id: "evt-7",
    muridId: "student-1", // Siti Aminah
    namaMurid: "Siti Aminah binti Ali",
    kelas: "6 Ruby",
    jenis: "Hasil kerja terbaik",
    kategori: "Positif",
    severity: "High", // +5 token
    catatan: "Projek Seni terbaik dalam kelas",
    timestamp: new Date().toISOString(),
    isPublic: true,
  },
  {
    id: "evt-8",
    muridId: "student-1",
    namaMurid: "Siti Aminah binti Ali",
    kelas: "6 Ruby",
    jenis: "Jaga kebersihan kelas",
    kategori: "Positif",
    severity: "Medium", // +3 token
    catatan: "",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isPublic: true,
  },
  {
    id: "evt-9",
    muridId: "student-8", // Muhammad Adam
    namaMurid: "Muhammad Adam bin Ismail",
    kelas: "6 Ruby",
    jenis: "Bising dalam kelas",
    kategori: "Negatif",
    severity: "Low", // -1 token
    catatan: "",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    isPublic: true,
  },

  // ===== 6 Pearl =====
  {
    id: "evt-10",
    muridId: "student-2", // Muhammad Haziq
    namaMurid: "Muhammad Haziq bin Hassan",
    kelas: "6 Pearl",
    jenis: "Tolong guru urus kelas",
    kategori: "Positif",
    severity: "High", // +5 token
    catatan: "Ketua kelas yang cemerlang",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isPublic: true,
  },
  {
    id: "evt-11",
    muridId: "student-2",
    namaMurid: "Muhammad Haziq bin Hassan",
    kelas: "6 Pearl",
    jenis: "Siap kerja lebih awal",
    kategori: "Positif",
    severity: "Low", // +1 token
    catatan: "",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    isPublic: true,
  },

  // ===== 6 Emerald =====
  {
    id: "evt-12",
    muridId: "student-4", // Lee Wei Ming
    namaMurid: "Lee Wei Ming",
    kelas: "6 Emerald",
    jenis: "Jaga kebersihan kelas",
    kategori: "Positif",
    severity: "Medium", // +3 token
    catatan: "Sentiasa kemas meja",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    isPublic: true,
  },
  {
    id: "evt-13",
    muridId: "student-4",
    namaMurid: "Lee Wei Ming",
    kelas: "6 Emerald",
    jenis: "Angkat tangan jawab soalan",
    kategori: "Positif",
    severity: "Low", // +1 token
    catatan: "",
    timestamp: new Date().toISOString(),
    isPublic: true,
  },

  // ===== 6 Sapphire =====
  {
    id: "evt-14",
    muridId: "student-6", // Nurul Huda
    namaMurid: "Nurul Huda binti Kamal",
    kelas: "6 Sapphire",
    jenis: "Aktif dalam kerja kumpulan",
    kategori: "Positif",
    severity: "Medium", // +3 token
    catatan: "",
    timestamp: new Date().toISOString(),
    isPublic: true,
  },

  // ===== 6 Jade =====
  {
    id: "evt-15",
    muridId: "student-7", // Tan Mei Ling
    namaMurid: "Tan Mei Ling",
    kelas: "6 Jade",
    jenis: "Skor tertinggi dalam kuiz",
    kategori: "Positif",
    severity: "High", // +5 token
    catatan: "Kuiz BM 98%",
    timestamp: new Date().toISOString(),
    isPublic: true,
  },
  {
    id: "evt-16",
    muridId: "student-7",
    namaMurid: "Tan Mei Ling",
    kelas: "6 Jade",
    jenis: "Tidur dalam kelas",
    kategori: "Negatif",
    severity: "Medium", // -3 token
    catatan: "Mengantuk selepas rehat",
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    isPublic: true,
  },

  // ===== 3 Pearl =====
  {
    id: "evt-17",
    muridId: "student-3", // Nur Aisyah
    namaMurid: "Nur Aisyah binti Rahman",
    kelas: "3 Pearl",
    jenis: "Kemas meja dan kerusi",
    kategori: "Positif",
    severity: "Low", // +1 token
    catatan: "",
    timestamp: new Date().toISOString(),
    isPublic: true,
  },
  {
    id: "evt-18",
    muridId: "student-9", // Anis
    namaMurid: "Anis binti Razak",
    kelas: "3 Pearl",
    jenis: "Bantu rakan faham pelajaran",
    kategori: "Positif",
    severity: "Medium", // +3 token
    catatan: "Tolong kawan belajar membaca",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    isPublic: true,
  },
];

// Helper to get assessment name by ID
export function getAssessmentName(id: string): string {
  const assessment = MOCK_ASSESSMENTS.find((a) => a.id === id);
  return assessment?.nama || id;
}
