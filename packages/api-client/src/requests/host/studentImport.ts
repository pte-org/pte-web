import type { ApiClient, DownloadResponse } from "../../client/client";
import type {
  ParseFileResponse,
  PrepareImportRequest,
  PreviewRequest,
  PreviewResponse,
} from "../../types/host/import";

export const HOST_STUDENT_IMPORT_ENDPOINTS = {
  parse: "/api/v1/host/students/import/parse",
  prepare: "/api/v1/host/students/import/prepare",
  preview: "/api/v1/host/students/import/preview",
  confirm: "/api/v1/host/students/import/confirm",
} as const;

export function parseStudentImport(
  client: ApiClient,
  file: File,
): Promise<ParseFileResponse> {
  const formData = new FormData();
  formData.append("file", file);
  return client.upload<ParseFileResponse>(
    HOST_STUDENT_IMPORT_ENDPOINTS.parse,
    formData,
  );
}

export function prepareStudentImport(
  client: ApiClient,
  payload: PrepareImportRequest,
): Promise<ParseFileResponse> {
  return client.request<ParseFileResponse>(
    HOST_STUDENT_IMPORT_ENDPOINTS.prepare,
    {
      method: "POST",
      body: payload,
    },
  );
}

export function previewStudentImport(
  client: ApiClient,
  payload: PreviewRequest,
): Promise<PreviewResponse> {
  return client.request<PreviewResponse>(HOST_STUDENT_IMPORT_ENDPOINTS.preview, {
    method: "POST",
    body: payload,
  });
}

export function confirmStudentImport(
  client: ApiClient,
  importId: string,
): Promise<DownloadResponse> {
  return client.download(HOST_STUDENT_IMPORT_ENDPOINTS.confirm, {
    method: "POST",
    body: { importId },
  });
}
