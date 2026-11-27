import { describe, expect, it } from "vitest";
import type {
  QuestionGenerationBatchChildResponse,
  QuestionGenerationBatchResponse,
} from "@pte/api-client";
import { batchAsWatched } from "../../../../features/batchgeneration/utils/batchAsWatched";

const job = (id: string, seq: number, done: number): QuestionGenerationBatchChildResponse => ({
  jobPublicId: id,
  batchSeq: seq,
  rowIndex: 0,
  taskType: "DESCRIBE_IMAGE",
  topicHint: null,
  requestedCount: 1,
  status: "COMPLETED",
  succeededCount: done,
  failedCount: 0,
  failureCode: null,
  startedAt: null,
  finishedAt: null,
});

const BATCH: QuestionGenerationBatchResponse = {
  publicId: "b-1",
  pool: "PRACTICE",
  status: "COMPLETED",
  totalRequested: 2,
  succeededCount: 2,
  failedCount: 0,
  cancelledCount: 0,
  openCount: 0,
  cancelRequested: false,
  failureCode: null,
  currentJobPublicId: null,
  createdAt: "2026-11-27T10:00:00Z",
  startedAt: "2026-11-27T10:00:05Z",
  finishedAt: "2026-11-27T10:05:00Z",
  rows: [
    { taskType: "DESCRIBE_IMAGE", cefrLevel: "B1", count: 2, topicHints: [], imageKind: "AUTO" },
  ],
  children: [job("job-1", 0, 1), job("job-2", 1, 1)],
};

describe("batchAsWatched", () => {
  it("keeps the batch running while the replay of the watched job still plays", () => {
    const shown = batchAsWatched(BATCH, "job-2", false);

    expect(shown.status).toBe("RUNNING");
    expect(shown.succeededCount).toBe(1);
    expect(shown.openCount).toBe(1);
    expect(shown.children[1]?.status).toBe("RUNNING");
    expect(shown.children[0]?.status).toBe("COMPLETED");
  });

  it("shows what the server says once the replay is done", () => {
    expect(batchAsWatched(BATCH, "job-2", true)).toBe(BATCH);
  });

  it("shows what the server says while nothing is watched or the watched job still runs", () => {
    const running = {
      ...BATCH,
      status: "RUNNING" as const,
      children: [job("job-1", 0, 1), { ...job("job-2", 1, 0), status: "RUNNING" as const }],
    };

    expect(batchAsWatched(BATCH, null, false)).toBe(BATCH);
    expect(batchAsWatched(running, "job-2", false)).toBe(running);
  });
});
