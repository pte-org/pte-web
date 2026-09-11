import * as XLSX from "xlsx";
import type { CreatedAccount } from "./types";

export function downloadCredentials(accounts: CreatedAccount[], fileName = "student-credentials.xlsx"): void {
  const sheet = XLSX.utils.json_to_sheet(
    accounts.map((account) => ({
      Email: account.email,
      "Full Name": account.fullName,
      Password: account.generatedPassword,
    })),
  );
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Credentials");
  XLSX.writeFile(workbook, fileName);
}
