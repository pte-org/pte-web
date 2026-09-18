import type { ApiClient, DownloadResponse } from "../../client/client";

export const STUDENT_ROSTER_IMPORT_ENDPOINTS = {
  import: "/api/v1/students/import",
} as const;

export function importStudentRoster(client: ApiClient, file: File): Promise<DownloadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return client.uploadDownload(STUDENT_ROSTER_IMPORT_ENDPOINTS.import, formData);
}
