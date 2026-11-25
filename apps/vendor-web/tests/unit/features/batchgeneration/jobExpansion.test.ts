import { describe, expect, it } from "vitest";
import type {
  QuestionGenerationBatchChildResponse,
  QuestionGenerationJobStatus,
} from "@pte/api-client";
import {
  focusedJobId,
  jobHasStarted,
  runningJobs,
} from "../../../../features/batchgeneration/utils/jobExpansion";

const job = (
  id: string,
  batchSeq: number,
  status: QuestionGenerationJobStatus,
): QuestionGenerationBatchChildResponse => ({
  jobPublicId: id,
  batchSeq,
  rowIndex: 0,
  taskType: "READ_ALOUD",
  topicHint: null,
  requestedCount: 1,
  status,
  succeededCount: 0,
  failedCount: 0,
  failureCode: null,
  startedAt: null,
  finishedAt: null,
});

describe("batch job focus", () => {
  const jobs = [
    job("a", 0, "COMPLETED"),
    job("c", 2, "RUNNING"),
    job("b", 1, "RUNNING"),
    job("d", 3, "PENDING"),
  ];

  it("lists the running jobs in run order, one per lane", () => {
    expect(runningJobs(jobs).map((entry) => entry.jobPublicId)).toEqual(["b", "c"]);
  });

  it("follows the first running job unless the person picked one", () => {
    expect(focusedJobId(jobs, null, null)).toBe("b");
    expect(focusedJobId(jobs, "d", null)).toBe("d");
    expect(focusedJobId(jobs, "gone", null)).toBe("b");
  });

  it("falls back to the current job, then the last finished one", () => {
    const idle = [job("a", 0, "COMPLETED"), job("b", 1, "FAILED"), job("c", 2, "PENDING")];
    expect(focusedJobId(idle, null, "c")).toBe("c");
    expect(focusedJobId(idle, null, null)).toBe("b");
    expect(focusedJobId([], null, null)).toBeNull();
  });

  it("has nothing to follow before a job started", () => {
    expect(jobHasStarted("PENDING")).toBe(false);
    expect(jobHasStarted("QUEUED")).toBe(false);
    expect(jobHasStarted("RUNNING")).toBe(true);
    expect(jobHasStarted("COMPLETED")).toBe(true);
  });
});
