"use client";

import React, { useState, useMemo, useCallback } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Card, Spinner, ErrorBanner, Breadcrumb } from "@/components/ui";
import { useStudents, useBookTypes, useBookChecks, useBehaviorEvents } from "@/hooks/useSupabase";
import {
  CLASS_SUBJECT_MAP,
  BOOK_CHECK_STYLES,
  BOOK_CHECK_LABELS,
  BOOK_CHECK_SYMBOLS,
  BOOK_CHECK_CYCLE,
  BOOK_CHECK_JENIS_PREFIX,
} from "@/types";
import type { Subject, BookCheckStatus } from "@/types";
import type { DbStudent } from "@/types/database";
import { exportBookChecksToExcel } from "@/utils/exportExcel";
import {
  Plus,
  Trash2,
  Download,
  CalendarPlus,
  CalendarMinus,
  Check,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export default function SemakanBukuPage() {
  // ============================================
  // FILTER STATE
  // ============================================
  const [selectedSubjek, setSelectedSubjek] = useState<Subject | "">("");
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");

  // ============================================
  // MODAL STATE
  // ============================================
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [newBookName, setNewBookName] = useState("");
  const [showAddDateModal, setShowAddDateModal] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [showDeleteDateModal, setShowDeleteDateModal] = useState(false);
  const [dateToDelete, setDateToDelete] = useState("");
  const [showDeleteBookModal, setShowDeleteBookModal] = useState(false);

  // ============================================
  // UI STATE
  // ============================================
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  // ============================================
  // DATA HOOKS
  // ============================================
  const { students } = useStudents();

  const {
    bookTypes,
    loading: bookTypesLoading,
    error: bookTypesError,
    fetchBookTypes,
    addBookType,
    addDate,
    removeDate,
    deleteBookType,
  } = useBookTypes({
    kelas: selectedKelas || undefined,
    subjek: selectedSubjek || undefined,
  });

  const {
    bookChecks,
    loading: bookChecksLoading,
    error: bookChecksError,
    upsertBookCheck,
    deleteBookCheck,
    deleteBookChecksByDate,
  } = useBookChecks({
    bookTypeId: selectedBookId || undefined,
  });

  const { behaviorEvents, addEvent, deleteEvent } = useBehaviorEvents();

  // ============================================
  // DERIVED DATA
  // ============================================
  const availableClasses = useMemo(() => {
    if (!selectedSubjek) return [];
    return CLASS_SUBJECT_MAP[selectedSubjek] || [];
  }, [selectedSubjek]);

  const filteredStudents = useMemo(() => {
    if (!selectedKelas) return [];
    return students
      .filter((s) => s.kelas === selectedKelas)
      .sort((a, b) => a.nama.localeCompare(b.nama));
  }, [students, selectedKelas]);

  const selectedBook = useMemo(
    () => bookTypes.find((b) => b.id === selectedBookId),
    [bookTypes, selectedBookId]
  );

  const tarikhList = useMemo(
    () => ((selectedBook?.tarikh_list || []) as string[]).sort(),
    [selectedBook]
  );

  // Build a map: `${muridId}_${tarikh}` → status
  const checkMap = useMemo(() => {
    const map = new Map<string, BookCheckStatus>();
    for (const check of bookChecks) {
      map.set(`${check.murid_id}_${check.tarikh}`, check.status as BookCheckStatus);
    }
    return map;
  }, [bookChecks]);

  // ============================================
  // HELPERS
  // ============================================
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // ============================================
  // BOOK CHECK TOKEN HELPERS
  // ============================================
  const getBookCheckJenis = useCallback(
    (bookName: string, tarikh: string) => `${BOOK_CHECK_JENIS_PREFIX}${bookName} (${tarikh})`,
    []
  );

  const findBookCheckToken = useCallback(
    (muridId: string, bookName: string, tarikh: string) => {
      const jenis = getBookCheckJenis(bookName, tarikh);
      return behaviorEvents.find((e) => e.murid_id === muridId && e.jenis === jenis);
    },
    [behaviorEvents, getBookCheckJenis]
  );

  const syncBookCheckToken = useCallback(
    (muridId: string, tarikh: string, newStatus: BookCheckStatus | null) => {
      if (!selectedBook) return;
      const student = filteredStudents.find((s) => s.id === muridId);
      if (!student) return;

      const bookName = selectedBook.nama;

      try {
        // Padam token sedia ada (cegah duplikat)
        const existingToken = findBookCheckToken(muridId, bookName, tarikh);
        if (existingToken) {
          deleteEvent(existingToken.id).catch(() => {});
        }

        // Cipta token baru berdasarkan status
        if (newStatus === "hantar") {
          addEvent({
            murid_id: student.id,
            nama_murid: student.nama,
            kelas: student.kelas,
            jenis: getBookCheckJenis(bookName, tarikh),
            kategori: "Positif",
            severity: "Low",
            catatan: "",
            timestamp: new Date().toISOString(),
            is_public: true,
          }).catch(() => {});
        } else if (newStatus === "tidak_hantar") {
          addEvent({
            murid_id: student.id,
            nama_murid: student.nama,
            kelas: student.kelas,
            jenis: getBookCheckJenis(bookName, tarikh),
            kategori: "Negatif",
            severity: "Low",
            catatan: "",
            timestamp: new Date().toISOString(),
            is_public: true,
          }).catch(() => {});
        }
      } catch (err) {
        // Token sync error silently handled
      }
    },
    [selectedBook, filteredStudents, findBookCheckToken, deleteEvent, addEvent, getBookCheckJenis]
  );

  const getStatus = useCallback(
    (muridId: string, tarikh: string): BookCheckStatus | null => {
      return checkMap.get(`${muridId}_${tarikh}`) || null;
    },
    [checkMap]
  );

  // ============================================
  // STATS
  // ============================================
  const getStudentStats = useCallback(
    (muridId: string) => {
      let hantar = 0;
      for (const t of tarikhList) {
        if (getStatus(muridId, t) === "hantar") hantar++;
      }
      const total = tarikhList.length;
      const pct = total > 0 ? Math.round((hantar / total) * 100) : 0;
      return { hantar, total, pct };
    },
    [tarikhList, getStatus]
  );

  const getDateStats = useCallback(
    (tarikh: string) => {
      let hantar = 0;
      const total = filteredStudents.length;
      for (const s of filteredStudents) {
        if (getStatus(s.id, tarikh) === "hantar") hantar++;
      }
      return { hantar, total };
    },
    [filteredStudents, getStatus]
  );

  // ============================================
  // ACTIONS
  // ============================================
  const handleCellClick = useCallback(
    async (muridId: string, tarikh: string) => {
      if (!selectedBookId) return;

      const currentStatus = getStatus(muridId, tarikh);
      const currentIndex = BOOK_CHECK_CYCLE.indexOf(currentStatus);
      const nextIndex = (currentIndex + 1) % BOOK_CHECK_CYCLE.length;
      const nextStatus = BOOK_CHECK_CYCLE[nextIndex];

      setSaving(true);
      try {
        if (nextStatus === null) {
          await deleteBookCheck(selectedBookId, muridId, tarikh);
        } else {
          await upsertBookCheck({
            book_type_id: selectedBookId,
            murid_id: muridId,
            tarikh,
            status: nextStatus,
          });
        }
        syncBookCheckToken(muridId, tarikh, nextStatus);
      } finally {
        setSaving(false);
      }
    },
    [selectedBookId, getStatus, upsertBookCheck, deleteBookCheck, syncBookCheckToken]
  );

  const handleAddBook = useCallback(async () => {
    if (!newBookName.trim() || !selectedKelas || !selectedSubjek) return;

    const { data, error } = await addBookType({
      nama: newBookName.trim(),
      kelas: selectedKelas,
      subjek: selectedSubjek,
    });

    if (error) {
      if (error.message.includes("duplicate") || error.message.includes("unique")) {
        showToast("Nama buku sudah wujud untuk kelas dan subjek ini");
      } else {
        showToast(`Ralat: ${error.message}`);
      }
    } else if (data) {
      setSelectedBookId(data.id);
      showToast(`Buku "${newBookName.trim()}" berjaya ditambah`);
    }
    setNewBookName("");
    setShowAddBookModal(false);
  }, [newBookName, selectedKelas, selectedSubjek, addBookType, showToast]);

  const handleAddDate = useCallback(async () => {
    if (!newDate || !selectedBookId) return;

    const { error } = await addDate(selectedBookId, newDate);

    if (error) {
      showToast(error.message || "Ralat menambah tarikh");
    } else {
      showToast("Tarikh berjaya ditambah");
    }
    setNewDate("");
    setShowAddDateModal(false);
  }, [newDate, selectedBookId, addDate, showToast]);

  const handleDeleteDate = useCallback(async () => {
    if (!dateToDelete || !selectedBookId || !selectedBook) return;

    const jenis = getBookCheckJenis(selectedBook.nama, dateToDelete);
    const tokens = behaviorEvents.filter((e) => e.jenis === jenis);
    Promise.all(tokens.map((t) => deleteEvent(t.id))).catch(() => {});

    const { error: checksError } = await deleteBookChecksByDate(selectedBookId, dateToDelete);
    if (checksError) {
      showToast(`Ralat: ${checksError.message}`);
      return;
    }

    const { error } = await removeDate(selectedBookId, dateToDelete);
    if (error) {
      showToast(error.message || "Ralat memadam tarikh");
    } else {
      showToast("Tarikh dan semua rekod berkaitan berjaya dipadam");
    }
    setDateToDelete("");
    setShowDeleteDateModal(false);
  }, [dateToDelete, selectedBookId, selectedBook, deleteBookChecksByDate, removeDate, showToast, getBookCheckJenis, behaviorEvents, deleteEvent]);

  const handleDeleteBook = useCallback(async () => {
    if (!selectedBookId || !selectedBook) return;

    const prefix = `${BOOK_CHECK_JENIS_PREFIX}${selectedBook.nama} (`;
    const tokens = behaviorEvents.filter((e) => e.jenis.startsWith(prefix));
    Promise.all(tokens.map((t) => deleteEvent(t.id))).catch(() => {});

    const bookName = selectedBook.nama;
    const { error } = await deleteBookType(selectedBookId);

    if (error) {
      showToast(`Ralat: ${error.message}`);
    } else {
      setSelectedBookId("");
      showToast(`Buku "${bookName}" dan semua rekod berkaitan berjaya dipadam`);
    }
    setShowDeleteBookModal(false);
  }, [selectedBookId, selectedBook, deleteBookType, showToast, behaviorEvents, deleteEvent]);

  const handleExport = useCallback(async () => {
    if (!selectedBook || !filteredStudents.length) return;

    try {
      await exportBookChecksToExcel({
        bookName: selectedBook.nama,
        className: selectedBook.kelas,
        subject: selectedBook.subjek,
        students: filteredStudents,
        tarikhList,
        bookChecks,
      });
      showToast("Fail Excel berjaya dimuat turun");
    } catch (error) {
      showToast("Gagal export ke Excel");
    }
  }, [selectedBook, filteredStudents, tarikhList, bookChecks, showToast]);

  // ============================================
  // RENDER HELPERS
  // ============================================
  const renderCell = useCallback(
    (student: DbStudent, tarikh: string) => {
      const status = getStatus(student.id, tarikh);

      const style: React.CSSProperties = status
        ? { ...BOOK_CHECK_STYLES[status] }
        : { backgroundColor: "#f3f4f6", color: "#9ca3af" };

      return (
        <td
          key={`${student.id}_${tarikh}`}
          className="border border-gray-200 text-center cursor-pointer select-none hover:opacity-80 active:opacity-60 transition-opacity"
          style={{ ...style, width: 40, height: 40, minWidth: 40, padding: 0, fontSize: 16, fontWeight: 700 }}
          onClick={() => handleCellClick(student.id, tarikh)}
          title={status ? BOOK_CHECK_LABELS[status] : "Kosong"}
        >
          {status ? BOOK_CHECK_SYMBOLS[status] : ""}
        </td>
      );
    },
    [getStatus, handleCellClick]
  );

  const formatTarikh = (tarikh: string) => {
    const d = new Date(tarikh + "T00:00:00");
    return d.toLocaleDateString("ms-MY", { day: "numeric", month: "short" });
  };

  const isLoading = bookTypesLoading || bookChecksLoading;
  const hasError = bookTypesError || bookChecksError;
  const showGrid = selectedBookId && selectedBook && filteredStudents.length > 0;

  return (
    <ProtectedRoute>
      <div className="p-4 max-w-7xl mx-auto space-y-4">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            {toastMessage}
          </div>
        )}

        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: "Utama", href: "/" }, { label: "Semakan Buku" }]} />

        {/* Error */}
        {hasError && (
          <ErrorBanner
            message={bookTypesError || bookChecksError || ""}
            onRetry={fetchBookTypes}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Semakan Buku</h1>
            <p className="text-sm text-gray-500">Rekod semakan buku latihan murid</p>
          </div>
          <div className="flex items-center gap-2">
            {saving && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Spinner size="sm" /> Menyimpan...
              </span>
            )}
            {showGrid && (
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-2.5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm transition-colors"
                title="Export Excel"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export Excel</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="sticky top-16 z-30 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Subjek */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subjek</label>
              <select
                value={selectedSubjek}
                onChange={(e) => {
                  setSelectedSubjek(e.target.value as Subject | "");
                  setSelectedKelas("");
                  setSelectedBookId("");
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Pilih Subjek --</option>
                {(Object.keys(CLASS_SUBJECT_MAP) as Subject[]).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Kelas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
              <select
                value={selectedKelas}
                onChange={(e) => {
                  setSelectedKelas(e.target.value);
                  setSelectedBookId("");
                }}
                disabled={!selectedSubjek}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              >
                <option value="">-- Pilih Kelas --</option>
                {availableClasses.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Book selection row */}
          {selectedKelas && (
            <div className="mt-3 flex items-end gap-2 sm:gap-3 flex-wrap">
              <div className="flex-1 min-w-[150px] sm:min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Buku</label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Pilih Buku --</option>
                  {bookTypes.map((b) => (
                    <option key={b.id} value={b.id}>{b.nama}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setShowAddBookModal(true)}
                className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                Tambah Buku
              </button>
            </div>
          )}
        </Card>

        {/* Action Bar */}
        {selectedBookId && selectedBook && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowAddDateModal(true)}
              className="flex items-center gap-1 px-2.5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 text-sm transition-colors"
              title="Tambah Tarikh"
            >
              <CalendarPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Tambah Tarikh</span>
            </button>
            {tarikhList.length > 0 && (
              <button
                onClick={() => setShowDeleteDateModal(true)}
                className="flex items-center gap-1 px-2.5 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 text-sm transition-colors"
                title="Padam Tarikh"
              >
                <CalendarMinus className="w-4 h-4" />
                <span className="hidden sm:inline">Padam Tarikh</span>
              </button>
            )}
            <button
              onClick={() => setShowDeleteBookModal(true)}
              className="flex items-center gap-1 px-2.5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm transition-colors"
              title="Padam Buku"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Padam Buku</span>
            </button>
          </div>
        )}

        {/* Legend */}
        {showGrid && (
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap text-xs sm:text-sm">
            <span className="text-gray-500 font-medium">Petunjuk:</span>
            <span className="flex items-center gap-1">
              <span
                className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold"
                style={BOOK_CHECK_STYLES.hantar}
              >
                {BOOK_CHECK_SYMBOLS.hantar}
              </span>
              Hantar
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold"
                style={BOOK_CHECK_STYLES.tidak_lengkap}
              >
                {BOOK_CHECK_SYMBOLS.tidak_lengkap}
              </span>
              Tidak Lengkap
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold"
                style={BOOK_CHECK_STYLES.tidak_hantar}
              >
                {BOOK_CHECK_SYMBOLS.tidak_hantar}
              </span>
              Tidak Hantar
            </span>
            <span className="flex items-center gap-1">
              <span
                className="inline-flex items-center justify-center w-6 h-6 rounded border border-gray-300 text-xs"
                style={{ backgroundColor: "#f3f4f6", color: "#9ca3af" }}
              />
              Kosong
            </span>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <Spinner size="lg" />
          </div>
        )}

        {/* Grid */}
        {showGrid && !isLoading && (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="border-collapse w-full" style={{ minWidth: "max-content" }}>
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-200 px-1 sm:px-2 py-2 text-xs font-semibold text-gray-600 text-center sticky left-0 bg-gray-50 z-10 w-[30px] sm:w-[40px] min-w-[30px] sm:min-w-[40px]">
                      No
                    </th>
                    <th className="border border-gray-200 px-2 sm:px-3 py-2 text-xs font-semibold text-gray-600 text-left sticky left-[30px] sm:left-[40px] bg-gray-50 z-10 min-w-[100px] sm:min-w-[160px] max-w-[120px] sm:max-w-none">
                      Nama Murid
                    </th>
                    {tarikhList.map((t) => (
                      <th
                        key={t}
                        className="border border-gray-200 px-1 py-2 text-xs font-semibold text-gray-600 text-center"
                        style={{ minWidth: 40, writingMode: "vertical-lr", height: 80 }}
                      >
                        {formatTarikh(t)}
                      </th>
                    ))}
                    <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-green-700 text-center bg-green-50" style={{ minWidth: 50 }}>
                      Hantar
                    </th>
                    <th className="border border-gray-200 px-2 py-2 text-xs font-semibold text-blue-700 text-center bg-blue-50" style={{ minWidth: 50 }}>
                      %
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, idx) => {
                    const stats = getStudentStats(student.id);
                    return (
                      <tr key={student.id} className="hover:bg-gray-50/50">
                        <td className="border border-gray-200 px-1 sm:px-2 py-1 text-xs text-center text-gray-500 sticky left-0 bg-white z-10 w-[30px] sm:w-[40px]">
                          {idx + 1}
                        </td>
                        <td className="border border-gray-200 px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-800 sticky left-[30px] sm:left-[40px] bg-white z-10 max-w-[120px] sm:max-w-none truncate sm:whitespace-nowrap" title={student.nama}>
                          {student.nama}
                        </td>
                        {tarikhList.map((t) => renderCell(student, t))}
                        <td className="border border-gray-200 px-2 py-1 text-sm text-center font-semibold text-green-700 bg-green-50">
                          {stats.hantar}
                        </td>
                        <td className="border border-gray-200 px-2 py-1 text-sm text-center font-semibold text-blue-700 bg-blue-50">
                          {stats.pct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Footer: per-date stats */}
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td className="border border-gray-200 px-1 sm:px-2 py-2 text-xs text-center sticky left-0 bg-gray-50 z-10 w-[30px] sm:w-[40px]" />
                    <td className="border border-gray-200 px-2 sm:px-3 py-2 text-xs text-gray-700 sticky left-[30px] sm:left-[40px] bg-gray-50 z-10">
                      JUMLAH HANTAR
                    </td>
                    {tarikhList.map((t) => {
                      const ds = getDateStats(t);
                      return (
                        <td
                          key={t}
                          className="border border-gray-200 px-1 py-2 text-xs text-center text-gray-700"
                        >
                          {ds.hantar}/{ds.total}
                        </td>
                      );
                    })}
                    <td className="border border-gray-200 bg-green-50" />
                    <td className="border border-gray-200 bg-blue-50" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Panduan & Empty states */}
        {!selectedSubjek && !isLoading && (
          <Card className="py-8">
            <div className="text-center mb-4">
              <p className="text-gray-400">Pilih subjek dan kelas untuk mula</p>
            </div>

            {/* Panduan ringkas */}
            <div className="border border-blue-200 rounded-lg overflow-hidden max-w-lg mx-auto">
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-blue-50 hover:bg-blue-100 transition-colors text-sm font-medium text-blue-700"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Cara Guna Semakan Buku
                </span>
                {showGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showGuide && (
                <div className="px-4 py-3 space-y-2.5 text-sm text-gray-700 bg-white">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
                    <p><strong>Pilih Subjek & Kelas</strong> di bahagian atas.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
                    <p><strong>Tambah Buku</strong> (cth: &quot;Buku Latihan&quot;) atau pilih buku sedia ada.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
                    <p><strong>Tambah Tarikh</strong> semakan. Boleh tambah banyak tarikh.</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">4</span>
                    <div>
                      <p><strong>Klik pada sel</strong> untuk tukar status murid:</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs">
                          <span className="w-4 h-4 rounded border border-gray-300" style={{ backgroundColor: "#f3f4f6" }} />
                          Kosong
                        </span>
                        <span className="text-gray-400">&rarr;</span>
                        <span className="inline-flex items-center gap-1 text-xs">
                          <span className="w-4 h-4 rounded text-center text-[10px] font-bold leading-4 text-white" style={{ backgroundColor: "#22c55e" }}>{BOOK_CHECK_SYMBOLS.hantar}</span>
                          Hantar
                        </span>
                        <span className="text-gray-400">&rarr;</span>
                        <span className="inline-flex items-center gap-1 text-xs">
                          <span className="w-4 h-4 rounded text-center text-[10px] font-bold leading-4 text-white" style={{ backgroundColor: "#eab308" }}>~</span>
                          Tidak Lengkap
                        </span>
                        <span className="text-gray-400">&rarr;</span>
                        <span className="inline-flex items-center gap-1 text-xs">
                          <span className="w-4 h-4 rounded text-center text-[10px] font-bold leading-4 text-white" style={{ backgroundColor: "#ef4444" }}>{BOOK_CHECK_SYMBOLS.tidak_hantar}</span>
                          Tidak Hantar
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">5</span>
                    <p><strong>Export Excel</strong> untuk simpan atau cetak rekod.</p>
                  </div>
                  <p className="text-xs text-gray-400 pt-1 border-t border-gray-100">
                    Data disimpan automatik setiap kali klik. Token sahsiah turut dikemaskini secara automatik.
                  </p>
                </div>
              )}
            </div>
          </Card>
        )}
        {selectedSubjek && selectedKelas && !selectedBookId && !isLoading && (
          <Card className="text-center py-12 text-gray-400">
            {bookTypes.length === 0
              ? 'Tiada buku lagi. Klik "Tambah Buku" untuk mula.'
              : "Pilih buku untuk lihat grid semakan."}
          </Card>
        )}
        {selectedBookId && selectedBook && tarikhList.length === 0 && !isLoading && (
          <Card className="text-center py-12 text-gray-400">
            Tiada tarikh lagi. Klik &quot;Tambah Tarikh&quot; untuk mula.
          </Card>
        )}

        {/* Summary Stats */}
        {showGrid && tarikhList.length > 0 && !isLoading && (
          <Card>
            <h3 className="font-semibold text-gray-800 mb-3">Statistik Ringkasan</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-700">
                  {filteredStudents.reduce((sum, s) => sum + getStudentStats(s.id).hantar, 0)}
                </p>
                <p className="text-xs text-green-600">Jumlah Hantar</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-700">
                  {bookChecks.filter((c) => c.status === "tidak_lengkap").length}
                </p>
                <p className="text-xs text-yellow-600">Tidak Lengkap</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-700">
                  {bookChecks.filter((c) => c.status === "tidak_hantar").length}
                </p>
                <p className="text-xs text-red-600">Tidak Hantar</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-700">
                  {filteredStudents.length > 0 && tarikhList.length > 0
                    ? Math.round(
                        (filteredStudents.reduce((sum, s) => sum + getStudentStats(s.id).hantar, 0) /
                          (filteredStudents.length * tarikhList.length)) *
                          100
                      )
                    : 0}
                  %
                </p>
                <p className="text-xs text-blue-600">Peratus Keseluruhan</p>
              </div>
            </div>
          </Card>
        )}

        {/* ============================================ */}
        {/* MODALS */}
        {/* ============================================ */}

        {/* Add Book Modal */}
        {showAddBookModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Tambah Buku Baru</h3>
              <p className="text-sm text-gray-500">
                {selectedSubjek} &middot; {selectedKelas}
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Buku
                </label>
                <input
                  type="text"
                  value={newBookName}
                  onChange={(e) => setNewBookName(e.target.value)}
                  placeholder="cth: Buku Latihan, Buku Karangan..."
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleAddBook()}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddBookModal(false);
                    setNewBookName("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddBook}
                  disabled={!newBookName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Tambah
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Date Modal */}
        {showAddDateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Tambah Tarikh Semakan</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tarikh
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAddDateModal(false);
                    setNewDate("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleAddDate}
                  disabled={!newDate}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <CalendarPlus className="w-4 h-4" />
                  Tambah
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Date Modal */}
        {showDeleteDateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center gap-3 text-orange-600">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold">Padam Tarikh</h3>
              </div>
              <p className="text-sm text-gray-600">
                Semua rekod semakan untuk tarikh ini akan turut dipadam.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Tarikh
                </label>
                <select
                  value={dateToDelete}
                  onChange={(e) => setDateToDelete(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">-- Pilih --</option>
                  {tarikhList.map((t) => (
                    <option key={t} value={t}>
                      {formatTarikh(t)} ({t})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowDeleteDateModal(false);
                    setDateToDelete("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteDate}
                  disabled={!dateToDelete}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Padam
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Book Modal */}
        {showDeleteBookModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center gap-3 text-red-600">
                <AlertTriangle className="w-8 h-8" />
                <h3 className="text-lg font-bold">Padam Buku</h3>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-gray-700">
                  Anda akan memadam buku <strong>&quot;{selectedBook?.nama}&quot;</strong> beserta
                  semua tarikh dan rekod semakan berkaitan. Operasi ini tidak boleh dibatalkan.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowDeleteBookModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteBook}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Padam Sekarang
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
