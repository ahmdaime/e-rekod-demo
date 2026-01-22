import type React from "react";

// ============================================
// TYPE DEFINITIONS
// ============================================

export type Subject = "BM" | "Sejarah" | "PSV";
export type Severity = "Low" | "Medium" | "High";
export type EventCategory = "Positif" | "Negatif";
export type EvidenceStatus = "Belum Hantar" | "Sudah Hantar" | "Dinilai";
export type Semester = "PBD 1" | "PBD 2";

// Student type
export interface Student {
  id: string;
  nama: string;
  noKp: string;
  kelas: string;
  tahun: number;
}

// PBD Record type
export interface PbdRecord {
  id: string;
  muridId: string;
  subjek: Subject;
  kelas: string;
  pentaksiranId: string;
  tahunAkademik: string; // e.g., "2026"
  semester: Semester; // "PBD 1" atau "PBD 2"
  tp: 1 | 2 | 3 | 4 | 5 | 6 | null;
  catatan: string;
  updatedAt: string;
}

// Assessment type (Standard Pembelajaran level)
export interface Assessment {
  id: string;
  subjek: Subject;
  nama: string; // Nama SP e.g., "10.1.1"
  tajuk?: string; // Nama Tajuk e.g., "Tajuk 10: Negara Malaysia"
  standardKandungan?: string; // Nama SK e.g., "10.1 Pembentukan Malaysia"
}

// PSV Task type
export interface PsvTask {
  id: string;
  nama: string;
  kelas: string;
  tarikhMula: string;
  tarikhAkhir: string;
}

// PSV Evidence type
export interface PsvEvidence {
  id: string;
  tugasanId: string;
  muridId: string;
  linkBukti: string;
  gambarBukti?: string; // Base64 encoded image (temporary until backend)
  catatan: string;
  status: EvidenceStatus;
}

// Behavior Event type
export interface BehaviorEvent {
  id: string;
  muridId: string;
  namaMurid: string;
  kelas: string;
  jenis: string;
  kategori: EventCategory;
  severity: Severity | null;
  catatan: string;
  timestamp: string;
  isPublic: boolean;
}

// Preset Event type
export interface PresetEvent {
  label: string;
  kategori: EventCategory;
  isPublic: boolean;
  defaultSeverity?: Severity;
}

// ============================================
// CONSTANTS
// ============================================

// Inline styles untuk TP - lebih reliable daripada Tailwind classes
export const TP_STYLES: Record<number, React.CSSProperties> = {
  1: { backgroundColor: "#ef4444", color: "white" }, // red-500
  2: { backgroundColor: "#f97316", color: "white" }, // orange-500
  3: { backgroundColor: "#eab308", color: "white" }, // yellow-500
  4: { backgroundColor: "#84cc16", color: "white" }, // lime-500
  5: { backgroundColor: "#22c55e", color: "white" }, // green-500
  6: { backgroundColor: "#059669", color: "white" }, // emerald-600
};

// Tailwind classes (untuk fallback/legacy)
export const TP_COLORS: Record<number, string> = {
  1: "bg-red-500 text-white",
  2: "bg-orange-500 text-white",
  3: "bg-yellow-500 text-white",
  4: "bg-lime-500 text-white",
  5: "bg-green-500 text-white",
  6: "bg-emerald-600 text-white",
};

export const TP_COLORS_LIGHT: Record<number, string> = {
  1: "bg-red-100 text-red-800 border-red-200",
  2: "bg-orange-100 text-orange-800 border-orange-200",
  3: "bg-yellow-100 text-yellow-800 border-yellow-200",
  4: "bg-lime-100 text-lime-800 border-lime-200",
  5: "bg-green-100 text-green-800 border-green-200",
  6: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  Low: "bg-gray-100 text-gray-700 border-gray-200",
  Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  High: "bg-red-100 text-red-800 border-red-200",
};

// ============================================
// TOKEN SYSTEM
// ============================================

// Nilai token berdasarkan tahap (severity)
export const TOKEN_VALUES: Record<Severity, number> = {
  Low: 1,
  Medium: 3,
  High: 5,
};

// Fungsi kira nilai token (positif atau negatif)
export const getTokenValue = (kategori: EventCategory, severity: Severity): number => {
  const baseValue = TOKEN_VALUES[severity];
  return kategori === "Positif" ? baseValue : -baseValue;
};

