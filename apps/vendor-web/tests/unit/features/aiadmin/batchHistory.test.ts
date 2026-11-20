import { describe, expect, it, vi } from "vitest";
import type { QuestionGenerationBatchResponse } from "@pte/api-client";
import { listQuestionGenerationJobs } from "@pte/api-client";
import {
  batchProgress,
  filterBatches,
  hasOpenBatch,
  summarizeBatch,
} from "../../../../features/aiadmin/utils/batchHistory";

const row = (taskType: string, count: number) => ({ taskType, cefrLevel: "B1", count, topicHints: [], imageKind: null });

const batch = (overrides: Partial<QuestionGenerationBatchResponse> = {}): QuestionGenerationBatchResponse => ({
  publicId: "b1",
  pool: "PRACTICE",
  status: "COMPLETED",
  totalRequested: 10,
  succeededCount: 6,
  failedCount: 2,
  cancelledCount: 1,
  openCount: 1,
  cancelRequested: false,
  failureCode: null,
  currentJobPublicId: null,
  createdAt: "2026-11-10T08:00:00Z",
  startedAt: null,
  finishedAt: null,
  rows: [row("READ_ALOUD", 3), row("READ_ALOUD", 2), row("ESSAY", 5)],
  children: [],
  ...overrides,
});

const toDay = (date: Date): string => date.toISOString().slice(0, 10);

describe("batch history helpers", () => {
  it("counts distinct task types and total questions", () => {
    expect(summarizeBatch(batch())).toEqual({ types: 2, questions: 10 });
  });

  it("counts saved, failed and cancelled as done", () => {
    expect(batchProgress(batch())).toEqual({ done: 9, total: 10 });
  });

  it("detects open batches", () => {
    expect(hasOpenBatch([batch()])).toBe(false);
    expect(hasOpenBatch([batch(), batch({ status: "CANCELLING" })])).toBe(true);
  });

  it("filters by created day and status", () => {
    const list = [
      batch({ publicId: "in" }),
      batch({ publicId: "late", createdAt: "2026-11-20T08:00:00Z" }),
      batch({ publicId: "running", status: "RUNNING" }),
    ];
    const range = { from: "2026-11-01", to: "2026-11-15" };
    expect(filterBatches(list, range, "", toDay).map((b) => b.publicId)).toEqual(["in", "running"]);
    expect(filterBatches(list, range, "RUNNING", toDay).map((b) => b.publicId)).toEqual(["running"]);
  });
});

describe("recent jobs request", () => {
  it("asks for batch children", async () => {
    const request = vi.fn().mockResolvedValue({ data: [], meta: {} });
    // Only `request` is used by the call under test.
    await listQuestionGenerationJobs({ request } as unknown as Parameters<typeof listQuestionGenerationJobs>[0], 0, 100, true);
    expect(request.mock.calls[0][0]).toContain("includeBatchChildren=true");
  });
});
