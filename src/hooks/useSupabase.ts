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

  const fetchAssessments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("assessments")
      .select("*")
      .order("subjek")
      .order("nama");

    if (!error) {
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

  return { assessments, loading, fetchAssessments, getAssessmentsBySubject };
}

// ============================================
// PBD RECORDS HOOK
// ============================================
export function usePbdRecords() {
  const [pbdRecords, setPbdRecords] = useState<DbPbdRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPbdRecords = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pbd_records")
      .select("*")
      .order("updated_at", { ascending: false });

    if (!error) {
      setPbdRecords((data || []) as DbPbdRecord[]);
    }
    setLoading(false);
  }, []);

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

  useEffect(() => {
    fetchPbdRecords();
  }, [fetchPbdRecords]);

  return { pbdRecords, loading, fetchPbdRecords, getPbdByStudent, upsertPbdRecord, batchUpsertPbd };
}

// ============================================
// BEHAVIOR EVENTS HOOK
// ============================================
export function useBehaviorEvents() {
  const [behaviorEvents, setBehaviorEvents] = useState<DbBehaviorEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBehaviorEvents = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("behavior_events")
      .select("*")
      .order("timestamp", { ascending: false });

    if (!error) {
      setBehaviorEvents((data || []) as DbBehaviorEvent[]);
    }
    setLoading(false);
  }, []);

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

  useEffect(() => {
    fetchBehaviorEvents();
  }, [fetchBehaviorEvents]);

  return {
    behaviorEvents,
    loading,
    fetchBehaviorEvents,
    getEventsByClass,
    getEventsByStudent,
    addEvent,
    deleteEvent,
  };
}

// ============================================
// PSV TASKS HOOK
// ============================================
export function usePsvTasks() {
  const [psvTasks, setPsvTasks] = useState<DbPsvTask[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPsvTasks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("psv_tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
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

  useEffect(() => {
    fetchPsvTasks();
  }, [fetchPsvTasks]);

  return { psvTasks, loading, fetchPsvTasks, getTasksByClass, addTask };
}

// ============================================
// PSV EVIDENCE HOOK
// ============================================
export function usePsvEvidence() {
  const [psvEvidence, setPsvEvidence] = useState<DbPsvEvidence[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPsvEvidence = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("psv_evidence")
      .select("*")
      .order("updated_at", { ascending: false });

    if (!error) {
      setPsvEvidence((data || []) as DbPsvEvidence[]);
    }
    setLoading(false);
  }, []);

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

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("app_settings")
      .select("*")
      .eq("key", "pbd_visible_to_parents")
      .single();

    if (!error && data) {
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

  return { pbdVisibleToParents, loading, fetchSettings, togglePbdVisibility };
}
