import type { ApiClient } from "../../client/client";
import type {
  CreateHostExamTemplateRequest,
  ReplaceScoreTemplateItemsRequest,
  ScoreTemplateResponse,
  SkillWeightSuggestionRequest,
  SkillWeightSuggestionResponse,
} from "../../types/scoretemplate";

/**
 * Matches `HostExamTemplateController`'s `/api/v1/host/exam-templates`.
 * Every route resolves templates by the caller's tenant, so a host only ever
 * sees and edits its own templates.
 */
export const HOST_EXAM_TEMPLATE_ENDPOINTS = {
  templates: "/api/v1/host/exam-templates",
  template: (publicId: string) => `/api/v1/host/exam-templates/${publicId}`,
  clone: (publicId: string) => `/api/v1/host/exam-templates/${publicId}/clone`,
  items: (publicId: string) => `/api/v1/host/exam-templates/${publicId}/items`,
  activate: (publicId: string) => `/api/v1/host/exam-templates/${publicId}/activate`,
  retire: (publicId: string) => `/api/v1/host/exam-templates/${publicId}/retire`,
  suggestions: "/api/v1/host/exam-templates/skill-weight-suggestions",
} as const;

export function listHostExamTemplates(client: ApiClient): Promise<ScoreTemplateResponse[]> {
  return client.request<ScoreTemplateResponse[]>(HOST_EXAM_TEMPLATE_ENDPOINTS.templates);
}

export function getHostExamTemplate(
  client: ApiClient,
  publicId: string,
): Promise<ScoreTemplateResponse> {
  return client.request<ScoreTemplateResponse>(HOST_EXAM_TEMPLATE_ENDPOINTS.template(publicId));
}

export function createHostExamTemplate(
  client: ApiClient,
  payload: CreateHostExamTemplateRequest,
): Promise<ScoreTemplateResponse> {
  return client.request<ScoreTemplateResponse>(HOST_EXAM_TEMPLATE_ENDPOINTS.templates, {
    method: "POST",
    body: payload,
  });
}

export function cloneHostExamTemplate(
  client: ApiClient,
  publicId: string,
): Promise<ScoreTemplateResponse> {
  return client.request<ScoreTemplateResponse>(HOST_EXAM_TEMPLATE_ENDPOINTS.clone(publicId), {
    method: "POST",
  });
}

export function replaceHostExamTemplateItems(
  client: ApiClient,
  publicId: string,
  payload: ReplaceScoreTemplateItemsRequest,
): Promise<ScoreTemplateResponse> {
  return client.request<ScoreTemplateResponse>(HOST_EXAM_TEMPLATE_ENDPOINTS.items(publicId), {
    method: "PUT",
    body: payload,
  });
}

export function activateHostExamTemplate(
  client: ApiClient,
  publicId: string,
): Promise<ScoreTemplateResponse> {
  return client.request<ScoreTemplateResponse>(HOST_EXAM_TEMPLATE_ENDPOINTS.activate(publicId), {
    method: "POST",
  });
}

export function retireHostExamTemplate(
  client: ApiClient,
  publicId: string,
): Promise<ScoreTemplateResponse> {
  return client.request<ScoreTemplateResponse>(HOST_EXAM_TEMPLATE_ENDPOINTS.retire(publicId), {
    method: "POST",
  });
}

export function deleteHostExamTemplate(client: ApiClient, publicId: string): Promise<void> {
  return client.request<void>(HOST_EXAM_TEMPLATE_ENDPOINTS.template(publicId), {
    method: "DELETE",
  });
}

export function suggestHostSkillWeights(
  client: ApiClient,
  payload: SkillWeightSuggestionRequest,
): Promise<SkillWeightSuggestionResponse> {
  return client.request<SkillWeightSuggestionResponse>(HOST_EXAM_TEMPLATE_ENDPOINTS.suggestions, {
    method: "POST",
    body: payload,
  });
}
