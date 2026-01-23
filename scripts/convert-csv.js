/**
 * Script untuk convert CSV murid ke format Supabase
 * Usage: node scripts/convert-csv.js
 */

const fs = require('fs');
const path = require('path');

// Read the CSV file
const inputPath = path.join(__dirname, '..', 'SENARAI NAMA.csv');
const outputPath = path.join(__dirname, '..', 'students-import.csv');

const content = fs.readFileSync(inputPath, 'utf-8');
const lines = content.split('\n');

// Map tahun text to number
const tahunMap = {
  'TAHUN SATU': 1,
  'TAHUN DUA': 2,
  'TAHUN TIGA': 3,
  'TAHUN EMPAT': 4,
  'TAHUN LIMA': 5,
  'TAHUN ENAM': 6,
};

// Format IC number with dashes: 170529160218 -> 170529-16-0218
function formatIc(ic) {
  const clean = ic.replace(/\D/g, '');
  if (clean.length !== 12) return ic; // Return as-is if not 12 digits
  return `${clean.slice(0, 6)}-${clean.slice(6, 8)}-${clean.slice(8, 12)}`;
}

// Format class name: "PEARL" + tahun 3 -> "3 Pearl"
function formatKelas(namaKelas, tahun) {
  const formatted = namaKelas.charAt(0) + namaKelas.slice(1).toLowerCase();
  return `${tahun} ${formatted}`;
}

const students = [];
let currentKelas = '';
let currentTahun = 0;

for (const line of lines) {
  const cols = line.split(',');

  // Skip empty lines
  if (!cols[0] && !cols[1]) continue;

  // Detect class header: ",KELAS : 3 PEARL,,,,,,"
  if (cols[1] && cols[1].includes('KELAS :')) {
    const match = cols[1].match(/KELAS\s*:\s*(\d+)\s+(\w+)/i);
    if (match) {
      currentTahun = parseInt(match[1]);
      currentKelas = match[2].toUpperCase();
    }
    continue;
  }

  // Skip header rows
  if (cols[0] === 'BIL.' || cols[1] === 'SENARAI NAMA MURID SESI 2026') continue;
  if (cols[1] && cols[1].includes('GURU KELAS')) continue;

  // Process student row: BIL, NAMA, NO. PENGENALAN, TAHUN, NAMA KELAS, ...
  const bil = cols[0]?.trim();
  const nama = cols[1]?.trim();
  const noKp = cols[2]?.trim();
  const tahunText = cols[3]?.trim();
  const namaKelas = cols[4]?.trim();

  // Validate it's a student row
  if (!bil || !nama || !noKp || isNaN(parseInt(bil))) continue;

  // Get tahun from text or use current
  let tahun = tahunMap[tahunText] || currentTahun;

  // Get kelas name
  const kelasName = namaKelas || currentKelas;

  if (!nama || !noKp || !kelasName || !tahun) continue;

  students.push({
    nama: nama,
    no_kp: formatIc(noKp),
    kelas: formatKelas(kelasName, tahun),
    tahun: tahun,
  });
}

// Generate CSV output
const header = 'nama,no_kp,kelas,tahun';
const rows = students.map(s => `"${s.nama}","${s.no_kp}","${s.kelas}",${s.tahun}`);
const output = [header, ...rows].join('\n');

fs.writeFileSync(outputPath, output, 'utf-8');

console.log(`✅ Converted ${students.length} students`);
console.log(`📁 Output: ${outputPath}`);
console.log('');
console.log('Breakdown by class:');

// Count by class
const byClass = {};
students.forEach(s => {
  byClass[s.kelas] = (byClass[s.kelas] || 0) + 1;
});
Object.entries(byClass).sort().forEach(([kelas, count]) => {
  console.log(`   ${kelas}: ${count} murid`);
});
