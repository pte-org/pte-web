import { type ApiClient, type PagedResult } from "../client/client";
import type {
  QuestionGenerationBatchCreateRequest,
  QuestionGenerationBatchDraftDeleteRequest,
  QuestionGenerationBatchDraftDeleteResponse,
  QuestionGenerationBatchListParams,
  QuestionGenerationBatchResponse,
} from "../types/generation";

const BATCHES = "/api/v1/question-generation/batches";

export const QUESTION_GENERATION_BATCH_ENDPOINTS = {
  batches: BATCHES,
  batchById: (id: string) => `${BATCHES}/${encodeURIComponent(id)}`,
  batchCancel: (id: string) => `${BATCHES}/${encodeURIComponent(id)}/cancel`,
  batchDraftDelete: (id: string) => `${BATCHES}/${encodeURIComponent(id)}/drafts/delete`,
} as const;

export function createQuestionGenerationBatch(
  client: ApiClient,
  payload: QuestionGenerationBatchCreateRequest,
): Promise<QuestionGenerationBatchResponse> {
  return client.request<QuestionGenerationBatchResponse>(QUESTION_GENERATION_BATCH_ENDPOINTS.batches, {
    method: "POST",
    body: payload,
  });
}

export function getQuestionGenerationBatch(
  client: ApiClient,
  id: string,
): Promise<QuestionGenerationBatchResponse> {
  return client.request<QuestionGenerationBatchResponse>(QUESTION_GENERATION_BATCH_ENDPOINTS.batchById(id));
}

export function listQuestionGenerationBatches(
  client: ApiClient,
  { page = 0, size = 20, mine = false }: QuestionGenerationBatchListParams = {},
): Promise<PagedResult<QuestionGenerationBatchResponse>> {
  const params = new URLSearchParams({ page: String(page), size: String(size), mine: String(mine) });
  return client.request<PagedResult<QuestionGenerationBatchResponse>>(
    `${QUESTION_GENERATION_BATCH_ENDPOINTS.batches}?${params.toString()}`,
  );
}

/** Idempotent: a batch already stopping or stopped answers with its current state. */
export function cancelQuestionGenerationBatch(
  client: ApiClient,
  id: string,
): Promise<QuestionGenerationBatchResponse> {
  return client.request<QuestionGenerationBatchResponse>(QUESTION_GENERATION_BATCH_ENDPOINTS.batchCancel(id), {
    method: "POST",
  });
}

/** Soft-deletes the drafts of the batch (or the given ones); repeat while `remaining > 0`. */
export function deleteQuestionGenerationBatchDrafts(
  client: ApiClient,
  id: string,
  payload: QuestionGenerationBatchDraftDeleteRequest = {},
): Promise<QuestionGenerationBatchDraftDeleteResponse> {
  return client.request<QuestionGenerationBatchDraftDeleteResponse>(
    QUESTION_GENERATION_BATCH_ENDPOINTS.batchDraftDelete(id),
    { method: "POST", body: payload },
  );
}
