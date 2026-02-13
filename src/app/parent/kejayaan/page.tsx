"use client";

import React, { useState, useMemo } from "react";
import { Card, Select, Badge, EmptyState, Spinner } from "@/components/ui";
import {
  useStudents,
  useBehaviorEvents,
  usePsvTasks,
  usePsvEvidence,
} from "@/hooks/useSupabase";
import { ALL_CLASSES, getTokenValue, CLASS_SUBJECT_MAP } from "@/types";
import { formatDate, formatTime } from "@/lib/utils";
import { Trophy, Medal, Coins, TrendingUp, Crown, Search, Palette, CheckCircle2, X, Clock, Users } from "lucide-react";

// Type for leaderboard entry
interface LeaderboardEntry {
  muridId: string;
  nama: string;
  totalToken: number;
  positifCount: number;
  negatifCount: number;
}

export default function PapanTokenPage() {
  // Local state
  const [classFilter, setClassFilter] = useState<string>(ALL_CLASSES[0]);

  // Supabase hooks — filtered by selected class
  const { students, loading: studentsLoading } = useStudents();
  const { behaviorEvents, loading: eventsLoading } = useBehaviorEvents({ kelas: classFilter });
  const { psvTasks, loading: tasksLoading } = usePsvTasks();
  const { psvEvidence, loading: evidenceLoading } = usePsvEvidence();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPsvTask, setSelectedPsvTask] = useState<string | null>(null);

  // Check if this class has PSV
  const hasPsv = CLASS_SUBJECT_MAP["PSV"].includes(classFilter);

  // Get PSV tasks for this class
  const classPsvTasks = psvTasks.filter((t) => t.kelas === classFilter);
  const totalPsvTasks = classPsvTasks.length;

  // Calculate student tokens (equivalent to getStudentTokens from store)
  const getStudentTokens = useMemo(() => {
    return (kelas: string): LeaderboardEntry[] => {
      const classStudents = students.filter((s) => s.kelas === kelas);

      return classStudents
        .map((student) => {
          const studentEvents = behaviorEvents.filter(
            (e) => e.murid_id === student.id
          );

          let totalToken = 0;
          let positifCount = 0;
          let negatifCount = 0;

          studentEvents.forEach((event) => {
            if (event.severity) {
              const tokenValue = getTokenValue(event.kategori, event.severity);
              totalToken += tokenValue;
              if (event.kategori === "Positif") {
                positifCount++;
              } else {
                negatifCount++;
              }
            }
          });

          return {
            muridId: student.id,
            nama: student.nama,
            totalToken,
            positifCount,
            negatifCount,
          };
        })
        .sort((a, b) => b.totalToken - a.totalToken);
    };
  }, [students, behaviorEvents]);

  // Get PSV submission count for a student
  const getPsvStats = (muridId: string) => {
    const submitted = psvEvidence.filter(
      (e) => e.murid_id === muridId &&
             classPsvTasks.some((t) => t.id === e.tugasan_id) &&
             (e.status === "Sudah Hantar" || e.status === "Dinilai")
    ).length;
    return { submitted, total: totalPsvTasks };
  };

  // Get leaderboard for selected class (filtered by search)
  const allLeaderboard = getStudentTokens(classFilter);

  // Get submission details for a specific task
  const getTaskSubmissionDetails = (taskId: string) => {
    const submittedStudentIds = psvEvidence
      .filter((e) => e.tugasan_id === taskId && (e.status === "Sudah Hantar" || e.status === "Dinilai"))
      .map((e) => e.murid_id);

    const submitted = allLeaderboard.filter((s) => submittedStudentIds.includes(s.muridId));
    const notSubmitted = allLeaderboard.filter((s) => !submittedStudentIds.includes(s.muridId));

    return { submitted, notSubmitted };
  };

  const leaderboard = searchQuery
    ? allLeaderboard.filter((s) =>
        s.nama.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allLeaderboard;

  // Get recent events for this class (last 10)
  const recentEvents = behaviorEvents
    .filter((e) => e.kelas === classFilter)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  // Get top 3 students (always from full list, not filtered)
  const top3 = allLeaderboard.slice(0, 3);

  // Rank badge colors
  const rankColors = [
    "bg-yellow-400 text-yellow-900", // 1st - Gold
    "bg-gray-300 text-gray-700",     // 2nd - Silver
    "bg-orange-400 text-orange-900", // 3rd - Bronze
  ];

  const isLoading = studentsLoading || eventsLoading || tasksLoading || evidenceLoading;

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="text-center py-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl mb-8 text-white shadow-lg">
        <Trophy className="w-16 h-16 mx-auto mb-2 text-yellow-200" />
        <h1 className="text-2xl font-bold">Papan Token</h1>
        <p className="opacity-90">Kumpul token, jadi yang terbaik!</p>
      </div>

      {/* Class Filter & Search */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Pilih Kelas"
          value={classFilter}
          onChange={(e) => {
            setClassFilter(e.target.value);
            setSearchQuery("");
          }}
          options={ALL_CLASSES.map((c) => ({ value: c, label: c }))}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Cari Murid
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama..."
              className="pl-10 w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      )}

      {!isLoading && (
        <>
          {/* Top 3 Podium */}
          {top3.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                3 Murid Terbaik
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {/* 2nd Place */}
                {top3[1] ? (
                  <div className="order-1 flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold text-gray-600 mb-2">
                      {top3[1].nama.charAt(0)}
                    </div>
                    <div className="bg-gray-300 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1">
                      2
                    </div>
                    <p className="text-sm font-medium text-gray-700 text-center truncate w-full">
                      {top3[1].nama}
                    </p>
                    <p className="text-lg font-bold text-gray-600">{top3[1].totalToken}</p>
                  </div>
                ) : (
                  <div className="order-1" />
                )}

                {/* 1st Place */}
                {top3[0] ? (
                  <div className="order-2 flex flex-col items-center -mt-4">
                    <Crown className="w-8 h-8 text-yellow-500 mb-1" />
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-3xl font-bold text-yellow-700 mb-2 ring-4 ring-yellow-400">
                      {top3[0].nama.charAt(0)}
                    </div>
                    <div className="bg-yellow-400 text-yellow-900 w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1">
                      1
                    </div>
                    <p className="text-sm font-bold text-gray-800 text-center truncate w-full">
                      {top3[0].nama}
                    </p>
                    <p className="text-xl font-bold text-yellow-600">{top3[0].totalToken}</p>
                  </div>
                ) : (
                  <div className="order-2" />
                )}

                {/* 3rd Place */}
                {top3[2] ? (
                  <div className="order-3 flex flex-col items-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl font-bold text-orange-600 mb-2">
                      {top3[2].nama.charAt(0)}
                    </div>
                    <div className="bg-orange-400 text-orange-900 w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1">
                      3
                    </div>
                    <p className="text-sm font-medium text-gray-700 text-center truncate w-full">
                      {top3[2].nama}
                    </p>
                    <p className="text-lg font-bold text-orange-600">{top3[2].totalToken}</p>
                  </div>
                ) : (
                  <div className="order-3" />
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Leaderboard Table */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Medal className="w-5 h-5 text-amber-500" />
                Kedudukan Penuh
              </h2>

              {leaderboard.length === 0 ? (
                <EmptyState
                  icon={Coins}
                  title="Tiada data"
                  description="Tiada murid dalam kelas ini"
                />
              ) : (
                <Card className="overflow-hidden overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left text-sm text-gray-600">
                        <th className="px-3 py-3 w-10">#</th>
                        <th className="px-3 py-3">Nama Murid</th>
                        <th className="px-3 py-3 text-center w-16">Token</th>
                        <th className="px-3 py-3 text-center w-20">+/-</th>
                        {hasPsv && totalPsvTasks > 0 && (
                          <th className="px-3 py-3 text-center w-20">
                            <span className="flex items-center justify-center gap-1">
                              <Palette className="w-3 h-3" />
                              PSV
                            </span>
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {leaderboard.map((student, index) => {
                        const psvStats = getPsvStats(student.muridId);
                        const psvComplete = psvStats.submitted === psvStats.total && psvStats.total > 0;

                        return (
                          <tr
                            key={student.muridId}
                            className={`hover:bg-gray-50 transition-colors ${
                              index < 3 ? "bg-amber-50/50" : ""
                            }`}
                          >
                            <td className="px-3 py-3">
                              {index < 3 ? (
                                <span
                                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${rankColors[index]}`}
                                >
                                  {index + 1}
                                </span>
                              ) : (
                                <span className="text-gray-500 font-medium pl-2">
                                  {index + 1}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              <span className="font-medium text-gray-800">
                                {student.nama}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span
                                className={`font-bold text-lg ${
                                  student.totalToken > 0
                                    ? "text-green-600"
                                    : student.totalToken < 0
                                    ? "text-red-600"
                                    : "text-gray-500"
                                }`}
                              >
                                {student.totalToken > 0 ? "+" : ""}
                                {student.totalToken}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className="text-xs text-gray-500">
                                <span className="text-green-600">+{student.positifCount}</span>
                                {" / "}
                                <span className="text-red-600">-{student.negatifCount}</span>
                              </span>
                            </td>
                            {hasPsv && totalPsvTasks > 0 && (
                              <td className="px-3 py-3 text-center">
                                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                                  psvComplete
                                    ? "bg-green-100 text-green-700"
                                    : psvStats.submitted > 0
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-gray-100 text-gray-500"
                                }`}>
                                  {psvComplete && <CheckCircle2 className="w-3 h-3" />}
                                  {psvStats.submitted}/{psvStats.total}
                                </span>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </Card>
              )}
            </div>

            {/* Recent Activity */}
            <div className="lg:col-span-1">
              <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                Aktiviti Terkini
              </h2>

              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {recentEvents.length === 0 ? (
                  <EmptyState
                    title="Tiada aktiviti"
                    description="Belum ada rekod untuk kelas ini"
                  />
                ) : (
                  recentEvents.map((event) => {
                    const tokenValue = event.severity
                      ? getTokenValue(event.kategori, event.severity)
                      : 0;
                    return (
                      <div
                        key={event.id}
                        className="bg-white p-3 rounded-lg shadow-sm border border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`px-2 py-1 rounded font-bold text-sm ${
                              event.kategori === "Positif"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {tokenValue > 0 ? `+${tokenValue}` : tokenValue}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-gray-800 truncate">
                              {event.nama_murid}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{event.jenis}</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDate(event.timestamp)} • {formatTime(event.timestamp)}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* PSV Progress Summary - Only show if class has PSV */}
          {hasPsv && totalPsvTasks > 0 && (
            <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-800 mb-3 flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Kemajuan PSV Kelas
              </h3>
              <p className="text-xs text-purple-600 mb-3">Klik untuk lihat senarai penghantaran</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {classPsvTasks.map((task) => {
                  const submittedCount = psvEvidence.filter(
                    (e) => e.tugasan_id === task.id && (e.status === "Sudah Hantar" || e.status === "Dinilai")
                  ).length;
                  const totalStudents = allLeaderboard.length;
                  const progress = totalStudents > 0 ? (submittedCount / totalStudents) * 100 : 0;

                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setSelectedPsvTask(task.id)}
                      className="bg-white rounded-lg p-3 border border-purple-100 hover:border-purple-300 hover:shadow-md transition-all text-left cursor-pointer"
                    >
                      <p className="text-sm font-medium text-gray-800 truncate mb-2">{task.nama}</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-purple-100 rounded-full h-2">
                          <div
                            className="bg-purple-500 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-purple-700">
                          {submittedCount}/{totalStudents}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* PSV Submission Details Modal */}
          {selectedPsvTask && (() => {
            const task = classPsvTasks.find((t) => t.id === selectedPsvTask);
            if (!task) return null;
            const { submitted, notSubmitted } = getTaskSubmissionDetails(selectedPsvTask);

            return (
              <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setSelectedPsvTask(null)}
              >
                <div
                  className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className="bg-purple-500 text-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg">{task.nama}</h3>
                        <p className="text-purple-100 text-sm flex items-center gap-1 mt-1">
                          <Users className="w-4 h-4" />
                          {submitted.length} hantar • {notSubmitted.length} belum hantar
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedPsvTask(null)}
                        className="p-1 hover:bg-purple-600 rounded-full transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Modal Body */}
                  <div className="overflow-y-auto max-h-[60vh]">
                    {/* Sudah Hantar */}
                    <div className="p-4 border-b">
                      <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Sudah Hantar ({submitted.length})
                      </h4>
                      {submitted.length === 0 ? (
                        <p className="text-gray-400 text-sm">Tiada lagi yang hantar</p>
                      ) : (
                        <div className="space-y-2">
                          {submitted.map((student) => (
                            <div
                              key={student.muridId}
                              className="flex items-center gap-3 p-2 bg-green-50 rounded-lg"
                            >
                              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-medium text-sm">
                                {student.nama.charAt(0)}
                              </div>
                              <span className="text-sm text-gray-800">{student.nama}</span>
                              <CheckCircle2 className="w-4 h-4 text-green-500 ml-auto" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Belum Hantar */}
                    <div className="p-4">
                      <h4 className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Belum Hantar ({notSubmitted.length})
                      </h4>
                      {notSubmitted.length === 0 ? (
                        <p className="text-gray-400 text-sm">Semua murid sudah hantar!</p>
                      ) : (
                        <div className="space-y-2">
                          {notSubmitted.map((student) => (
                            <div
                              key={student.muridId}
                              className="flex items-center gap-3 p-2 bg-orange-50 rounded-lg"
                            >
                              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-700 font-medium text-sm">
                                {student.nama.charAt(0)}
                              </div>
                              <span className="text-sm text-gray-800">{student.nama}</span>
                              <Clock className="w-4 h-4 text-orange-400 ml-auto" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </>
      )}

      {/* Token Legend */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-700 mb-3">Sistem Token</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="bg-green-600 text-white px-2 py-0.5 rounded font-bold">+1</span>
            <span className="text-gray-600">Tahap Rendah</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-green-600 text-white px-2 py-0.5 rounded font-bold">+3</span>
            <span className="text-gray-600">Tahap Sederhana</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-green-600 text-white px-2 py-0.5 rounded font-bold">+5</span>
            <span className="text-gray-600">Tahap Tinggi</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white px-2 py-0.5 rounded font-bold">-1</span>
            <span className="text-gray-600">Tahap Rendah</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white px-2 py-0.5 rounded font-bold">-3</span>
            <span className="text-gray-600">Tahap Sederhana</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-red-600 text-white px-2 py-0.5 rounded font-bold">-5</span>
            <span className="text-gray-600">Tahap Tinggi</span>
          </div>
        </div>
      </div>
    </div>
  );
}
