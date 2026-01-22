"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  Student,
  PbdRecord,
  PsvEvidence,
  BehaviorEvent,
  PsvTask,
  Assessment,
  Severity,
  getTokenValue,
} from "@/types";
import {
  MOCK_STUDENTS,
  MOCK_ASSESSMENTS,
  MOCK_PSV_TASKS,
  INITIAL_EVENTS,
} from "@/data/mockData";

// ============================================
// TOKEN HELPER TYPES
// ============================================

export interface StudentToken {
  muridId: string;
  nama: string;
  kelas: string;
  totalToken: number;
  positifCount: number;
  negatifCount: number;
}

// ============================================
// SETTINGS INTERFACE
// ============================================

interface AppSettings {
  pbdVisibleToParents: boolean;
}

// ============================================
// STORE INTERFACE
// ============================================

interface AppState {
  // Data
  students: Student[];
  pbdRecords: PbdRecord[];
  psvEvidence: PsvEvidence[];
  psvTasks: PsvTask[];
  behaviorEvents: BehaviorEvent[];
  assessments: Assessment[];

  // Settings
  settings: AppSettings;

  // Toast state
  toast: { message: string; type: "success" | "error" | "info" } | null;

  // Actions - PBD
  updatePbd: (record: PbdRecord) => void;
  batchUpdatePbd: (records: PbdRecord[]) => void;

  // Actions - Behavior Events
  addEvent: (event: BehaviorEvent) => void;
  deleteEvent: (id: string) => void;

  // Actions - PSV
  addPsvTask: (task: PsvTask) => void;
  updatePsvEvidence: (evidence: PsvEvidence) => void;

  // Actions - Settings
  togglePbdVisibility: () => void;

  // Actions - Toast
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  hideToast: () => void;

  // Actions - Reset
  resetData: () => void;

  // Selectors - Token
  getStudentTokens: (kelas?: string) => StudentToken[];
  getStudentTokenById: (muridId: string) => StudentToken | null;
}

// ============================================
// INITIAL STATE
// ============================================

const initialState = {
  students: MOCK_STUDENTS,
  pbdRecords: [],
  psvEvidence: [],
  psvTasks: MOCK_PSV_TASKS,
  behaviorEvents: INITIAL_EVENTS,
  assessments: MOCK_ASSESSMENTS,
  settings: {
    pbdVisibleToParents: false, // Default: PBD hidden from parents
  },
  toast: null,
};

// ============================================
// STORE CREATION
// ============================================

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ======== PBD Actions ========
      updatePbd: (newRecord) =>
        set((state) => {
          const existingIndex = state.pbdRecords.findIndex(
            (r) =>
              r.muridId === newRecord.muridId &&
              r.subjek === newRecord.subjek &&
              r.pentaksiranId === newRecord.pentaksiranId
          );

          const newRecords = [...state.pbdRecords];
          if (existingIndex >= 0) {
            newRecords[existingIndex] = newRecord;
          } else {
            newRecords.push(newRecord);
          }
          return { pbdRecords: newRecords };
        }),

      batchUpdatePbd: (records) =>
        set((state) => {
          const idsToUpdate = new Set(
            records.map((r) => `${r.muridId}-${r.subjek}-${r.pentaksiranId}`)
          );
          const filtered = state.pbdRecords.filter(
            (r) => !idsToUpdate.has(`${r.muridId}-${r.subjek}-${r.pentaksiranId}`)
          );
          return { pbdRecords: [...filtered, ...records] };
        }),

      // ======== Behavior Event Actions ========
      addEvent: (event) =>
        set((state) => ({
          behaviorEvents: [event, ...state.behaviorEvents],
        })),

      deleteEvent: (id) =>
        set((state) => ({
          behaviorEvents: state.behaviorEvents.filter((e) => e.id !== id),
        })),

      // ======== PSV Actions ========
      addPsvTask: (task) =>
        set((state) => ({
          psvTasks: [task, ...state.psvTasks],
        })),

      updatePsvEvidence: (evidence) =>
        set((state) => {
          const index = state.psvEvidence.findIndex((e) => e.id === evidence.id);
          const newEvidence = [...state.psvEvidence];
          if (index >= 0) {
            newEvidence[index] = evidence;
          } else {
            newEvidence.push(evidence);
          }
          return { psvEvidence: newEvidence };
        }),

      // ======== Settings Actions ========
      togglePbdVisibility: () =>
        set((state) => ({
          settings: {
            ...state.settings,
            pbdVisibleToParents: !state.settings.pbdVisibleToParents,
          },
        })),

      // ======== Toast Actions ========
      showToast: (message, type = "success") => {
        set({ toast: { message, type } });
        // Auto-hide after 3 seconds
        setTimeout(() => {
          get().hideToast();
        }, 3000);
      },

      hideToast: () => set({ toast: null }),

      // ======== Reset Action ========
      resetData: () =>
        set({
          ...initialState,
          students: MOCK_STUDENTS, // Re-generate if needed
        }),

      // ======== Token Selectors ========
      getStudentTokens: (kelas?: string) => {
        const state = get();
        const students = kelas
          ? state.students.filter((s) => s.kelas === kelas)
          : state.students;

        const tokenMap = new Map<string, StudentToken>();

        // Initialize all students with 0 tokens
        students.forEach((student) => {
          tokenMap.set(student.id, {
            muridId: student.id,
            nama: student.nama,
            kelas: student.kelas,
            totalToken: 0,
            positifCount: 0,
            negatifCount: 0,
          });
        });

        // Calculate tokens from behavior events
        state.behaviorEvents.forEach((event) => {
          const studentToken = tokenMap.get(event.muridId);
          if (studentToken && event.severity) {
            const tokenValue = getTokenValue(event.kategori, event.severity);
            studentToken.totalToken += tokenValue;
            if (event.kategori === "Positif") {
              studentToken.positifCount++;
            } else {
              studentToken.negatifCount++;
            }
          }
        });

        // Convert to array and sort by totalToken (descending)
        return Array.from(tokenMap.values()).sort(
          (a, b) => b.totalToken - a.totalToken
        );
      },

      getStudentTokenById: (muridId: string) => {
        const state = get();
        const student = state.students.find((s) => s.id === muridId);
        if (!student) return null;

        let totalToken = 0;
        let positifCount = 0;
        let negatifCount = 0;

        state.behaviorEvents
          .filter((e) => e.muridId === muridId)
          .forEach((event) => {
            if (event.severity) {
              totalToken += getTokenValue(event.kategori, event.severity);
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
          kelas: student.kelas,
          totalToken,
          positifCount,
          negatifCount,
        };
      },
    }),
    {
      name: "rekod-pbd-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        pbdRecords: state.pbdRecords,
        psvEvidence: state.psvEvidence,
        psvTasks: state.psvTasks,
        behaviorEvents: state.behaviorEvents,
        settings: state.settings,
      }),
    }
  )
);
