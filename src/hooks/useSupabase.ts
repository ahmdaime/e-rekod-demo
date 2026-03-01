"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  DbStudent,
  DbAssessment,
  DbPbdRecord,
  DbBehaviorEvent,
  DbPsvTask,
  DbPsvEvidence,
  DbBookType,
  DbBookCheck,
} from "@/types/database";
import {
  DEMO_STUDENTS,
  DEMO_ASSESSMENTS,
  DEMO_PBD_RECORDS,
  DEMO_BEHAVIOR_EVENTS,
  DEMO_PSV_TASKS,
  DEMO_PSV_EVIDENCE,
  DEMO_BOOK_TYPES,
  DEMO_BOOK_CHECKS,
  DEMO_APP_SETTINGS,
} from "@/data/demoData";

// Helper to generate unique IDs
let idCounter = Date.now();
function genId(prefix: string) {
  idCounter++;
  return `${prefix}-${idCounter}`;
}

// ============================================
// STUDENTS HOOK
// ============================================
export function useStudents() {
  const [students] = useState<DbStudent[]>(DEMO_STUDENTS);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {}, []);

  const getStudentByIc = useCallback(async (noKp: string) => {
    const digits = noKp.replace(/\D/g, "");
    const formattedIc = digits.length === 12
      ? `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 12)}`
      : noKp;

    return DEMO_STUDENTS.find((s) => s.no_kp === formattedIc) || null;
  }, []);

  const getStudentsByClass = useCallback(async (kelas: string) => {
    return DEMO_STUDENTS.filter((s) => s.kelas === kelas).sort((a, b) =>
      a.nama.localeCompare(b.nama)
    );
  }, []);

  return { students, loading, error, fetchStudents, getStudentByIc, getStudentsByClass };
}

// ============================================
// ASSESSMENTS HOOK
// ============================================
export function useAssessments() {
  const [assessments] = useState<DbAssessment[]>(DEMO_ASSESSMENTS);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchAssessments = useCallback(async () => {}, []);

  const getAssessmentsBySubject = useCallback(
    (subjek: string) => assessments.filter((a) => a.subjek === subjek),
    [assessments]
  );

  return { assessments, loading, error, fetchAssessments, getAssessmentsBySubject };
}

