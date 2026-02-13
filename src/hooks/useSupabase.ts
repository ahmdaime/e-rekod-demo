"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type {
  DbStudent,
  DbAssessment,
  DbPbdRecord,
  DbBehaviorEvent,
  DbPsvTask,
  DbPsvEvidence,
} from "@/types/database";

// ============================================
// STUDENTS HOOK
// ============================================
export function useStudents() {
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("nama");

    if (error) {
      setError(error.message);
    } else {
      setStudents(data || []);
    }
    setLoading(false);
  }, []);

  const getStudentByIc = useCallback(async (noKp: string) => {
    // Normalize IC: remove dashes and format to XXXXXX-XX-XXXX
    const digits = noKp.replace(/\D/g, "");
    const formattedIc = digits.length === 12
      ? `${digits.slice(0, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 12)}`
      : noKp;

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("no_kp", formattedIc)
      .single();

    if (error) return null;
    return data as DbStudent;
  }, []);

  const getStudentsByClass = useCallback(async (kelas: string) => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("kelas", kelas)
      .order("nama");

    if (error) return [];
    return (data || []) as DbStudent[];
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return { students, loading, error, fetchStudents, getStudentByIc, getStudentsByClass };
}

// ============================================
// ASSESSMENTS HOOK
// ============================================
export function useAssessments() {
  const [assessments, setAssessments] = useState<DbAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("assessments")
      .select("*")
      .order("subjek")
      .order("nama");

    if (err) {
      setError(err.message);
    } else {
      setAssessments((data || []) as DbAssessment[]);
    }
    setLoading(false);
  }, []);

  const getAssessmentsBySubject = useCallback(
    (subjek: string) => assessments.filter((a) => a.subjek === subjek),
    [assessments]
  );

  useEffect(() => {
    fetchAssessments();
  }, [fetchAssessments]);

  return { assessments, loading, error, fetchAssessments, getAssessmentsBySubject };
}

