import type { ApiClient } from "../../client/client";
import type {
  ReplaceScoreTemplateItemsRequest,
  ScoreTemplateResponse,
} from "../../types/scoretemplate";

/**
 * Matches `ScoreTemplateController`'s real `@RequestMapping("/score-templates")`
 * (pte-api, Phase 1) — no `/api/{service}` prefix. Several older request
 * modules in this package (`question`, `authoring/blueprints`,
 * `scoring/answers`) still carry a stale `/api/...` prefix left over from a
 * pre-monolith gateway that no longer exists; do not copy that pattern here.
 * Every endpoint is `PLATFORM_ADMIN`-only on the backend (FR-03) — hosts
 * never call these.
 */
export const SCORE_TEMPLATE_ENDPOINTS = {
  templates: "/score-templates",
  template: (publicId: string) => `/score-templates/${publicId}`,
  clone: (publicId: string) => `/score-templates/${publicId}/clone`,
  items: (publicId: string) => `/score-templates/${publicId}/items`,
  activate: (publicId: string) => `/score-templates/${publicId}/activate`,
} as const;

export function listScoreTemplates(client: ApiClient): Promise<ScoreTemplateResponse[]> {
  return client.request<ScoreTemplateResponse[]>(SCORE_TEMPLATE_ENDPOINTS.templates);
}

export function getScoreTemplate(client: ApiClient, publicId: string): Promise<ScoreTemplateResponse> {
  return client.request<ScoreTemplateResponse>(SCORE_TEMPLATE_ENDPOINTS.template(publicId));
}

export function cloneScoreTemplate(client: ApiClient, publicId: string): Promise<ScoreTemplateResponse> {
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

export function activateScoreTemplate(client: ApiClient, publicId: string): Promise<ScoreTemplateResponse> {
  return client.request<ScoreTemplateResponse>(SCORE_TEMPLATE_ENDPOINTS.activate(publicId), {
    method: "POST",
  });
}
