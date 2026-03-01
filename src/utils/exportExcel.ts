import ExcelJS from "exceljs";
import type { DbStudent, DbPbdRecord, DbAssessment, DbBookCheck } from "@/types/database";
import type { Subject, Semester, BookCheckStatus } from "@/types";
import { BOOK_CHECK_LABELS } from "@/types";

// ============================================
// INTERFACES (kekal sama)
// ============================================

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

interface BookCheckExportOptions {
  bookName: string;
  className: string;
  subject: string;
  students: DbStudent[];
  tarikhList: string[];
  bookChecks: DbBookCheck[];
}

// ============================================
// CONSTANTS
// ============================================

const TP_LABELS: Record<number, string> = {
  1: "Sangat Lemah",
  2: "Lemah",
  3: "Sederhana",
  4: "Baik",
  5: "Sangat Baik",
  6: "Cemerlang",
};

const SUBJECT_NAMES: Record<Subject, string> = {
  BM: "Bahasa Melayu",
  Sejarah: "Sejarah",
  PSV: "Pendidikan Seni Visual",
};

// TP colors (ARGB format — FFrrggbb)
const TP_COLORS: Record<number, string> = {
  1: "FFef4444",
  2: "FFf97316",
  3: "FFeab308",
  4: "FF84cc16",
  5: "FF22c55e",
  6: "FF059669",
};

// Book check status colors
const BOOK_STATUS_COLORS: Record<BookCheckStatus, string> = {
  hantar: "FF22c55e",
  tidak_lengkap: "FFeab308",
  tidak_hantar: "FFef4444",
};

const BOOK_CHECK_SYMBOL_MAP: Record<BookCheckStatus, string> = {
  hantar: "\u2713",
  tidak_lengkap: "~",
  tidak_hantar: "\u2717",
};

// Tajuk group header colors (rotating)
const TAJUK_COLORS = [
  "FF2563eb", "FFdc2626", "FF16a34a", "FFca8a04", "FF9333ea", "FFdb2777",
];

// Common colors
const DARK_BLUE = "FF1e3a5f";
const LIGHT_BLUE = "FFdbeafe";
const DARK_TEAL = "FF115e59";
const LIGHT_TEAL = "FFccfbf1";
const LIGHT_GREY = "FFf3f4f6";
const GREY = "FFe5e7eb";
const WHITE_FONT = "FFFFFFFF";

// ============================================
// STYLING HELPERS
// ============================================

const thinBorder = {
  top: { style: "thin" as const },
  left: { style: "thin" as const },
  bottom: { style: "thin" as const },
  right: { style: "thin" as const },
};

function solidFill(argb: string) {
  return { type: "pattern" as const, pattern: "solid" as const, fgColor: { argb } };
}

function getTpFill(tp: number) {
  return solidFill(TP_COLORS[tp] || "FFFFFFFF");
}

