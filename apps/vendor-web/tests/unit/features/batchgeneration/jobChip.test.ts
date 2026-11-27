import { describe, expect, it } from "vitest";
import { jobChipStatus } from "../../../../features/batchgeneration/utils/jobChip";

describe("jobChipStatus", () => {
  it("keeps the job being watched running until its replay is done, however early the server finished it", () => {
    expect(jobChipStatus("COMPLETED", true, false)).toBe("RUNNING");
    expect(jobChipStatus("FAILED", true, false)).toBe("RUNNING");
    expect(jobChipStatus("CANCELLED", true, false)).toBe("RUNNING");
  });

  it("shows what the server says once the replay is done", () => {
    expect(jobChipStatus("COMPLETED", true, true)).toBe("COMPLETED");
  });

  it("always shows what the server says for the other jobs", () => {
    expect(jobChipStatus("COMPLETED", false, false)).toBe("COMPLETED");
    expect(jobChipStatus("QUEUED", false, false)).toBe("QUEUED");
  });

  it("does not call a job running that the server has not finished or even started", () => {
    expect(jobChipStatus("PENDING", true, false)).toBe("PENDING");
    expect(jobChipStatus("QUEUED", true, false)).toBe("QUEUED");
    expect(jobChipStatus("RUNNING", true, false)).toBe("RUNNING");
  });
});
