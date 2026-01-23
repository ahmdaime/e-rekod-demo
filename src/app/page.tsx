"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, Spinner } from "@/components/ui";
import { CLASS_SUBJECT_MAP } from "@/types";
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
} from "lucide-react";

export default function DashboardPage() {
  const { pbdRecords, loading: pbdLoading } = usePbdRecords();
  const { behaviorEvents, loading: eventsLoading } = useBehaviorEvents();
  const { pbdVisibleToParents, loading: settingsLoading, togglePbdVisibility } = useAppSettings();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  const isLoading = pbdLoading || eventsLoading || settingsLoading;

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toastMessage}
        </div>
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
        </div>
      </Card>

      {/* Database Status */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-400 flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Disambung ke Supabase
        </p>
      </div>
    </div>
  );
}
