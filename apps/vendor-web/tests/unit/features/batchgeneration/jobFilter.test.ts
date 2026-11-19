import { describe, expect, it } from "vitest";
import type { QuestionGenerationBatchChildResponse } from "@pte/api-client";
import { filterJobs, jobCancelledCount, nextJobFilter, type JobFilter } from "../../../../features/batchgeneration/utils/jobFilter";

// Only the fields the filter reads are filled in.
const job = (id: string, status: string, succeededCount: number, failedCount: number, requestedCount = 2) =>
  ({ jobPublicId: id, status, succeededCount, failedCount, requestedCount }) as unknown as QuestionGenerationBatchChildResponse;

const JOBS = [
  job("saved", "COMPLETED", 2, 0),
  job("failed", "COMPLETED", 1, 1),
  job("cancelled", "CANCELLED", 0, 0),
  job("running", "RUNNING", 0, 0),
  job("waiting", "PENDING", 0, 0),
];
const ids = (filter: JobFilter): string[] => filterJobs(JOBS, filter).map((entry) => entry.jobPublicId);

describe("filtering the jobs of a batch by a summary counter", () => {
  it("keeps every job for all", () => expect(ids("all")).toHaveLength(5));
  it("keeps jobs that saved something", () => expect(ids("saved")).toEqual(["saved", "failed"]));
  it("keeps jobs with a failed question", () => expect(ids("failed")).toEqual(["failed"]));
  it("keeps jobs with questions stopped by a cancel", () => expect(ids("cancelled")).toEqual(["cancelled"]));
  it("keeps jobs still waiting or running", () => expect(ids("open")).toEqual(["running", "waiting"]));

  it("counts as cancelled only what a cancelled job never wrote", () => {
    expect(jobCancelledCount(job("x", "CANCELLED", 1, 0, 3))).toBe(2);
    expect(jobCancelledCount(job("x", "COMPLETED", 1, 0, 3))).toBe(0);
  });

  it("clicking the active counter again shows every job", () => {
    expect(nextJobFilter("failed", "failed")).toBe("all");
    expect(nextJobFilter("all", "failed")).toBe("failed");
  });
});
