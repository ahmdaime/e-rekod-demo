// ============================================
// SUPABASE DATABASE TYPES
// ============================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string;
          nama: string;
          no_kp: string;
          kelas: string;
          tahun: number;
          jantina: "lelaki" | "perempuan";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          no_kp: string;
          kelas: string;
          tahun?: number;
          jantina?: "lelaki" | "perempuan";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nama?: string;
          no_kp?: string;
          kelas?: string;
          tahun?: number;
          jantina?: "lelaki" | "perempuan";
          created_at?: string;
          updated_at?: string;
        };
      };
      assessments: {
        Row: {
          id: string;
          subjek: "BM" | "Sejarah" | "PSV";
          nama: string;
          tajuk: string | null;
          standard_kandungan: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subjek: "BM" | "Sejarah" | "PSV";
          nama: string;
          tajuk?: string | null;
          standard_kandungan?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          subjek?: "BM" | "Sejarah" | "PSV";
          nama?: string;
          tajuk?: string | null;
          standard_kandungan?: string | null;
          created_at?: string;
        };
      };
      pbd_records: {
        Row: {
          id: string;
          murid_id: string;
          subjek: "BM" | "Sejarah" | "PSV";
          kelas: string;
          pentaksiran_id: string;
          tahun_akademik: string;
          semester: "PBD 1" | "PBD 2";
          tp: number | null;
          catatan: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          murid_id: string;
          subjek: "BM" | "Sejarah" | "PSV";
          kelas: string;
          pentaksiran_id: string;
          tahun_akademik?: string;
          semester: "PBD 1" | "PBD 2";
          tp?: number | null;
          catatan?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          murid_id?: string;
          subjek?: "BM" | "Sejarah" | "PSV";
          kelas?: string;
          pentaksiran_id?: string;
          tahun_akademik?: string;
          semester?: "PBD 1" | "PBD 2";
          tp?: number | null;
          catatan?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      behavior_events: {
        Row: {
          id: string;
          murid_id: string;
          nama_murid: string;
          kelas: string;
          jenis: string;
          kategori: "Positif" | "Negatif";
          severity: "Low" | "Medium" | "High" | null;
          catatan: string;
          is_public: boolean;
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          murid_id: string;
          nama_murid: string;
          kelas: string;
          jenis: string;
          kategori: "Positif" | "Negatif";
          severity?: "Low" | "Medium" | "High" | null;
          catatan?: string;
          is_public?: boolean;
          timestamp?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          murid_id?: string;
          nama_murid?: string;
          kelas?: string;
          jenis?: string;
          kategori?: "Positif" | "Negatif";
          severity?: "Low" | "Medium" | "High" | null;
          catatan?: string;
          is_public?: boolean;
          timestamp?: string;
          created_at?: string;
        };
      };
      psv_tasks: {
        Row: {
          id: string;
          nama: string;
          kelas: string;
          tarikh_mula: string;
          tarikh_akhir: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          kelas: string;
          tarikh_mula?: string;
          tarikh_akhir: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nama?: string;
          kelas?: string;
          tarikh_mula?: string;
          tarikh_akhir?: string;
          created_at?: string;
        };
      };
      psv_evidence: {
        Row: {
          id: string;
          tugasan_id: string;
          murid_id: string;
          link_bukti: string;
          gambar_url: string;
          catatan: string;
          status: "Belum Hantar" | "Sudah Hantar" | "Dinilai";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tugasan_id: string;
          murid_id: string;
          link_bukti?: string;
          gambar_url?: string;
          catatan?: string;
          status?: "Belum Hantar" | "Sudah Hantar" | "Dinilai";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tugasan_id?: string;
          murid_id?: string;
          link_bukti?: string;
          gambar_url?: string;
          catatan?: string;
          status?: "Belum Hantar" | "Sudah Hantar" | "Dinilai";
          created_at?: string;
          updated_at?: string;
        };
      };
      app_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value?: Json;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          updated_at?: string;
        };
      };
      book_types: {
        Row: {
          id: string;
          nama: string;
          kelas: string;
          subjek: "BM" | "Sejarah" | "PSV";
          tarikh_list: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nama: string;
          kelas: string;
          subjek: "BM" | "Sejarah" | "PSV";
          tarikh_list?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nama?: string;
          kelas?: string;
          subjek?: "BM" | "Sejarah" | "PSV";
          tarikh_list?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      book_checks: {
        Row: {
          id: string;
          book_type_id: string;
          murid_id: string;
          tarikh: string;
          status: "hantar" | "tidak_lengkap" | "tidak_hantar";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          book_type_id: string;
          murid_id: string;
          tarikh: string;
          status: "hantar" | "tidak_lengkap" | "tidak_hantar";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          book_type_id?: string;
          murid_id?: string;
          tarikh?: string;
          status?: "hantar" | "tidak_lengkap" | "tidak_hantar";
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// ============================================
// HELPER TYPES FOR APP USE
// ============================================

export type DbStudent = Database["public"]["Tables"]["students"]["Row"];
export type DbAssessment = Database["public"]["Tables"]["assessments"]["Row"];
export type DbPbdRecord = Database["public"]["Tables"]["pbd_records"]["Row"];
export type DbBehaviorEvent = Database["public"]["Tables"]["behavior_events"]["Row"];
export type DbPsvTask = Database["public"]["Tables"]["psv_tasks"]["Row"];
export type DbPsvEvidence = Database["public"]["Tables"]["psv_evidence"]["Row"];
export type DbAppSetting = Database["public"]["Tables"]["app_settings"]["Row"];
export type DbBookType = Database["public"]["Tables"]["book_types"]["Row"];
export type DbBookCheck = Database["public"]["Tables"]["book_checks"]["Row"];
