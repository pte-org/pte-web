import { describe, expect, it } from "vitest";
import { isJobExpanded, jobHasStarted, toggleJob } from "../../../../features/batchgeneration/utils/jobExpansion";

describe("batch job rows", () => {
  it("opens the running job by default and keeps the others closed", () => {
    expect(isJobExpanded("job-2", {}, "job-2")).toBe(true);
    expect(isJobExpanded("job-1", {}, "job-2")).toBe(false);
    expect(isJobExpanded("job-1", {}, null)).toBe(false);
  });

  it("follows what the person chose over the default", () => {
    const closed = toggleJob("job-2", {}, "job-2");
    expect(isJobExpanded("job-2", closed, "job-2")).toBe(false);
    const opened = toggleJob("job-1", closed, "job-2");
    expect(isJobExpanded("job-1", opened, "job-2")).toBe(true);
    expect(isJobExpanded("job-1", toggleJob("job-1", opened, "job-2"), "job-2")).toBe(false);
  });

  it("has nothing to follow before a job started", () => {
    expect(jobHasStarted("PENDING")).toBe(false);
    expect(jobHasStarted("QUEUED")).toBe(false);
    expect(jobHasStarted("RUNNING")).toBe(true);
    expect(jobHasStarted("COMPLETED")).toBe(true);
  });
});
