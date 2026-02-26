# Sistem Rekod PBD & Sahsiah

Sistem pengurusan rekod PBD (Pentaksiran Bilik Darjah), token sahsiah murid, dan bukti PSV untuk guru sekolah rendah. Digunakan secara **dalaman** oleh guru, murid, dan ibu bapa sahaja.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend:** Supabase (PostgreSQL + Storage + Auth + RLS)
- **UI Icons:** lucide-react
- **Export:** xlsx (Excel export untuk rekod PBD)

## Struktur Projek

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # Dashboard guru (statistik, tetapan, reset data)
│   ├── layout.tsx          # Root layout (AuthProvider + Navbar)
│   ├── login/page.tsx      # Halaman login guru (Supabase Auth)
│   ├── pbd/page.tsx        # Rekod PBD (pentaksiran murid per subjek)
│   ├── psv/page.tsx        # Semakan bukti PSV (karya seni murid) + token penilaian
│   ├── sahsiah/page.tsx    # Rekod token sahsiah (positif/negatif)
│   └── parent/             # Portal ibu bapa (tanpa login)
│       ├── page.tsx         # Carian murid via No. KP
│       ├── anak/page.tsx    # Redirect
│       ├── anak/[ic]/page.tsx # Paparan lengkap anak (PBD+Token+PSV)
│       └── kejayaan/page.tsx  # Papan pendahulu token per kelas
├── components/
│   ├── ui/                 # Komponen UI reusable
│   │   ├── index.ts        # Barrel exports
│   │   ├── Button, Card, Input, Select, Badge, Modal, Spinner
│   │   ├── Breadcrumb, EmptyState
│   │   ├── DebouncedInput.tsx  # Input dengan debounce (500ms)
│   │   └── ErrorBanner.tsx     # Banner error dengan butang retry
│   ├── auth/ProtectedRoute.tsx # Guard halaman guru
│   └── layout/Navbar.tsx       # Navigation bar
├── hooks/
│   └── useSupabase.ts      # Semua data hooks (SATU-SATUNYA data layer)
│       # useStudents, useAssessments, usePbdRecords,
│       # useBehaviorEvents, usePsvTasks, usePsvEvidence, useAppSettings
├── contexts/
│   └── AuthContext.tsx      # Supabase Auth context (guru sahaja)
├── lib/
│   ├── supabase.ts          # Supabase client + Storage helpers + compressImage
│   └── utils.ts             # Fungsi utiliti (formatDate, isToday, cn, dll.)
├── types/
│   ├── database.ts          # Supabase DB types (SUMBER KEBENARAN untuk types)
│   └── index.ts             # Constants, enums, PRESET_EVENTS (tiada interface)
└── utils/
    └── exportExcel.ts       # Export rekod PBD ke Excel
