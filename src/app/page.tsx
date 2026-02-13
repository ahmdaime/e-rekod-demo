"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Card, Spinner, ErrorBanner } from "@/components/ui";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CLASS_SUBJECT_MAP, ALL_CLASSES } from "@/types";
import { isToday } from "@/lib/utils";
import { usePbdRecords, useBehaviorEvents, useAppSettings } from "@/hooks/useSupabase";
import {
  FileText,
  Image,
  Coins,
  Users,
  ClipboardList,
  Activity,
  Settings,
  Eye,
  EyeOff,
  Trash2,
  AlertTriangle,
} from "lucide-react";

export default function DashboardPage() {
  const { pbdRecords, loading: pbdLoading, error: pbdError, fetchPbdRecords, resetPbdByClass } = usePbdRecords();
  const { behaviorEvents, loading: eventsLoading, error: eventsError, fetchBehaviorEvents, resetEventsByClass } = useBehaviorEvents();
  const { pbdVisibleToParents, loading: settingsLoading, error: settingsError, fetchSettings, togglePbdVisibility } = useAppSettings();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reset data states
  const [resetClass, setResetClass] = useState<string>("");
  const [resetType, setResetType] = useState<"pbd" | "token" | "both">("pbd");
  const [showResetModal, setShowResetModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calculate today's stats
  const todayPbdCount = pbdRecords.filter((r) => isToday(r.updated_at)).length;
  const todayEventCount = behaviorEvents.filter((e) => isToday(e.timestamp)).length;
  const todayPositifCount = behaviorEvents.filter(
    (e) => isToday(e.timestamp) && e.kategori === "Positif"
  ).length;

  const handleTogglePbd = async () => {
    const { error } = await togglePbdVisibility();
    if (!error) {
      showToast(
        pbdVisibleToParents
          ? "Paparan PBD telah ditutup"
          : "Paparan PBD telah dibuka"
      );
    }
  };

  // Count records by class
  const pbdCountByClass = useMemo(() => {
    if (!resetClass) return 0;
    return pbdRecords.filter((r) => r.kelas === resetClass).length;
  }, [pbdRecords, resetClass]);

  const tokenCountByClass = useMemo(() => {
    if (!resetClass) return 0;
    return behaviorEvents.filter((e) => e.kelas === resetClass).length;
  }, [behaviorEvents, resetClass]);

  const totalCountToDelete = useMemo(() => {
    if (resetType === "pbd") return pbdCountByClass;
    if (resetType === "token") return tokenCountByClass;
    return pbdCountByClass + tokenCountByClass;
  }, [resetType, pbdCountByClass, tokenCountByClass]);

  const handleOpenResetModal = () => {
    if (!resetClass) {
      showToast("Sila pilih kelas terlebih dahulu");
      return;
    }
    if (totalCountToDelete === 0) {
      showToast("Tiada rekod untuk dipadam");
      return;
    }
    setShowResetModal(true);
    setConfirmText("");
  };

  const handleCloseResetModal = () => {
    setShowResetModal(false);
    setConfirmText("");
  };

  const handleResetData = async () => {
    if (confirmText !== resetClass) return;

    setIsResetting(true);
    let pbdDeleted = 0;
    let tokenDeleted = 0;

    try {
      if (resetType === "pbd" || resetType === "both") {
        const result = await resetPbdByClass(resetClass);
        if (result.error) {
          showToast(`Ralat: ${result.error.message}`);
          return;
        }
        pbdDeleted = result.deletedCount;
      }

      if (resetType === "token" || resetType === "both") {
        const result = await resetEventsByClass(resetClass);
        if (result.error) {
          showToast(`Ralat: ${result.error.message}`);
          return;
        }
        tokenDeleted = result.deletedCount;
      }

      const messages = [];
      if (pbdDeleted > 0) messages.push(`${pbdDeleted} rekod PBD`);
      if (tokenDeleted > 0) messages.push(`${tokenDeleted} rekod token`);
      showToast(`Berjaya memadam ${messages.join(" dan ")} untuk kelas ${resetClass}`);

      setShowResetModal(false);
      setConfirmText("");
      setResetClass("");
    } finally {
      setIsResetting(false);
    }
  };

  const isLoading = pbdLoading || eventsLoading || settingsLoading;

  return (
    <ProtectedRoute>
      <div className="p-4 max-w-7xl mx-auto space-y-6">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            {toastMessage}
          </div>
        )}

        {/* Error Banner */}
        {(pbdError || eventsError || settingsError) && (
          <ErrorBanner
            message={pbdError || eventsError || settingsError || ""}
            onRetry={() => {
              if (pbdError) fetchPbdRecords();
              if (eventsError) fetchBehaviorEvents();
              if (settingsError) fetchSettings();
            }}
          />
        )}

        {/* Header */}
        <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Selamat Kembali, Cikgu!
        </h1>
        <p className="text-gray-500">Papan Pemuka Pengurusan Kelas</p>
      </header>

      {/* Quick Access Menu */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/pbd">
          <Card
            hover
            className="flex flex-col items-center justify-center p-6 hover:bg-blue-50 border-blue-100 min-h-[140px]"
          >
            <div className="p-3 bg-blue-100 rounded-full mb-3 text-blue-600">
              <FileText className="w-8 h-8" />
            </div>
            <span className="font-semibold text-gray-800 text-center">
              Rekod PBD
            </span>
          </Card>
        </Link>

        <Link href="/psv">
          <Card
            hover
            className="flex flex-col items-center justify-center p-6 hover:bg-purple-50 border-purple-100 min-h-[140px]"
          >
            <div className="p-3 bg-purple-100 rounded-full mb-3 text-purple-600">
              <Image className="w-8 h-8" />
            </div>
            <span className="font-semibold text-gray-800 text-center">
              Bukti PSV
            </span>
          </Card>
        </Link>

        <Link href="/sahsiah">
          <Card
            hover
            className="flex flex-col items-center justify-center p-6 hover:bg-amber-50 border-amber-100 min-h-[140px]"
          >
            <div className="p-3 bg-amber-100 rounded-full mb-3 text-amber-600">
              <Coins className="w-8 h-8" />
            </div>
            <span className="font-semibold text-gray-800 text-center">
              Rekod Token
            </span>
          </Card>
        </Link>

        <Link href="/parent">
          <Card
            hover
            className="flex flex-col items-center justify-center p-6 hover:bg-indigo-50 border-indigo-100 min-h-[140px]"
          >
            <div className="p-3 bg-indigo-100 rounded-full mb-3 text-indigo-600">
              <Users className="w-8 h-8" />
            </div>
            <span className="font-semibold text-gray-800 text-center">
              Portal Ibu Bapa
            </span>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-full text-green-600">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Rekod PBD Hari Ini</p>
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{todayPbdCount}</p>
            )}
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Rekod Token Hari Ini</p>
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{todayEventCount}</p>
            )}
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Token Positif Hari Ini</p>
            {isLoading ? (
              <Spinner size="sm" />
            ) : (
              <p className="text-2xl font-bold text-gray-900">{todayPositifCount}</p>
            )}
          </div>
        </Card>
      </div>

      {/* Classes Summary */}
      <Card>
        <h2 className="font-bold text-lg text-gray-900 mb-4">
          Kelas Yang Diajar
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(Object.keys(CLASS_SUBJECT_MAP) as Array<keyof typeof CLASS_SUBJECT_MAP>).map(
            (subject) => (
              <div
                key={subject}
                className="p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <h3 className="font-semibold text-gray-800 mb-2">{subject}</h3>
                <div className="flex flex-wrap gap-1">
                  {CLASS_SUBJECT_MAP[subject].map((kelas) => (
                    <span
                      key={kelas}
                      className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-600"
                    >
                      {kelas}
                    </span>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </Card>

      {/* Admin Settings */}
      <Card>
        <h2 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          Tetapan Admin
        </h2>
        <div className="space-y-4">
          {/* PBD Visibility Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="flex items-center gap-3">
              {pbdVisibleToParents ? (
                <div className="p-2 bg-green-100 rounded-full text-green-600">
                  <Eye className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2 bg-red-100 rounded-full text-red-600">
                  <EyeOff className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-800">Paparan PBD kepada Ibu Bapa</p>
                <p className="text-sm text-gray-500">
                  {pbdVisibleToParents
                    ? "Ibu bapa boleh lihat rekod PBD anak mereka"
                    : "Rekod PBD disembunyikan daripada ibu bapa"}
                </p>
              </div>
            </div>
            <button
              onClick={handleTogglePbd}
              disabled={settingsLoading}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                pbdVisibleToParents ? "bg-green-500" : "bg-gray-300"
              } ${settingsLoading ? "opacity-50" : ""}`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                  pbdVisibleToParents ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-red-700 flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" />
              Reset Data (Bahaya)
            </h3>

            <div className="p-4 bg-red-50 rounded-lg border border-red-100 space-y-4">
              {/* Class Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pilih Kelas
                </label>
                <select
                  value={resetClass}
                  onChange={(e) => setResetClass(e.target.value)}
                  className="w-full md:w-64 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">-- Pilih Kelas --</option>
                  {ALL_CLASSES.map((kelas) => (
                    <option key={kelas} value={kelas}>
                      {kelas}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Data
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="resetType"
                      value="pbd"
                      checked={resetType === "pbd"}
                      onChange={() => setResetType("pbd")}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-gray-700">
                      Rekod PBD sahaja
                      {resetClass && (
                        <span className="text-gray-500 ml-1">
                          ({pbdCountByClass} rekod)
                        </span>
                      )}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="resetType"
                      value="token"
                      checked={resetType === "token"}
                      onChange={() => setResetType("token")}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-gray-700">
                      Rekod Token sahaja
                      {resetClass && (
                        <span className="text-gray-500 ml-1">
                          ({tokenCountByClass} rekod)
                        </span>
                      )}
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="resetType"
                      value="both"
                      checked={resetType === "both"}
                      onChange={() => setResetType("both")}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <span className="text-gray-700">
                      Kedua-dua sekali
                      {resetClass && (
                        <span className="text-gray-500 ml-1">
                          ({pbdCountByClass + tokenCountByClass} rekod)
                        </span>
                      )}
                    </span>
                  </label>
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={handleOpenResetModal}
                disabled={!resetClass || totalCountToDelete === 0}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Reset Data
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-lg font-bold">AMARAN: Operasi ini tidak boleh dibatalkan!</h3>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-gray-700 mb-2">Anda akan memadam:</p>
              <ul className="list-disc list-inside text-gray-800 space-y-1">
                {(resetType === "pbd" || resetType === "both") && (
                  <li>
                    <strong>{pbdCountByClass}</strong> rekod PBD untuk kelas{" "}
                    <strong>{resetClass}</strong>
                  </li>
                )}
                {(resetType === "token" || resetType === "both") && (
                  <li>
                    <strong>{tokenCountByClass}</strong> rekod token untuk kelas{" "}
                    <strong>{resetClass}</strong>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Taip &quot;<strong>{resetClass}</strong>&quot; untuk sahkan:
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={resetClass}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                autoComplete="off"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCloseResetModal}
                disabled={isResetting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Batal
              </button>
              <button
                onClick={handleResetData}
                disabled={confirmText !== resetClass || isResetting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isResetting ? (
                  <>
                    <Spinner size="sm" />
                    Memadam...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Padam Sekarang
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Database Status */}
        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 flex items-center gap-2">
            {isLoading ? (
              <>
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                Menyambung ke Supabase...
              </>
            ) : (pbdError || eventsError || settingsError) ? (
              <>
                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                Gagal disambung ke Supabase
              </>
            ) : (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Disambung ke Supabase
              </>
            )}
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
