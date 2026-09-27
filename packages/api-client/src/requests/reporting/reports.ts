import type { ApiClient } from "../../client/client";
import type {
  ReportPublicationReadinessResponse,
  ReportPublicationSummaryResponse,
  ReportResponse,
} from "../../types/reporting";

export const REPORT_ENDPOINTS = {
  mine: "/api/v1/reports",
  attempt: (attemptPublicId: string) => `/api/v1/reports/attempts/${attemptPublicId}`,
  publicationPreflight: (sessionPublicId: string) =>
    `/api/v1/reporting/sessions/${sessionPublicId}/preflight`,
  publicationSummary: (sessionPublicId: string) =>
    `/api/v1/reporting/sessions/${sessionPublicId}/publication`,
  publishSession: (sessionPublicId: string) =>
    `/api/v1/reporting/sessions/${sessionPublicId}/publish`,
} as const;

export function listMyReports(client: ApiClient): Promise<ReportResponse[]> {
  return client.request<ReportResponse[]>(REPORT_ENDPOINTS.mine);
}

export function getAttemptReport(
  client: ApiClient,
  attemptPublicId: string,
): Promise<ReportResponse> {
  return client.request<ReportResponse>(REPORT_ENDPOINTS.attempt(attemptPublicId));
}

export function preflightReportPublication(
  client: ApiClient,
  sessionPublicId: string,
): Promise<ReportPublicationReadinessResponse> {
  return client.request<ReportPublicationReadinessResponse>(
    REPORT_ENDPOINTS.publicationPreflight(sessionPublicId),
    {
      method: "POST",
    },
  );
}

export async function publishSessionReports(
  client: ApiClient,
  sessionPublicId: string,
): Promise<void> {
  await client.request<void>(REPORT_ENDPOINTS.publishSession(sessionPublicId), { method: "POST" });
}

export function getReportPublicationSummary(
  client: ApiClient,
  sessionPublicId: string,
): Promise<ReportPublicationSummaryResponse | null> {
  return client.request<ReportPublicationSummaryResponse | null>(
    REPORT_ENDPOINTS.publicationSummary(sessionPublicId),
  );
}
