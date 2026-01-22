"use client";

import React, { useState, useMemo } from "react";
import { useAppStore } from "@/store";
import {
  Card,
  Select,
  Badge,
  Breadcrumb,
  EmptyState,
  Textarea,
} from "@/components/ui";
import {
  BehaviorEvent,
  Severity,
  PRESET_EVENTS,
  ALL_CLASSES,
  TOKEN_VALUES,
  getTokenValue,
} from "@/types";
import { generateId, formatTime, isToday, isThisWeek, isThisMonth } from "@/lib/utils";
import { Trash2, Clock, Coins, TrendingUp, TrendingDown, CheckSquare, Square, Users, Search } from "lucide-react";

type DateFilter = "today" | "week" | "month" | "all";

export default function SahsiahPage() {
  const { students, behaviorEvents, addEvent, deleteEvent, showToast } = useAppStore();

  const [selectedClass, setSelectedClass] = useState<string>("6 Topaz");
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [severity, setSeverity] = useState<Severity>("Medium");
  const [catatan, setCatatan] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const [searchQuery, setSearchQuery] = useState("");

  // Get students in selected class (filtered by search)
  const classStudents = useMemo(() =>
    students.filter((s) =>
      s.kelas === selectedClass &&
      (searchQuery === "" ||
       s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
       s.noKp.replace(/-/g, "").includes(searchQuery.replace(/-/g, "")))
    ),
    [students, selectedClass, searchQuery]
  );

  // Filter events by date
  const filterEventsByDate = (events: BehaviorEvent[]) => {
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
  const handleBulkLogEvent = (preset: (typeof PRESET_EVENTS)[0]) => {
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
    selectedStudentIds.forEach((studentId) => {
      const student = classStudents.find((s) => s.id === studentId);
      if (student) {
        const newEvent: BehaviorEvent = {
          id: generateId("evt"),
          muridId: student.id,
          namaMurid: student.nama,
          kelas: student.kelas,
          jenis: preset.label,
          kategori: preset.kategori,
          severity: finalSeverity,
          catatan: catatan,
          timestamp: timestamp,
          isPublic: preset.isPublic,
        };
        addEvent(newEvent);
      }
    });

    const tokenDisplay = tokenValue > 0 ? `+${tokenValue}` : `${tokenValue}`;
    showToast(
      `${tokenDisplay} token untuk ${selectedStudentIds.size} murid (${preset.label})`,
      tokenValue > 0 ? "success" : "error"
    );
    setCatatan("");
  };

  // Handle delete event
  const handleDeleteEvent = (id: string) => {
    if (window.confirm("Padam rekod ini?")) {
      deleteEvent(id);
      showToast("Rekod telah dipadam", "success");
    }
  };

  // Reset selection when class changes
  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    setSelectedStudentIds(new Set());
    setSearchQuery("");
  };

  // Positif events
  const positifEvents = PRESET_EVENTS.filter((e) => e.kategori === "Positif");
  // Negatif events
  const negatifEvents = PRESET_EVENTS.filter((e) => e.kategori === "Negatif");

  const allSelected = selectedStudentIds.size === classStudents.length && classStudents.length > 0;
  const someSelected = selectedStudentIds.size > 0;

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <Breadcrumb items={[{ label: "Rekod Token" }]} />

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

            {/* Student Selection with Checkboxes */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Senarai Murid ({classStudents.length} orang)
                </label>
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
              </div>

              {/* Student List with Checkboxes */}
              <div className="border border-gray-200 rounded-lg max-h-[300px] overflow-y-auto">
                {classStudents.map((student, index) => {
                  const isSelected = selectedStudentIds.has(student.id);
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
                })}
              </div>
            </div>

            {/* Catatan Input */}
            <Textarea
              label="Catatan (Opsyen)"
              placeholder="Contoh: Semua siap kerja hari ini..."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              rows={2}
            />
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
            <ol className="list-decimal list-inside space-y-1 text-amber-700">
              <li>Klik "Pilih Semua" untuk pilih semua murid</li>
              <li>Klik nama murid yang tak perlu untuk nyahpilih</li>
              <li>Klik butang token untuk beri kepada semua yang dipilih</li>
            </ol>
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
                          {event.namaMurid}
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
  );
}
