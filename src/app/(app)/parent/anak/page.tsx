"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Input, Spinner } from "@/components/ui";
import { useStudents } from "@/hooks/useSupabase";
import { User, Search } from "lucide-react";

export default function AnakLoginPage() {
  const router = useRouter();
  const { getStudentByIc } = useStudents();

  const [inputIc, setInputIc] = useState("");
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Handle IC input - accept with or without dashes
  const handleIcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits and dashes
    const value = e.target.value.replace(/[^\d-]/g, "");
    setInputIc(value);
    setError("");
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setError("");

    const student = await getStudentByIc(inputIc);

    if (student) {
      router.push(`/parent/anak/${encodeURIComponent(inputIc)}`);
    } else {
      setError("No KP tidak dijumpai. Sila semak semula.");
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
            <User className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Rekod Anak Saya</h1>
          <p className="text-gray-500 text-sm mt-2">
            Masukkan No. Kad Pengenalan anak untuk melihat rekod penuh.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Contoh: 170523141234"
              value={inputIc}
              onChange={handleIcChange}
              className="text-center text-lg tracking-wider font-mono"
              maxLength={14}
              icon={Search}
              error={error}
              disabled={isSearching}
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={isSearching}>
            {isSearching ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner size="sm" />
                Mencari...
              </span>
            ) : (
              "Lihat Rekod"
            )}
          </Button>
        </form>

        {/* Demo IC List */}
        <div className="mt-6 bg-emerald-50 border border-emerald-200 p-4 rounded-lg">
          <h3 className="text-sm font-bold text-emerald-800 mb-2">IC Contoh untuk Demo</h3>
          <p className="text-xs text-emerald-600 mb-3">
            Klik mana-mana IC di bawah untuk auto-isi. Semua data adalah <strong>REKAAN</strong>.
          </p>
          <div className="space-y-1.5">
            {[
              { ic: "140115-00-0123", nama: "DANIAL HAKIMI (6 Topaz)" },
              { ic: "140518-00-0789", nama: "NUR AISYAH (6 Topaz)" },
              { ic: "170210-00-3123", nama: "NUR IRDINA (3 Pearl)" },
              { ic: "170425-00-3456", nama: "MIKHAIL DARWISH (3 Pearl)" },
            ].map(({ ic, nama }) => (
              <button
                key={ic}
                onClick={() => {
                  setInputIc(ic.replace(/-/g, ""));
                  setError("");
                }}
                className="w-full text-left px-3 py-2 rounded-lg bg-white border border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 transition-colors text-sm flex justify-between items-center group"
              >
                <span className="font-mono text-emerald-700 group-hover:text-emerald-900">{ic}</span>
                <span className="text-xs text-gray-500">{nama}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-4 bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Masukkan 12 digit No. KP anak anda (tanpa dash).
            Jika menghadapi masalah, sila hubungi guru kelas.
          </p>
        </div>

        {/* Privacy Notice */}
        <p className="text-xs text-gray-400 text-center mt-6">
          Rekod ini adalah sulit dan hanya boleh diakses oleh ibu bapa murid.
        </p>
      </Card>
    </div>
  );
}
