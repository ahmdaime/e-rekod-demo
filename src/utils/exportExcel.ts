import * as XLSX from "xlsx";
import type { DbStudent, DbPbdRecord, DbAssessment } from "@/types/database";
import type { Subject, Semester } from "@/types";

interface ExportOptions {
  subject: Subject;
  className: string;
  students: DbStudent[];
  pbdRecords: DbPbdRecord[];
  assessments: DbAssessment[];
  teacherName?: string;
  schoolName?: string;
  year?: string;
  semester?: Semester;
}

// TP Labels for reference
const TP_LABELS: Record<number, string> = {
  1: "Sangat Lemah",
  2: "Lemah",
  3: "Sederhana",
  4: "Baik",
  5: "Sangat Baik",
  6: "Cemerlang",
};

// Subject full names
const SUBJECT_NAMES: Record<Subject, string> = {
  BM: "Bahasa Melayu",
  Sejarah: "Sejarah",
  PSV: "Pendidikan Seni Visual",
};

export function exportPbdToExcel(options: ExportOptions): void {
  const {
    subject,
    className,
    students,
    pbdRecords,
    assessments,
    teacherName = "",
    schoolName = "",
    year = new Date().getFullYear().toString(),
    semester = "PBD 1",
  } = options;

  const workbook = XLSX.utils.book_new();

  // ============================================
  // SHEET 1: Rekod Keseluruhan (Overview)
  // ============================================
  const overviewData = createOverviewSheet(
    subject,
    className,
    students,
    pbdRecords,
    assessments,
    teacherName,
    schoolName,
    year,
    semester
  );
  const overviewSheet = XLSX.utils.aoa_to_sheet(overviewData);

  // Set column widths
  overviewSheet["!cols"] = [
    { wch: 5 },  // No
    { wch: 30 }, // Nama
    ...assessments.map(() => ({ wch: 8 })), // SP columns
    { wch: 10 }, // Purata
    { wch: 12 }, // TP Keseluruhan
  ];

  XLSX.utils.book_append_sheet(workbook, overviewSheet, "Rekod Keseluruhan");

  // ============================================
  // SHEET 2: Rekod Mengikut Tajuk (Grouped)
  // ============================================
  const groupedData = createGroupedSheet(
    subject,
    className,
    students,
    pbdRecords,
    assessments,
    teacherName,
    schoolName,
    year,
    semester
  );
  const groupedSheet = XLSX.utils.aoa_to_sheet(groupedData);

  groupedSheet["!cols"] = [
    { wch: 5 },  // No
    { wch: 30 }, // Nama
    { wch: 35 }, // Tajuk
    { wch: 35 }, // Standard Kandungan
    { wch: 10 }, // SP
    { wch: 8 },  // TP
    { wch: 25 }, // Catatan
  ];

  XLSX.utils.book_append_sheet(workbook, groupedSheet, "Rekod Terperinci");

  // ============================================
  // SHEET 3: Ringkasan TP
  // ============================================
  const summaryData = createSummarySheet(
    subject,
    className,
    students,
    pbdRecords,
    assessments,
    teacherName,
    schoolName,
    year,
    semester
  );
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  summarySheet["!cols"] = [
    { wch: 5 },  // No
    { wch: 30 }, // Nama
    { wch: 15 }, // SP Diisi
    { wch: 10 }, // Purata
    { wch: 15 }, // TP Keseluruhan
    { wch: 15 }, // Tahap
  ];

  XLSX.utils.book_append_sheet(workbook, summarySheet, "Ringkasan TP");

  // ============================================
  // Generate filename and download
  // ============================================
  const filename = `Rekod_PBD_${SUBJECT_NAMES[subject]}_${className.replace(" ", "_")}_${year}_${semester.replace(" ", "_")}.xlsx`;
  XLSX.writeFile(workbook, filename);
}

function createOverviewSheet(
  subject: Subject,
  className: string,
  students: DbStudent[],
  pbdRecords: DbPbdRecord[],
  assessments: DbAssessment[],
  teacherName: string,
  schoolName: string,
  year: string,
  semester: Semester
): (string | number | null)[][] {
  const data: (string | number | null)[][] = [];

  // Header rows
  data.push([`REKOD TRANSIT PENTAKSIRAN BILIK DARJAH (PBD) ${year} - ${semester}`]);
  data.push([`SUBJEK: ${SUBJECT_NAMES[subject]}`]);
  data.push([`KELAS: ${className}`]);
  data.push([`SEMESTER: ${semester}`]);
  data.push([`NAMA SEKOLAH: ${schoolName}`]);
  data.push([`NAMA GURU: ${teacherName}`]);
  data.push([]);

  // Get unique tajuks for grouping headers
  const tajuks = [...new Set(assessments.map((a) => a.tajuk || "Lain-lain"))];

  // Column headers - Row 1: Tajuk grouping
  const tajukRow: (string | number | null)[] = ["", ""];
  tajuks.forEach((tajuk) => {
    const count = assessments.filter((a) => (a.tajuk || "Lain-lain") === tajuk).length;
    tajukRow.push(tajuk);
    for (let i = 1; i < count; i++) {
      tajukRow.push("");
    }
  });
  tajukRow.push("", "");
  data.push(tajukRow);

  // Column headers - Row 2: SP names
  const spRow: (string | number | null)[] = ["No", "Nama Murid"];
  assessments.forEach((a) => {
    spRow.push(a.nama);
  });
  spRow.push("Purata", "TP Keseluruhan");
  data.push(spRow);

  // Column headers - Row 3: Standard Kandungan
  const skRow: (string | number | null)[] = ["", "Standard Kandungan:"];
  assessments.forEach((a) => {
    skRow.push(a.standard_kandungan || "");
  });
  skRow.push("", "");
  data.push(skRow);

  data.push([]); // Empty row

  // Student data rows
  students.forEach((student, idx) => {
    const row: (string | number | null)[] = [idx + 1, student.nama];

    let totalTp = 0;
    let filledCount = 0;

    assessments.forEach((assessment) => {
      const record = pbdRecords.find(
        (r) =>
          r.murid_id === student.id &&
          r.subjek === subject &&
          r.pentaksiran_id === assessment.id
      );
      if (record?.tp) {
        row.push(record.tp);
        totalTp += record.tp;
        filledCount++;
      } else {
        row.push(null);
      }
    });

    // Calculate average and overall TP
    const average = filledCount > 0 ? totalTp / filledCount : 0;
    const overallTp = filledCount > 0 ? Math.ceil(average) : null;

    row.push(filledCount > 0 ? Number(average.toFixed(2)) : null);
    row.push(overallTp);

    data.push(row);
  });

  return data;
}

