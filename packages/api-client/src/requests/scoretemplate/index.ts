import type { ApiClient } from "../../client/client";
import type {
  CreateScoreTemplateRequest,
  ReplaceScoreTemplateItemsRequest,
  ScoreTemplateResponse,
} from "../../types/scoretemplate";

/**
 * Matches `ScoreTemplateController`'s `@RequestMapping("/api/v1/score-templates")` —
 * pte-api's Nginx edge forwards `/api/v1/*` unchanged, so every request
 * module in this package must carry the controller's real full path.
 * Every endpoint is `PLATFORM_ADMIN`-only on the backend (FR-03) — hosts
 * never call these.
 */
export const SCORE_TEMPLATE_ENDPOINTS = {
  templates: "/api/v1/score-templates",
  template: (publicId: string) => `/api/v1/score-templates/${publicId}`,
  clone: (publicId: string) => `/api/v1/score-templates/${publicId}/clone`,
  items: (publicId: string) => `/api/v1/score-templates/${publicId}/items`,
  activate: (publicId: string) => `/api/v1/score-templates/${publicId}/activate`,
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
  return client.request<ScoreTemplateResponse>(SCORE_TEMPLATE_ENDPOINTS.activate(publicId), {
    method: "POST",
  });
}