// ============================================
// PBD RECORDS HOOK
// ============================================
export function usePbdRecords(filters?: { kelas?: string; muridId?: string }) {
  const [pbdRecords, setPbdRecords] = useState<DbPbdRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPbdRecords = useCallback(async () => {
    if (filters?.muridId !== undefined && !filters.muridId) {
      setPbdRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    let query = supabase
      .from("pbd_records")
      .select("*")
      .order("updated_at", { ascending: false });

    if (filters?.kelas) query = query.eq("kelas", filters.kelas);
    if (filters?.muridId) query = query.eq("murid_id", filters.muridId);

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
    } else {
      setPbdRecords((data || []) as DbPbdRecord[]);
    }
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
      const { data, error } = await supabase
        .from("pbd_records")
        .upsert(record as never, {
          onConflict: "murid_id,pentaksiran_id,tahun_akademik,semester",
        })
        .select()
        .single();

      if (!error && data) {
        const typedData = data as DbPbdRecord;
        setPbdRecords((prev) => {
          const index = prev.findIndex(
            (r) =>
              r.murid_id === typedData.murid_id &&
              r.pentaksiran_id === typedData.pentaksiran_id &&
              r.tahun_akademik === typedData.tahun_akademik &&
              r.semester === typedData.semester
          );
          if (index >= 0) {
            const newRecords = [...prev];
            newRecords[index] = typedData;
            return newRecords;
          }
          return [typedData, ...prev];
        });
      }
      return { data: data as DbPbdRecord | null, error };
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
      const { data, error } = await supabase
        .from("pbd_records")
        .upsert(records as never[], {
          onConflict: "murid_id,pentaksiran_id,tahun_akademik,semester",
        })
        .select();

      if (!error) {
        await fetchPbdRecords();
      }
      return { data: data as DbPbdRecord[] | null, error };
    },
    [fetchPbdRecords]
  );

  const resetPbdByClass = useCallback(
    async (kelas: string) => {
      const { error, count } = await supabase
        .from("pbd_records")
        .delete({ count: "exact" })
        .eq("kelas", kelas);

      if (!error) {
        await fetchPbdRecords();
      }
      return { error, deletedCount: count ?? 0 };
    },
    [fetchPbdRecords]
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
  const [error, setError] = useState<string | null>(null);

  const fetchBehaviorEvents = useCallback(async () => {
    if (filters?.muridId !== undefined && !filters.muridId) {
      setBehaviorEvents([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    let query = supabase
      .from("behavior_events")
      .select("*")
      .order("timestamp", { ascending: false });

    if (filters?.kelas) query = query.eq("kelas", filters.kelas);
    if (filters?.muridId) query = query.eq("murid_id", filters.muridId);

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
    } else {
      setBehaviorEvents((data || []) as DbBehaviorEvent[]);
    }
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
      const { data, error } = await supabase
        .from("behavior_events")
        .insert(event as never)
        .select()
        .single();

      if (!error && data) {
        setBehaviorEvents((prev) => [data as DbBehaviorEvent, ...prev]);
      }
      return { data: data as DbBehaviorEvent | null, error };
    },
    []
  );

  const deleteEvent = useCallback(async (id: string) => {
    const { error } = await supabase.from("behavior_events").delete().eq("id", id);

    if (!error) {
      setBehaviorEvents((prev) => prev.filter((e) => e.id !== id));
    }
    return { error };
  }, []);

  const resetEventsByClass = useCallback(
    async (kelas: string) => {
      const { error, count } = await supabase
        .from("behavior_events")
        .delete({ count: "exact" })
        .eq("kelas", kelas);

      if (!error) {
        await fetchBehaviorEvents();
      }
      return { error, deletedCount: count ?? 0 };
    },
    [fetchBehaviorEvents]
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
  const [psvTasks, setPsvTasks] = useState<DbPsvTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPsvTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("psv_tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setPsvTasks((data || []) as DbPsvTask[]);
    }
    setLoading(false);
  }, []);

  const getTasksByClass = useCallback(
    (kelas: string) => psvTasks.filter((t) => t.kelas === kelas),
    [psvTasks]
  );

  const addTask = useCallback(
    async (task: { nama: string; kelas: string; tarikh_mula?: string; tarikh_akhir: string }) => {
      const { data, error } = await supabase
        .from("psv_tasks")
        .insert(task as never)
        .select()
        .single();

      if (!error && data) {
        setPsvTasks((prev) => [data as DbPsvTask, ...prev]);
      }
      return { data: data as DbPsvTask | null, error };
    },
    []
  );

  const deleteTask = useCallback(
    async (taskId: string) => {
      // Padam evidence berkaitan terlebih dahulu
      await supabase.from("psv_evidence").delete().eq("tugasan_id", taskId);
      // Padam tugasan
      const { error } = await supabase.from("psv_tasks").delete().eq("id", taskId);
      if (!error) {
        setPsvTasks((prev) => prev.filter((t) => t.id !== taskId));
      }
      return { error };
    },
    []
  );

  useEffect(() => {
    fetchPsvTasks();
  }, [fetchPsvTasks]);

  return { psvTasks, loading, error, fetchPsvTasks, getTasksByClass, addTask, deleteTask };
}

// ============================================
// PSV EVIDENCE HOOK
// ============================================
export function usePsvEvidence(filters?: { muridId?: string }) {
  const [psvEvidence, setPsvEvidence] = useState<DbPsvEvidence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPsvEvidence = useCallback(async () => {
    if (filters?.muridId !== undefined && !filters.muridId) {
      setPsvEvidence([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    let query = supabase
      .from("psv_evidence")
      .select("*")
      .order("updated_at", { ascending: false });

    if (filters?.muridId) query = query.eq("murid_id", filters.muridId);

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
    } else {
      setPsvEvidence((data || []) as DbPsvEvidence[]);
    }
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
      const { data, error } = await supabase
        .from("psv_evidence")
        .upsert(evidence as never, {
          onConflict: "tugasan_id,murid_id",
        })
        .select()
        .single();

      if (!error && data) {
        const typedData = data as DbPsvEvidence;
        setPsvEvidence((prev) => {
          const index = prev.findIndex(
            (e) => e.tugasan_id === typedData.tugasan_id && e.murid_id === typedData.murid_id
          );
          if (index >= 0) {
            const newEvidence = [...prev];
            newEvidence[index] = typedData;
            return newEvidence;
          }
          return [typedData, ...prev];
        });
      }
      return { data: data as DbPsvEvidence | null, error };
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
  const [pbdVisibleToParents, setPbdVisibleToParents] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("app_settings")
      .select("*")
      .eq("key", "pbd_visible_to_parents")
      .single();

    if (err) {
      setError(err.message);
    } else if (data) {
      const record = data as { value: { enabled?: boolean } };
      setPbdVisibleToParents(record.value?.enabled ?? false);
    }
    setLoading(false);
  }, []);

  const togglePbdVisibility = useCallback(async () => {
    const newValue = !pbdVisibleToParents;
    const { error } = await supabase
      .from("app_settings")
      .update({ value: { enabled: newValue } } as never)
      .eq("key", "pbd_visible_to_parents");

    if (!error) {
      setPbdVisibleToParents(newValue);
    }
    return { error };
  }, [pbdVisibleToParents]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return { pbdVisibleToParents, loading, error, fetchSettings, togglePbdVisibility };
}
