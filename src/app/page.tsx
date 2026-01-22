"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { useAppStore } from "@/store";
import { CLASS_SUBJECT_MAP } from "@/types";
import { isToday } from "@/lib/utils";
import {
  FileText,
  Image,
  Coins,
  Users,
  ClipboardList,
  Activity,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";

export default function DashboardPage() {
  const { pbdRecords, behaviorEvents, resetData, showToast, settings, togglePbdVisibility } = useAppStore();

  // Calculate today's stats
  const todayPbdCount = pbdRecords.filter((r) => isToday(r.updatedAt)).length;
  const todayEventCount = behaviorEvents.filter((e) => isToday(e.timestamp)).length;
  const todayPositifCount = behaviorEvents.filter(
    (e) => isToday(e.timestamp) && e.kategori === "Positif"
  ).length;

  const handleReset = () => {
    if (window.confirm("Reset semua data demo kepada asal?")) {
      resetData();
      showToast("Data telah direset", "success");
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-6">
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
            <p className="text-2xl font-bold text-gray-900">{todayPbdCount}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-yellow-100 rounded-full text-yellow-600">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Rekod Token Hari Ini</p>
            <p className="text-2xl font-bold text-gray-900">{todayEventCount}</p>
          </div>
        </Card>

        <Card className="flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 rounded-full text-emerald-600">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Token Positif Hari Ini</p>
            <p className="text-2xl font-bold text-gray-900">{todayPositifCount}</p>
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
              {settings.pbdVisibleToParents ? (
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
                  {settings.pbdVisibleToParents
                    ? "Ibu bapa boleh lihat rekod PBD anak mereka"
                    : "Rekod PBD disembunyikan daripada ibu bapa"}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                togglePbdVisibility();
                showToast(
                  settings.pbdVisibleToParents
                    ? "Paparan PBD telah ditutup"
                    : "Paparan PBD telah dibuka",
                  "success"
                );
              }}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                settings.pbdVisibleToParents ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                  settings.pbdVisibleToParents ? "translate-x-8" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* Reset Button */}
      <div className="pt-4 border-t border-gray-200">
        <button
          onClick={handleReset}
          className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Set Semula Data
        </button>
      </div>
    </div>
  );
}
