"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, Badge, EmptyState, Spinner, DebouncedInput } from "@/components/ui";
import { TP_COLORS_LIGHT, SEVERITY_COLORS, getTokenValue } from "@/types";
import { uploadPsvImage, deletePsvImage } from "@/lib/supabase";
import {
  useStudents,
  useBehaviorEvents,
  usePbdRecords,
  usePsvTasks,
  usePsvEvidence,
  useAssessments,
  useAppSettings,
} from "@/hooks/useSupabase";
import {
  formatDate,
  isToday,
  isThisWeek,
  isThisMonth,
} from "@/lib/utils";
import {
  User,
  Star,
  ShieldAlert,
  BookOpen,
  Lock,
  Calendar,
  TrendingUp,
  TrendingDown,
  Palette,
  CheckCircle,
  Clock,
  Image as ImageIcon,
  ExternalLink,
  X,
  Eye,
  Upload,
  Trash2,
  Send,
  CheckCircle2,
  Coins,
} from "lucide-react";

type Tab = "sahsiah" | "pbd" | "psv";
type DateFilter = "today" | "week" | "month" | "all";

export default function AnakDashboardPage() {
  const params = useParams();
  const ic = decodeURIComponent(params.ic as string);

  // Supabase hooks
  const { getStudentByIc } = useStudents();
  const { assessments } = useAssessments();
  const { pbdVisibleToParents, loading: settingsLoading } = useAppSettings();

  // Local state
  const [student, setStudent] = useState<Awaited<ReturnType<typeof getStudentByIc>> | null>(null);
  const [studentLoading, setStudentLoading] = useState(true);

  // Filtered hooks — only fetch data for THIS student (empty string = skip until student loaded)
  const studentId = student?.id || "";
  const { behaviorEvents, loading: eventsLoading } = useBehaviorEvents({ muridId: studentId });
  const { pbdRecords, loading: pbdLoading } = usePbdRecords({ muridId: studentId });
  const { psvTasks, loading: tasksLoading } = usePsvTasks();
  const { psvEvidence, upsertEvidence, loading: evidenceLoading } = usePsvEvidence({ muridId: studentId });
  const [activeTab, setActiveTab] = useState<Tab>("sahsiah");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Toast helper
  const showToast = (text: string, type: "success" | "error" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch student on mount
  useEffect(() => {
    const fetchStudent = async () => {
      setStudentLoading(true);
      const result = await getStudentByIc(ic);
      setStudent(result);
      setStudentLoading(false);
    };
    fetchStudent();
  }, [ic, getStudentByIc]);

  // Get assessment name by ID
  const getAssessmentName = (pentaksiranId: string) => {
    const assessment = assessments.find((a) => a.id === pentaksiranId);
    return assessment?.nama || pentaksiranId;
  };

  if (studentLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // If student not found
  if (!student) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Murid Tidak Dijumpai
          </h2>
          <p className="text-gray-500 mb-4">
            No. KP "{ic}" tidak wujud dalam sistem.
          </p>
          <Link
            href="/parent/anak"
            className="text-blue-600 hover:underline text-sm"
          >
            Kembali ke halaman login
          </Link>
        </Card>
      </div>
    );
  }

  // Get student's events
  const myEvents = behaviorEvents
    .filter((e) => e.murid_id === student.id)
    .filter((e) => {
      if (dateFilter === "today" && !isToday(e.timestamp)) return false;
      if (dateFilter === "week" && !isThisWeek(e.timestamp)) return false;
      if (dateFilter === "month" && !isThisMonth(e.timestamp)) return false;
      return true;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Kira NILAI TOKEN sebenar, bukan bilangan event sahaja
  let totalTokenPositif = 0;
  let totalTokenNegatif = 0;
  myEvents.forEach((e) => {
    if (e.severity) {
      const val = getTokenValue(e.kategori, e.severity);
      if (val > 0) totalTokenPositif += val;
      else totalTokenNegatif += val;
    }
  });
  const totalToken = totalTokenPositif + totalTokenNegatif;

  // Get student's PBD records
  const myPbd = pbdRecords.filter((r) => r.murid_id === student.id);

  // Group PBD by subject
  const pbdBySubject = myPbd.reduce((acc, record) => {
    if (!acc[record.subjek]) acc[record.subjek] = [];
    acc[record.subjek].push(record);
    return acc;
  }, {} as Record<string, typeof myPbd>);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg z-50 ${
          toastMessage.type === "success" ? "bg-green-500" : "bg-red-500"
        } text-white`}>
          {toastMessage.text}
        </div>
      )}

      {/* Student Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center text-2xl font-bold text-blue-700">
              {student.nama.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{student.nama}</h1>
              <p className="text-gray-600">
                {student.kelas}
              </p>
            </div>
          </div>
          <Badge variant="info" size="md">
            <Lock className="w-3 h-3 mr-1" />
            Rekod Sulit
          </Badge>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("sahsiah")}
          className={`px-4 md:px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "sahsiah"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Star className="w-4 h-4" />
          Rekod Token
        </button>
        <button
          onClick={() => setActiveTab("pbd")}
          className={`px-4 md:px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "pbd"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Rekod PBD
        </button>
        <button
          onClick={() => setActiveTab("psv")}
          className={`px-4 md:px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "psv"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Palette className="w-4 h-4" />
          Bukti PSV
        </button>
      </div>

      {/* Sahsiah Tab */}
      {activeTab === "sahsiah" && (
        <div className="space-y-4">
          {/* Date Filter */}
          <div className="flex justify-end gap-2">
            {(["today", "week", "month", "all"] as DateFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  dateFilter === f
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {f === "today"
                  ? "Hari Ini"
                  : f === "week"
                  ? "Minggu Ini"
                  : f === "month"
                  ? "Bulan Ini"
                  : "Semua"}
              </button>
            ))}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3">
            <Card className="text-center p-4 bg-blue-50 border-blue-100">
              <Coins className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <span className={`block text-2xl font-bold ${
                totalToken > 0 ? "text-green-700" : totalToken < 0 ? "text-red-700" : "text-gray-500"
              }`}>
                {totalToken > 0 ? `+${totalToken}` : totalToken}
              </span>
              <span className="text-xs text-blue-600">Jumlah Token</span>
            </Card>
            <Card className="text-center p-4 bg-green-50 border-green-100">
              <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <span className="block text-2xl font-bold text-green-700">
                +{totalTokenPositif}
              </span>
              <span className="text-xs text-green-600">Token Positif</span>
            </Card>
            <Card className="text-center p-4 bg-red-50 border-red-100">
              <TrendingDown className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <span className="block text-2xl font-bold text-red-700">
                {totalTokenNegatif}
              </span>
              <span className="text-xs text-red-600">Token Negatif</span>
            </Card>
          </div>

          {/* Events List */}
          {eventsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="space-y-3">
              {myEvents.length === 0 && (
                <EmptyState
                  title="Tiada rekod"
                  description="Tiada rekod sahsiah dalam tempoh yang dipilih."
                />
              )}

              {myEvents.map((event) => {
                const tokenVal = event.severity
                  ? getTokenValue(event.kategori, event.severity)
                  : 0;
                return (
                  <Card
                    key={event.id}
                    className={`p-4 ${
                      event.kategori === "Positif"
                        ? "border-green-100"
                        : "border-red-100"
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Token Value Badge */}
                      <div
                        className={`mt-0.5 px-2.5 py-1.5 rounded-lg font-bold text-sm flex-shrink-0 ${
                          event.kategori === "Positif"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tokenVal > 0 ? `+${tokenVal}` : tokenVal}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-800">{event.jenis}</h3>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {formatDate(event.timestamp)}
                          </div>
                        </div>
                        {event.severity && (
                          <span
                            className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 border ${
                              SEVERITY_COLORS[event.severity]
                            }`}
                          >
                            {event.severity === "Low" ? "Rendah" : event.severity === "Medium" ? "Sederhana" : "Tinggi"}
                          </span>
                        )}
                        {event.catatan && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            &quot;{event.catatan}&quot;
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Note */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500">
            <p>
              Jika ada sebarang pertanyaan berkaitan rekod di atas, sila hubungi
              guru kelas.
            </p>
          </div>
        </div>
      )}

      {/* PBD Tab */}
      {activeTab === "pbd" && (
        <div className="space-y-6">
          {/* Check if PBD is visible to parents */}
          {settingsLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : !pbdVisibleToParents ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Rekod PBD Belum Dibuka
              </h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Paparan rekod PBD sedang ditutup oleh pihak sekolah.
                Sila tunggu pengumuman daripada guru untuk melihat rekod PBD anak anda.
              </p>
            </Card>
          ) : pbdLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <>
              {Object.keys(pbdBySubject).length === 0 && (
                <EmptyState
                  icon={BookOpen}
                  title="Tiada rekod PBD"
                  description="Rekod PBD belum dimasukkan untuk murid ini."
                />
              )}

              {Object.entries(pbdBySubject).map(([subjek, records]) => (
                <Card key={subjek} className="overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b font-bold text-gray-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    {subjek === "BM"
                      ? "Bahasa Melayu"
                      : subjek === "PSV"
                      ? "Pendidikan Seni Visual"
                      : subjek}
                  </div>
                  <div className="divide-y">
                    {records.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-4 flex justify-between items-center"
                      >
                        <div>
                          <span className="text-sm font-medium text-gray-700">
                            {getAssessmentName(rec.pentaksiran_id)}
                          </span>
                          {rec.catatan && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {rec.catatan}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end">
                          {rec.tp ? (
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-bold border ${
                                TP_COLORS_LIGHT[rec.tp]
                              }`}
                            >
                              TP{rec.tp}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Belum dinilai
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}

              {/* TP Legend */}
              <Card className="p-4">
                <h4 className="font-medium text-gray-700 mb-3">Petunjuk Tahap Penguasaan:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-red-100 text-red-800 flex items-center justify-center text-xs font-bold">1</span>
                    <span className="text-gray-600">Sangat Lemah</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-800 flex items-center justify-center text-xs font-bold">2</span>
                    <span className="text-gray-600">Lemah</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 flex items-center justify-center text-xs font-bold">3</span>
                    <span className="text-gray-600">Sederhana</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-lime-100 text-lime-800 flex items-center justify-center text-xs font-bold">4</span>
                    <span className="text-gray-600">Baik</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs font-bold">5</span>
                    <span className="text-gray-600">Sangat Baik</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold">6</span>
                    <span className="text-gray-600">Cemerlang</span>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {/* PSV Tab */}
      {activeTab === "psv" && (() => {
        // Get PSV tasks for student's class
        const myPsvTasks = psvTasks.filter((t) => t.kelas === student.kelas);

        // Get evidence for this student
        const getMyEvidence = (taskId: string) =>
          psvEvidence.find((e) => e.murid_id === student.id && e.tugasan_id === taskId);

        // Count stats
        const completedCount = myPsvTasks.filter((t) => {
          const ev = getMyEvidence(t.id);
          return ev?.status === "Sudah Hantar" || ev?.status === "Dinilai";
        }).length;

        const reviewedCount = myPsvTasks.filter((t) => {
          const ev = getMyEvidence(t.id);
          return ev?.status === "Dinilai";
        }).length;

        // Handle image upload
        const handleImageUpload = async (taskId: string, file: File) => {
          if (file.size > 10 * 1024 * 1024) {
            showToast("Saiz gambar terlalu besar. Maksimum 10MB.", "error");
            return;
          }
          if (!file.type.startsWith("image/")) {
            showToast("Sila pilih fail gambar sahaja.", "error");
            return;
          }

          const { url, error } = await uploadPsvImage(file, student.id, taskId);
          if (error || !url) {
            showToast("Gagal memuat naik gambar. Sila cuba lagi.", "error");
            return;
          }

          const current = getMyEvidence(taskId);
          await upsertEvidence({
            tugasan_id: taskId,
            murid_id: student.id,
            link_bukti: current?.link_bukti || "",
            gambar_url: url,
            catatan: current?.catatan || "",
            status: current?.status || "Belum Hantar",
          });
          showToast("Gambar berjaya dimuat naik", "success");
        };

        // Handle remove image
        const handleRemoveImage = async (taskId: string) => {
          const current = getMyEvidence(taskId);
          if (current) {
            // Delete from Storage if it's a URL (not old base64)
            if (current.gambar_url) {
              await deletePsvImage(current.gambar_url);
            }
            await upsertEvidence({
              tugasan_id: taskId,
              murid_id: student.id,
              link_bukti: current.link_bukti,
              gambar_url: "",
              catatan: current.catatan,
              status: current.status,
            });
            showToast("Gambar telah dipadam", "success");
          }
        };

        // Handle submit evidence
        const handleSubmit = async (taskId: string) => {
          const current = getMyEvidence(taskId);
          if (!current?.gambar_url && !current?.link_bukti) {
            showToast("Sila muat naik gambar atau masukkan pautan terlebih dahulu", "error");
            return;
          }
          await upsertEvidence({
            tugasan_id: taskId,
            murid_id: student.id,
            link_bukti: current.link_bukti,
            gambar_url: current.gambar_url,
            catatan: current.catatan,
            status: "Sudah Hantar",
          });
          showToast("Bukti berjaya dihantar!", "success");
        };

        // Handle link change
        const handleLinkChange = async (taskId: string, link: string) => {
          const current = getMyEvidence(taskId);
          await upsertEvidence({
            tugasan_id: taskId,
            murid_id: student.id,
            link_bukti: link,
            gambar_url: current?.gambar_url || "",
            catatan: current?.catatan || "",
            status: current?.status || "Belum Hantar",
          });
        };

        if (tasksLoading || evidenceLoading) {
          return (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          );
        }

        return (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="text-center p-3 bg-purple-50 border-purple-100">
                <Palette className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <span className="block text-xl font-bold text-purple-700">
                  {myPsvTasks.length}
                </span>
                <span className="text-xs text-purple-600">Tugasan</span>
              </Card>
              <Card className="text-center p-3 bg-blue-50 border-blue-100">
                <Send className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <span className="block text-xl font-bold text-blue-700">
                  {completedCount}
                </span>
                <span className="text-xs text-blue-600">Dihantar</span>
              </Card>
              <Card className="text-center p-3 bg-green-50 border-green-100">
                <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <span className="block text-xl font-bold text-green-700">
                  {reviewedCount}
                </span>
                <span className="text-xs text-green-600">Disemak</span>
              </Card>
            </div>

            {/* Task List */}
            {myPsvTasks.length === 0 ? (
              <EmptyState
                icon={Palette}
                title="Tiada tugasan PSV"
                description="Tiada tugasan PSV untuk kelas ini."
              />
            ) : (
              <div className="space-y-4">
                {myPsvTasks.map((task) => {
                  const evidence = getMyEvidence(task.id);
                  const status = evidence?.status || "Belum Hantar";
                  const isSubmitted = status === "Sudah Hantar" || status === "Dinilai";
                  const isReviewed = status === "Dinilai";

                  return (
                    <Card key={task.id} className="overflow-hidden">
                      {/* Task Header */}
                      <div className={`px-4 py-3 border-b flex items-center justify-between ${
                        isReviewed ? "bg-green-50" : isSubmitted ? "bg-blue-50" : "bg-amber-50"
                      }`}>
                        <div className="flex items-center gap-3">
                          {isReviewed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : isSubmitted ? (
                            <CheckCircle className="w-5 h-5 text-blue-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-amber-500" />
                          )}
                          <div>
                            <h3 className="font-bold text-gray-800">{task.nama}</h3>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Tarikh Akhir: {formatDate(task.tarikh_akhir)}
                            </p>
                          </div>
                        </div>
                        <Badge
                          variant={isReviewed ? "success" : isSubmitted ? "info" : "warning"}
                          size="sm"
                        >
                          {status}
                        </Badge>
                      </div>

                      {/* Evidence Content */}
                      <div className="p-4 space-y-4">
                        {/* Show uploaded image preview */}
                        {evidence?.gambar_url && (
                          <div>
                            <p className="text-xs text-gray-500 mb-2">Gambar Hasil Karya:</p>
                            <div className="flex items-start gap-3">
                              <div
                                className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group"
                                onClick={() => setPreviewImage(evidence.gambar_url!)}
                              >
                                <img
                                  src={evidence.gambar_url}
                                  alt="Bukti PSV"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Eye className="w-5 h-5 text-white" />
                                </div>
                              </div>
                              {!isSubmitted && (
                                <button
                                  onClick={() => handleRemoveImage(task.id)}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Padam gambar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Upload area - only show if not submitted */}
                        {!isSubmitted && (
                          <div className="space-y-3">
                            {/* Image Upload */}
                            {!evidence?.gambar_url && (
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer bg-purple-50 hover:bg-purple-100 transition-colors">
                                <div className="flex flex-col items-center justify-center py-4">
                                  <Upload className="w-8 h-8 text-purple-400 mb-2" />
                                  <p className="text-sm text-purple-600 font-medium">
                                    Muat Naik Gambar Hasil Karya
                                  </p>
                                  <p className="text-xs text-purple-400 mt-1">
                                    Maksimum 10MB (akan dikecilkan automatik)
                                  </p>
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleImageUpload(task.id, file);
                                    e.target.value = "";
                                  }}
                                />
                              </label>
                            )}

                            {/* OR divider */}
                            <div className="flex items-center gap-3">
                              <div className="flex-1 border-t border-gray-200"></div>
                              <span className="text-xs text-gray-400">ATAU</span>
                              <div className="flex-1 border-t border-gray-200"></div>
                            </div>

                            {/* Link input */}
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Pautan Google Drive / Telegram:</p>
                              <DebouncedInput
                                type="text"
                                placeholder="https://drive.google.com/..."
                                className="w-full text-sm border rounded-lg px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                                value={evidence?.link_bukti || ""}
                                onDebouncedChange={(value) => handleLinkChange(task.id, value)}
                              />
                            </div>

                            {/* Submit button */}
                            <button
                              onClick={() => handleSubmit(task.id)}
                              disabled={!evidence?.gambar_url && !evidence?.link_bukti}
                              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              <Send className="w-4 h-4" />
                              Hantar Bukti
                            </button>
                          </div>
                        )}

                        {/* Show link if submitted */}
                        {isSubmitted && evidence?.link_bukti && (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Pautan Bukti:</p>
                            <a
                              href={evidence.link_bukti}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Lihat Bukti
                            </a>
                          </div>
                        )}

                        {/* Teacher's notes */}
                        {evidence?.catatan && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <p className="text-xs text-green-600 font-medium mb-1">Catatan Guru:</p>
                            <p className="text-sm text-green-800">
                              {evidence.catatan}
                            </p>
                          </div>
                        )}

                        {/* Status message */}
                        {isReviewed && (
                          <div className="flex items-center gap-2 text-green-600 text-sm">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Tugasan telah disemak oleh guru</span>
                          </div>
                        )}
                        {isSubmitted && !isReviewed && (
                          <div className="flex items-center gap-2 text-blue-600 text-sm">
                            <Clock className="w-4 h-4" />
                            <span>Menunggu semakan guru</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Note */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
              <p className="font-medium mb-1">Panduan:</p>
              <ol className="list-decimal list-inside space-y-1 text-amber-700">
                <li>Muat naik gambar hasil karya ATAU masukkan pautan</li>
                <li>Klik "Hantar Bukti" untuk menghantar kepada guru</li>
                <li>Guru akan semak dan beri maklum balas</li>
              </ol>
            </div>
          </div>
        );
      })()}

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="p-3 bg-gray-100 border-b flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-800">Bukti PSV - {student.nama}</span>
              </div>
              <div className="p-2 bg-gray-50">
                <img
                  src={previewImage}
                  alt="Bukti PSV"
                  className="max-h-[70vh] w-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