async function downloadExcelBuffer(workbook: ExcelJS.Workbook, filename: string) {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ============================================
// PBD EXPORT (3 sheets)
// ============================================

export async function exportPbdToExcel(options: ExportOptions): Promise<void> {
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

  const workbook = new ExcelJS.Workbook();

  buildOverviewSheet(workbook, subject, className, students, pbdRecords, assessments, teacherName, schoolName, year, semester);
  buildGroupedSheet(workbook, subject, className, students, pbdRecords, assessments, teacherName, year, semester);
  buildSummarySheet(workbook, subject, className, students, pbdRecords, assessments, teacherName, year, semester);

  const filename = `Rekod_PBD_${SUBJECT_NAMES[subject]}_${className.replace(/ /g, "_")}_${year}_${semester.replace(/ /g, "_")}.xlsx`;
  await downloadExcelBuffer(workbook, filename);
}

// ============================================
// SHEET 1: Rekod Keseluruhan (Overview)
// ============================================

function buildOverviewSheet(
  workbook: ExcelJS.Workbook,
  subject: Subject,
  className: string,
  students: DbStudent[],
  pbdRecords: DbPbdRecord[],
  assessments: DbAssessment[],
  teacherName: string,
  schoolName: string,
  year: string,
  semester: Semester
) {
  const ws = workbook.addWorksheet("Rekod Keseluruhan");
  const totalCols = 2 + assessments.length + 2;

  // --- Tajuk utama ---
  const titleRow = ws.addRow([`REKOD TRANSIT PENTAKSIRAN BILIK DARJAH (PBD) ${year} - ${semester}`]);
  ws.mergeCells(titleRow.number, 1, titleRow.number, totalCols);
  const titleCell = titleRow.getCell(1);
  titleCell.font = { bold: true, size: 14, color: { argb: WHITE_FONT } };
  titleCell.fill = solidFill(DARK_BLUE);
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleRow.height = 30;

  // --- Info rows ---
  const infoLines = [
    `SUBJEK: ${SUBJECT_NAMES[subject]}`,
    `KELAS: ${className}`,
    `SEMESTER: ${semester}`,
    `NAMA SEKOLAH: ${schoolName}`,
    `NAMA GURU: ${teacherName}`,
  ];
  for (const text of infoLines) {
    const row = ws.addRow([text]);
    ws.mergeCells(row.number, 1, row.number, totalCols);
    row.getCell(1).font = { bold: true, size: 11 };
  }

  ws.addRow([]); // baris kosong

  // --- Tajuk group header row ---
  const tajuks = [...new Set(assessments.map((a) => a.tajuk || "Lain-lain"))];
  const tajukRowValues: (string | null)[] = [null, null];
  tajuks.forEach((tajuk) => {
    const count = assessments.filter((a) => (a.tajuk || "Lain-lain") === tajuk).length;
    tajukRowValues.push(tajuk);
    for (let i = 1; i < count; i++) tajukRowValues.push(null);
  });
  tajukRowValues.push(null, null);
  const tajukRow = ws.addRow(tajukRowValues);
  tajukRow.height = 25;

  // Merge & color setiap group tajuk
  let colOffset = 3;
  tajuks.forEach((_, idx) => {
    const count = assessments.filter((a) => (a.tajuk || "Lain-lain") === tajuks[idx]).length;
    if (count > 1) {
      ws.mergeCells(tajukRow.number, colOffset, tajukRow.number, colOffset + count - 1);
    }
    const color = TAJUK_COLORS[idx % TAJUK_COLORS.length];
    for (let c = colOffset; c < colOffset + count; c++) {
      const cell = tajukRow.getCell(c);
      cell.font = { bold: true, color: { argb: WHITE_FONT } };
      cell.fill = solidFill(color);
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = thinBorder;
    }
    colOffset += count;
  });

  // --- SP column headers ---
  const spValues: (string | null)[] = ["No", "Nama Murid"];
  assessments.forEach((a) => spValues.push(a.nama));
  spValues.push("Purata", "TP Keseluruhan");
  const spRow = ws.addRow(spValues);
  spRow.height = 22;
  spRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { bold: true };
    cell.fill = solidFill(LIGHT_BLUE);
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = thinBorder;
  });

  // --- Standard Kandungan row ---
  const skValues: (string | null)[] = ["", "Standard Kandungan:"];
  assessments.forEach((a) => skValues.push(a.standard_kandungan || ""));
  skValues.push("", "");
  const skRow = ws.addRow(skValues);
  skRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { italic: true, size: 9 };
    cell.fill = solidFill(LIGHT_GREY);
    cell.alignment = { vertical: "top", wrapText: true };
    cell.border = thinBorder;
  });

  ws.addRow([]); // baris kosong

  // --- Student data rows ---
  students.forEach((student, idx) => {
    const rowValues: (string | number | null)[] = [idx + 1, student.nama];
    let totalTp = 0;
    let filledCount = 0;

    assessments.forEach((assessment) => {
      const record = pbdRecords.find(
        (r) => r.murid_id === student.id && r.subjek === subject && r.pentaksiran_id === assessment.id
      );
      if (record?.tp) {
        rowValues.push(record.tp);
        totalTp += record.tp;
        filledCount++;
      } else {
        rowValues.push(null);
      }
    });

    const average = filledCount > 0 ? totalTp / filledCount : 0;
    const overallTp = filledCount > 0 ? Math.ceil(average) : null;
    rowValues.push(filledCount > 0 ? Number(average.toFixed(2)) : null);
    rowValues.push(overallTp);

    const row = ws.addRow(rowValues);

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = thinBorder;
      cell.alignment = { vertical: "middle" };

      if (colNumber === 1) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
      } else if (colNumber === 2) {
        cell.alignment = { vertical: "middle", horizontal: "left" };
      } else if (colNumber > 2 && colNumber <= 2 + assessments.length) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        const val = cell.value as number;
        if (val && val >= 1 && val <= 6) {
          cell.fill = getTpFill(val);
          cell.font = { bold: true, color: { argb: WHITE_FONT } };
        }
      } else if (colNumber === totalCols - 1) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        if (overallTp && overallTp >= 1 && overallTp <= 6) {
          cell.font = { bold: true };
        }
      } else if (colNumber === totalCols) {
        cell.alignment = { vertical: "middle", horizontal: "center" };
        if (overallTp && overallTp >= 1 && overallTp <= 6) {
          cell.fill = getTpFill(overallTp);
          cell.font = { bold: true, color: { argb: WHITE_FONT } };
        }
      }
    });
  });

  // --- Column widths ---
  ws.getColumn(1).width = 5;
  ws.getColumn(2).width = 30;
  for (let i = 3; i <= 2 + assessments.length; i++) ws.getColumn(i).width = 8;
  ws.getColumn(totalCols - 1).width = 10;
  ws.getColumn(totalCols).width = 15;
}