```

## Seni Bina & Keputusan Penting

### Type System
- **Satu sumber kebenaran:** `types/database.ts` (`DbStudent`, `DbPbdRecord`, dll.)
- `types/index.ts` hanya mengandungi constants dan utility types (`Subject`, `Severity`, `PRESET_EVENTS`, dll.)
- **Tiada** interface camelCase lama — semua guna snake_case padanan DB

### Data Layer
- Semua data melalui hooks dalam `hooks/useSupabase.ts`
- Setiap hook return `{ data, loading, error, fetchFn, ...actions }`
- Hooks support optional filters (contoh: `useBehaviorEvents({ kelas })`)
- Skip logic: jika `muridId` kosong, hook skip fetch (tunggu student load)

### Imej PSV
- Gambar disimpan dalam **Supabase Storage** (bucket: `psv-evidence`)
- Auto-compress sebelum upload: max 1024px, JPEG 50% (~50-150KB per gambar)
- Had upload: 10MB input (dikecilkan automatik)
- Gambar lama base64 dalam DB masih berfungsi (backward compatible)

### Auth
- Guru: Supabase Auth (email/password) → `AuthContext` → `ProtectedRoute`
- Ibu bapa: Tanpa login, akses via No. KP anak (portal awam)
- Security sengaja ringan kerana sistem dalaman sahaja

### Error Handling
- Semua hooks return `error` state
- `ErrorBanner` component dengan butang "Cuba Lagi" pada semua halaman utama
- Toast tempatan (local state) pada setiap halaman untuk feedback operasi

### Debouncing
- `DebouncedInput` component untuk input yang tulis ke DB (catatan, link)
- 500ms delay, kekalkan local state untuk UX yang lancar

## Supabase

- **URL:** https://cwbtrlrmwvnfmhobbmab.supabase.co
- **Jadual:** students, assessments, pbd_records, behavior_events, psv_tasks, psv_evidence, app_settings
- **Storage bucket:** psv-evidence (public, RLS enabled)
- **Kolum jantina:** Ada dalam jadual students (`lelaki` / `perempuan`)
- Setup SQL untuk Storage: `supabase/storage-setup.sql`

## Arahan Build

```bash
npm install
npm run dev      # Development server (port 3000)
npm run build    # Production build
```

### Isu Diketahui
- `next build` gagal dengan EISDIR pada Windows jika path projek ada ruang (cth: "Koleksi Coding"). Dev server dan deployment Vercel tidak terjejas. Ini isu Next.js + Windows, bukan kod.

## Konvensyen

- Bahasa UI: **Bahasa Melayu**
- Commit messages: Bahasa Melayu
- Nama pembolehubah/fungsi: English (camelCase untuk JS, snake_case untuk DB)
- Fail baru: Elakkan melainkan benar-benar perlu — utamakan edit fail sedia ada

---

## Pelan Komersial (Belum Dilaksanakan)

Sistem ini akan dijual kepada guru-guru di Malaysia. Model: **dua pilihan serentak**.

### Pilihan A: SaaS (Multi-Tenant)
- Guru daftar → pilih pelan → terus guna di `app.erekod.my`
- Data diasingkan ikut `teacher_id`, satu Supabase untuk semua
- Bayaran bulanan via Toyyib Pay

| Pelan | Harga/bulan | Modul |
|-------|------------|-------|
| Percuma | RM0 | PBD sahaja, 1 subjek, 1 kelas |
| Asas | RM12 | PBD + Sahsiah, unlimited kelas |
| Pro | RM25 | Semua + AI auto-isi + Export Excel |

### Pilihan B: Siap Pasang (Self-Hosted)
- Sekolah/PPD beli → kita setup Supabase + Vercel untuk mereka
- Single-tenant, data 100% milik sekolah

| Pakej | Harga | Termasuk |
|-------|-------|----------|
| Standard | RM299 | Semua modul + setup + 3 bulan support |
| Premium | RM499 | Semua + custom logo + 1 tahun support |
| Renewal | RM49/tahun | Update + support berterusan |

### Satu Codebase, Dua Mod
```
ENV: DEPLOYMENT_MODE=saas | standalone

saas       → multi-tenant, teacher_id filter, billing aktif
standalone → single-tenant, macam sekarang, skip billing
```

### Fasa Pelaksanaan

**Fasa 1: Multi-Tenant Core (wajib untuk kedua-dua)**
- Auth guru + profil (nama, sekolah, subjek diajar)
- Tambah `teacher_id` pada semua jadual (students, pbd_records, dll.)
- RLS supaya guru nampak data sendiri sahaja
- Onboarding flow (daftar → setup kelas → import murid)

**Fasa 2: SaaS Layer**
- Landing page + pricing page
- Modul toggle ikut pelan langganan
- Integrasi Toyyib Pay untuk bayaran bulanan

**Fasa 3: Standalone Packaging**
- Script setup automatik (create Supabase project + deploy Vercel)
- Dokumentasi deploy untuk sekolah
- ENV toggle saas/standalone

### Ciri Baru Sedia Ada
- `src/app/api/ai-tp/route.ts` — AI auto-isi TP via Gemini 2.0 Flash
- `src/components/AiAutoFill.tsx` — Komponen UI AI (textarea → pratonton → apply)
- Reset TP & toggle sembunyi IC (localStorage) dalam `pbd/page.tsx`

### Token PSV
- Guru beri token semasa semak bukti PSV (Tiada/Perlu Diperbaiki +1/Memuaskan +3/Cemerlang +5)
- Token PSV auto masuk `behavior_events` dengan `jenis: "Hasil Karya PSV: [nama tugasan]"`
- Batal semak / padam bukti → token turut dipadam
- Duplikat dicegah: semak semula padam token lama, cipta baru
- Constant `PSV_TOKEN_OPTIONS` dan `PSV_JENIS_PREFIX` dalam `psv/page.tsx`
