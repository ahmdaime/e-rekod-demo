"use client";

import React, { useState } from "react";
import { Sparkles, ChevronDown, ChevronUp, Loader2, AlertTriangle, Check, X } from "lucide-react";
import { TP_STYLES } from "@/types";

interface AiAutoFillProps {
  students: Array<{ id: string; nama: string }>;
  selectedAssessmentId: string;
  onApply: (assignments: Array<{ studentId: string; tp: 1 | 2 | 3 | 4 | 5 | 6 }>) => void;
  disabled?: boolean;
}

interface MatchedAssignment {
  studentId: string;
  studentName: string;
  aiName: string;
  tp: 1 | 2 | 3 | 4 | 5 | 6;
  isDefault: boolean;
}

interface UnmatchedName {
  name: string;
  tp: number;
}

type UiState = "collapsed" | "input" | "loading" | "preview";

export default function AiAutoFill({ students, selectedAssessmentId, onApply, disabled }: AiAutoFillProps) {
  const [uiState, setUiState] = useState<UiState>("collapsed");
  const [text, setText] = useState("");
  const [matched, setMatched] = useState<MatchedAssignment[]>([]);
  const [unmatched, setUnmatched] = useState<UnmatchedName[]>([]);
  const [error, setError] = useState<string | null>(null);

  // --- Name matching (client-side, no external lib) ---
  function matchName(aiName: string, studentList: Array<{ id: string; nama: string }>): { id: string; nama: string } | null {
    const query = aiName.toLowerCase().trim();
    if (!query) return null;

    // Try exact substring match first
    const substringMatches = studentList.filter((s) =>
      s.nama.toLowerCase().includes(query)
    );
    if (substringMatches.length === 1) return substringMatches[0];

    // If multiple matches, try matching with more words
    if (substringMatches.length > 1) {
      // Try matching each word from the AI name
      const queryWords = query.split(/\s+/);
      let best = substringMatches;
      for (let i = 0; i < queryWords.length && best.length > 1; i++) {
        const word = queryWords[i];
        const filtered = best.filter((s) =>
          s.nama.toLowerCase().split(/\s+/).some((w) => w.startsWith(word))
        );
        if (filtered.length > 0) best = filtered;
      }
      return best[0];
    }

    // Try matching individual words from query against student name words
    const queryWords = query.split(/\s+/);
    for (const word of queryWords) {
      if (word.length < 3) continue; // skip short words like "dan", "bin"
      const wordMatches = studentList.filter((s) =>
        s.nama.toLowerCase().split(/\s+/).some((w) => w.startsWith(word))
      );
      if (wordMatches.length === 1) return wordMatches[0];
    }

    return null;
  }

  // Mock AI: parse user text to extract names + TP, simulate API delay
  function mockAiAnalyse(input: string, studentNames: string[]): {
    assignments: Array<{ name: string; tp: number }>;
    defaultTp: number | null;
  } {
    const lower = input.toLowerCase();
    const assignments: Array<{ name: string; tp: number }> = [];
    const usedNames = new Set<string>();

    // Extract default TP from patterns like "semua TP4", "semua murid TP3"
    let defaultTp: number | null = null;
    const defaultMatch = lower.match(/semua(?:\s+murid)?\s+tp\s*(\d)/i);
    if (defaultMatch) {
      defaultTp = Math.max(1, Math.min(6, parseInt(defaultMatch[1])));
    }

    // Extract individual assignments: "Danial TP5", "Aisyah tp 3", etc.
    // Match patterns like "[name] TP[n]" or "TP[n] [name]"
    const namePatterns = studentNames.map((name) => {
      // Get first meaningful word (skip short words like BIN, BINTI)
      const words = name.split(/\s+/).filter((w) => w.length >= 3 && !["BIN", "BINTI"].includes(w));
      return { fullName: name, keywords: words };
    });

    for (const { fullName, keywords } of namePatterns) {
      for (const kw of keywords) {
        const kwLower = kw.toLowerCase();
        // Check if this keyword appears in the input
        if (!lower.includes(kwLower)) continue;
        if (usedNames.has(fullName)) continue;

        // Look for TP value AFTER this name mention (closest match)
        const kwIndex = lower.indexOf(kwLower);
        const afterName = lower.slice(kwIndex + kwLower.length, kwIndex + kwLower.length + 20);
        const tpAfter = afterName.match(/\s*tp\s*(\d)/i);

        // Also check BEFORE the name (e.g. "TP5 Danial")
        const beforeName = lower.slice(Math.max(0, kwIndex - 15), kwIndex);
        const tpBefore = beforeName.match(/tp\s*(\d)\s*$/i);

        const tpMatch = tpAfter || tpBefore;

        if (tpMatch) {
          const tp = Math.max(1, Math.min(6, parseInt(tpMatch[1])));
          assignments.push({ name: fullName, tp });
          usedNames.add(fullName);
        }
        break;
      }
    }

    // If no default found but no specific assignments either, assume TP4
    if (defaultTp === null && assignments.length === 0) {
      defaultTp = 4;
    }

    return { assignments, defaultTp };
  }

  async function handleAnalyse() {
    if (!text.trim()) {
      setError("Sila taip arahan terlebih dahulu.");
      return;
    }

    setError(null);
    setUiState("loading");

    try {
      // Simulate AI processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const data = mockAiAnalyse(
        text.trim(),
        students.map((s) => s.nama)
      );

      // Match AI names to actual students
      const matchedList: MatchedAssignment[] = [];
      const unmatchedList: UnmatchedName[] = [];
      const assignedIds = new Set<string>();

      for (const a of data.assignments) {
        const student = matchName(a.name, students);
        if (student && !assignedIds.has(student.id)) {
          assignedIds.add(student.id);
          matchedList.push({
            studentId: student.id,
            studentName: student.nama,
            aiName: a.name,
            tp: Math.max(1, Math.min(6, a.tp)) as 1 | 2 | 3 | 4 | 5 | 6,
            isDefault: false,
          });
        } else if (!student) {
          unmatchedList.push({ name: a.name, tp: a.tp });
        }
      }

      // Apply defaultTp to remaining students
      if (data.defaultTp !== null) {
        const defaultTpVal = Math.max(1, Math.min(6, data.defaultTp)) as 1 | 2 | 3 | 4 | 5 | 6;
        for (const s of students) {
          if (!assignedIds.has(s.id)) {
            matchedList.push({
              studentId: s.id,
              studentName: s.nama,
              aiName: "",
              tp: defaultTpVal,
              isDefault: true,
            });
          }
        }
      }

      setMatched(matchedList);
      setUnmatched(unmatchedList);
      setUiState("preview");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Ralat tidak diketahui");
      setUiState("input");
    }
  }

  function handleApply() {
    onApply(
      matched.map((m) => ({
        studentId: m.studentId,
        tp: m.tp,
      }))
    );
    // Reset
    setText("");
    setMatched([]);
    setUnmatched([]);
    setUiState("collapsed");
  }

  function handleCancel() {
    setMatched([]);
    setUnmatched([]);
    setError(null);
    setUiState("input");
  }

  function handleClose() {
    setText("");
    setMatched([]);
    setUnmatched([]);
    setError(null);
    setUiState("collapsed");
  }

  // --- Collapsed state ---
  if (uiState === "collapsed") {
    return (
      <button
        onClick={() => setUiState("input")}
        disabled={disabled}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg hover:from-purple-100 hover:to-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-purple-700">
          <Sparkles className="w-4 h-4" />
          Isi Auto dengan AI
        </span>
        <ChevronDown className="w-4 h-4 text-purple-400" />
      </button>
    );
  }

  return (
    <div className="border border-purple-200 rounded-lg overflow-hidden bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-200">
        <span className="flex items-center gap-2 text-sm font-medium text-purple-700">
          <Sparkles className="w-4 h-4" />
          Isi Auto dengan AI
        </span>
        <button onClick={handleClose} className="text-purple-400 hover:text-purple-600">
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3">
        {/* --- Input state --- */}
        {(uiState === "input" || uiState === "loading") && (
          <>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='Contoh: "Semua murid TP4 kecuali Danial TP5 dan Aisyah TP3."'
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none resize-none"
              rows={3}
              disabled={uiState === "loading"}
            />
            <p className="text-xs text-gray-400">
              Taip arahan dalam BM. Sebut nama murid dan TP mereka. AI akan padankan nama secara automatik.
            </p>

            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleAnalyse}
                disabled={uiState === "loading" || !text.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uiState === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analisis dengan AI
                  </>
                )}
              </button>
              <button
                onClick={handleClose}
                disabled={uiState === "loading"}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm transition-colors"
              >
                Batal
              </button>
            </div>
          </>
        )}

        {/* --- Preview state --- */}
        {uiState === "preview" && (
          <>
            {/* Unmatched warning */}
            {unmatched.length > 0 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {unmatched.length} nama tidak dapat dipadankan:
                  </p>
                  <p className="text-sm text-yellow-700 mt-1">
                    {unmatched.map((u) => `"${u.name}" (TP${u.tp})`).join(", ")}
                  </p>
                </div>
              </div>
            )}

            {/* Preview table */}
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Murid</th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase w-20">TP</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase w-28">Sumber</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {matched.map((m) => (
                    <tr key={m.studentId} className="hover:bg-gray-50">
                      <td className="px-3 py-2">
                        <div className="font-medium text-gray-900 truncate">{m.studentName}</div>
                        {m.aiName && (
                          <div className="text-xs text-gray-400">dipadankan: &quot;{m.aiName}&quot;</div>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold"
                          style={TP_STYLES[m.tp]}
                        >
                          {m.tp}
                        </span>
                      </td>
                      <td className="px-3 py-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          m.isDefault
                            ? "bg-gray-100 text-gray-600"
                            : "bg-purple-100 text-purple-700"
                        }`}>
                          {m.isDefault ? "Default" : "Disebut"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-gray-500">
              {matched.length} murid akan dikemas kini.
              {matched.filter((m) => !m.isDefault).length > 0 && (
                <> {matched.filter((m) => !m.isDefault).length} disebut secara khusus.</>
              )}
            </p>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleApply}
                disabled={matched.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Guna Penetapan Ini
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg text-sm transition-colors"
              >
                <X className="w-4 h-4" />
                Batal
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
