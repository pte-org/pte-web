import type { ApiClient } from "../client/client";
import type {
  AiStatusResponse,
  GenerationStatsResponse,
  PromptCatalogResponse,
  PromptCategory,
  PromptDocument,
  PromptStatusRequest,
  PromptTestResponse,
  PromptVersionResponse,
  PromptProposalRequest,
  PromptWorkspaceResponse,
} from "../types/ai";

export const AI_ADMIN_ENDPOINTS = {
  status: "/api/v1/ai/status",
  prompts: "/api/v1/ai/prompts",
  generationStats: "/api/v1/ai/question-generation/stats",
  promptWorkspace: (category: string, key: string) =>
    `/api/v1/ai/prompts/${encodeURIComponent(category)}/${encodeURIComponent(key)}/workspace`,
  promptProposal: (category: string, key: string) =>
    `/api/v1/ai/prompts/${encodeURIComponent(category)}/${encodeURIComponent(key)}/proposal`,
  promptVersion: (publicId: string) => `/api/v1/ai/prompt-versions/${encodeURIComponent(publicId)}`,
  promptVersionTest: (publicId: string) => `/api/v1/ai/prompt-versions/${encodeURIComponent(publicId)}/test`,
  promptVersionStatus: (publicId: string) => `/api/v1/ai/prompt-versions/${encodeURIComponent(publicId)}/status`,
} as const;

export function getAiStatus(client: ApiClient): Promise<AiStatusResponse> {
  return client.request<AiStatusResponse>(AI_ADMIN_ENDPOINTS.status);
}

export function getPromptCatalog(client: ApiClient): Promise<PromptCatalogResponse> {
  return client.request<PromptCatalogResponse>(AI_ADMIN_ENDPOINTS.prompts);
}

export function getPromptDocument(client: ApiClient, category: PromptCategory, key: string): Promise<PromptDocument> {
  return client.request<PromptDocument>(
    `${AI_ADMIN_ENDPOINTS.prompts}/${encodeURIComponent(category)}/${encodeURIComponent(key)}`,
  );
}

/** Figures for the jobs created from `range.from` to `range.to` (yyyy-MM-dd, both included), or the last 30 days. */
export function getGenerationStats(
  client: ApiClient,
  range?: { from: string; to: string },
): Promise<GenerationStatsResponse> {
  const query = range === undefined ? "" : `?from=${range.from}&to=${range.to}`;
  return client.request<GenerationStatsResponse>(`${AI_ADMIN_ENDPOINTS.generationStats}${query}`);
}

export function getPromptWorkspace(client: ApiClient, category: PromptCategory, key: string): Promise<PromptWorkspaceResponse> {
  return client.request<PromptWorkspaceResponse>(AI_ADMIN_ENDPOINTS.promptWorkspace(category, key));
}

export function savePromptProposal(
  client: ApiClient,
  category: PromptCategory,
  key: string,
  body: PromptProposalRequest,
): Promise<PromptVersionResponse> {
  return client.request<PromptVersionResponse>(AI_ADMIN_ENDPOINTS.promptProposal(category, key), { method: "PUT", body });
}

export function getPromptVersion(client: ApiClient, publicId: string): Promise<PromptVersionResponse> {
  return client.request<PromptVersionResponse>(AI_ADMIN_ENDPOINTS.promptVersion(publicId));
}

export function testPromptVersion(client: ApiClient, publicId: string): Promise<PromptTestResponse> {
  return client.request<PromptTestResponse>(AI_ADMIN_ENDPOINTS.promptVersionTest(publicId), { method: "POST" });
}

export function changePromptVersionStatus(
  client: ApiClient,
  publicId: string,
  body: PromptStatusRequest,
): Promise<PromptVersionResponse> {
  return client.request<PromptVersionResponse>(AI_ADMIN_ENDPOINTS.promptVersionStatus(publicId), { method: "PATCH", body });
}
