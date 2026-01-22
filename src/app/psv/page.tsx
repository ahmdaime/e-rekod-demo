"use client";

import React, { useState } from "react";
import { useAppStore } from "@/store";
import {
  Card,
  Select,
  Button,
  Input,
  Badge,
  Modal,
  Breadcrumb,
  EmptyState,
} from "@/components/ui";
import { PsvTask, PsvEvidence, CLASS_SUBJECT_MAP } from "@/types";
import { generateId, formatDate } from "@/lib/utils";
import {
  Plus,
  ExternalLink,
  CheckCircle,
  CheckCircle2,
  ArrowLeft,
  Calendar,
  Users,
  Search,
  Image as ImageIcon,
  X,
  Eye,
  Clock,
  MessageSquare,
} from "lucide-react";

export default function PsvPage() {
  const { students, psvTasks, psvEvidence, addPsvTask, updatePsvEvidence, showToast } =
    useAppStore();

  const [selectedClass, setSelectedClass] = useState<string>(CLASS_SUBJECT_MAP["PSV"][0]);
  const [selectedTask, setSelectedTask] = useState<PsvTask | null>(null);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "submitted" | "reviewed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewImage, setPreviewImage] = useState<{ nama: string; src: string } | null>(null);

  // Get tasks for selected class
  const classTasks = psvTasks.filter((t) => t.kelas === selectedClass);
  const classStudents = students.filter((s) => s.kelas === selectedClass);

  // Get evidence for a student
  const getEvidence = (studentId: string, taskId: string) =>
    psvEvidence.find((e) => e.muridId === studentId && e.tugasanId === taskId);

  // Filter students based on evidence status and search
  const filteredStudents = classStudents.filter((student) => {
    // Search filter
    if (searchQuery !== "" &&
        !student.nama.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !student.noKp.replace(/-/g, "").includes(searchQuery.replace(/-/g, ""))) {
      return false;
    }

    if (!selectedTask) return true;
    const evidence = getEvidence(student.id, selectedTask.id);
    const status = evidence?.status || "Belum Hantar";

    if (filter === "pending") return status === "Belum Hantar";
    if (filter === "submitted") return status === "Sudah Hantar";
    if (filter === "reviewed") return status === "Dinilai";
    return true;
  });

  // Handle create new task
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const nama = (form.elements.namedItem("nama") as HTMLInputElement).value;
    const tarikhAkhir = (form.elements.namedItem("tarikhAkhir") as HTMLInputElement).value;

    const newTask: PsvTask = {
      id: generateId("task"),
      nama,
      kelas: selectedClass,
      tarikhMula: new Date().toISOString().split("T")[0],
      tarikhAkhir,
    };

    addPsvTask(newTask);
    setIsNewTaskModalOpen(false);
    showToast("Tugasan baru telah dicipta", "success");
  };

  // Handle update evidence
  const handleUpdateEvidence = (
    studentId: string,
    field: keyof PsvEvidence,
    value: string
  ) => {
    if (!selectedTask) return;

    const current = getEvidence(studentId, selectedTask.id);
    const evidence: PsvEvidence = current
      ? { ...current, [field]: value }
      : {
          id: generateId("ev"),
          tugasanId: selectedTask.id,
          muridId: studentId,
          linkBukti: "",
          gambarBukti: "",
          catatan: "",
          status: "Belum Hantar",
          [field]: value,
        };

    updatePsvEvidence(evidence);
  };

  // Mark as reviewed
  const markAsReviewed = (studentId: string) => {
    if (!selectedTask) return;
    handleUpdateEvidence(studentId, "status", "Dinilai");
    showToast("Tugasan telah ditanda sebagai disemak", "success");
  };

  // Undo review (back to submitted)
  const undoReview = (studentId: string) => {
    if (!selectedTask) return;
    handleUpdateEvidence(studentId, "status", "Sudah Hantar");
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      <Breadcrumb items={[{ label: "Bukti PSV" }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Semakan Bukti PSV</h1>
          <p className="text-gray-500 text-sm">
            Semak hasil karya yang dihantar oleh murid/ibu bapa
          </p>
        </div>
        <Button onClick={() => setIsNewTaskModalOpen(true)} icon={Plus}>
          Tugasan Baru
        </Button>
      </div>

      {/* Info Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <p>
          <strong>Aliran Kerja:</strong> Ibu bapa/murid muat naik bukti melalui Portal Ibu Bapa → Cikgu semak dan beri maklum balas di sini.
        </p>
      </div>

      {/* Class Select */}
      <div className="w-full md:w-1/3">
        <Select
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSelectedTask(null);
            setSearchQuery("");
          }}
          options={CLASS_SUBJECT_MAP["PSV"].map((c) => ({ value: c, label: c }))}
        />
      </div>

      {/* Task List or Task Detail */}
      {!selectedTask ? (
        // Task List View
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classTasks.map((task) => {
            const taskEvidence = psvEvidence.filter((e) => e.tugasanId === task.id);
            const submittedCount = taskEvidence.filter((e) => e.status === "Sudah Hantar").length;
            const reviewedCount = taskEvidence.filter((e) => e.status === "Dinilai").length;
            const pendingReview = submittedCount; // Waiting to be reviewed

            return (
              <Card
                key={task.id}
                onClick={() => setSelectedTask(task)}
                hover
                className="cursor-pointer"
              >
                <h3 className="font-bold text-lg text-gray-900">{task.nama}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-2 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>Tarikh Akhir: {formatDate(task.tarikhAkhir)}</span>
                </div>

                {/* Progress bars */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${(reviewedCount / classStudents.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-green-600 w-16 text-right">{reviewedCount} semak</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${(submittedCount / classStudents.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-blue-600 w-16 text-right">{submittedCount} hantar</span>
                  </div>
                </div>

                {pendingReview > 0 && (
                  <div className="bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-lg inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {pendingReview} menunggu semakan
                  </div>
                )}
              </Card>
            );
          })}

          {classTasks.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                title="Tiada tugasan"
                description="Tiada tugasan untuk kelas ini. Sila cipta tugasan baru."
                action={
                  <Button onClick={() => setIsNewTaskModalOpen(true)} icon={Plus}>
                    Cipta Tugasan
                  </Button>
                }
              />
            </div>
          )}
        </div>
      ) : (
        // Task Detail View
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => setSelectedTask(null)}
              icon={ArrowLeft}
            >
              Kembali ke Senarai
            </Button>

            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
              {(["all", "submitted", "reviewed", "pending"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filter === f
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f === "all"
                    ? "Semua"
                    : f === "pending"
                    ? "Belum Hantar"
                    : f === "submitted"
                    ? "Perlu Semak"
                    : "Sudah Semak"}
                </button>
              ))}
            </div>
          </div>

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

          <Card className="overflow-hidden">
            <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-bold text-lg">{selectedTask.nama}</h3>
                <p className="text-sm text-gray-500">
                  Tarikh Akhir: {formatDate(selectedTask.tarikhAkhir)}
                </p>
              </div>
              <Badge variant="info">
                <Users className="w-3 h-3 mr-1" />
                {classStudents.length} Murid
              </Badge>
            </div>

            <ul className="divide-y divide-gray-200">
              {filteredStudents.map((student) => {
                const evidence = getEvidence(student.id, selectedTask.id);
                const status = evidence?.status || "Belum Hantar";
                const hasImage = !!evidence?.gambarBukti;
                const hasLink = !!evidence?.linkBukti;
                const hasEvidence = hasImage || hasLink;
                const isReviewed = status === "Dinilai";
                const isSubmitted = status === "Sudah Hantar";

                return (
                  <li
                    key={student.id}
                    className={`p-4 space-y-3 ${isSubmitted ? "bg-amber-50/50" : ""}`}
                  >
                    {/* Row 1: Name, Status, and Actions */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{student.nama}</p>
                        <Badge
                          variant={isReviewed ? "success" : isSubmitted ? "info" : "danger"}
                          size="sm"
                        >
                          {isReviewed ? (
                            <><CheckCircle2 className="w-3 h-3 mr-1" />Sudah Semak</>
                          ) : isSubmitted ? (
                            <><Clock className="w-3 h-3 mr-1" />Perlu Semak</>
                          ) : (
                            status
                          )}
                        </Badge>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        {isSubmitted && (
                          <button
                            onClick={() => markAsReviewed(student.id)}
                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Tandakan Semak
                          </button>
                        )}
                        {isReviewed && (
                          <button
                            onClick={() => undoReview(student.id)}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            Batal Semak
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Evidence Preview */}
                    {hasEvidence ? (
                      <div className="flex items-start gap-4 bg-gray-50 p-3 rounded-lg">
                        {/* Image thumbnail */}
                        {hasImage && (
                          <div
                            className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group flex-shrink-0"
                            onClick={() => setPreviewImage({ nama: student.nama, src: evidence.gambarBukti! })}
                          >
                            <img
                              src={evidence.gambarBukti}
                              alt="Bukti"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Eye className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          {/* Link */}
                          {hasLink && (
                            <a
                              href={evidence.linkBukti}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Lihat Pautan Bukti
                            </a>
                          )}

                          {/* Image indicator if no link */}
                          {hasImage && !hasLink && (
                            <p className="text-sm text-gray-600 mb-2">
                              <ImageIcon className="w-4 h-4 inline mr-1" />
                              Gambar hasil karya (klik untuk lihat)
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        Belum ada bukti dihantar
                      </p>
                    )}

                    {/* Teacher Notes */}
                    <div>
                      <label className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                        <MessageSquare className="w-3 h-3" />
                        Catatan Guru (akan dipaparkan kepada ibu bapa)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Bagus! Warna cantik..."
                        className="text-sm border rounded-lg px-3 py-2 w-full focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                        value={evidence?.catatan || ""}
                        onChange={(e) =>
                          handleUpdateEvidence(student.id, "catatan", e.target.value)
                        }
                      />
                    </div>
                  </li>
                );
              })}

              {filteredStudents.length === 0 && (
                <li className="p-8">
                  <EmptyState
                    title="Tiada murid"
                    description={
                      filter === "pending"
                        ? "Tiada murid yang belum hantar"
                        : filter === "submitted"
                        ? "Tiada bukti yang perlu disemak"
                        : filter === "reviewed"
                        ? "Tiada bukti yang sudah disemak"
                        : "Tiada murid dalam senarai"
                    }
                  />
                </li>
              )}
            </ul>
          </Card>
        </div>
      )}

      {/* New Task Modal */}
      <Modal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        title={`Tugasan Baru: ${selectedClass}`}
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <Input
            name="nama"
            label="Nama Tugasan"
            required
            placeholder="Contoh: Lukisan Anyaman"
          />
          <Input name="tarikhAkhir" label="Tarikh Akhir" type="date" required />
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsNewTaskModalOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit">Cipta</Button>
          </div>
        </form>
      </Modal>

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
                <span className="font-medium text-gray-800">{previewImage.nama}</span>
              </div>
              <div className="p-2 bg-gray-50">
                <img
                  src={previewImage.src}
                  alt={`Bukti - ${previewImage.nama}`}
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
