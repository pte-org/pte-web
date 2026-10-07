import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import {
  finalizeGradingCohort,
  getGradingCohortPreview,
  GRADING_COHORT_ENDPOINTS,
} from "./gradingCohort";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn().mockResolvedValue({}),
    upload: vi.fn(),
    uploadDownload: vi.fn(),
    download: vi.fn(),
  } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

describe("host grading cohort requests", () => {
  it("previews and finalizes only the selected session cohort", async () => {
    const client = fakeClient();
    const sessionId = "session-id";
    const payload = {
      expectedPreviewVersion: "preview-v1",
      markingMode: "MANUAL_EXAMINER" as const,
      outstandingDispositions: [{ attemptPublicId: "attempt-id", reason: "Absent" }],
    };

    await getGradingCohortPreview(client, sessionId);
    await finalizeGradingCohort(client, sessionId, payload);

    expect(client.request).toHaveBeenNthCalledWith(
      1,
      GRADING_COHORT_ENDPOINTS.preview(sessionId),
    );
    expect(client.request).toHaveBeenNthCalledWith(
      2,
      GRADING_COHORT_ENDPOINTS.finalize(sessionId),
      { method: "POST", body: payload },
    );
  });
});