// ============================================
// PBD RECORDS HOOK
// ============================================
export function usePbdRecords(filters?: { kelas?: string; muridId?: string }) {
  const [pbdRecords, setPbdRecords] = useState<DbPbdRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const fetchPbdRecords = useCallback(async () => {
    if (filters?.muridId !== undefined && !filters.muridId) {
      setPbdRecords([]);
      setLoading(false);
      return;
    }

    let filtered = [...DEMO_PBD_RECORDS];
    if (filters?.kelas) filtered = filtered.filter((r) => r.kelas === filters.kelas);
    if (filters?.muridId) filtered = filtered.filter((r) => r.murid_id === filters.muridId);

    setPbdRecords(filtered);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.kelas, filters?.muridId]);

  const getPbdByStudent = useCallback(
    (muridId: string) => pbdRecords.filter((r) => r.murid_id === muridId),
    [pbdRecords]
  );

  const upsertPbdRecord = useCallback(
    async (record: {
      murid_id: string;
      subjek: string;
      kelas: string;
      pentaksiran_id: string;
      tahun_akademik: string;
      semester: string;
      tp: number | null;
      catatan?: string;
    }) => {
      const now = new Date().toISOString();
      const newRecord: DbPbdRecord = {
        id: genId("pbd"),
        murid_id: record.murid_id,
        subjek: record.subjek as DbPbdRecord["subjek"],
        kelas: record.kelas,
        pentaksiran_id: record.pentaksiran_id,
        tahun_akademik: record.tahun_akademik,
        semester: record.semester as DbPbdRecord["semester"],
        tp: record.tp,
        catatan: record.catatan || "",
        created_at: now,
        updated_at: now,
      };

      setPbdRecords((prev) => {
        const index = prev.findIndex(
          (r) =>
            r.murid_id === newRecord.murid_id &&
            r.pentaksiran_id === newRecord.pentaksiran_id &&
            r.tahun_akademik === newRecord.tahun_akademik &&
            r.semester === newRecord.semester
        );
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...prev[index], ...newRecord, id: prev[index].id };
          return updated;
        }
        return [newRecord, ...prev];
      });

      return { data: newRecord, error: null };
    },
    []
  );

  const batchUpsertPbd = useCallback(
    async (
      records: {
        murid_id: string;
        subjek: string;
        kelas: string;
        pentaksiran_id: string;
        tahun_akademik: string;
        semester: string;
        tp: number | null;
        catatan?: string;
      }[]
    ) => {
      const now = new Date().toISOString();
      const newRecords: DbPbdRecord[] = records.map((r) => ({
        id: genId("pbd"),
        murid_id: r.murid_id,
        subjek: r.subjek as DbPbdRecord["subjek"],
        kelas: r.kelas,
        pentaksiran_id: r.pentaksiran_id,
        tahun_akademik: r.tahun_akademik,
        semester: r.semester as DbPbdRecord["semester"],
        tp: r.tp,
        catatan: r.catatan || "",
        created_at: now,
        updated_at: now,
      }));

      setPbdRecords((prev) => {
        let updated = [...prev];
        for (const nr of newRecords) {
          const idx = updated.findIndex(
            (r) =>
              r.murid_id === nr.murid_id &&
              r.pentaksiran_id === nr.pentaksiran_id &&
              r.tahun_akademik === nr.tahun_akademik &&
              r.semester === nr.semester
          );
          if (idx >= 0) {
            updated[idx] = { ...updated[idx], ...nr, id: updated[idx].id };
          } else {
            updated = [nr, ...updated];
          }
        }
        return updated;
      });

      return { data: newRecords, error: null };
    },
    []
  );

  const resetPbdByClass = useCallback(
    async (kelas: string) => {
      setPbdRecords((prev) => {
        const remaining = prev.filter((r) => r.kelas !== kelas);
        return remaining;
      });
      return { error: null as { message: string } | null, deletedCount: 0 };
    },
    []
  );

  useEffect(() => {
    fetchPbdRecords();
  }, [fetchPbdRecords]);

  return { pbdRecords, loading, error, fetchPbdRecords, getPbdByStudent, upsertPbdRecord, batchUpsertPbd, resetPbdByClass };
}

// ============================================
// BEHAVIOR EVENTS HOOK
// ============================================
export function useBehaviorEvents(filters?: { kelas?: string; muridId?: string }) {
  const [behaviorEvents, setBehaviorEvents] = useState<DbBehaviorEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const fetchBehaviorEvents = useCallback(async () => {
    if (filters?.muridId !== undefined && !filters.muridId) {
      setBehaviorEvents([]);
      setLoading(false);
      return;
    }

    let filtered = [...DEMO_BEHAVIOR_EVENTS];
    if (filters?.kelas) filtered = filtered.filter((e) => e.kelas === filters.kelas);
    if (filters?.muridId) filtered = filtered.filter((e) => e.murid_id === filters.muridId);
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setBehaviorEvents(filtered);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.kelas, filters?.muridId]);

  const getEventsByClass = useCallback(
    (kelas: string) => behaviorEvents.filter((e) => e.kelas === kelas),
    [behaviorEvents]
  );

  const getEventsByStudent = useCallback(
    (muridId: string) => behaviorEvents.filter((e) => e.murid_id === muridId),
    [behaviorEvents]
  );

  const addEvent = useCallback(
    async (event: {
      murid_id: string;
      nama_murid: string;
      kelas: string;
      jenis: string;
      kategori: string;
      severity?: string | null;
      catatan?: string;
      is_public?: boolean;
      timestamp?: string;
    }) => {
      const now = new Date().toISOString();
      const newEvent: DbBehaviorEvent = {
        id: genId("evt"),
        murid_id: event.murid_id,
        nama_murid: event.nama_murid,
        kelas: event.kelas,
        jenis: event.jenis,
        kategori: event.kategori as DbBehaviorEvent["kategori"],
        severity: (event.severity as DbBehaviorEvent["severity"]) || null,
        catatan: event.catatan || "",
        is_public: event.is_public ?? true,
        timestamp: event.timestamp || now,
        created_at: now,
      };

      setBehaviorEvents((prev) => [newEvent, ...prev]);
      return { data: newEvent, error: null };
    },
    []
  );

  const deleteEvent = useCallback(async (id: string) => {
    setBehaviorEvents((prev) => prev.filter((e) => e.id !== id));
    return { error: null };
  }, []);

  const resetEventsByClass = useCallback(
    async (kelas: string) => {
      setBehaviorEvents((prev) => prev.filter((e) => e.kelas !== kelas));
      return { error: null as { message: string } | null, deletedCount: 0 };
    },
    []
  );

  useEffect(() => {
    fetchBehaviorEvents();
  }, [fetchBehaviorEvents]);

  return {
    behaviorEvents,
    loading,
    error,
    fetchBehaviorEvents,
    getEventsByClass,
    getEventsByStudent,
    addEvent,
    deleteEvent,
    resetEventsByClass,
  };
}