export const PRESET_EVENTS: PresetEvent[] = [
  // ============================================
  // POSITIF - Umum (Cepat & Mudah)
  // ============================================
  { label: "Bagus", kategori: "Positif", isPublic: true, defaultSeverity: "Low" },
  { label: "Sangat Bagus", kategori: "Positif", isPublic: true, defaultSeverity: "Medium" },
  { label: "Cemerlang", kategori: "Positif", isPublic: true, defaultSeverity: "High" },

  // ============================================
  // POSITIF - Spesifik (Jika perlu)
  // ============================================
  // Tahap Rendah (+1 token)
  { label: "Angkat tangan jawab soalan", kategori: "Positif", isPublic: true, defaultSeverity: "Low" },
  { label: "Siap kerja lebih awal", kategori: "Positif", isPublic: true, defaultSeverity: "Low" },
  { label: "Kemas meja dan kerusi", kategori: "Positif", isPublic: true, defaultSeverity: "Low" },
  // Tahap Sederhana (+3 token)
  { label: "Bantu rakan faham pelajaran", kategori: "Positif", isPublic: true, defaultSeverity: "Medium" },
  { label: "Aktif dalam kerja kumpulan", kategori: "Positif", isPublic: true, defaultSeverity: "Medium" },
  { label: "Jaga kebersihan kelas", kategori: "Positif", isPublic: true, defaultSeverity: "Medium" },
  // Tahap Tinggi (+5 token)
  { label: "Skor tertinggi dalam kuiz", kategori: "Positif", isPublic: true, defaultSeverity: "High" },
  { label: "Hasil kerja terbaik", kategori: "Positif", isPublic: true, defaultSeverity: "High" },
  { label: "Tolong guru urus kelas", kategori: "Positif", isPublic: true, defaultSeverity: "High" },

  // ============================================
  // NEGATIF - Aktiviti dalam kelas
  // ============================================
  // Tahap Rendah (-1 token)
  { label: "Bising dalam kelas", kategori: "Negatif", isPublic: true, defaultSeverity: "Low" },
  { label: "Lupa bawa buku/alatan", kategori: "Negatif", isPublic: true, defaultSeverity: "Low" },
  { label: "Lambat masuk kelas", kategori: "Negatif", isPublic: true, defaultSeverity: "Low" },
  // Tahap Sederhana (-3 token)
  { label: "Tidak siap kerja sekolah", kategori: "Negatif", isPublic: true, defaultSeverity: "Medium" },
  { label: "Tidur dalam kelas", kategori: "Negatif", isPublic: true, defaultSeverity: "Medium" },
  { label: "Main telefon dalam kelas", kategori: "Negatif", isPublic: true, defaultSeverity: "Medium" },
  // Tahap Tinggi (-5 token)
  { label: "Bergaduh dalam kelas", kategori: "Negatif", isPublic: true, defaultSeverity: "High" },
  { label: "Buli rakan sekelas", kategori: "Negatif", isPublic: true, defaultSeverity: "High" },
  { label: "Ganggu pembelajaran kelas", kategori: "Negatif", isPublic: true, defaultSeverity: "High" },
];

export const CLASS_SUBJECT_MAP: Record<Subject, string[]> = {
  BM: ["3 Pearl"],
  Sejarah: ["6 Topaz", "6 Ruby", "6 Pearl", "6 Sapphire", "6 Jade"],
  PSV: ["6 Topaz", "6 Emerald", "6 Ruby", "6 Pearl"],
};

export const ALL_CLASSES = [
  "3 Pearl",
  "6 Topaz",
  "6 Ruby",
  "6 Pearl",
  "6 Sapphire",
  "6 Jade",
  "6 Emerald",
];

// Semester options
export const SEMESTERS: Semester[] = ["PBD 1", "PBD 2"];

// Generate academic years (current year and 2 previous years)
export const getAcademicYears = (): string[] => {
  const currentYear = new Date().getFullYear();
  return [
    currentYear.toString(),
    (currentYear - 1).toString(),
    (currentYear - 2).toString(),
  ];
};

// Get current semester based on month (Jan-Jun = PBD 1, Jul-Dec = PBD 2)
export const getCurrentSemester = (): Semester => {
  const month = new Date().getMonth(); // 0-11
  return month < 6 ? "PBD 1" : "PBD 2";
};