// ============================================
// SHEET 2: Rekod Terperinci
// ============================================

function buildGroupedSheet(
  workbook: ExcelJS.Workbook,
  subject: Subject,
  className: string,
  students: DbStudent[],
  pbdRecords: DbPbdRecord[],
  assessments: DbAssessment[],
  teacherName: string,
  year: string,
  semester: Semester
) {
  const ws = workbook.addWorksheet("Rekod Terperinci");
  const totalCols = 7;

  // --- Tajuk utama ---
  const titleRow = ws.addRow([`REKOD TERPERINCI PBD - ${SUBJECT_NAMES[subject]} ${year} - ${semester}`]);
  ws.mergeCells(titleRow.number, 1, titleRow.number, totalCols);
  const titleCell = titleRow.getCell(1);
  titleCell.font = { bold: true, size: 14, color: { argb: WHITE_FONT } };
  titleCell.fill = solidFill(DARK_BLUE);
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleRow.height = 30;

  // Info rows
  for (const text of [`KELAS: ${className}`, `SEMESTER: ${semester}`, `NAMA GURU: ${teacherName}`]) {
    const row = ws.addRow([text]);
    ws.mergeCells(row.number, 1, row.number, totalCols);
    row.getCell(1).font = { bold: true, size: 11 };
  }

  ws.addRow([]);

  // --- Column headers ---
  const headerRow = ws.addRow(["No", "Nama Murid", "Tajuk", "Standard Kandungan", "SP", "TP", "Catatan"]);
  headerRow.height = 22;
  headerRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { bold: true };
    cell.fill = solidFill(LIGHT_BLUE);
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = thinBorder;
  });

  // --- Student data rows ---
  students.forEach((student, idx) => {
    let isFirstRow = true;
    const altBg = idx % 2 !== 0 ? LIGHT_GREY : undefined;

    assessments.forEach((assessment) => {
      const record = pbdRecords.find(
        (r) => r.murid_id === student.id && r.subjek === subject && r.pentaksiran_id === assessment.id
      );

      const row = ws.addRow([
        isFirstRow ? idx + 1 : "",
        isFirstRow ? student.nama : "",
        assessment.tajuk || "",
        assessment.standard_kandungan || "",
        assessment.nama,
        record?.tp || null,
        record?.catatan || "",
      ]);

      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = thinBorder;
        cell.alignment = { vertical: "middle", wrapText: colNumber === 4 || colNumber === 7 };
        if (altBg) cell.fill = solidFill(altBg);

        if (colNumber === 1 || colNumber === 5) {
          cell.alignment = { ...cell.alignment, horizontal: "center" };
        }

        // TP cell coloring
        if (colNumber === 6) {
          cell.alignment = { ...cell.alignment, horizontal: "center" };
          const val = cell.value as number;
          if (val && val >= 1 && val <= 6) {
            cell.fill = getTpFill(val);
            cell.font = { bold: true, color: { argb: WHITE_FONT } };
          }
        }
      });

      isFirstRow = false;
    });
  });

  // --- Column widths ---
  ws.getColumn(1).width = 5;
  ws.getColumn(2).width = 30;
  ws.getColumn(3).width = 35;
  ws.getColumn(4).width = 35;
  ws.getColumn(5).width = 10;
  ws.getColumn(6).width = 8;
  ws.getColumn(7).width = 25;
}

