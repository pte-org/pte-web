import type { ApiClient } from "../../client/client";
import type {
  CreateScoreTemplateRequest,
  ReplaceScoreTemplateItemsRequest,
  ScoreTemplateResponse,
  RejectScoreTemplateRequest,
  ScoreTemplateFeasibilityResponse,
} from "../../types/scoretemplate";

/**
 * Matches `ExamDefinitionController`'s `@RequestMapping("/api/v1/exam-definitions")` —
 * pte-api's Nginx edge forwards `/api/v1/*` unchanged, so every request
 * module in this package must carry the controller's real full path.
 * Academic authoring endpoints are available to platform admin, academic
 * manager, and academic staff; review/activation endpoints remain restricted
 * to platform admin and academic manager. Hosts never call these.
 */
export const SCORE_TEMPLATE_ENDPOINTS = {
  templates: "/api/v1/exam-definitions",
  template: (publicId: string) => `/api/v1/exam-definitions/${publicId}`,
  clone: (publicId: string) => `/api/v1/exam-definitions/${publicId}/clone`,
  items: (publicId: string) => `/api/v1/exam-definitions/${publicId}/items`,
  active: "/api/v1/exam-definitions/active",
  feasibility: (publicId: string) => `/api/v1/exam-definitions/${publicId}/feasibility`,
  status: (publicId: string) => `/api/v1/exam-definitions/${publicId}/status`,
} as const;

export function listScoreTemplates(client: ApiClient): Promise<ScoreTemplateResponse[]> {
  return client.request<ScoreTemplateResponse[]>(SCORE_TEMPLATE_ENDPOINTS.templates);
}

export function createScoreTemplate(
  client: ApiClient,
  payload: CreateScoreTemplateRequest,
): Promise<ScoreTemplateResponse> {
  return client.request<ScoreTemplateResponse>(SCORE_TEMPLATE_ENDPOINTS.templates, {
    method: "POST",
    body: payload,
  });
}

export function getScoreTemplate(
  client: ApiClient,
  publicId: string,
): Promise<ScoreTemplateResponse> {
  return client.request<ScoreTemplateResponse>(SCORE_TEMPLATE_ENDPOINTS.template(publicId));
}

export function cloneScoreTemplate(
  client: ApiClient,
  publicId: string,
): Promise<ScoreTemplateResponse> {
  return client.request<ScoreTemplateResponse>(SCORE_TEMPLATE_ENDPOINTS.clone(publicId), {
    method: "POST",
  });
}

export function replaceScoreTemplateItems(
  client: ApiClient,
  publicId: string,
  payload: ReplaceScoreTemplateItemsRequest,
): Promise<ScoreTemplateResponse> {
  return client.request<ScoreTemplateResponse>(SCORE_TEMPLATE_ENDPOINTS.items(publicId), {
    method: "PUT",
    body: payload,
  });
}

export function deleteScoreTemplate(client: ApiClient, publicId: string): Promise<void> {
  return client.request<void>(SCORE_TEMPLATE_ENDPOINTS.template(publicId), {
    method: "DELETE",
  });
}

export function activateScoreTemplate(
  client: ApiClient,
  publicId: string,
): Promise<ScoreTemplateResponse> {
  return client.request<ScoreTemplateResponse>(SCORE_TEMPLATE_ENDPOINTS.status(publicId), {
    method: "PATCH", body: { action: "ACTIVATE" },
  });
}

export function getActiveScoreTemplate(client: ApiClient): Promise<ScoreTemplateResponse> {
  return client.request<ScoreTemplateResponse>(SCORE_TEMPLATE_ENDPOINTS.active);
}

export function submitScoreTemplateApproval(
  client: ApiClient,
  publicId: string,
): Promise<ScoreTemplateResponse> {
  return client.request<ScoreTemplateResponse>(SCORE_TEMPLATE_ENDPOINTS.status(publicId), {
    method: "PATCH", body: { action: "SUBMIT_APPROVAL" },
  });
}

export function approveScoreTemplate(
  client: ApiClient,
  publicId: string,
): Promise<ScoreTemplateResponse> {
  return client.request<ScoreTemplateResponse>(SCORE_TEMPLATE_ENDPOINTS.status(publicId), {
    method: "PATCH", body: { action: "APPROVE" },
  });
}

export function rejectScoreTemplate(
  client: ApiClient,
  publicId: string,
  payload: RejectScoreTemplateRequest,
): Promise<ScoreTemplateResponse> {
  return client.request<ScoreTemplateResponse>(SCORE_TEMPLATE_ENDPOINTS.status(publicId), {
    method: "PATCH", body: { action: "REJECT", ...payload },
  });
}

export function getScoreTemplateFeasibility(
  client: ApiClient,
  publicId: string,
): Promise<ScoreTemplateFeasibilityResponse> {
  return client.request<ScoreTemplateFeasibilityResponse>(
    SCORE_TEMPLATE_ENDPOINTS.feasibility(publicId),
  );
}