// ============================================
// PSV TASKS HOOK
// ============================================
export function usePsvTasks() {
  const [psvTasks, setPsvTasks] = useState<DbPsvTask[]>(DEMO_PSV_TASKS);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchPsvTasks = useCallback(async () => {}, []);

  const getTasksByClass = useCallback(
    (kelas: string) => psvTasks.filter((t) => t.kelas === kelas),
    [psvTasks]
  );

  const addTask = useCallback(
    async (task: { nama: string; kelas: string; tarikh_mula?: string; tarikh_akhir: string }) => {
      const now = new Date().toISOString();
      const newTask: DbPsvTask = {
        id: genId("task"),
        nama: task.nama,
        kelas: task.kelas,
        tarikh_mula: task.tarikh_mula || now.split("T")[0],
        tarikh_akhir: task.tarikh_akhir,
        created_at: now,
      };
      setPsvTasks((prev) => [newTask, ...prev]);
      return { data: newTask, error: null };
    },
    []
  );

  const updateTask = useCallback(
    async (taskId: string, updates: { nama?: string; tarikh_akhir?: string }) => {
      let updatedTask: DbPsvTask | null = null;
      setPsvTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            updatedTask = { ...t, ...updates };
            return updatedTask;
          }
          return t;
        })
      );
      return { data: updatedTask, error: null };
    },
    []
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      setPsvTasks((prev) => prev.filter((t) => t.id !== taskId));
      return { error: null };
    },
    []
  );

  return { psvTasks, loading, error, fetchPsvTasks, getTasksByClass, addTask, updateTask, deleteTask };
}

