"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, Select, Breadcrumb, EmptyState, Spinner } from "@/components/ui";
import {
  useStudents,
  usePbdRecords,
  useAssessments,
} from "@/hooks/useSupabase";
import { Subject, TP_STYLES, CLASS_SUBJECT_MAP, Semester, SEMESTERS, getAcademicYears, getCurrentSemester } from "@/types";
import { Search, Save, Check, AlertCircle, Calculator, Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { exportPbdToExcel } from "@/utils/exportExcel";

type SortField = "no" | "nama" | "no_kp";
type SortOrder = "asc" | "desc";

export default function PbdPage() {
  // Supabase hooks
  const { students, loading: studentsLoading } = useStudents();
  const { pbdRecords, upsertPbdRecord, batchUpsertPbd, loading: pbdLoading } = usePbdRecords();
  const { assessments, loading: assessmentsLoading } = useAssessments();

  // Local state
  const [selectedSubject, setSelectedSubject] = useState<Subject>("BM");
  const [selectedClass, setSelectedClass] = useState<string>(CLASS_SUBJECT_MAP["BM"][0]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedSemester, setSelectedSemester] = useState<Semester>(getCurrentSemester());
  const [searchQuery, setSearchQuery] = useState("");
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">("idle");
  const [sortField, setSortField] = useState<SortField>("no");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const academicYears = getAcademicYears();

  // Toast helper
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Get available assessments for selected subject
  const availableAssessments = useMemo(() =>
    assessments.filter((a) => a.subjek === selectedSubject),
    [assessments, selectedSubject]
  );

  // Update class and assessment when subject changes
  useEffect(() => {
    setSelectedClass(CLASS_SUBJECT_MAP[selectedSubject][0]);
    if (availableAssessments.length > 0) {
      setSelectedAssessmentId(availableAssessments[0]?.id || "");
    }
  }, [selectedSubject, availableAssessments.length]);

  // Set initial assessment when loaded
  useEffect(() => {
    if (availableAssessments.length > 0 && !selectedAssessmentId) {
      setSelectedAssessmentId(availableAssessments[0]?.id || "");
    }
  }, [availableAssessments, selectedAssessmentId]);

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let result = students.filter(
      (s) =>
        s.kelas === selectedClass &&
        (s.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
         s.no_kp.replace(/-/g, "").includes(searchQuery.replace(/-/g, "")))
    );

    // Sort
    result = [...result].sort((a, b) => {
      let comparison = 0;
      if (sortField === "nama") {
        comparison = a.nama.localeCompare(b.nama);
      } else if (sortField === "no_kp") {
        comparison = a.no_kp.localeCompare(b.no_kp);
      }
      // "no" keeps original order
      return sortOrder === "desc" ? -comparison : comparison;
    });

    return result;
  }, [students, selectedClass, searchQuery, sortField, sortOrder]);

  // Get PBD record for a student (filtered by year and semester)
  const getStudentPbd = (studentId: string) => {
    return pbdRecords.find(
      (r) =>
        r.murid_id === studentId &&
        r.subjek === selectedSubject &&
        r.pentaksiran_id === selectedAssessmentId &&
        r.tahun_akademik === selectedYear &&
        r.semester === selectedSemester
    );
  };

  // Handle TP change
  const handleTpChange = async (studentId: string, tp: 1 | 2 | 3 | 4 | 5 | 6) => {
    if (!selectedAssessmentId) {
      showToast("Sila pilih topik pentaksiran dahulu", "error");
      return;
    }

    setSavingState("saving");
    const existingRecord = getStudentPbd(studentId);

    await upsertPbdRecord({
      murid_id: studentId,
      subjek: selectedSubject,
      kelas: selectedClass,
      pentaksiran_id: selectedAssessmentId,
      tahun_akademik: selectedYear,
      semester: selectedSemester,
      tp,
      catatan: existingRecord?.catatan || "",
    });

    setTimeout(() => setSavingState("saved"), 300);
    setTimeout(() => setSavingState("idle"), 2000);
  };

  // Handle note change
  const handleNoteChange = async (studentId: string, note: string) => {
    const current = getStudentPbd(studentId);
    if (!current) return;

    await upsertPbdRecord({
      murid_id: studentId,
      subjek: selectedSubject,
      kelas: selectedClass,
      pentaksiran_id: selectedAssessmentId,
      tahun_akademik: selectedYear,
      semester: selectedSemester,
      tp: current.tp,
      catatan: note,
    });
  };

  // Set TP for all students
  const setAllTp = async (tp: 1 | 2 | 3 | 4 | 5 | 6) => {
    if (!selectedAssessmentId) {
      showToast("Sila pilih topik pentaksiran dahulu", "error");
      return;
    }

    if (!window.confirm(`Set TP${tp} untuk semua ${filteredStudents.length} murid?`)) {
      return;
    }

    const records = filteredStudents.map((s) => ({
      murid_id: s.id,
      subjek: selectedSubject as "BM" | "Sejarah" | "PSV",
      kelas: selectedClass,
      pentaksiran_id: selectedAssessmentId,
      tahun_akademik: selectedYear,
      semester: selectedSemester as "PBD 1" | "PBD 2",
      tp,
      catatan: getStudentPbd(s.id)?.catatan || "",
    }));

    await batchUpsertPbd(records);
    showToast(`TP${tp} telah ditetapkan untuk ${filteredStudents.length} murid`, "success");
  };

  // Toggle sort
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Filter pbdRecords by year and semester for summary calculations
  const filteredPbdRecords = pbdRecords.filter(
    (r) => r.tahun_akademik === selectedYear && r.semester === selectedSemester
  );

  // Export to Excel
  const handleExport = () => {
    try {
      // Convert to format expected by export function
      const studentsForExport = filteredStudents.map(s => ({
        ...s,
        noKp: s.no_kp, // Map for backwards compatibility
      }));

      const assessmentsForExport = availableAssessments.map(a => ({
        id: a.id,
        subjek: a.subjek,
        nama: a.nama,
        tajuk: a.tajuk,
        standardKandungan: a.standard_kandungan,
      }));

      const pbdRecordsForExport = filteredPbdRecords.map(r => ({
        ...r,
        muridId: r.murid_id,
        pentaksiranId: r.pentaksiran_id,
        tahunAkademik: r.tahun_akademik,
      }));

      exportPbdToExcel({
        subject: selectedSubject,
        className: selectedClass,
        students: studentsForExport,
        pbdRecords: pbdRecordsForExport,
        assessments: assessmentsForExport,
        teacherName: "Cikgu",
        schoolName: "SK Contoh",
        year: selectedYear,
        semester: selectedSemester,
      });
      showToast("Fail Excel berjaya dimuat turun!", "success");
    } catch (error) {
      console.error("Export error:", error);
      showToast("Gagal export ke Excel", "error");
    }
  };

  // Sort icon component
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
    return sortOrder === "asc"
      ? <ArrowUp className="w-3 h-3 text-blue-600" />
      : <ArrowDown className="w-3 h-3 text-blue-600" />;
  };

  const isLoading = studentsLoading || pbdLoading || assessmentsLoading;

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          toastMessage.type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white`}>
          {toastMessage.text}
        </div>
      )}

      <Breadcrumb items={[{ label: "Rekod PBD" }]} />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rekod PBD</h1>
          <p className="text-gray-500 text-sm">
            Kemaskini tahap penguasaan murid
          </p>
        </div>

        {/* Save indicator & Export button */}
        <div className="flex items-center gap-4">
          {savingState === "saving" && (
            <span className="text-yellow-600 flex items-center text-sm animate-pulse">
              <Save className="w-4 h-4 mr-1" /> Menyimpan...
            </span>
          )}
          {savingState === "saved" && (
            <span className="text-green-600 flex items-center text-sm">
              <Check className="w-4 h-4 mr-1" /> Disimpan
            </span>
          )}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Muat Turun Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 sticky top-16 z-30 shadow-md space-y-4">
        {/* Row 1: Year, Semester, Subject, Class */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Select
            label="Tahun Akademik"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            options={academicYears.map((y) => ({
              value: y,
              label: y,
            }))}
          />
          <Select
            label="Semester"
            value={selectedSemester}
            onChange={(e) => setSelectedSemester(e.target.value as Semester)}
            options={SEMESTERS.map((s) => ({
              value: s,
              label: s,
            }))}
          />
          <Select
            label="Subjek"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value as Subject)}
            options={[
              { value: "BM", label: "Bahasa Melayu" },
              { value: "Sejarah", label: "Sejarah" },
              { value: "PSV", label: "Pendidikan Seni Visual" },
            ]}
          />
          <Select
            label="Kelas"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            options={CLASS_SUBJECT_MAP[selectedSubject].map((c) => ({
              value: c,
              label: c,
            }))}
          />
        </div>
        {/* Row 2: Standard Pembelajaran */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Standard Pembelajaran
          </label>
          {assessmentsLoading ? (
            <div className="flex items-center gap-2 p-2.5">
              <Spinner size="sm" />
              <span className="text-sm text-gray-500">Memuatkan...</span>
            </div>
          ) : (
            <select
              value={selectedAssessmentId}
              onChange={(e) => setSelectedAssessmentId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none bg-white"
            >
              {/* Group by tajuk then standard_kandungan */}
              {(() => {
                const grouped: { [tajuk: string]: { [sk: string]: typeof availableAssessments } } = {};
                availableAssessments.forEach((a) => {
                  const tajuk = a.tajuk || "Lain-lain";
                  const sk = a.standard_kandungan || a.nama;
                  if (!grouped[tajuk]) grouped[tajuk] = {};
                  if (!grouped[tajuk][sk]) grouped[tajuk][sk] = [];
                  grouped[tajuk][sk].push(a);
                });
                return Object.entries(grouped).map(([tajuk, sks]) => (
                  <optgroup key={tajuk} label={tajuk}>
                    {Object.entries(sks).map(([sk, items]) =>
                      items.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.nama} - {sk}
                        </option>
                      ))
                    )}
                  </optgroup>
                ));
              })()}
            </select>
          )}
        </div>
      </Card>

      {/* Search, Sort and Batch Set */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama atau No. KP..."
              className="pl-10 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Susun:</span>
            <button
              onClick={() => toggleSort("nama")}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                sortField === "nama" ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Nama <SortIcon field="nama" />
            </button>
            <button
              onClick={() => toggleSort("no_kp")}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                sortField === "no_kp" ? "bg-blue-50 border-blue-300 text-blue-700" : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              No. KP <SortIcon field="no_kp" />
            </button>
          </div>
        </div>

        {/* Batch Set */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <span className="text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">
            Set Semua:
          </span>
          {[1, 2, 3, 4, 5, 6].map((tp) => (
            <button
              key={tp}
              onClick={() => setAllTp(tp as 1 | 2 | 3 | 4 | 5 | 6)}
              className="px-3 py-1.5 rounded text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-300 transition-colors whitespace-nowrap"
            >
              TP{tp}
            </button>
          ))}
        </div>
      </div>

      {/* Warning if no assessment selected */}
      {!selectedAssessmentId && !assessmentsLoading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            Sila pilih standard pembelajaran untuk mula merekod.
          </p>
        </div>
      )}

      {/* Current Assessment Info */}
      {selectedAssessmentId && (() => {
        const currentAssessment = availableAssessments.find(a => a.id === selectedAssessmentId);
        if (!currentAssessment) return null;
        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">
              Sedang Merekod
            </div>
            <div className="text-lg font-bold text-blue-900">
              {currentAssessment.nama}
            </div>
            {currentAssessment.tajuk && (
              <div className="text-sm text-blue-700 mt-1">
                <span className="font-medium">{currentAssessment.tajuk}</span>
                {currentAssessment.standard_kandungan && (
                  <span> → {currentAssessment.standard_kandungan}</span>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      )}

      {/* Student List - Desktop Table / Mobile Cards */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">
                    Nama Murid
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tahap Penguasaan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catatan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student, idx) => {
                  const record = getStudentPbd(student.id);
                  const currentTp = record?.tp;

                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.nama}
                        </div>
                        <div className="text-xs text-gray-400">{student.no_kp}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex justify-center gap-1">
                          {[1, 2, 3, 4, 5, 6].map((tp) => (
                            <button
                              key={tp}
                              onClick={() =>
                                handleTpChange(student.id, tp as 1 | 2 | 3 | 4 | 5 | 6)
                              }
                              disabled={!selectedAssessmentId}
                              className={`w-9 h-9 rounded-full text-xs font-bold transition-all transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed ${
                                currentTp === tp
                                  ? "ring-2 ring-offset-1 ring-blue-500"
                                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                              }`}
                              style={currentTp === tp ? TP_STYLES[tp] : undefined}
                            >
                              {tp}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <input
                          type="text"
                          placeholder="Catatan ringkas..."
                          className="w-full text-sm border-b border-gray-200 focus:border-blue-500 focus:outline-none bg-transparent py-1"
                          value={record?.catatan || ""}
                          onChange={(e) => handleNoteChange(student.id, e.target.value)}
                          disabled={!currentTp}
                        />
                      </td>
                    </tr>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8">
                      <EmptyState
                        title="Tiada murid dijumpai"
                        description={
                          searchQuery
                            ? "Cuba carian lain"
                            : "Tiada murid dalam kelas ini"
                        }
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredStudents.length === 0 ? (
              <div className="p-4">
                <EmptyState
                  title="Tiada murid dijumpai"
                  description={
                    searchQuery
                      ? "Cuba carian lain"
                      : "Tiada murid dalam kelas ini"
                  }
                />
              </div>
            ) : (
              filteredStudents.map((student, idx) => {
                const record = getStudentPbd(student.id);
                const currentTp = record?.tp;

                return (
                  <div key={student.id} className="p-4 space-y-3">
                    {/* Student Info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {idx + 1}. {student.nama}
                        </div>
                        <div className="text-xs text-gray-400">{student.no_kp}</div>
                      </div>
                      {currentTp && (
                        <span
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                          style={TP_STYLES[currentTp]}
                        >
                          TP{currentTp}
                        </span>
                      )}
                    </div>

                    {/* TP Buttons - Larger for mobile */}
                    <div className="grid grid-cols-6 gap-2">
                      {[1, 2, 3, 4, 5, 6].map((tp) => (
                        <button
                          key={tp}
                          onClick={() =>
                            handleTpChange(student.id, tp as 1 | 2 | 3 | 4 | 5 | 6)
                          }
                          disabled={!selectedAssessmentId}
                          className={`py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                            currentTp === tp
                              ? "ring-2 ring-offset-1 ring-blue-500"
                              : "bg-gray-100 text-gray-500"
                          }`}
                          style={currentTp === tp ? TP_STYLES[tp] : undefined}
                        >
                          {tp}
                        </button>
                      ))}
                    </div>

                    {/* Note Input */}
                    <input
                      type="text"
                      placeholder="Catatan ringkas..."
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none"
                      value={record?.catatan || ""}
                      onChange={(e) => handleNoteChange(student.id, e.target.value)}
                      disabled={!currentTp}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="text-sm text-gray-500 text-right">
        {filteredStudents.length} murid | {filteredPbdRecords.filter(r => r.subjek === selectedSubject && r.kelas === selectedClass).length} rekod ({selectedYear} - {selectedSemester})
      </div>

      {/* Summary Section - TP Keseluruhan */}
      {!isLoading && (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Ringkasan TP Keseluruhan - {selectedSubject === "BM" ? "Bahasa Melayu" : selectedSubject} ({selectedClass})
            </h2>
            <p className="text-indigo-100 text-xs mt-1">
              {selectedYear} | {selectedSemester} | {availableAssessments.length} Standard Pembelajaran
            </p>
          </div>

          {/* Desktop Summary Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Murid
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    SP Diisi
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                    Purata
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                    TP Keseluruhan
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student, idx) => {
                  const studentRecords = filteredPbdRecords.filter(
                    (r) => r.murid_id === student.id && r.subjek === selectedSubject && r.tp !== null
                  );
                  const filledCount = studentRecords.length;
                  const totalSP = availableAssessments.length;
                  const totalTp = studentRecords.reduce((sum, r) => sum + (r.tp || 0), 0);
                  const average = filledCount > 0 ? totalTp / filledCount : 0;
                  const overallTp = filledCount > 0 ? Math.ceil(average) : null;
                  const progressPercent = (filledCount / totalSP) * 100;

                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.nama}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <div className="text-sm font-medium text-gray-700">
                          {filledCount}/{totalSP}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              progressPercent === 100
                                ? "bg-green-500"
                                : progressPercent >= 50
                                ? "bg-yellow-500"
                                : "bg-red-400"
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className="text-sm font-medium text-gray-700">
                          {filledCount > 0 ? average.toFixed(2) : "-"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        {overallTp ? (
                          <span
                            className="inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold"
                            style={TP_STYLES[overallTp]}
                          >
                            {overallTp}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Summary Cards */}
          <div className="md:hidden divide-y divide-gray-200">
            {filteredStudents.map((student, idx) => {
              const studentRecords = filteredPbdRecords.filter(
                (r) => r.murid_id === student.id && r.subjek === selectedSubject && r.tp !== null
              );
              const filledCount = studentRecords.length;
              const totalSP = availableAssessments.length;
              const totalTp = studentRecords.reduce((sum, r) => sum + (r.tp || 0), 0);
              const average = filledCount > 0 ? totalTp / filledCount : 0;
              const overallTp = filledCount > 0 ? Math.ceil(average) : null;
              const progressPercent = (filledCount / totalSP) * 100;

              return (
                <div key={student.id} className="p-4 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {idx + 1}. {student.nama}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">
                        {filledCount}/{totalSP} SP
                      </span>
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            progressPercent === 100
                              ? "bg-green-500"
                              : progressPercent >= 50
                              ? "bg-yellow-500"
                              : "bg-red-400"
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">
                        {filledCount > 0 ? average.toFixed(1) : "-"}
                      </span>
                    </div>
                  </div>
                  {overallTp ? (
                    <span
                      className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={TP_STYLES[overallTp]}
                    >
                      TP{overallTp}
                    </span>
                  ) : (
                    <span className="w-12 h-12 rounded-full flex items-center justify-center text-xs text-gray-400 bg-gray-100 flex-shrink-0">
                      -
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-medium text-gray-600">Petunjuk TP:</span>
              {[1, 2, 3, 4, 5, 6].map((tp) => (
                <span key={tp} className="flex items-center gap-1">
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                    style={TP_STYLES[tp]}
                  >
                    {tp}
                  </span>
                  <span className="text-gray-600 hidden sm:inline">
                    {tp === 1 && "Sangat Lemah"}
                    {tp === 2 && "Lemah"}
                    {tp === 3 && "Sederhana"}
                    {tp === 4 && "Baik"}
                    {tp === 5 && "Sangat Baik"}
                    {tp === 6 && "Cemerlang"}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