// ============================================
// SHEET 3: Ringkasan TP
// ============================================

function buildSummarySheet(
  workbook: ExcelJS.Workbook,
  subject: Subject,
  className: string,
  students: DbStudent[],
  pbdRecords: DbPbdRecord[],
  assessments: DbAssessment[],
  teacherName: string,
  year: string,
  semester: Semester
) {
  const ws = workbook.addWorksheet("Ringkasan TP");
  const totalCols = 6;

  // --- Tajuk utama ---
  const titleRow = ws.addRow([`RINGKASAN TP KESELURUHAN - ${SUBJECT_NAMES[subject]} ${year} - ${semester}`]);
  ws.mergeCells(titleRow.number, 1, titleRow.number, totalCols);
  const titleCell = titleRow.getCell(1);
  titleCell.font = { bold: true, size: 14, color: { argb: WHITE_FONT } };
  titleCell.fill = solidFill(DARK_BLUE);
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleRow.height = 30;

  // Info rows
  for (const text of [`KELAS: ${className}`, `SEMESTER: ${semester}`, `NAMA GURU: ${teacherName}`, `JUMLAH SP: ${assessments.length}`]) {
    const row = ws.addRow([text]);
    ws.mergeCells(row.number, 1, row.number, totalCols);
    row.getCell(1).font = { bold: true, size: 11 };
  }

  ws.addRow([]);

  // --- Column headers ---
  const headerRow = ws.addRow(["No", "Nama Murid", "SP Diisi", "Purata", "TP Keseluruhan", "Tahap"]);
  headerRow.height = 22;
  headerRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { bold: true };
    cell.fill = solidFill(LIGHT_BLUE);
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = thinBorder;
  });

  // --- Student summary rows ---
  students.forEach((student, idx) => {
    const studentRecords = pbdRecords.filter(
      (r) => r.murid_id === student.id && r.subjek === subject && r.tp !== null
    );
    const filledCount = studentRecords.length;
    const totalSP = assessments.length;
    const totalTp = studentRecords.reduce((sum, r) => sum + (r.tp || 0), 0);
    const average = filledCount > 0 ? totalTp / filledCount : 0;
    const overallTp = filledCount > 0 ? Math.ceil(average) : null;

    const row = ws.addRow([
      idx + 1,
      student.nama,
      `${filledCount}/${totalSP}`,
      filledCount > 0 ? Number(average.toFixed(2)) : null,
      overallTp,
      overallTp ? TP_LABELS[overallTp] : "-",
    ]);

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = thinBorder;
      cell.alignment = { vertical: "middle", horizontal: colNumber === 2 ? "left" : "center" };

      if ((colNumber === 5 || colNumber === 6) && overallTp && overallTp >= 1 && overallTp <= 6) {
        cell.fill = getTpFill(overallTp);
        cell.font = { bold: true, color: { argb: WHITE_FONT } };
      }
    });
  });

  // --- Statistik Kelas ---
  ws.addRow([]);

  const statsHeaderRow = ws.addRow(["STATISTIK KELAS"]);
  ws.mergeCells(statsHeaderRow.number, 1, statsHeaderRow.number, totalCols);
  const statsCell = statsHeaderRow.getCell(1);
  statsCell.font = { bold: true, size: 12, color: { argb: WHITE_FONT } };
  statsCell.fill = solidFill(DARK_BLUE);
  statsCell.alignment = { vertical: "middle" };

  // Kira taburan TP
  const allOverallTps = students
    .map((student) => {
      const recs = pbdRecords.filter(
        (r) => r.murid_id === student.id && r.subjek === subject && r.tp !== null
      );
      if (recs.length === 0) return null;
      return Math.ceil(recs.reduce((sum, r) => sum + (r.tp || 0), 0) / recs.length);
    })
    .filter((tp) => tp !== null) as number[];

  const tpCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  allOverallTps.forEach((tp) => { tpCounts[tp]++; });

  // Header taburan
  const distHeaderRow = ws.addRow(["TP", "Bilangan Murid", "Peratus"]);
  distHeaderRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { bold: true };
    cell.fill = solidFill(LIGHT_BLUE);
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = thinBorder;
  });

  // Baris taburan TP 1-6
  for (let tp = 1; tp <= 6; tp++) {
    const count = tpCounts[tp];
    const percent = allOverallTps.length > 0 ? ((count / allOverallTps.length) * 100).toFixed(1) : "0";
    const row = ws.addRow([`TP ${tp} - ${TP_LABELS[tp]}`, count, `${percent}%`]);
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = thinBorder;
      cell.alignment = { vertical: "middle", horizontal: colNumber === 1 ? "left" : "center" };
      cell.fill = getTpFill(tp);
      cell.font = { color: { argb: WHITE_FONT }, bold: colNumber > 1 };
    });
  }

  // Ringkasan akhir
  ws.addRow([]);
  const dinilaiRow = ws.addRow(["Jumlah Murid Dinilai:", allOverallTps.length]);
  dinilaiRow.getCell(1).font = { bold: true };
  dinilaiRow.getCell(1).border = thinBorder;
  dinilaiRow.getCell(2).font = { bold: true };
  dinilaiRow.getCell(2).border = thinBorder;

  const belumRow = ws.addRow(["Jumlah Murid Belum Dinilai:", students.length - allOverallTps.length]);
  belumRow.getCell(1).font = { bold: true };
  belumRow.getCell(1).border = thinBorder;
  belumRow.getCell(2).font = { bold: true };
  belumRow.getCell(2).border = thinBorder;

  // --- Column widths ---
  ws.getColumn(1).width = 25;
  ws.getColumn(2).width = 30;
  ws.getColumn(3).width = 15;
  ws.getColumn(4).width = 10;
  ws.getColumn(5).width = 15;
  ws.getColumn(6).width = 15;
}