function createGroupedSheet(
  subject: Subject,
  className: string,
  students: DbStudent[],
  pbdRecords: DbPbdRecord[],
  assessments: DbAssessment[],
  teacherName: string,
  schoolName: string,
  year: string,
  semester: Semester
): (string | number | null)[][] {
  const data: (string | number | null)[][] = [];

  // Header
  data.push([`REKOD TERPERINCI PBD - ${SUBJECT_NAMES[subject]} ${year} - ${semester}`]);
  data.push([`KELAS: ${className}`]);
  data.push([`SEMESTER: ${semester}`]);
  data.push([`NAMA GURU: ${teacherName}`]);
  data.push([]);

  // Column headers
  data.push(["No", "Nama Murid", "Tajuk", "Standard Kandungan", "SP", "TP", "Catatan"]);

  // Data rows
  students.forEach((student, idx) => {
    let isFirstRow = true;

    assessments.forEach((assessment) => {
      const record = pbdRecords.find(
        (r) =>
          r.murid_id === student.id &&
          r.subjek === subject &&
          r.pentaksiran_id === assessment.id
      );

      data.push([
        isFirstRow ? idx + 1 : "",
        isFirstRow ? student.nama : "",
        assessment.tajuk || "",
        assessment.standard_kandungan || "",
        assessment.nama,
        record?.tp || null,
        record?.catatan || "",
      ]);

      isFirstRow = false;
    });

    // Add empty row between students
    data.push([]);
  });

  return data;
}

function createSummarySheet(
  subject: Subject,
  className: string,
  students: DbStudent[],
  pbdRecords: DbPbdRecord[],
  assessments: DbAssessment[],
  teacherName: string,
  schoolName: string,
  year: string,
  semester: Semester
): (string | number | null)[][] {
  const data: (string | number | null)[][] = [];

  // Header
  data.push([`RINGKASAN TP KESELURUHAN - ${SUBJECT_NAMES[subject]} ${year} - ${semester}`]);
  data.push([`KELAS: ${className}`]);
  data.push([`SEMESTER: ${semester}`]);
  data.push([`NAMA GURU: ${teacherName}`]);
  data.push([`JUMLAH SP: ${assessments.length}`]);
  data.push([]);

  // Column headers
  data.push(["No", "Nama Murid", "SP Diisi", "Purata", "TP Keseluruhan", "Tahap"]);

  // Student summary rows
  students.forEach((student, idx) => {
    const studentRecords = pbdRecords.filter(
      (r) => r.murid_id === student.id && r.subjek === subject && r.tp !== null
    );

    const filledCount = studentRecords.length;
    const totalSP = assessments.length;
    const totalTp = studentRecords.reduce((sum, r) => sum + (r.tp || 0), 0);
    const average = filledCount > 0 ? totalTp / filledCount : 0;
    const overallTp = filledCount > 0 ? Math.ceil(average) : null;

    data.push([
      idx + 1,
      student.nama,
      `${filledCount}/${totalSP}`,
      filledCount > 0 ? Number(average.toFixed(2)) : null,
      overallTp,
      overallTp ? TP_LABELS[overallTp] : "-",
    ]);
  });

  // Summary statistics
  data.push([]);
  data.push(["STATISTIK KELAS"]);

  const allOverallTps = students
    .map((student) => {
      const studentRecords = pbdRecords.filter(
        (r) => r.murid_id === student.id && r.subjek === subject && r.tp !== null
      );
      if (studentRecords.length === 0) return null;
      const avg = studentRecords.reduce((sum, r) => sum + (r.tp || 0), 0) / studentRecords.length;
      return Math.ceil(avg);
    })
    .filter((tp) => tp !== null) as number[];

  const tpCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  allOverallTps.forEach((tp) => {
    tpCounts[tp]++;
  });

  data.push(["TP", "Bilangan Murid", "Peratus"]);
  [1, 2, 3, 4, 5, 6].forEach((tp) => {
    const count = tpCounts[tp];
    const percent = allOverallTps.length > 0 ? ((count / allOverallTps.length) * 100).toFixed(1) : "0";
    data.push([`TP ${tp} - ${TP_LABELS[tp]}`, count, `${percent}%`]);
  });

  data.push([]);
  data.push(["Jumlah Murid Dinilai:", allOverallTps.length]);
  data.push(["Jumlah Murid Belum Dinilai:", students.length - allOverallTps.length]);

  return data;
}
