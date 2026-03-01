"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ClipboardList,
  ClipboardCheck,
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

const WAITLIST_URL = "https://script.google.com/macros/s/AKfycbwWugWBOmxgiIOPlMxbwSa6iHxC0bjVBLoGH_V6ebNK7xwS2L6IAodal3B1Ub5yyCzq/exec";


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
          open ? "max-h-96 pb-5" : "max-h-0"
        }`}
      >
        <p className="text-base text-gray-600 leading-relaxed">{a}</p>
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
    const trimmed = {
      nama: form.nama.trim(),
      email: form.email.trim(),
      sekolah: form.sekolah.trim(),
      subjek: form.subjek.trim(),
    };
    if (!trimmed.nama || !trimmed.email) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed.email)) {
      setSubmitError("Sila masukkan alamat emel yang sah.");
      return;
    }
    // Client-side rate limiting (1 submission per hour)
    const lastSubmit = localStorage.getItem("waitlist_last_submit");
    if (lastSubmit && Date.now() - parseInt(lastSubmit) < 3600000) {
      setSubmitError("Anda sudah mendaftar. Sila cuba lagi selepas 1 jam.");
      return;
    }
    setSubmitting(true);
    setSubmitError("");
    try {
      if (WAITLIST_URL) {
        await fetch(WAITLIST_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify({ timestamp: new Date().toISOString(), ...trimmed }),
        });
      }
      localStorage.setItem("waitlist_last_submit", Date.now().toString());
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
            <a href="#modul" className="hidden md:block text-[15px] text-gray-500 hover:text-gray-800 transition-colors">
              Modul
            </a>
            <a href="#cara-guna" className="hidden md:block text-[15px] text-gray-500 hover:text-gray-800 transition-colors">
              Cara Guna
            </a>
            <a href="#soalan" className="hidden md:block text-[15px] text-gray-500 hover:text-gray-800 transition-colors">
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
                Dibina khas untuk guru-guru di Malaysia
              </span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center max-w-3xl mx-auto">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-[1.1] mb-6"
              style={{ animation: "landing-fade-up 0.7s ease-out 0.1s both" }}
            >
              Satu klik. Semua rekod
              <br />
              kelas anda selesai.
            </h1>

            <p
              className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
              style={{ animation: "landing-fade-up 0.7s ease-out 0.2s both" }}
            >
              Rekod PBD, semakan buku, token sahsiah, bukti PSV dan portal ibu bapa.
              Semua dalam satu sistem yang dibina khas untuk guru.
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

          {/* Dashboard Screenshot */}
          <div
            className="mt-14 md:mt-16 max-w-4xl mx-auto relative"
            style={{ animation: "landing-fade-up 0.8s ease-out 0.45s both" }}
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-[#2D6A4F]/15 border border-gray-200/80 relative">
              <img
                src="/dashboard-preview.png"
                alt="Paparan papan pemuka e-Rekod yang menunjukkan senarai murid dan rekod TP"
                className="w-full h-auto block"
                width={1200}
                height={675}
              />
              {/* Bottom gradient fade */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F0F7F4] to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ TRUST STRIP ═══════════ */}
      <section className="border-b border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-5 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: "5 Modul", desc: "PBD, Semakan Buku, Sahsiah, PSV, Portal" },
              { value: "TP 1 hingga 6", desc: "Ikut format PBD terkini" },
              { value: "Export Excel", desc: "Muat turun rekod bila perlu" },
              { value: "Tanpa Login", desc: "Portal ibu bapa terbuka" },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-base font-bold text-gray-800">{s.value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section id="modul" className="py-20 md:py-28 px-5 bg-white scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#2D6A4F] uppercase tracking-wider mb-3">
              Lima modul utama
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Semua keperluan rekod kelas, dalam satu tempat.
            </h2>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Setiap modul dibina untuk menjimatkan masa guru, bukan menambah kerja.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                icon: ClipboardList,
                title: "Rekod PBD",
                tag: "TP 1–6 · Export Excel",
                description:
                  "Rekod Tahap Penguasaan untuk setiap murid mengikut subjek. Klik pada petak, pilih TP, siap. Muat turun ke Excel dengan formatting lengkap bila-bila masa.",
                color: "#2D6A4F",
                bg: "#F0F7F4",
              },
              {
                icon: ClipboardCheck,
                title: "Semakan Buku",
                tag: "Auto-token · 4 status",
                description:
                  "Semak penghantaran buku latihan mengikut tarikh. Satu klik tukar status: hantar, tidak lengkap, atau tidak hantar. Token sahsiah dikemaskini secara automatik.",
                color: "#0D9488",
                bg: "#F0FDFA",
              },
              {
                icon: Coins,
                title: "Token Sahsiah",
                tag: "Positif & negatif · Papan kedudukan",
                description:
                  "Catat tingkah laku positif dan negatif murid. Pilih dari 19 preset atau tulis sendiri. Ibu bapa boleh lihat papan kedudukan token anak mereka.",
                color: "#B8860B",
                bg: "#FBF7ED",
              },
              {
                icon: ImageIcon,
                title: "Bukti PSV",
                tag: "Khas untuk guru PSV",
                description:
                  "Modul tambahan untuk guru PSV yang berminat. Murid hantar gambar hasil karya, guru semak dan beri penilaian. Token dijana automatik, semua dalam satu tempat.",
                color: "#C0562B",
                bg: "#FDF4F0",
              },
              {
                icon: Users,
                title: "Portal Ibu Bapa",
                tag: "Tanpa login · No. KP sahaja",
                description:
                  "Ibu bapa masuk guna nombor KP anak, tiada akaun perlu didaftarkan. Boleh lihat rekod PBD, token sahsiah, dan papan pencapaian kelas secara langsung.",
                color: "#3A7CA5",
                bg: "#EFF6FB",
              },
            ].map((f, i) => (
              <div
                key={f.title}
                className="rounded-xl p-6 md:p-7 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border border-transparent hover:border-gray-100 group"
                style={{
                  backgroundColor: f.bg,
                  animation: `landing-fade-up 0.5s ease-out ${i * 0.08}s both`,
                }}
              >
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${f.color}15` }}
                  >
                    <f.icon className="w-5 h-5" style={{ color: f.color }} strokeWidth={1.8} />
                  </div>
                  <span
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: `${f.color}12`, color: f.color }}
                  >
                    {f.tag}
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-base text-gray-600 leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PULL QUOTE ═══════════ */}
      <section className="py-16 md:py-20 px-5 bg-[#F0F7F4]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm font-semibold text-[#2D6A4F] uppercase tracking-wider mb-6">
            Kenapa e-Rekod wujud
          </p>
          <blockquote className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-6">
            &ldquo;Guru sepatutnya fokus mendidik, bukan bergelut dengan borang dan sistem yang separuh siap.&rdquo;
          </blockquote>
          <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
            e-Rekod bukan sistem yang dijana dalam beberapa minit. Ia dibina dari awal dengan satu matlamat: <strong className="text-gray-900">memudahkan kerja harian guru melalui sistem yang benar-benar berfungsi.</strong> Setiap klik direkod secara realtime. Tiada data hilang, tiada masalah yang perlu cikgu selesaikan sendiri. Cikgu guna, kami yang jaga.
          </p>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="cara-guna" className="py-20 md:py-28 px-5 bg-white scroll-mt-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-[#2D6A4F] uppercase tracking-wider mb-3">
              Cara guna
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Tiga langkah sahaja.
            </h2>
            <p className="text-lg text-gray-600 max-w-lg mx-auto">
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
                <p className="text-base text-gray-600 leading-relaxed">{step.desc}</p>
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
                <p className="text-base text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section id="soalan" className="py-20 md:py-28 px-5 bg-white scroll-mt-20">
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
                q: "Adakah e-Rekod percuma?",
                a: "Demo boleh dicuba sepenuhnya tanpa bayaran. Versi penuh adalah perkhidmatan berbayar melalui langganan bulanan untuk guru secara persendirian. Harga akan dimaklumkan kepada mereka yang mendaftar senarai menunggu.",
              },
              {
                q: "Bolehkah ibu bapa lihat rekod anak mereka?",
                a: "Boleh. Portal Ibu Bapa membenarkan akses menggunakan nombor kad pengenalan anak. Tiada akaun perlu didaftarkan.",
              },
              {
                q: "Adakah data murid selamat?",
                a: "Data hanya boleh diakses oleh guru dan ibu bapa yang mempunyai No. KP murid. Sistem ini direka untuk kegunaan guru dan ibu bapa sahaja. Data disimpan dalam pangkalan data yang menggunakan penyulitan, dan setiap guru hanya dapat melihat data mereka sendiri.",
              },
              {
                q: "Bolehkah rekod dimuat turun ke Excel?",
                a: "Boleh. Rekod PBD dan semakan buku boleh dimuat turun dalam format Excel (.xlsx) yang lengkap dengan formatting pada bila-bila masa.",
              },
              {
                q: "Adakah e-Rekod boleh digunakan di telefon?",
                a: "Boleh. e-Rekod dibina untuk berfungsi di pelayar web, jadi boleh digunakan di telefon, tablet, atau komputer tanpa perlu memuat turun sebarang aplikasi.",
              },
              {
                q: "Adakah ini untuk guru persendirian atau untuk sekolah?",
                a: "Buat masa ini, e-Rekod dibina khusus untuk guru secara persendirian. Setiap guru melanggan dan menguruskan kelas mereka sendiri. Pakej untuk peringkat sekolah belum dalam perancangan, tetapi kami terbuka kepada maklum balas.",
              },
            ].map((item, i) => (
              <FaqItem key={i} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ WAITLIST ═══════════ */}
      <section id="waitlist" className="py-20 md:py-28 px-5 bg-[#F0F7F4] scroll-mt-20">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-[#2D6A4F] uppercase tracking-wider mb-3">
              Senarai menunggu
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
              Berminat? Daftar dulu.
            </h2>
            <p className="text-base text-gray-600">
              Kami akan hubungi anda dengan maklumat harga dan pakej apabila e-Rekod sedia dilancarkan. Tiada komitmen diperlukan.
            </p>
          </div>

          {submitted ? (
            <div className="bg-white border border-gray-100 rounded-xl p-10 text-center shadow-sm">
              <CheckCircle className="w-10 h-10 text-[#2D6A4F] mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Terima kasih!</h3>
              <p className="text-base text-gray-600">
                Kami akan hubungi anda melalui emel dengan maklumat harga dan pakej apabila e-Rekod sedia untuk dilancarkan.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-gray-100 rounded-xl p-6 md:p-8 space-y-4 shadow-sm"
            >
              {[
                { label: "Nama penuh", key: "nama", type: "text", req: true, ph: "Cth: Puan Siti Aminah", max: 100 },
                { label: "Alamat emel", key: "email", type: "email", req: true, ph: "cikgu@email.com", max: 254 },
                { label: "Sekolah tempat mengajar", key: "sekolah", type: "text", req: false, ph: "Cth: SK Taman Melawati", max: 150 },
                { label: "Subjek yang diajar", key: "subjek", type: "text", req: false, ph: "Cth: BM, Sejarah, PSV", max: 150 },
              ].map((f) => (
                <div key={f.key}>
                  <label htmlFor={`waitlist-${f.key}`} className="block text-sm font-semibold text-gray-600 mb-1.5">
                    {f.label}
                    {f.req && <span className="text-red-400 ml-0.5" aria-hidden="true">*</span>}
                  </label>
                  <input
                    id={`waitlist-${f.key}`}
                    type={f.type}
                    required={f.req}
                    maxLength={f.max}
                    aria-required={f.req}
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
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Demo
            </Link>
            <a href="#modul" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Modul
            </a>
            <a href="#waitlist" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Senarai Menunggu
            </a>
          </div>

          <p className="text-gray-300 text-sm">
            &copy; {new Date().getFullYear()} e-Rekod
          </p>
        </div>
        <div className="max-w-5xl mx-auto mt-4 pt-4 border-t border-gray-50 text-center">
          <p className="text-xs text-gray-400">
            Dibina oleh{" "}
            <a
              href="https://portfolio-cikguaime.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#2D6A4F] hover:underline"
            >
              Cikgu Aime
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
