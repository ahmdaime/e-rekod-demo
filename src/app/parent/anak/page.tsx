"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Input, Spinner } from "@/components/ui";
import { formatIcNumber } from "@/lib/utils";
import { useStudents } from "@/hooks/useSupabase";
import { User, Search } from "lucide-react";

export default function AnakLoginPage() {
  const router = useRouter();
  const { getStudentByIc } = useStudents();

  const [inputIc, setInputIc] = useState("");
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Handle IC input with formatting
  const handleIcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatIcNumber(e.target.value);
    setInputIc(formatted);
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
              placeholder="Contoh: 170523-14-1234"
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

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Sila masukkan No. Kad Pengenalan anak anda untuk mengakses rekod.
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
