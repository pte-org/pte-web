import { describe, expect, it } from "vitest";
import type {
  QuestionGenerationBatchChildResponse,
  QuestionGenerationJobStatus,
} from "@pte/api-client";
import {
  focusedJobId,
  nextJobId,
  previousJobId,
  runningJobs,
  unseenJobIds,
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
});

describe("moving between jobs", () => {
  const jobs = [
    job("a", 0, "COMPLETED"),
    job("b", 1, "COMPLETED"),
    job("c", 2, "RUNNING"),
    job("d", 3, "QUEUED"),
  ];

  it("goes next to a finished job not viewed yet, then to a running one", () => {
    expect(nextJobId(jobs, "a", new Set(["a"]))).toBe("b");
    expect(nextJobId(jobs, "c", new Set(["c"]))).toBe("a");
    expect(nextJobId(jobs, "a", new Set(["a", "b"]))).toBe("c");
  });

  it("goes next in run order when every finished job was viewed and none runs", () => {
    const done = [job("a", 0, "COMPLETED"), job("b", 1, "FAILED")];
    expect(nextJobId(done, "a", new Set(["a", "b"]))).toBe("b");
    expect(nextJobId(done, "b", new Set(["a", "b"]))).toBeNull();
  });

  it("goes back in run order and stops at the first job", () => {
    expect(previousJobId(jobs, "c")).toBe("b");
    expect(previousJobId(jobs, "a")).toBeNull();
  });

  it("lists finished jobs not viewed yet", () => {
    expect([...unseenJobIds(jobs, new Set(["a"]))]).toEqual(["b"]);
  });
});
