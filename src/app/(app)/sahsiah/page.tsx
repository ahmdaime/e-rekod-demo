"use client";

import React, { useState, useMemo } from "react";
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
  PRESET_EVENTS,
  ALL_CLASSES,
  TOKEN_VALUES,
  getTokenValue,
  type Severity,
} from "@/types";
import { formatTime, isToday, isThisWeek, isThisMonth } from "@/lib/utils";
import { Trash2, Clock, CheckSquare, XSquare, Square, Users, Search, ChevronDown } from "lucide-react";

type DateFilter = "today" | "week" | "month" | "all";
type GenderFilter = "all" | "lelaki" | "perempuan";

const POSITIF_EVENTS = PRESET_EVENTS.filter((e) => e.kategori === "Positif");
const NEGATIF_EVENTS = PRESET_EVENTS.filter((e) => e.kategori === "Negatif");

export default function SahsiahPage() {
  // Supabase hooks
  const { students, loading: studentsLoading, error: studentsError, fetchStudents } = useStudents();
  const { behaviorEvents, addEvent, deleteEvent, loading: eventsLoading, error: eventsError, fetchBehaviorEvents } = useBehaviorEvents();

  // State — kekal
  const [selectedClass, setSelectedClass] = useState<string>("6 Topaz");
  const [catatan, setCatatan] = useState<string>("");
  const [keepCatatan, setKeepCatatan] = useState<boolean>(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // State — dual event
  const [positiveEventKey, setPositiveEventKey] = useState<string>("");
  const [negativeEventKey, setNegativeEventKey] = useState<string>("");
  const [positiveCustomName, setPositiveCustomName] = useState<string>("");
  const [negativeCustomName, setNegativeCustomName] = useState<string>("");
  const [positiveCustomSeverity, setPositiveCustomSeverity] = useState<Severity>("Low");
  const [negativeCustomSeverity, setNegativeCustomSeverity] = useState<Severity>("Low");
  const [positiveStudentIds, setPositiveStudentIds] = useState<Set<string>>(new Set());
  const [negativeStudentIds, setNegativeStudentIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // State — batch delete feed
  const [selectMode, setSelectMode] = useState(false);
  const [selectedFeedIds, setSelectedFeedIds] = useState<Set<string>>(new Set());
  const [isDeletingBatch, setIsDeletingBatch] = useState(false);

  // Toast helper
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Resolve positive event
  const resolvedPositiveEvent = useMemo(() => {
    if (!positiveEventKey) return null;
    if (positiveEventKey === "__custom_positif__") {
      return {
        label: positiveCustomName.trim(),
        kategori: "Positif" as const,
        isPublic: true,
        defaultSeverity: positiveCustomSeverity,
      };
    }
    return POSITIF_EVENTS.find((e) => e.label === positiveEventKey) || null;
  }, [positiveEventKey, positiveCustomName, positiveCustomSeverity]);

  // Resolve negative event
  const resolvedNegativeEvent = useMemo(() => {
    if (!negativeEventKey) return null;
    if (negativeEventKey === "__custom_negatif__") {
      return {
        label: negativeCustomName.trim(),
        kategori: "Negatif" as const,
        isPublic: true,
        defaultSeverity: negativeCustomSeverity,
      };
    }
    return NEGATIF_EVENTS.find((e) => e.label === negativeEventKey) || null;
  }, [negativeEventKey, negativeCustomName, negativeCustomSeverity]);

  // Token display strings
  const positiveTokenDisplay = useMemo(() => {
    if (!resolvedPositiveEvent?.defaultSeverity) return "";
    const val = getTokenValue(resolvedPositiveEvent.kategori, resolvedPositiveEvent.defaultSeverity);
    return val > 0 ? `+${val}` : `${val}`;
  }, [resolvedPositiveEvent]);

  const negativeTokenDisplay = useMemo(() => {
    if (!resolvedNegativeEvent?.defaultSeverity) return "";
    const val = getTokenValue(resolvedNegativeEvent.kategori, resolvedNegativeEvent.defaultSeverity);
    return val > 0 ? `+${val}` : `${val}`;
  }, [resolvedNegativeEvent]);

  // Students filtered by class, search, gender
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

  // Gender counts (before gender filter, after search)
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
  const filteredEvents = useMemo(() => {
    let filtered = behaviorEvents;
    switch (dateFilter) {
      case "today": filtered = behaviorEvents.filter((e) => isToday(e.timestamp)); break;
      case "week": filtered = behaviorEvents.filter((e) => isThisWeek(e.timestamp)); break;
      case "month": filtered = behaviorEvents.filter((e) => isThisMonth(e.timestamp)); break;
    }
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [behaviorEvents, dateFilter]);

  // --- Handlers ---

  const hasBothEvents = positiveEventKey !== "" && negativeEventKey !== "";

  const handleToggleStudent = (studentId: string) => {
    if (hasBothEvents) {
      // Tri-state: ⬜ → positif → negatif → ⬜
      const inPos = positiveStudentIds.has(studentId);
      const inNeg = negativeStudentIds.has(studentId);
      if (!inPos && !inNeg) {
        // ⬜ → positif
        const newPos = new Set(positiveStudentIds);
        newPos.add(studentId);
        setPositiveStudentIds(newPos);
      } else if (inPos) {
        // positif → negatif
        const newPos = new Set(positiveStudentIds);
        newPos.delete(studentId);
        setPositiveStudentIds(newPos);
        const newNeg = new Set(negativeStudentIds);
        newNeg.add(studentId);
        setNegativeStudentIds(newNeg);
      } else {
        // negatif → ⬜
        const newNeg = new Set(negativeStudentIds);
        newNeg.delete(studentId);
        setNegativeStudentIds(newNeg);
      }
    } else if (positiveEventKey) {
      // Toggle dalam positiveStudentIds
      const newPos = new Set(positiveStudentIds);
      if (newPos.has(studentId)) newPos.delete(studentId);
      else newPos.add(studentId);
      setPositiveStudentIds(newPos);
    } else if (negativeEventKey) {
      // Toggle dalam negativeStudentIds
      const newNeg = new Set(negativeStudentIds);
      if (newNeg.has(studentId)) newNeg.delete(studentId);
      else newNeg.add(studentId);
      setNegativeStudentIds(newNeg);
    }
  };

  const handleSelectAll = () => {
    const allIds = new Set(classStudents.map((s) => s.id));
    if (positiveEventKey) {
      setPositiveStudentIds(allIds);
      setNegativeStudentIds(new Set());
    } else if (negativeEventKey) {
      setNegativeStudentIds(allIds);
    }
  };

  const handleDeselectAll = () => {
    setPositiveStudentIds(new Set());
    setNegativeStudentIds(new Set());
  };

  const handleDeleteEvent = async (id: string) => {
    if (window.confirm("Padam rekod ini?")) {
      await deleteEvent(id);
      showToast("Rekod telah dipadam", "success");
    }
  };

  const handleToggleFeedItem = (id: string) => {
    setSelectedFeedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllFeed = () => {
    setSelectedFeedIds(new Set(filteredEvents.map((e) => e.id)));
  };

  const handleDeselectAllFeed = () => {
    setSelectedFeedIds(new Set());
  };

  const handleDeleteSelected = async () => {
    if (selectedFeedIds.size === 0) return;
    if (!window.confirm(`Padam ${selectedFeedIds.size} rekod yang dipilih?`)) return;
    setIsDeletingBatch(true);
    try {
      await Promise.all(Array.from(selectedFeedIds).map((id) => deleteEvent(id)));
      showToast(`${selectedFeedIds.size} rekod telah dipadam`, "success");
      setSelectedFeedIds(new Set());
      setSelectMode(false);
    } catch {
      showToast("Gagal memadam beberapa rekod", "error");
    }
    setIsDeletingBatch(false);
  };

  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    setPositiveStudentIds(new Set());
    setNegativeStudentIds(new Set());
    setSearchQuery("");
    setGenderFilter("all");
  };

  const handleSaveTokens = async () => {
    if (!positiveEventKey && !negativeEventKey) {
      showToast("Sila pilih sekurang-kurangnya satu event", "error");
      return;
    }
    const totalSelected = positiveStudentIds.size + negativeStudentIds.size;
    if (totalSelected === 0) {
      showToast("Sila pilih sekurang-kurangnya seorang murid", "error");
      return;
    }
    // Validate custom names
    if (positiveEventKey === "__custom_positif__" && !positiveCustomName.trim() && positiveStudentIds.size > 0) {
      showToast("Sila masukkan nama event positif", "error");
      return;
    }
    if (negativeEventKey === "__custom_negatif__" && !negativeCustomName.trim() && negativeStudentIds.size > 0) {
      showToast("Sila masukkan nama event negatif", "error");
      return;
    }
    if (positiveStudentIds.size > 0 && (!resolvedPositiveEvent || !resolvedPositiveEvent.label)) {
      showToast("Event positif tidak sah", "error");
      return;
    }
    if (negativeStudentIds.size > 0 && (!resolvedNegativeEvent || !resolvedNegativeEvent.label)) {
      showToast("Event negatif tidak sah", "error");
      return;
    }

    setIsSaving(true);
    const timestamp = new Date().toISOString();
    const promises: ReturnType<typeof addEvent>[] = [];

    // Positive batch
    if (resolvedPositiveEvent && resolvedPositiveEvent.label && positiveStudentIds.size > 0) {
      const severity = resolvedPositiveEvent.defaultSeverity || "Low";
      Array.from(positiveStudentIds).forEach((studentId) => {
        const student = students.find((s) => s.id === studentId);
        if (!student) return;
        promises.push(
          addEvent({
            murid_id: student.id,
            nama_murid: student.nama,
            kelas: student.kelas,
            jenis: resolvedPositiveEvent.label,
            kategori: resolvedPositiveEvent.kategori,
            severity,
            catatan,
            timestamp,
            is_public: resolvedPositiveEvent.isPublic,
          })
        );
      });
    }

    // Negative batch
    if (resolvedNegativeEvent && resolvedNegativeEvent.label && negativeStudentIds.size > 0) {
      const severity = resolvedNegativeEvent.defaultSeverity || "Low";
      Array.from(negativeStudentIds).forEach((studentId) => {
        const student = students.find((s) => s.id === studentId);
        if (!student) return;
        promises.push(
          addEvent({
            murid_id: student.id,
            nama_murid: student.nama,
            kelas: student.kelas,
            jenis: resolvedNegativeEvent.label,
            kategori: resolvedNegativeEvent.kategori,
            severity,
            catatan,
            timestamp,
            is_public: resolvedNegativeEvent.isPublic,
          })
        );
      });
    }

    const results = await Promise.all(promises);
    const failCount = results.filter((r) => r.error).length;
    const successCount = results.length - failCount;

    if (failCount > 0 && successCount === 0) {
      showToast("Gagal menyimpan. Sila semak sambungan atau login semula.", "error");
    } else if (failCount > 0) {
      showToast(`${successCount} berjaya, ${failCount} gagal. Sila cuba lagi.`, "error");
    } else {
      // Build combined toast message
      const parts: string[] = [];
      if (resolvedPositiveEvent?.label && positiveStudentIds.size > 0) {
        const val = getTokenValue(resolvedPositiveEvent.kategori, resolvedPositiveEvent.defaultSeverity || "Low");
        parts.push(`+${val} untuk ${positiveStudentIds.size} murid`);
      }
      if (resolvedNegativeEvent?.label && negativeStudentIds.size > 0) {
        const val = getTokenValue(resolvedNegativeEvent.kategori, resolvedNegativeEvent.defaultSeverity || "Low");
        parts.push(`${val} untuk ${negativeStudentIds.size} murid`);
      }
      const eventNames = [resolvedPositiveEvent?.label, resolvedNegativeEvent?.label].filter(Boolean).join(", ");
      showToast(`${parts.join(" & ")} (${eventNames})`, "success");
    }

    if (successCount > 0) {
      setPositiveStudentIds(new Set());
      setNegativeStudentIds(new Set());
      if (!keepCatatan) setCatatan("");
    }
    setIsSaving(false);
  };

  // --- Computed UI helpers ---

  const totalSelected = positiveStudentIds.size + negativeStudentIds.size;
  const someSelected = totalSelected > 0;

  const buttonText = useMemo(() => {
    if (!positiveEventKey && !negativeEventKey) return "Pilih event dahulu";
    if (totalSelected === 0) return "Pilih murid dahulu";
    const parts: string[] = [];
    if (positiveStudentIds.size > 0 && positiveTokenDisplay) {
      parts.push(`${positiveTokenDisplay} untuk ${positiveStudentIds.size} murid`);
    }
    if (negativeStudentIds.size > 0 && negativeTokenDisplay) {
      parts.push(`${negativeTokenDisplay} untuk ${negativeStudentIds.size} murid`);
    }
    return `Simpan ${parts.join(" & ")}`;
  }, [positiveEventKey, negativeEventKey, totalSelected, positiveStudentIds.size, negativeStudentIds.size, positiveTokenDisplay, negativeTokenDisplay]);

  const canSave = useMemo(() => {
    if (totalSelected === 0) return false;
    if (positiveEventKey === "__custom_positif__" && !positiveCustomName.trim() && positiveStudentIds.size > 0) return false;
    if (negativeEventKey === "__custom_negatif__" && !negativeCustomName.trim() && negativeStudentIds.size > 0) return false;
    return true;
  }, [totalSelected, positiveEventKey, negativeEventKey, positiveCustomName, negativeCustomName, positiveStudentIds.size, negativeStudentIds.size]);

  // Button color
  const buttonColor = useMemo(() => {
    if (!canSave) return "bg-gray-300 text-gray-500";
    if (positiveStudentIds.size > 0 && negativeStudentIds.size > 0) return "bg-blue-600 hover:bg-blue-700 text-white";
    if (positiveStudentIds.size > 0) return "bg-green-600 hover:bg-green-700 text-white";
    return "bg-red-600 hover:bg-red-700 text-white";
  }, [canSave, positiveStudentIds.size, negativeStudentIds.size]);

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
          {/* Left Panel */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Rekod Token</h1>
              {someSelected && (
                <div className="flex items-center gap-2">
                  {positiveStudentIds.size > 0 && (
                    <Badge variant="success" size="md">
                      {positiveStudentIds.size} positif
                    </Badge>
                  )}
                  {negativeStudentIds.size > 0 && (
                    <Badge variant="danger" size="md">
                      {negativeStudentIds.size} negatif
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Card 1: Pilih Kelas & Event */}
            <Card className="space-y-4">
              <Select
                label="Pilih Kelas"
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
                options={ALL_CLASSES.map((c) => ({ value: c, label: c }))}
              />

              {/* Dual Event Dropdowns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dropdown Positif */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Positif (opsyen)
                  </label>
                  <div className="relative">
                    <select
                      value={positiveEventKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPositiveEventKey(val);
                        if (val !== "__custom_positif__") {
                          setPositiveCustomName("");
                          setPositiveCustomSeverity("Low");
                        }
                        if (!val) setPositiveStudentIds(new Set());
                      }}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                    >
                      <option value="">&mdash; Tiada &mdash;</option>
                      {POSITIF_EVENTS.map((evt) => (
                        <option key={evt.label} value={evt.label}>
                          {evt.label} (+{TOKEN_VALUES[evt.defaultSeverity || "Low"]})
                        </option>
                      ))}
                      <option value="__custom_positif__">Custom (Positif)...</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Custom positif inputs */}
                  {positiveEventKey === "__custom_positif__" && (
                    <div className="mt-2 space-y-2">
                      <input
                        type="text"
                        placeholder="cth: Siap latihan tambahan"
                        value={positiveCustomName}
                        onChange={(e) => setPositiveCustomName(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                      />
                      <div className="relative">
                        <select
                          value={positiveCustomSeverity}
                          onChange={(e) => setPositiveCustomSeverity(e.target.value as Severity)}
                          className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none"
                        >
                          <option value="Low">+1 (Rendah)</option>
                          <option value="Medium">+3 (Sederhana)</option>
                          <option value="High">+5 (Tinggi)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Dropdown Negatif */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Negatif (opsyen)
                  </label>
                  <div className="relative">
                    <select
                      value={negativeEventKey}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNegativeEventKey(val);
                        if (val !== "__custom_negatif__") {
                          setNegativeCustomName("");
                          setNegativeCustomSeverity("Low");
                        }
                        if (!val) setNegativeStudentIds(new Set());
                      }}
                      className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-3 pr-10 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
                    >
                      <option value="">&mdash; Tiada &mdash;</option>
                      {NEGATIF_EVENTS.map((evt) => (
                        <option key={evt.label} value={evt.label}>
                          {evt.label} (-{TOKEN_VALUES[evt.defaultSeverity || "Low"]})
                        </option>
                      ))}
                      <option value="__custom_negatif__">Custom (Negatif)...</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>

                  {/* Custom negatif inputs */}
                  {negativeEventKey === "__custom_negatif__" && (
                    <div className="mt-2 space-y-2">
                      <input
                        type="text"
                        placeholder="cth: Vandalisme"
                        value={negativeCustomName}
                        onChange={(e) => setNegativeCustomName(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
                      />
                      <div className="relative">
                        <select
                          value={negativeCustomSeverity}
                          onChange={(e) => setNegativeCustomSeverity(e.target.value as Severity)}
                          className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-10 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none"
                        >
                          <option value="Low">-1 (Rendah)</option>
                          <option value="Medium">-3 (Sederhana)</option>
                          <option value="High">-5 (Tinggi)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Badge Preview */}
              {(resolvedPositiveEvent?.label || resolvedNegativeEvent?.label) && (
                <div className="flex flex-wrap items-center gap-3">
                  {resolvedPositiveEvent?.label && (
                    <div className="flex items-center gap-1.5">
                      <Badge variant="success" size="md">
                        {resolvedPositiveEvent.label} {positiveTokenDisplay}
                      </Badge>
                      <span className="text-xs text-gray-500">{positiveStudentIds.size} murid</span>
                    </div>
                  )}
                  {resolvedNegativeEvent?.label && (
                    <div className="flex items-center gap-1.5">
                      <Badge variant="danger" size="md">
                        {resolvedNegativeEvent.label} {negativeTokenDisplay}
                      </Badge>
                      <span className="text-xs text-gray-500">{negativeStudentIds.size} murid</span>
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Card 2: Pilih Murid */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Senarai Murid ({classStudents.length})
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    disabled={!positiveEventKey && !negativeEventKey}
                    className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium transition-colors disabled:opacity-50"
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
              </div>

              {/* Header badge counts */}
              {someSelected && (
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  {positiveStudentIds.size > 0 && (
                    <span className="flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-green-600" />
                      {positiveStudentIds.size} positif
                    </span>
                  )}
                  {positiveStudentIds.size > 0 && negativeStudentIds.size > 0 && (
                    <span className="text-gray-300">|</span>
                  )}
                  {negativeStudentIds.size > 0 && (
                    <span className="flex items-center gap-1">
                      <XSquare className="w-3.5 h-3.5 text-red-600" />
                      {negativeStudentIds.size} negatif
                    </span>
                  )}
                </div>
              )}

              {/* Hint text for tri-state */}
              {hasBothEvents && (
                <p className="text-xs text-gray-400">
                  Klik: ⬜ → ✅ Positif → ❌ Negatif → ⬜
                </p>
              )}

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
                      const inPos = positiveStudentIds.has(student.id);
                      const inNeg = negativeStudentIds.has(student.id);
                      return (
                        <div
                          key={student.id}
                          onClick={() => handleToggleStudent(student.id)}
                          className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors ${
                            inPos
                              ? "bg-green-50"
                              : inNeg
                                ? "bg-red-50"
                                : "hover:bg-gray-50"
                          } ${index !== 0 ? "border-t border-gray-100" : ""}`}
                        >
                          {inPos ? (
                            <CheckSquare className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : inNeg ? (
                            <XSquare className="w-5 h-5 text-red-600 flex-shrink-0" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300 flex-shrink-0" />
                          )}
                          <span className={`text-sm ${
                            inPos
                              ? "font-medium text-green-900"
                              : inNeg
                                ? "font-medium text-red-900"
                                : "text-gray-700"
                          }`}>
                            {student.nama}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* Collapsible: carian, penapis, catatan */}
              <details className="group">
                <summary className="flex items-center gap-1 text-sm font-medium text-gray-600 cursor-pointer hover:text-gray-800 select-none list-none">
                  <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                  Lagi (carian, penapis, catatan)
                </summary>
                <div className="mt-3 space-y-3">
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

                  {/* Catatan */}
                  <Textarea
                    label="Catatan (Opsyen)"
                    placeholder="Contoh: Semua siap kerja hari ini..."
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    rows={2}
                  />

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={keepCatatan}
                      onChange={(e) => setKeepCatatan(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">Kekalkan catatan selepas simpan</span>
                  </label>
                </div>
              </details>
            </Card>

            {/* Sticky Save Button */}
            <div className="sticky bottom-4 z-10">
              <button
                onClick={handleSaveTokens}
                disabled={!canSave || isSaving}
                className={`w-full py-3.5 rounded-lg font-bold text-lg shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${buttonColor}`}
              >
                {isSaving ? "Menyimpan..." : buttonText}
              </button>
            </div>

            {/* Panduan Pantas */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <p className="font-medium">Panduan: Pilih event → Klik murid → Simpan</p>
            </div>
          </div>

          {/* Right Panel: Suapan Terkini */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Suapan Terkini
              </h3>

              {/* Date Filter */}
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value as DateFilter);
                  setSelectedFeedIds(new Set());
                }}
                className="text-sm border border-gray-300 rounded-lg px-2 py-1 focus:border-blue-500 focus:outline-none"
              >
                <option value="today">Hari Ini</option>
                <option value="week">Minggu Ini</option>
                <option value="month">Bulan Ini</option>
                <option value="all">Semua</option>
              </select>
            </div>

            {/* Select Mode Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  const next = !selectMode;
                  setSelectMode(next);
                  if (!next) setSelectedFeedIds(new Set());
                }}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectMode
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {selectMode ? "Batal Pilih" : "Pilih"}
              </button>

              {selectMode && (
                <>
                  <button
                    onClick={handleSelectAllFeed}
                    className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-medium transition-colors"
                  >
                    Semua
                  </button>
                  <button
                    onClick={handleDeselectAllFeed}
                    disabled={selectedFeedIds.size === 0}
                    className="text-xs px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 font-medium transition-colors disabled:opacity-50"
                  >
                    Nyahpilih
                  </button>
                  {selectedFeedIds.size > 0 && (
                    <span className="text-xs text-gray-500 font-medium">
                      {selectedFeedIds.size} dipilih
                    </span>
                  )}
                </>
              )}
            </div>

            {selectMode && selectedFeedIds.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                disabled={isDeletingBatch}
                className="w-full py-2 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
              >
                {isDeletingBatch
                  ? "Memadam..."
                  : `Padam ${selectedFeedIds.size} Rekod`}
              </button>
            )}

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
                  const isSelected = selectMode && selectedFeedIds.has(event.id);
                  return (
                    <div
                      key={event.id}
                      onClick={selectMode ? () => handleToggleFeedItem(event.id) : undefined}
                      className={`bg-white p-4 rounded-lg shadow-sm border animate-in fade-in duration-300 ${
                        isSelected
                          ? "ring-2 ring-red-200 bg-red-50/50 border-red-200"
                          : "border-gray-100"
                      } ${selectMode ? "cursor-pointer" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox in select mode */}
                        {selectMode && (
                          isSelected ? (
                            <CheckSquare className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                          )
                        )}

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
                            {event.catatan || event.jenis}
                          </p>

                          <p className="text-xs text-gray-500 mt-0.5">{event.kelas}</p>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}
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