// ============================================
// PSV EVIDENCE HOOK
// ============================================
export function usePsvEvidence(filters?: { muridId?: string }) {
  const [psvEvidence, setPsvEvidence] = useState<DbPsvEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const fetchPsvEvidence = useCallback(async () => {
    if (filters?.muridId !== undefined && !filters.muridId) {
      setPsvEvidence([]);
      setLoading(false);
      return;
    }

    let filtered = [...DEMO_PSV_EVIDENCE];
    if (filters?.muridId) filtered = filtered.filter((e) => e.murid_id === filters.muridId);

    setPsvEvidence(filtered);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.muridId]);

  const getEvidenceByTask = useCallback(
    (tugasanId: string) => psvEvidence.filter((e) => e.tugasan_id === tugasanId),
    [psvEvidence]
  );

  const getEvidenceByStudent = useCallback(
    (muridId: string) => psvEvidence.filter((e) => e.murid_id === muridId),
    [psvEvidence]
  );

  const upsertEvidence = useCallback(
    async (evidence: {
      tugasan_id: string;
      murid_id: string;
      link_bukti?: string;
      gambar_url?: string;
      catatan?: string;
      status?: string;
    }) => {
      const now = new Date().toISOString();
      const newEvidence: DbPsvEvidence = {
        id: genId("ev"),
        tugasan_id: evidence.tugasan_id,
        murid_id: evidence.murid_id,
        link_bukti: evidence.link_bukti || "",
        gambar_url: evidence.gambar_url || "",
        catatan: evidence.catatan || "",
        status: (evidence.status as DbPsvEvidence["status"]) || "Belum Hantar",
        created_at: now,
        updated_at: now,
      };

      setPsvEvidence((prev) => {
        const index = prev.findIndex(
          (e) => e.tugasan_id === newEvidence.tugasan_id && e.murid_id === newEvidence.murid_id
        );
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...prev[index], ...newEvidence, id: prev[index].id };
          return updated;
        }
        return [newEvidence, ...prev];
      });

      return { data: newEvidence, error: null };
    },
    []
  );

  useEffect(() => {
    fetchPsvEvidence();
  }, [fetchPsvEvidence]);

  return {
    psvEvidence,
    loading,
    error,
    fetchPsvEvidence,
    getEvidenceByTask,
    getEvidenceByStudent,
    upsertEvidence,
  };
}

// ============================================
// APP SETTINGS HOOK
// ============================================
export function useAppSettings() {
  const [pbdVisibleToParents, setPbdVisibleToParents] = useState(DEMO_APP_SETTINGS.pbdVisibleToParents);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {}, []);

  const togglePbdVisibility = useCallback(async () => {
    setPbdVisibleToParents((prev) => !prev);
    return { error: null };
  }, []);

  return { pbdVisibleToParents, loading, error, fetchSettings, togglePbdVisibility };
}

// ============================================
// BOOK TYPES HOOK
// ============================================
export function useBookTypes(filters?: { kelas?: string; subjek?: string }) {
  const [bookTypes, setBookTypes] = useState<DbBookType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const fetchBookTypes = useCallback(async () => {
    let filtered = [...DEMO_BOOK_TYPES];
    if (filters?.kelas) filtered = filtered.filter((b) => b.kelas === filters.kelas);
    if (filters?.subjek) filtered = filtered.filter((b) => b.subjek === filters.subjek);
    filtered.sort((a, b) => a.nama.localeCompare(b.nama));
    setBookTypes(filtered);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.kelas, filters?.subjek]);

  const addBookType = useCallback(
    async (book: { nama: string; kelas: string; subjek: string }) => {
      const now = new Date().toISOString();
      const newBook: DbBookType = {
        id: genId("bt"),
        nama: book.nama,
        kelas: book.kelas,
        subjek: book.subjek as DbBookType["subjek"],
        tarikh_list: [],
        created_at: now,
        updated_at: now,
      };
      // Check duplicate
      const exists = bookTypes.find(
        (b) => b.nama === book.nama && b.kelas === book.kelas && b.subjek === book.subjek
      );
      if (exists) {
        return { data: null, error: { message: "duplicate key" } };
      }
      setBookTypes((prev) => [...prev, newBook].sort((a, b) => a.nama.localeCompare(b.nama)));
      return { data: newBook, error: null };
    },
    [bookTypes]
  );

  const addDate = useCallback(
    async (bookTypeId: string, tarikh: string) => {
      const current = bookTypes.find((b) => b.id === bookTypeId);
      if (!current) return { data: null, error: { message: "Buku tidak dijumpai" } };

      const currentList = (current.tarikh_list || []) as string[];
      if (currentList.includes(tarikh)) {
        return { data: null, error: { message: "Tarikh sudah wujud" } };
      }

      const newList = [...currentList, tarikh].sort();
      const updated = { ...current, tarikh_list: newList, updated_at: new Date().toISOString() };
      setBookTypes((prev) => prev.map((b) => (b.id === bookTypeId ? updated : b)));
      return { data: updated, error: null };
    },
    [bookTypes]
  );

  const removeDate = useCallback(
    async (bookTypeId: string, tarikh: string) => {
      const current = bookTypes.find((b) => b.id === bookTypeId);
      if (!current) return { data: null, error: { message: "Buku tidak dijumpai" } };

      const currentList = (current.tarikh_list || []) as string[];
      const newList = currentList.filter((t) => t !== tarikh);
      const updated = { ...current, tarikh_list: newList, updated_at: new Date().toISOString() };
      setBookTypes((prev) => prev.map((b) => (b.id === bookTypeId ? updated : b)));
      return { data: updated, error: null };
    },
    [bookTypes]
  );

  const deleteBookType = useCallback(
    async (bookTypeId: string) => {
      setBookTypes((prev) => prev.filter((b) => b.id !== bookTypeId));
      return { error: null as { message: string } | null };
    },
    []
  );

  useEffect(() => {
    fetchBookTypes();
  }, [fetchBookTypes]);

  return { bookTypes, loading, error, fetchBookTypes, addBookType, addDate, removeDate, deleteBookType };
}

