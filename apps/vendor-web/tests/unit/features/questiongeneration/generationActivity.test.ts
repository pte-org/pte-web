import { describe, expect, it } from "vitest";
import type { QuestionGenerationBatchResponse, QuestionGenerationJobResponse } from "@pte/api-client";
import { pickGenerationActivity } from "../../../../features/questiongeneration/utils/generationActivity";

const hrefs = { job: (id: string) => `/job/${id}`, batch: (id: string) => `/batch/${id}` };
// Only the fields the indicator reads are filled in.
const job = (status: string) =>
  ({ publicId: "j1", status, succeededCount: 1, failedCount: 0, requestedCount: 3 }) as unknown as QuestionGenerationJobResponse;
const batch = (status: string) =>
  ({ publicId: "b1", status, succeededCount: 4, failedCount: 1, totalRequested: 7 }) as unknown as QuestionGenerationBatchResponse;

describe("header generation activity", () => {
  it("shows an open batch with its overall progress", () => {
    expect(pickGenerationActivity([job("RUNNING")], batch("RUNNING"), hrefs)).toEqual({ href: "/batch/b1", done: 5, total: 7 });
  });

  it("falls back to a running single job when no batch is open", () => {
    expect(pickGenerationActivity([job("COMPLETED"), job("RUNNING")], batch("COMPLETED"), hrefs)).toEqual({ href: "/job/j1", done: 1, total: 3 });
  });

  it("is hidden when nothing runs", () => {
    expect(pickGenerationActivity([job("COMPLETED")], null, hrefs)).toBeNull();
  });
});
