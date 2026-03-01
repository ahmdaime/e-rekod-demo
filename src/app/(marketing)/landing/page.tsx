"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Coins,
  Image as ImageIcon,
  Users,
  ArrowRight,
  CheckCircle,
  Send,
  Loader2,
  BookOpen,
  MousePointerClick,
  Eye,
  ChevronDown,
  Zap,
  FileSpreadsheet,
  Smartphone,
} from "lucide-react";

const WAITLIST_URL = "";

/* TP color mapping for mini dashboard preview */
const TP_COLORS: Record<number, string> = {
  1: "#ef4444", 2: "#f97316", 3: "#eab308",
  4: "#84cc16", 5: "#22c55e", 6: "#059669",
};

const MOCK_STUDENTS = [
  { name: "Danial Hakimi", scores: [5, 4, 5, null, 3] },
  { name: "Nur Aisyah", scores: [6, 5, 6, 5, 6] },
  { name: "Hafiz Irfan", scores: [3, 3, 4, null, 2] },
  { name: "Siti Mariam", scores: [4, 4, null, null, 4] },
  { name: "Aiman Haziq", scores: [2, 3, 2, null, 1] },
];

/* ════════════════════════════════════════
   FAQ ITEM
════════════════════════════════════════ */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left group"
      >
        <span className="text-base font-semibold text-gray-800 group-hover:text-[#2D6A4F] transition-colors pr-4">
          {q}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-300 flex-shrink-0 transition-transform duration-300 ${
            open ? "rotate-180 text-[#2D6A4F]" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-40 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-base text-gray-500 leading-relaxed">{a}</p>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   MAIN LANDING PAGE
════════════════════════════════════════ */
export default function LandingPage() {
  const [form, setForm] = useState({ nama: "", email: "", sekolah: "", subjek: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nama || !form.email) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      if (WAITLIST_URL) {
        await fetch(WAITLIST_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ timestamp: new Date().toISOString(), ...form }),
        });
      }
      setSubmitted(true);
    } catch {
      setSubmitError("Gagal menghantar. Sila cuba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-white"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Segoe UI', system-ui, sans-serif" }}
    >
      {/* ═══════════ NAVIGATION ═══════════ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-5 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2D6A4F] flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-gray-900 font-bold text-lg tracking-tight">
              e-Rekod
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#modul" className="hidden md:block text-[15px] text-gray-400 hover:text-gray-700 transition-colors">
              Modul
            </a>
            <a href="#cara-guna" className="hidden md:block text-[15px] text-gray-400 hover:text-gray-700 transition-colors">
              Cara Guna
            </a>
            <a href="#soalan" className="hidden md:block text-[15px] text-gray-400 hover:text-gray-700 transition-colors">
              Soalan
            </a>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 bg-[#2D6A4F] hover:bg-[#245A42] text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
            >
              Cuba Demo
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section className="pt-16 bg-gradient-to-b from-[#F0F7F4] to-white">
        <div className="max-w-5xl mx-auto px-5 lg:px-8 pt-16 md:pt-24 pb-8 md:pb-12">
          {/* Badge */}
          <div
            className="flex justify-center mb-8"
            style={{ animation: "landing-fade-up 0.6s ease-out both" }}
          >
            <div className="inline-flex items-center gap-2 bg-[#2D6A4F]/[0.08] rounded-full px-4 py-1.5">
              <div className="w-2 h-2 rounded-full bg-[#2D6A4F]" />
              <span className="text-sm text-[#2D6A4F] font-medium">
                Dibina khas untuk guru sekolah rendah Malaysia
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center max-w-3xl mx-auto">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-6"
              style={{ animation: "landing-fade-up 0.7s ease-out 0.1s both" }}
            >
              Urus rekod PBD, sahsiah
              <br />
              dan PSV secara digital.
            </h1>

            <p
              className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
              style={{ animation: "landing-fade-up 0.7s ease-out 0.2s both" }}
            >
              Gantikan borang kertas dengan satu sistem yang ringkas.
              Ibu bapa boleh semak rekod anak pada bila-bila masa.
            </p>

            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
              style={{ animation: "landing-fade-up 0.7s ease-out 0.3s both" }}
            >
              <Link
                href="/"
                className="group inline-flex items-center justify-center gap-2 bg-[#2D6A4F] hover:bg-[#245A42] text-white font-bold px-8 py-4 rounded-xl text-base transition-colors shadow-lg shadow-[#2D6A4F]/20"
              >
                Cuba Demo Sekarang
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a
                href="#waitlist"
                className="inline-flex items-center justify-center gap-2 text-gray-500 hover:text-gray-700 font-medium px-6 py-4 text-base transition-colors"
              >
                Daftar Senarai Menunggu
              </a>
            </div>
          </div>

          {/* Mini Dashboard Mockup */}
          <div
            className="mt-14 md:mt-16 max-w-3xl mx-auto"
            style={{ animation: "landing-fade-up 0.8s ease-out 0.45s both" }}
          >
            <div className="rounded-xl border border-gray-200 overflow-hidden shadow-xl shadow-gray-200/50 bg-white">
              {/* Browser chrome */}
              <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-3 border-b border-gray-100">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 mx-2 bg-gray-100 rounded-md px-3 py-1">
                  <span className="text-xs text-gray-400">
                    erekod-demo.pages.dev/pbd
                  </span>
                </div>
              </div>

              {/* App content */}
              <div className="p-4 md:p-5 bg-[#f8f8f7]">
                <div className="bg-white rounded-lg p-4 border border-gray-100">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {["6 Topaz", "3 Pearl"].map((cls, i) => (
                        <span
                          key={cls}
                          className={`text-xs font-semibold px-2.5 py-1 rounded ${
                            i === 0
                              ? "bg-[#2D6A4F]/10 text-[#2D6A4F]"
                              : "text-gray-300"
                          }`}
                        >
                          {cls}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] bg-gray-50 text-gray-400 px-2 py-0.5 rounded font-medium">
                      Sejarah · PBD 1
                    </span>
                  </div>

                  {/* Column headers */}
                  <div className="flex items-center mb-2">
                    <div className="w-28 md:w-32" />
                    {["SP 1", "SP 2", "SP 3", "SP 4", "SP 5"].map((sp) => (
                      <div key={sp} className="w-11 md:w-12 text-center text-[10px] text-gray-300 font-semibold">
                        {sp}
                      </div>
                    ))}
                  </div>

                  {/* Rows */}
                  <div className="space-y-1">
                    {MOCK_STUDENTS.map((s, i) => (
                      <div
                        key={i}
                        className="flex items-center rounded px-1 py-0.5"
                        style={{ animation: `landing-grid-fade 0.4s ease-out ${i * 0.06}s both` }}
                      >
                        <span className="text-xs text-gray-500 w-28 md:w-32 truncate pr-2 font-medium">
                          {s.name}
                        </span>
                        <div className="flex gap-1">
                          {s.scores.map((score, j) => (
                            <div
                              key={j}
                              className="w-11 md:w-12 h-7 rounded flex items-center justify-center text-[10px] font-bold"
                              style={
                                score
                                  ? {
                                      backgroundColor: `${TP_COLORS[score]}18`,
                                      color: TP_COLORS[score],
                                    }
                                  : {
                                      backgroundColor: "#f5f5f4",
                                      color: "#d4d4d4",
                                    }
                              }
                            >
                              {score ? `TP${score}` : "\u2014"}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TRUST STRIP ═══════════ */}
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-5 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "4 Modul", desc: "PBD, Sahsiah, PSV, Portal" },
              { value: "TP 1 hingga 6", desc: "Ikut format PBD terkini" },
              { value: "Export Excel", desc: "Muat turun rekod bila perlu" },
              { value: "Tanpa Login", desc: "Portal ibu bapa terbuka" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-base font-bold text-gray-800">{s.value}</p>
                <p className="text-sm text-gray-400 mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="modul" className="py-20 md:py-28 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#2D6A4F] uppercase tracking-wider mb-3">
              Empat modul utama
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Semua keperluan rekod kelas, dalam satu tempat.
            </h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">
              Setiap modul dibina untuk menjimatkan masa guru, bukan menambah kerja.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                icon: ClipboardList,
                title: "Rekod PBD",
                description:
                  "Rekod Tahap Penguasaan (TP 1 hingga 6) untuk setiap murid mengikut subjek. Klik pada petak, pilih TP, siap. Boleh export ke Excel bila-bila masa.",
                color: "#2D6A4F",
                bg: "#F0F7F4",
              },
              {
                icon: Coins,
                title: "Token Sahsiah",
                description:
                  "Catat tingkah laku positif dan negatif murid. Pilih dari senarai yang disediakan atau tulis sendiri. Setiap token direkodkan dengan tarikh dan masa.",
                color: "#B8860B",
                bg: "#FBF7ED",
              },
              {
                icon: ImageIcon,
                title: "Bukti PSV",
                description:
                  "Murid hantar gambar hasil karya melalui sistem. Guru semak, beri penilaian, dan token dijana secara automatik. Tidak perlu guna WhatsApp lagi.",
                color: "#C0562B",
                bg: "#FDF4F0",
              },
              {
                icon: Users,
                title: "Portal Ibu Bapa",
                description:
                  "Ibu bapa masuk menggunakan nombor kad pengenalan anak. Tiada akaun perlu didaftarkan. Boleh lihat semua rekod PBD, token sahsiah, dan papan pencapaian kelas.",
                color: "#3A7CA5",
                bg: "#EFF6FB",
              },
            ].map((f, i) => (
              <div
                key={f.title}
                className="rounded-xl p-6 md:p-7 transition-all duration-300 hover:shadow-md border border-transparent hover:border-gray-100"
                style={{
                  backgroundColor: f.bg,
                  animation: `landing-fade-up 0.5s ease-out ${i * 0.08}s both`,
                }}
              >
                <div
                  className="w-11 h-11 rounded-lg flex items-center justify-center mb-5"
                  style={{ backgroundColor: `${f.color}15` }}
                >
                  <f.icon className="w-5 h-5" style={{ color: f.color }} strokeWidth={1.8} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-base text-gray-500 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PULL QUOTE ═══════════ */}
      <section className="py-14 md:py-16 px-5 bg-[#F0F7F4]">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-2xl md:text-3xl font-bold text-gray-800 leading-snug">
            &ldquo;Cikgu sibuk mengajar,
            <br />
            bukan mengisi borang.&rdquo;
          </blockquote>
          <p className="text-sm text-[#2D6A4F] font-semibold mt-4">
            Misi e-Rekod
          </p>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="cara-guna" className="py-20 md:py-28 px-5 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#2D6A4F] uppercase tracking-wider mb-3">
              Cara guna
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Tiga langkah sahaja.
            </h2>
            <p className="text-lg text-gray-400 max-w-lg mx-auto">
              Tidak perlu latihan khas. Buka, klik, dan rekod terus disimpan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                num: "1",
                icon: MousePointerClick,
                title: "Pilih kelas dan subjek",
                desc: "Buka e-Rekod, pilih kelas anda dan subjek yang hendak direkodkan. Senarai murid akan terpapar secara automatik.",
                color: "#2D6A4F",
              },
              {
                num: "2",
                icon: Zap,
                title: "Rekod dengan satu klik",
                desc: "Klik pada petak TP untuk rekod PBD, pilih jenis token untuk sahsiah, atau semak bukti karya PSV yang dihantar murid.",
                color: "#B8860B",
              },
              {
                num: "3",
                icon: Eye,
                title: "Ibu bapa boleh semak",
                desc: "Semua rekod yang disimpan boleh dilihat oleh ibu bapa melalui portal khas. Mereka hanya perlu masukkan nombor KP anak.",
                color: "#C0562B",
              },
            ].map((step, i) => (
              <div
                key={step.num}
                className="text-center"
                style={{ animation: `landing-fade-up 0.5s ease-out ${i * 0.1}s both` }}
              >
                <div className="flex justify-center mb-5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${step.color}10` }}
                  >
                    <step.icon className="w-6 h-6" style={{ color: step.color }} strokeWidth={1.6} />
                  </div>
                </div>
                <span className="inline-block text-xs font-bold text-white bg-[#2D6A4F] w-6 h-6 rounded-full leading-6 mb-3">
                  {step.num}
                </span>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                <p className="text-base text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 bg-[#2D6A4F] hover:bg-[#245A42] text-white font-bold px-8 py-4 rounded-xl text-base transition-colors shadow-lg shadow-[#2D6A4F]/20"
            >
              Cuba sendiri sekarang
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ WHY E-REKOD ═══════════ */}
      <section className="py-20 md:py-28 px-5 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#2D6A4F] uppercase tracking-wider mb-3">
              Kenapa e-Rekod
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Dibina khas untuk guru Malaysia.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Smartphone,
                title: "Buka di mana-mana",
                desc: "Tiada perlu muat turun aplikasi. Buka dalam pelayar web di telefon, tablet, atau komputer.",
              },
              {
                icon: FileSpreadsheet,
                title: "Ikut format KPM",
                desc: "Tahap Penguasaan 1 hingga 6 mengikut format pentaksiran PBD yang ditetapkan oleh Kementerian Pendidikan Malaysia.",
              },
              {
                icon: Zap,
                title: "Cepat dan ringkas",
                desc: "Antaramuka yang mudah difahami. Tiada ciri yang rumit atau tidak perlu. Fokus kepada apa yang guru perlukan sahaja.",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                className="bg-white rounded-xl p-6 border border-gray-100"
                style={{ animation: `landing-fade-up 0.5s ease-out ${i * 0.08}s both` }}
              >
                <div className="w-11 h-11 rounded-lg bg-gray-50 flex items-center justify-center mb-4">
                  <item.icon className="w-5 h-5 text-gray-600" strokeWidth={1.6} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-base text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section id="soalan" className="py-20 md:py-28 px-5 bg-white">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-[#2D6A4F] uppercase tracking-wider mb-3">
              Soalan lazim
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              Ada soalan?
            </h2>
          </div>

          <div>
            {[
              {
                q: "Adakah e-Rekod percuma untuk dicuba?",
                a: "Ya, versi demo boleh dicuba sepenuhnya tanpa sebarang bayaran. Versi penuh akan ditawarkan dengan pelan langganan bermula serendah RM12 sebulan.",
              },
              {
                q: "Bolehkah ibu bapa lihat rekod anak mereka?",
                a: "Boleh. Portal Ibu Bapa membenarkan akses menggunakan nombor kad pengenalan anak. Tiada akaun perlu didaftarkan.",
              },
              {
                q: "Adakah data yang disimpan selamat?",
                a: "Data disimpan dalam pangkalan data yang menggunakan penyulitan. Setiap guru hanya dapat melihat data mereka sendiri.",
              },
              {
                q: "Bolehkah rekod dimuat turun ke Excel?",
                a: "Boleh. Rekod PBD boleh dimuat turun dalam format Excel (.xlsx) pada bila-bila masa melalui butang Muat Turun di halaman PBD.",
              },
              {
                q: "Adakah e-Rekod boleh digunakan di telefon?",
                a: "Boleh. e-Rekod dibina untuk berfungsi di pelayar web, jadi boleh digunakan di telefon, tablet, atau komputer tanpa perlu memuat turun sebarang aplikasi.",
              },
            ].map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ WAITLIST ═══════════ */}
      <section id="waitlist" className="py-20 md:py-28 px-5 bg-[#F0F7F4]">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-[#2D6A4F] uppercase tracking-wider mb-3">
              Senarai menunggu
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              Daftar awal.
            </h2>
            <p className="text-base text-gray-500">
              Jadi antara yang pertama menggunakan e-Rekod apabila ia dilancarkan.
            </p>
          </div>

          {submitted ? (
            <div className="bg-white border border-gray-100 rounded-xl p-10 text-center shadow-sm">
              <CheckCircle className="w-10 h-10 text-[#2D6A4F] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Terima kasih!</h3>
              <p className="text-base text-gray-500">
                Kami akan hubungi anda melalui emel apabila e-Rekod sedia untuk digunakan.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-gray-100 rounded-xl p-6 md:p-8 space-y-4 shadow-sm"
            >
              {[
                { label: "Nama penuh", key: "nama", type: "text", req: true, ph: "Cth: Puan Siti Aminah" },
                { label: "Alamat emel", key: "email", type: "email", req: true, ph: "cikgu@email.com" },
                { label: "Nama sekolah", key: "sekolah", type: "text", req: false, ph: "Cth: SK Taman Melawati" },
                { label: "Subjek yang diajar", key: "subjek", type: "text", req: false, ph: "Cth: BM, Sejarah, PSV" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5">
                    {f.label}
                    {f.req && <span className="text-red-400 ml-0.5">*</span>}
                  </label>
                  <input
                    type={f.type}
                    required={f.req}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [f.key]: e.target.value }))
                    }
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-base text-gray-800 placeholder:text-gray-300 focus:border-[#2D6A4F] focus:ring-1 focus:ring-[#2D6A4F]/20 focus:outline-none transition-all"
                    placeholder={f.ph}
                  />
                </div>
              ))}

              {submitError && (
                <p className="text-red-500 text-sm font-medium">{submitError}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#2D6A4F] hover:bg-[#245A42] text-white font-bold py-3.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 text-base"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {submitting ? "Menghantar..." : "Daftar Sekarang"}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="border-t border-gray-100 py-8 px-5 bg-white">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#2D6A4F] flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-gray-600 text-sm font-semibold">e-Rekod</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Demo
            </Link>
            <a href="#modul" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Modul
            </a>
            <a href="#waitlist" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
              Senarai Menunggu
            </a>
          </div>

          <p className="text-gray-300 text-sm">
            &copy; {new Date().getFullYear()} e-Rekod
          </p>
        </div>
      </footer>
    </div>
  );
}