// ============================================
// BOOK CHECKS EXPORT
// ============================================

export async function exportBookChecksToExcel(options: BookCheckExportOptions): Promise<void> {
  const { bookName, className, subject, students, tarikhList, bookChecks } = options;

  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet("Semakan Buku");
  const totalCols = 2 + tarikhList.length + 2;

  // Build check map
  const checkMap = new Map<string, BookCheckStatus>();
  for (const check of bookChecks) {
    checkMap.set(`${check.murid_id}_${check.tarikh}`, check.status as BookCheckStatus);
  }

  // --- Tajuk utama ---
  const titleRow = ws.addRow([`REKOD SEMAKAN BUKU - ${bookName.toUpperCase()}`]);
  ws.mergeCells(titleRow.number, 1, titleRow.number, totalCols);
  const titleCell = titleRow.getCell(1);
  titleCell.font = { bold: true, size: 14, color: { argb: WHITE_FONT } };
  titleCell.fill = solidFill(DARK_TEAL);
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleRow.height = 30;

  // Info rows
  for (const text of [`SUBJEK: ${subject}`, `KELAS: ${className}`, `TARIKH EXPORT: ${new Date().toLocaleDateString("ms-MY")}`]) {
    const row = ws.addRow([text]);
    ws.mergeCells(row.number, 1, row.number, totalCols);
    row.getCell(1).font = { bold: true, size: 11 };
  }

  ws.addRow([]);

  // Petunjuk
  const legendRow = ws.addRow([
    "PETUNJUK:",
    `${BOOK_CHECK_SYMBOL_MAP.hantar} = ${BOOK_CHECK_LABELS.hantar}`,
    `~ = ${BOOK_CHECK_LABELS.tidak_lengkap}`,
    `${BOOK_CHECK_SYMBOL_MAP.tidak_hantar} = ${BOOK_CHECK_LABELS.tidak_hantar}`,
    "Kosong = Belum disemak",
  ]);
  legendRow.getCell(1).font = { bold: true };

  ws.addRow([]);

  // --- Column headers ---
  const headerValues: (string | null)[] = ["No", "Nama Murid"];
  tarikhList.forEach((t) => {
    const d = new Date(t + "T00:00:00");
    headerValues.push(d.toLocaleDateString("ms-MY", { day: "numeric", month: "short" }));
  });
  headerValues.push("Hantar", "%");
  const headerRow = ws.addRow(headerValues);
  headerRow.height = 22;
  headerRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { bold: true };
    cell.fill = solidFill(LIGHT_TEAL);
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = thinBorder;
  });

  // --- Student rows ---
  students.forEach((student, idx) => {
    const rowValues: (string | number)[] = [idx + 1, student.nama];
    let hantarCount = 0;

    tarikhList.forEach((t) => {
      const status = checkMap.get(`${student.id}_${t}`);
      if (status) {
        rowValues.push(BOOK_CHECK_SYMBOL_MAP[status]);
        if (status === "hantar") hantarCount++;
      } else {
        rowValues.push("");
      }
    });

    rowValues.push(hantarCount);
    rowValues.push(tarikhList.length > 0 ? Math.round((hantarCount / tarikhList.length) * 100) : 0);

    const row = ws.addRow(rowValues);

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.border = thinBorder;
      cell.alignment = { vertical: "middle", horizontal: colNumber === 2 ? "left" : "center" };

      // Status cell coloring (date columns)
      if (colNumber > 2 && colNumber <= 2 + tarikhList.length) {
        const t = tarikhList[colNumber - 3];
        const status = checkMap.get(`${student.id}_${t}`);
        if (status) {
          cell.fill = solidFill(BOOK_STATUS_COLORS[status]);
          cell.font = { bold: true, color: { argb: WHITE_FONT } };
        }
      }

      // Hantar count column
      if (colNumber === totalCols - 1) {
        cell.font = { bold: true };
        cell.fill = solidFill("FFbbf7d0");
      }

      // % column
      if (colNumber === totalCols) {
        cell.font = { bold: true };
        cell.fill = solidFill(LIGHT_BLUE);
      }
    });
  });

  // --- JUMLAH HANTAR summary row ---
  ws.addRow([]);
  const summaryValues: (string | number)[] = ["", "JUMLAH HANTAR"];
  tarikhList.forEach((t) => {
    let count = 0;
    students.forEach((s) => {
      if (checkMap.get(`${s.id}_${t}`) === "hantar") count++;
    });
    summaryValues.push(`${count}/${students.length}`);
  });
  summaryValues.push("", "");
  const summaryRow = ws.addRow(summaryValues);
  summaryRow.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { bold: true };
    cell.fill = solidFill(GREY);
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border = thinBorder;
  });

  // --- Column widths ---
  ws.getColumn(1).width = 5;
  ws.getColumn(2).width = 30;
  for (let i = 3; i <= 2 + tarikhList.length; i++) ws.getColumn(i).width = 10;
  if (totalCols >= 3) ws.getColumn(totalCols - 1).width = 8;
  if (totalCols >= 4) ws.getColumn(totalCols).width = 6;

  const filename = `Semakan_Buku_${bookName.replace(/\s+/g, "_")}_${className.replace(/\s+/g, "_")}_${subject}.xlsx`;
  await downloadExcelBuffer(workbook, filename);
}