// ============================================
// BOOK CHECKS HOOK
// ============================================
export function useBookChecks(filters?: { bookTypeId?: string; muridId?: string }) {
  const [bookChecks, setBookChecks] = useState<DbBookCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const fetchBookChecks = useCallback(async () => {
    if (filters?.bookTypeId !== undefined && !filters.bookTypeId) {
      setBookChecks([]);
      setLoading(false);
      return;
    }
    if (filters?.muridId !== undefined && !filters.muridId) {
      setBookChecks([]);
      setLoading(false);
      return;
    }

    let filtered = [...DEMO_BOOK_CHECKS];
    if (filters?.bookTypeId) filtered = filtered.filter((c) => c.book_type_id === filters.bookTypeId);
    if (filters?.muridId) filtered = filtered.filter((c) => c.murid_id === filters.muridId);
    filtered.sort((a, b) => a.tarikh.localeCompare(b.tarikh));

    setBookChecks(filtered);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.bookTypeId, filters?.muridId]);

  const upsertBookCheck = useCallback(
    async (record: {
      book_type_id: string;
      murid_id: string;
      tarikh: string;
      status: string;
    }) => {
      const now = new Date().toISOString();
      const newRecord: DbBookCheck = {
        id: genId("bc"),
        book_type_id: record.book_type_id,
        murid_id: record.murid_id,
        tarikh: record.tarikh,
        status: record.status as DbBookCheck["status"],
        created_at: now,
        updated_at: now,
      };

      setBookChecks((prev) => {
        const index = prev.findIndex(
          (r) =>
            r.book_type_id === newRecord.book_type_id &&
            r.murid_id === newRecord.murid_id &&
            r.tarikh === newRecord.tarikh
        );
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = { ...prev[index], ...newRecord, id: prev[index].id };
          return updated;
        }
        return [...prev, newRecord];
      });

      return { data: newRecord, error: null };
    },
    []
  );

  const deleteBookCheck = useCallback(
    async (bookTypeId: string, muridId: string, tarikh: string) => {
      setBookChecks((prev) =>
        prev.filter(
          (r) => !(r.book_type_id === bookTypeId && r.murid_id === muridId && r.tarikh === tarikh)
        )
      );
      return { error: null as { message: string } | null };
    },
    []
  );

  const deleteBookChecksByDate = useCallback(
    async (bookTypeId: string, tarikh: string) => {
      setBookChecks((prev) =>
        prev.filter((r) => !(r.book_type_id === bookTypeId && r.tarikh === tarikh))
      );
      return { error: null as { message: string } | null };
    },
    []
  );

  useEffect(() => {
    fetchBookChecks();
  }, [fetchBookChecks]);

  return {
    bookChecks,
    loading,
    error,
    fetchBookChecks,
    upsertBookCheck,
    deleteBookCheck,
    deleteBookChecksByDate,
  };
}
