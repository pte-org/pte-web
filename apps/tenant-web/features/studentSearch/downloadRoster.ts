import type { DownloadResponse } from "@pte/api-client";

const DEFAULT_ROSTER_FILENAME = "students_credentials.xlsx";

export function downloadRoster(response: DownloadResponse): void {
  const url = URL.createObjectURL(response.blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = response.filename ?? DEFAULT_ROSTER_FILENAME;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
