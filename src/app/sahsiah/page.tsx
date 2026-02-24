"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  Select,
  Badge,
  Breadcrumb,
  EmptyState,
  Textarea,
  Spinner,
  ErrorBanner,
} from "@/components/ui";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import {
  useStudents,
  useBehaviorEvents,
} from "@/hooks/useSupabase";
import {
  Severity,
  PRESET_EVENTS,
  ALL_CLASSES,
  TOKEN_VALUES,
  getTokenValue,
} from "@/types";
import { formatTime, isToday, isThisWeek, isThisMonth } from "@/lib/utils";
import { Trash2, Clock, TrendingUp, TrendingDown, CheckSquare, Square, Users, Search, Zap } from "lucide-react";

type DateFilter = "today" | "week" | "month" | "all";
type GenderFilter = "all" | "lelaki" | "perempuan";

export default function SahsiahPage() {
  // Supabase hooks
  const { students, loading: studentsLoading, error: studentsError, fetchStudents } = useStudents();
  const { behaviorEvents, addEvent, deleteEvent, loading: eventsLoading, error: eventsError, fetchBehaviorEvents } = useBehaviorEvents();

  // Local state
  const [selectedClass, setSelectedClass] = useState<string>("6 Topaz");
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [severity, setSeverity] = useState<Severity>("Medium");
  const [catatan, setCatatan] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Toggle Mode state
  const [isToggleMode, setIsToggleMode] = useState<boolean>(false);
  const [studentTokenStatus, setStudentTokenStatus] = useState<Map<string, 'none' | 'low' | 'medium' | 'high' | 'negative'>>(new Map());
  const [selectedPositiveEvent, setSelectedPositiveEvent] = useState<string>("Bagus");
  const [selectedNegativeEvent, setSelectedNegativeEvent] = useState<string>("Tidak siap kerja sekolah");

  // Custom Event state
  const [customPositiveEvent, setCustomPositiveEvent] = useState<string>("");
  const [customPositiveToken, setCustomPositiveToken] = useState<number>(1);
  const [customNegativeEvent, setCustomNegativeEvent] = useState<string>("");
  const [customNegativeToken, setCustomNegativeToken] = useState<number>(1);

  // Kekalkan catatan state
  const [keepCatatan, setKeepCatatan] = useState<boolean>(false);

  // Toast helper
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Get students in selected class (filtered by search & gender)
  const classStudents = useMemo(() =>
    students.filter((s) => {
      if (s.kelas !== selectedClass) return false;
      if (searchQuery !== "" &&
        !s.nama.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !s.no_kp.replace(/-/g, "").includes(searchQuery.replace(/-/g, "")))
        return false;
      if (genderFilter !== "all" && s.jantina !== genderFilter) return false;
      return true;
    }),
    [students, selectedClass, searchQuery, genderFilter]
  );

  // Count lelaki/perempuan in class (before gender filter, after search)
  const genderCounts = useMemo(() => {
    const inClass = students.filter((s) =>
      s.kelas === selectedClass &&
      (searchQuery === "" ||
       s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
       s.no_kp.replace(/-/g, "").includes(searchQuery.replace(/-/g, "")))
    );
    let lelaki = 0, perempuan = 0;
    inClass.forEach((s) => {
      if (s.jantina === "lelaki") lelaki++;
      else perempuan++;
    });
    return { lelaki, perempuan, total: inClass.length };
  }, [students, selectedClass, searchQuery]);

  // Filter events by date
  const filterEventsByDate = (events: typeof behaviorEvents) => {
    switch (dateFilter) {
      case "today":
        return events.filter((e) => isToday(e.timestamp));
      case "week":
        return events.filter((e) => isThisWeek(e.timestamp));
      case "month":
        return events.filter((e) => isThisMonth(e.timestamp));
      default:
        return events;
    }
  };

  const filteredEvents = filterEventsByDate(behaviorEvents).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  // Handle select all
  const handleSelectAll = () => {
    setSelectedStudentIds(new Set(classStudents.map((s) => s.id)));
  };

  // Handle deselect all
  const handleDeselectAll = () => {
    setSelectedStudentIds(new Set());
  };

  // Toggle Mode: Tandakan semua murid mengikut tahap
  const handleMarkAll = (level: 'low' | 'medium' | 'high') => {
    const newStatus = new Map<string, 'none' | 'low' | 'medium' | 'high' | 'negative'>();
    classStudents.forEach(student => {
      newStatus.set(student.id, level);
    });
    setStudentTokenStatus(newStatus);
  };

  // Toggle Mode: Reset semua status
  const handleClearAllStatus = () => {
    setStudentTokenStatus(new Map());
  };

  // Toggle Mode: Tukar status murid (none → low → medium → high → negative → none)
  const handleToggleStudentStatus = (studentId: string) => {
    const newStatus = new Map(studentTokenStatus);
    const current = newStatus.get(studentId) || 'none';

    const cycle: Array<'none' | 'low' | 'medium' | 'high' | 'negative'> = ['none', 'low', 'medium', 'high', 'negative'];
    const nextIndex = (cycle.indexOf(current) + 1) % cycle.length;
    newStatus.set(studentId, cycle[nextIndex]);

    setStudentTokenStatus(newStatus);
  };

  // Toggle Mode: Simpan semua token sekaligus
  const handleSaveAllTokens = async () => {
    const hasAnyStatus = Array.from(studentTokenStatus.values()).some(s => s !== 'none');
    if (!hasAnyStatus) {
      showToast("Sila tandakan sekurang-kurangnya seorang murid", "error");
      return;
    }

    // Validate custom events jika dipilih
    const isCustomPositive = selectedPositiveEvent === "__custom__";
    const isCustomNegative = selectedNegativeEvent === "__custom__";

    if (isCustomPositive && !customPositiveEvent.trim()) {
      showToast("Sila masukkan nama event positif", "error");
      return;
    }
    if (isCustomNegative && !customNegativeEvent.trim()) {
      showToast("Sila masukkan nama event negatif", "error");
      return;
    }

    const timestamp = new Date().toISOString();
    const promises: Promise<{ error: unknown }>[] = [];

    const positivePreset = positifEvents.find(e => e.label === selectedPositiveEvent);
    const negativePreset = negatifEvents.find(e => e.label === selectedNegativeEvent);

    // Map toggle status ke severity
    const statusToSeverity: Record<string, Severity> = {
      low: "Low",
      medium: "Medium",
      high: "High",
    };

    studentTokenStatus.forEach((status, studentId) => {
      const student = classStudents.find(s => s.id === studentId);
      if (!student || status === 'none') return;

      if (status === 'low' || status === 'medium' || status === 'high') {
        // Handle positive event (preset atau custom)
        const toggleSeverity = statusToSeverity[status];
        if (isCustomPositive) {
          // Custom positive event — guna severity dari toggle
          promises.push(addEvent({
            murid_id: student.id,
            nama_murid: student.nama,
            kelas: student.kelas,
            jenis: customPositiveEvent.trim(),
            kategori: "Positif",
            severity: toggleSeverity,
            catatan: catatan,
            timestamp: timestamp,
            is_public: true,
          }));
        } else if (positivePreset) {
          // Preset positive event — guna severity dari toggle
          promises.push(addEvent({
            murid_id: student.id,
            nama_murid: student.nama,
            kelas: student.kelas,
            jenis: positivePreset.label,
            kategori: positivePreset.kategori,
            severity: toggleSeverity,
            catatan: catatan,
            timestamp: timestamp,
            is_public: positivePreset.isPublic,
          }));
        }
      } else if (status === 'negative') {
        // Handle negative event (preset atau custom)
        if (isCustomNegative) {
          // Custom negative event
          const tokenSeverity: Severity = customNegativeToken === 1 ? "Low" : customNegativeToken === 3 ? "Medium" : "High";
          promises.push(addEvent({
            murid_id: student.id,
            nama_murid: student.nama,
            kelas: student.kelas,
            jenis: customNegativeEvent.trim(),
            kategori: "Negatif",
            severity: tokenSeverity,
            catatan: catatan,
            timestamp: timestamp,
            is_public: true,
          }));
        } else if (negativePreset) {
          // Preset negative event
          promises.push(addEvent({
            murid_id: student.id,
            nama_murid: student.nama,
            kelas: student.kelas,
            jenis: negativePreset.label,
            kategori: negativePreset.kategori,
            severity: severity,
            catatan: catatan,
            timestamp: timestamp,
            is_public: negativePreset.isPublic,
          }));
        }
      }
    });

    const results = await Promise.all(promises);
    const failCount = results.filter(r => r.error).length;
    const successCount = results.length - failCount;

    if (failCount > 0 && successCount === 0) {
      showToast(`Gagal menyimpan token. Sila semak sambungan atau login semula.`, "error");
    } else if (failCount > 0) {
      showToast(`${successCount} berjaya, ${failCount} gagal disimpan. Sila cuba lagi.`, "error");
    } else {
      // Kira jumlah per tahap
      let lowCount = 0, medCount = 0, highCount = 0, negativeCount = 0;
      studentTokenStatus.forEach(status => {
        if (status === 'low') lowCount++;
        if (status === 'medium') medCount++;
        if (status === 'high') highCount++;
        if (status === 'negative') negativeCount++;
      });
      const parts: string[] = [];
      if (lowCount > 0) parts.push(`+1: ${lowCount}`);
      if (medCount > 0) parts.push(`+3: ${medCount}`);
      if (highCount > 0) parts.push(`+5: ${highCount}`);
      if (negativeCount > 0) parts.push(`Negatif: ${negativeCount}`);
      showToast(`Disimpan: ${parts.join(" | ")}`, "success");
    }

    // Reset hanya jika ada yang berjaya
    if (successCount > 0) {
      setStudentTokenStatus(new Map());
      if (!keepCatatan) {
        setCatatan("");
      }
    }
  };

  // Handle toggle student
  const handleToggleStudent = (studentId: string) => {
    const newSelected = new Set(selectedStudentIds);
    if (newSelected.has(studentId)) {
      newSelected.delete(studentId);
    } else {
      newSelected.add(studentId);
    }
    setSelectedStudentIds(newSelected);
  };

  // Handle bulk log event
  const handleBulkLogEvent = async (preset: (typeof PRESET_EVENTS)[0]) => {
    if (selectedStudentIds.size === 0) {
      showToast("Sila pilih sekurang-kurangnya seorang murid", "error");
      return;
    }

    const finalSeverity = preset.kategori === "Negatif"
      ? severity
      : (preset.defaultSeverity || "Low");

    const tokenValue = getTokenValue(preset.kategori, finalSeverity);
    const timestamp = new Date().toISOString();

    // Create events for all selected students
    let successCount = 0;
    let failCount = 0;

    const promises = Array.from(selectedStudentIds).map(async (studentId) => {
      const student = classStudents.find((s) => s.id === studentId);
      if (student) {
        const { error } = await addEvent({
          murid_id: student.id,
          nama_murid: student.nama,
          kelas: student.kelas,
          jenis: preset.label,
          kategori: preset.kategori,
          severity: finalSeverity,
          catatan: catatan,
          timestamp: timestamp,
          is_public: preset.isPublic,
        });
        if (error) failCount++;
        else successCount++;
      }
    });

    await Promise.all(promises);

    if (failCount > 0 && successCount === 0) {
      showToast(`Gagal menyimpan token. Sila semak sambungan atau login semula.`, "error");
    } else if (failCount > 0) {
      showToast(`${successCount} berjaya, ${failCount} gagal disimpan. Sila cuba lagi.`, "error");
    } else {
      const tokenDisplay = tokenValue > 0 ? `+${tokenValue}` : `${tokenValue}`;
      showToast(
        `${tokenDisplay} token untuk ${successCount} murid (${preset.label})`,
        "success"
      );
    }
    if (!keepCatatan) {
      setCatatan("");
    }
  };

  // Handle delete event
  const handleDeleteEvent = async (id: string) => {
    if (window.confirm("Padam rekod ini?")) {
      await deleteEvent(id);
      showToast("Rekod telah dipadam", "success");
    }
  };

  // Reset selection when class changes
  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    setSelectedStudentIds(new Set());
    setSearchQuery("");
    setGenderFilter("all");
    // Reset toggle mode state juga
    setStudentTokenStatus(new Map());
  };

  // Positif events
  const positifEvents = PRESET_EVENTS.filter((e) => e.kategori === "Positif");
  // Negatif events
  const negatifEvents = PRESET_EVENTS.filter((e) => e.kategori === "Negatif");

  const allSelected = selectedStudentIds.size === classStudents.length && classStudents.length > 0;
  const someSelected = selectedStudentIds.size > 0;

  const isLoading = studentsLoading || eventsLoading;

  return (
    <ProtectedRoute>
      <div className="p-4 max-w-7xl mx-auto">
        {/* Toast */}
        {toastMessage && (
          <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
            toastMessage.type === "success" ? "bg-green-500" : "bg-red-500"
          } text-white`}>
            {toastMessage.text}
          </div>
        )}

        <Breadcrumb items={[{ label: "Rekod Token" }]} />

        {/* Error Banner */}
        {(studentsError || eventsError) && (
          <div className="mb-4">
            <ErrorBanner
              message={studentsError || eventsError || ""}
              onRetry={() => {
                if (studentsError) fetchStudents();
                if (eventsError) fetchBehaviorEvents();
              }}
            />
          </div>
        )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Controls */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Rekod Token</h1>
            {someSelected && (
              <Badge variant="info" size="md">
                {selectedStudentIds.size} murid dipilih
              </Badge>
            )}
          </div>

          {/* Class Selection */}
          <Card className="space-y-4">
            <Select
              label="Pilih Kelas"
              value={selectedClass}
              onChange={(e) => handleClassChange(e.target.value)}
              options={ALL_CLASSES.map((c) => ({ value: c, label: c }))}
            />

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau No. KP..."
                className="pl-10 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Gender Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Jantina:</span>
              <div className="flex gap-1.5 flex-1">
                <button
                  onClick={() => setGenderFilter("all")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    genderFilter === "all"
                      ? "bg-gray-800 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Semua ({genderCounts.total})
                </button>
                <button
                  onClick={() => setGenderFilter("lelaki")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    genderFilter === "lelaki"
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                  }`}
                >
                  Lelaki ({genderCounts.lelaki})
                </button>
                <button
                  onClick={() => setGenderFilter("perempuan")}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    genderFilter === "perempuan"
                      ? "bg-pink-600 text-white"
                      : "bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200"
                  }`}
                >
                  Perempuan ({genderCounts.perempuan})
                </button>
              </div>
            </div>

            {/* Toggle Mode Panel */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-purple-900 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Mod Toggle Pantas
                </h4>
                <button
                  onClick={() => setIsToggleMode(!isToggleMode)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    isToggleMode
                      ? "bg-purple-600 text-white"
                      : "bg-white border border-purple-300 text-purple-700 hover:bg-purple-100"
                  }`}
                >
                  {isToggleMode ? "Aktif" : "Aktifkan"}
                </button>
              </div>

              {isToggleMode && (
                <>
                  {/* Butang Tandakan Semua */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => handleMarkAll('low')}
                      className="flex-1 min-w-[80px] px-3 py-2 bg-green-400 text-white rounded-lg hover:bg-green-500 font-medium transition-colors text-sm"
                    >
                      Semua +1
                    </button>
                    <button
                      onClick={() => handleMarkAll('medium')}
                      className="flex-1 min-w-[80px] px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors text-sm"
                    >
                      Semua +3
                    </button>
                    <button
                      onClick={() => handleMarkAll('high')}
                      className="flex-1 min-w-[80px] px-3 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 font-medium transition-colors text-sm"
                    >
                      Semua +5
                    </button>
                    <button
                      onClick={handleClearAllStatus}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors text-sm"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Pilihan Event */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Event Positif */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-green-700 block">Event Positif:</label>
                      <select
                        value={selectedPositiveEvent}
                        onChange={(e) => setSelectedPositiveEvent(e.target.value)}
                        className="w-full border border-green-300 rounded-lg p-2 text-sm bg-green-50 focus:border-green-500 focus:outline-none"
                      >
                        {positifEvents.map(evt => (
                          <option key={evt.label} value={evt.label}>
                            {evt.label}
                          </option>
                        ))}
                        <option value="__custom__">✏️ Custom...</option>
                      </select>
                      <p className="text-xs text-green-600">Token ditentukan oleh status toggle (+1/+3/+5)</p>
                      {selectedPositiveEvent === "__custom__" && (
                        <div className="space-y-2 p-2 bg-green-100 rounded-lg">
                          <input
                            type="text"
                            placeholder="Nama event (cth: Siap latihan)"
                            value={customPositiveEvent}
                            onChange={(e) => setCustomPositiveEvent(e.target.value)}
                            className="w-full border border-green-300 rounded-lg p-2 text-sm focus:border-green-500 focus:outline-none"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-700">Token:</span>
                            <select
                              value={customPositiveToken}
                              onChange={(e) => setCustomPositiveToken(Number(e.target.value))}
                              className="flex-1 border border-green-300 rounded-lg p-1.5 text-sm bg-white focus:border-green-500 focus:outline-none"
                            >
                              <option value={1}>+1 (Rendah)</option>
                              <option value={3}>+3 (Sederhana)</option>
                              <option value={5}>+5 (Tinggi)</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Event Negatif */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-red-700 block">Event Negatif:</label>
                      <select
                        value={selectedNegativeEvent}
                        onChange={(e) => setSelectedNegativeEvent(e.target.value)}
                        className="w-full border border-red-300 rounded-lg p-2 text-sm bg-red-50 focus:border-red-500 focus:outline-none"
                      >
                        {negatifEvents.map(evt => (
                          <option key={evt.label} value={evt.label}>
                            {evt.label} (-{TOKEN_VALUES[severity]})
                          </option>
                        ))}
                        <option value="__custom__">✏️ Custom...</option>
                      </select>
                      {selectedNegativeEvent === "__custom__" && (
                        <div className="space-y-2 p-2 bg-red-100 rounded-lg">
                          <input
                            type="text"
                            placeholder="Nama event (cth: Lambat hantar)"
                            value={customNegativeEvent}
                            onChange={(e) => setCustomNegativeEvent(e.target.value)}
                            className="w-full border border-red-300 rounded-lg p-2 text-sm focus:border-red-500 focus:outline-none"
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-red-700">Token:</span>
                            <select
                              value={customNegativeToken}
                              onChange={(e) => setCustomNegativeToken(Number(e.target.value))}
                              className="flex-1 border border-red-300 rounded-lg p-1.5 text-sm bg-white focus:border-red-500 focus:outline-none"
                            >
                              <option value={1}>-1 (Rendah)</option>
                              <option value={3}>-3 (Sederhana)</option>
                              <option value={5}>-5 (Tinggi)</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ringkasan & Butang Simpan */}
                  {Array.from(studentTokenStatus.values()).some(s => s !== 'none') && (
                    <div className="bg-white rounded-lg p-3 border border-purple-200">
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mb-2">
                        <span>+1: <strong className="text-green-500">
                          {Array.from(studentTokenStatus.values()).filter(s => s === 'low').length}
                        </strong></span>
                        <span>+3: <strong className="text-green-600">
                          {Array.from(studentTokenStatus.values()).filter(s => s === 'medium').length}
                        </strong></span>
                        <span>+5: <strong className="text-green-800">
                          {Array.from(studentTokenStatus.values()).filter(s => s === 'high').length}
                        </strong></span>
                        <span>Negatif: <strong className="text-red-600">
                          {Array.from(studentTokenStatus.values()).filter(s => s === 'negative').length}
                        </strong></span>
                      </div>
                      <button
                        onClick={handleSaveAllTokens}
                        className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-bold text-lg transition-colors"
                      >
                        Simpan Semua Token
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Student Selection with Checkboxes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Senarai Murid ({classStudents.length} orang)
                  {isToggleMode && (
                    <span className="text-xs text-purple-600 font-normal">(Klik untuk tukar status)</span>
                  )}
                </label>
                {!isToggleMode && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSelectAll}
                      className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium transition-colors"
                    >
                      Pilih Semua
                    </button>
                    <button
                      onClick={handleDeselectAll}
                      disabled={!someSelected}
                      className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 font-medium transition-colors disabled:opacity-50"
                    >
                      Nyahpilih
                    </button>
                  </div>
                )}
              </div>

              {/* Student List */}
              {studentsLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg max-h-[300px] overflow-y-auto">
                  {classStudents.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Tiada murid dalam kelas ini
                    </div>
                  ) : (
                    classStudents.map((student, index) => {
                      const isSelected = selectedStudentIds.has(student.id);
                      const tokenStatus = studentTokenStatus.get(student.id) || 'none';

                      // Jika toggle mode aktif, tunjuk UI berbeza
                      if (isToggleMode) {
                        const toggleStyles: Record<string, { bg: string; border: string; icon: string; text: string; badge: string; label: string }> = {
                          low:      { bg: "bg-green-50",  border: "border-green-400", icon: "text-green-500", text: "font-medium text-green-800", badge: "bg-green-200 text-green-800", label: "+1" },
                          medium:   { bg: "bg-green-100", border: "border-green-500", icon: "text-green-600", text: "font-medium text-green-900", badge: "bg-green-300 text-green-900", label: "+3" },
                          high:     { bg: "bg-green-200", border: "border-green-700", icon: "text-green-700", text: "font-medium text-green-950", badge: "bg-green-500 text-white",     label: "+5" },
                          negative: { bg: "bg-red-100",   border: "border-red-500",   icon: "text-red-600",   text: "font-medium text-red-900",   badge: "bg-red-200 text-red-800",     label: "Negatif" },
                          none:     { bg: "",             border: "border-transparent", icon: "text-gray-300", text: "text-gray-700",               badge: "",                            label: "" },
                        };
                        const style = toggleStyles[tokenStatus] || toggleStyles.none;

                        return (
                          <div
                            key={student.id}
                            onClick={() => handleToggleStudentStatus(student.id)}
                            className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${style.bg} border-l-4 ${style.border} ${
                              tokenStatus === 'none' ? "hover:bg-gray-50" : ""
                            } ${index !== 0 ? "border-t border-gray-100" : ""}`}
                          >
                            {tokenStatus === 'negative' ? (
                              <TrendingDown className={`w-5 h-5 ${style.icon} flex-shrink-0`} />
                            ) : tokenStatus !== 'none' ? (
                              <TrendingUp className={`w-5 h-5 ${style.icon} flex-shrink-0`} />
                            ) : (
                              <Square className="w-5 h-5 text-gray-300 flex-shrink-0" />
                            )}
                            <span className={`text-sm flex-1 ${style.text}`}>
                              {student.nama}
                            </span>
                            {tokenStatus !== 'none' && (
                              <span className={`text-xs px-2 py-0.5 rounded font-medium ${style.badge}`}>
                                {style.label}
                              </span>
                            )}
                          </div>
                        );
                      }

                      // Mod biasa (checkbox)
                      return (
                        <div
                          key={student.id}
                          onClick={() => handleToggleStudent(student.id)}
                          className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                            isSelected ? "bg-blue-50" : "hover:bg-gray-50"
                          } ${index !== 0 ? "border-t border-gray-100" : ""}`}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-blue-600 flex-shrink-0" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${isSelected ? "font-medium text-blue-900" : "text-gray-700"}`}>
                            {student.nama}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Catatan Input */}
            <Textarea
              label="Catatan (Opsyen)"
              placeholder="Contoh: Semua siap kerja hari ini..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={2}
            />

            {/* Checkbox Kekalkan Catatan */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={keepCatatan}
                onChange={(e) => setKeepCatatan(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Kekalkan catatan selepas simpan</span>
            </label>
          </Card>

          {/* Token Actions */}
          <Card className="space-y-6">
            {/* Positif Events */}
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                Tambah Token (Positif)
              </h3>
              <div className="flex flex-wrap gap-2">
                {positifEvents.map((evt) => {
                  const tokenVal = TOKEN_VALUES[evt.defaultSeverity || "Low"];
                  return (
                    <button
                      key={evt.label}
                      onClick={() => handleBulkLogEvent(evt)}
                      disabled={!someSelected}
                      className="px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                    >
                      <span className="bg-green-600 text-white text-xs px-1.5 py-0.5 rounded mr-2 font-bold">
                        +{tokenVal}
                      </span>
                      {evt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Negatif Events */}
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-500" />
                Tolak Token (Negatif)
              </h3>

              {/* Severity Selection */}
              <div className="flex items-center gap-3 bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
                <span className="text-sm text-gray-700 font-medium">Tahap:</span>
                {(["Low", "Medium", "High"] as Severity[]).map((s) => {
                  const tokenVal = TOKEN_VALUES[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setSeverity(s)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                        severity === s
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      -{tokenVal} ({s === "Low" ? "Rendah" : s === "Medium" ? "Sederhana" : "Tinggi"})
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-2">
                {negatifEvents.map((evt) => (
                  <button
                    key={evt.label}
                    onClick={() => handleBulkLogEvent(evt)}
                    disabled={!someSelected}
                    className="px-4 py-2.5 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
                  >
                    <span className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded mr-2 font-bold">
                      -{TOKEN_VALUES[severity]}
                    </span>
                    {evt.label}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Quick Tips */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <p className="font-medium mb-1">Panduan Pantas:</p>
            {isToggleMode ? (
              <ol className="list-decimal list-inside space-y-1 text-amber-700">
                <li>Klik "Semua +1" untuk set semua murid (baseline)</li>
                <li>Klik murid untuk naik tahap (+1 → +3 → +5 → Negatif → Kosong)</li>
                <li>Pilih jenis event positif dan negatif</li>
                <li>Tekan "Simpan Semua Token"</li>
              </ol>
            ) : (
              <ol className="list-decimal list-inside space-y-1 text-amber-700">
                <li>Klik "Pilih Semua" untuk pilih semua murid</li>
                <li>Klik nama murid yang tak perlu untuk nyahpilih</li>
                <li>Klik butang token untuk beri kepada semua yang dipilih</li>
                <li><strong>Atau:</strong> Aktifkan "Mod Toggle Pantas" untuk rekod berbeza sekaligus</li>
              </ol>
            )}
          </div>
        </div>

        {/* Right Panel: Feed */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Suapan Terkini
            </h3>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:border-blue-500 focus:outline-none"
            >
              <option value="today">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="all">Semua</option>
            </select>
          </div>

          {eventsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {filteredEvents.length === 0 && (
                <EmptyState
                  title="Tiada rekod"
                  description={
                    dateFilter === "today"
                      ? "Tiada rekod token hari ini"
                      : "Tiada rekod dalam tempoh ini"
                  }
                />
              )}

              {filteredEvents.map((event) => {
                const tokenValue = event.severity
                  ? getTokenValue(event.kategori, event.severity)
                  : 0;
                return (
                  <div
                    key={event.id}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 animate-in fade-in duration-300"
                  >
                    <div className="flex items-start gap-3">
                      {/* Token Badge */}
                      <div
                        className={`mt-0.5 px-2 py-1.5 rounded-lg font-bold text-sm ${
                          event.kategori === "Positif"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tokenValue > 0 ? `+${tokenValue}` : tokenValue}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="font-bold text-sm text-gray-900 truncate">
                            {event.nama_murid}
                          </p>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                            {formatTime(event.timestamp)}
                          </span>
                        </div>

                        <p className="text-sm font-medium text-gray-700 mt-0.5">
                          {event.jenis}
                        </p>

                        <p className="text-xs text-gray-500 mt-0.5">{event.kelas}</p>

                        {event.catatan && (
                          <p className="text-xs text-gray-500 mt-2 italic">
                            "{event.catatan}"
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stats */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Jumlah event:</span>
              <span className="font-medium">{filteredEvents.length}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Positif:</span>
              <span className="font-medium text-green-600">
                {filteredEvents.filter((e) => e.kategori === "Positif").length}
              </span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Negatif:</span>
              <span className="font-medium text-red-600">
                {filteredEvents.filter((e) => e.kategori === "Negatif").length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
