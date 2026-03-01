"use client";

import React from "react";
import Link from "next/link";
import { Card, Button } from "@/components/ui";
import { Trophy, Lock, Users, Coins } from "lucide-react";

export default function ParentLandingPage() {
  return (
    <div className="p-4 max-w-4xl mx-auto space-y-6 mt-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Portal Ibu Bapa</h1>
        <p className="text-gray-500">
          Sila pilih jenis paparan yang ingin diakses
        </p>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Public Feed - Papan Token */}
        <Link href="/parent/kejayaan">
          <Card
            hover
            className="p-8 border-amber-100 hover:border-amber-300 group min-h-[280px] flex flex-col"
          >
            <div className="flex flex-col items-center text-center flex-1">
              <div className="p-4 bg-amber-100 rounded-full mb-4 text-amber-600 group-hover:scale-110 transition-transform">
                <Coins className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Papan Token
              </h2>
              <p className="text-gray-500 flex-1">
                Lihat kedudukan token murid mengikut kelas. Murid terbaik setiap bulan akan dapat hadiah!
              </p>
              <Button variant="primary" className="mt-6 w-full bg-amber-500 hover:bg-amber-600">
                Lihat Papan Token
              </Button>
            </div>
          </Card>
        </Link>

        {/* Private View */}
        <Link href="/parent/anak">
          <Card
            hover
            className="p-8 border-blue-100 hover:border-blue-300 group min-h-[280px] flex flex-col"
          >
            <div className="flex flex-col items-center text-center flex-1">
              <div className="p-4 bg-blue-100 rounded-full mb-4 text-blue-600 group-hover:scale-110 transition-transform">
                <Lock className="w-12 h-12" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Rekod Anak Saya
              </h2>
              <p className="text-gray-500 flex-1">
                Akses rekod PBD dan sahsiah peribadi anak anda. Memerlukan No.
                Kad Pengenalan.
              </p>
              <Button variant="primary" className="mt-6 w-full">
                Log Masuk
              </Button>
            </div>
          </Card>
        </Link>
      </div>

      {/* Info */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-500 text-center">
        <p>
          <strong>Nota:</strong> Papan Token menunjukkan kedudukan semua murid. Rekod terperinci anak anda boleh dilihat melalui &quot;Rekod Anak Saya&quot;.
        </p>
      </div>

      {/* Demo Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800 text-center">
        <p>
          <strong>Nota Demo:</strong> Semua nama dan No. KP murid dalam demo ini adalah <strong>REKAAN</strong> semata-mata dan tidak merujuk kepada individu sebenar.
        </p>
      </div>
    </div>
  );
}
