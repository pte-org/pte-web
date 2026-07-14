import type { ApiClient } from "../../client/client";
import type {
  AssignExamRequest,
  AssignExamResponse,
  ExamResponse,
  RosterImportRequest,
  RosterImportResponse,
} from "../../types/host/import";

export const HOST_IMPORT_ENDPOINTS = {
  imports: "/api/v1/host/imports",
  byBatch: (batchId: number) => `/api/v1/host/imports/${batchId}`,
  assign: (batchId: number) => `/api/v1/host/imports/${batchId}/assign`,
  exams: (batchId: number) => `/api/v1/host/imports/${batchId}/exams`,
} as const;

export function provisionRosterImport(
  client: ApiClient,
  payload: RosterImportRequest,
): Promise<RosterImportResponse> {
  return client.request<RosterImportResponse>(HOST_IMPORT_ENDPOINTS.imports, {
    method: "POST",
    body: payload,
  });
}

export function getRosterImportReport(
  client: ApiClient,
  batchId: number,
): Promise<RosterImportResponse> {
  return client.request<RosterImportResponse>(
    HOST_IMPORT_ENDPOINTS.byBatch(batchId),
  );
}

export function listAssignableExams(
  client: ApiClient,
  batchId: number,
): Promise<ExamResponse[]> {
  return client.request<ExamResponse[]>(HOST_IMPORT_ENDPOINTS.exams(batchId));
}

export function assignExamToBatch(
  client: ApiClient,
  batchId: number,
  payload: AssignExamRequest,
): Promise<AssignExamResponse> {
  return client.request<AssignExamResponse>(HOST_IMPORT_ENDPOINTS.assign(batchId), {
    method: "POST",
    body: payload,
  });
}
