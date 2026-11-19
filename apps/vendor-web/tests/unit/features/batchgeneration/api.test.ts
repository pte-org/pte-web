import { beforeEach, describe, expect, it, vi } from "vitest";
import type { QuestionGenerationBatchResponse } from "@pte/api-client";

type Options = Record<string, unknown> & {
  queryKey?: readonly unknown[];
  queryFn?: () => Promise<unknown>;
  mutationFn?: (input: unknown) => Promise<unknown>;
  onSuccess?: (data: unknown, input: unknown) => void;
};

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub" },
  queries: [] as Options[],
  mutations: [] as Options[],
  invalidated: [] as unknown[],
  setData: vi.fn(),
  cancelQuestionGenerationBatch: vi.fn(),
  listQuestionGenerationBatches: vi.fn(),
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock("@pte/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@pte/api-client")>()),
  cancelQuestionGenerationBatch: hoisted.cancelQuestionGenerationBatch,
  listQuestionGenerationBatches: hoisted.listQuestionGenerationBatches,
}));
vi.mock("@tanstack/react-query", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-query")>()),
  useQuery: (options: Options) => {
    hoisted.queries.push(options);
    return {};
  },
  useMutation: (options: Options) => {
    hoisted.mutations.push(options);
    return {};
  },
  useQueryClient: () => ({
    setQueryData: hoisted.setData,
    invalidateQueries: (filter: { queryKey: unknown }) => {
      hoisted.invalidated.push(filter.queryKey);
      return Promise.resolve();
    },
  }),
}));

import {
  batchDetailKey,
  batchPollInterval,
  useCancelQuestionGenerationBatch,
} from "../../../../features/batchgeneration/api";
import { BATCH_POLL_HIDDEN_MS, BATCH_POLL_VISIBLE_MS } from "../../../../features/batchgeneration/constants";
import { GENERATION_QUOTA_QUERY_KEY } from "../../../../features/questiongeneration/constants";

const batch = (status: QuestionGenerationBatchResponse["status"]): QuestionGenerationBatchResponse =>
  ({ publicId: "b-1", status }) as QuestionGenerationBatchResponse; // only the fields the poller reads

beforeEach(() => {
  hoisted.queries.length = 0;
  hoisted.mutations.length = 0;
  hoisted.invalidated.length = 0;
  hoisted.setData.mockReset();
});

describe("batch polling", () => {
  it("polls an open batch faster while the tab is visible and stops at a terminal status", () => {
    expect(batchPollInterval(undefined, false)).toBe(BATCH_POLL_VISIBLE_MS);
    expect(batchPollInterval(batch("RUNNING"), false)).toBe(BATCH_POLL_VISIBLE_MS);
    expect(batchPollInterval(batch("CANCELLING"), true)).toBe(BATCH_POLL_HIDDEN_MS);
    for (const status of ["COMPLETED", "PARTIALLY_COMPLETED", "FAILED", "CANCELLED"] as const) {
      expect(batchPollInterval(batch(status), false)).toBe(false);
    }
  });
});

describe("batch hooks", () => {
  it("stores the cancelled batch and refreshes batches and quota", () => {
    useCancelQuestionGenerationBatch();
    hoisted.mutations[0]?.onSuccess?.(batch("CANCELLING"), "b-1");
    expect(hoisted.setData).toHaveBeenCalledWith(batchDetailKey("b-1"), batch("CANCELLING"));
    expect(hoisted.invalidated).toContainEqual(["generationBatches"]);
    expect(hoisted.invalidated).toContainEqual([GENERATION_QUOTA_QUERY_KEY]);
  });

});
