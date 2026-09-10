import * as XLSX from "xlsx";
import type { ClassRosterEntry } from "./api";

/**
 * Reverse of `cleanRosterFile.ts`'s import path — entirely client-side
 * (`json_to_sheet` + `writeFile`, same `xlsx` library, no new backend
 * endpoint). Column headers match `HEADER_ALIASES` in `cleanRosterFile.ts`
 * exactly so a re-imported export round-trips to the same students.
 */
export function exportClassRosterToExcel(entries: ClassRosterEntry[], fileNameBase: string): void {
  const rows = entries.map((entry) => ({
    Email: entry.student.email,
    "Full Name": entry.student.fullName,
    "Student Code": entry.student.studentCode ?? "",
    Class: entry.student.className ?? "",
    Phone: entry.student.phone ?? "",
    "Date of Birth": entry.student.dateOfBirth ?? "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Roster");
  XLSX.writeFile(workbook, `${fileNameBase}.xlsx`);
}
