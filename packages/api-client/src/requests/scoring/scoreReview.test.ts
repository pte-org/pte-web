import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import {
  SCORE_REVIEW_ENDPOINTS,
  applyScoreSourceSelection,
  getHostScoreReview,
  getScoreSourceSelectionAudits,
  previewScoreSourceSelection,
} from "./scoreReview";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn().mockResolvedValue({}),
    upload: vi.fn(),
    download: vi.fn(),
  } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

describe("Host score review requests", () => {
  it("uses the session-scoped review and selection endpoints", async () => {
    const client = fakeClient();
    const sessionId = "session-id";
    const request = {
      scope: "ALL" as const,
      scopeValue: null,
      selectedSource: "AI" as const,
      expectedReviewVersion: "version",
      requestPublicId: "request-id",
    };

    await getHostScoreReview(client, sessionId);
    await previewScoreSourceSelection(client, sessionId, request);
    await applyScoreSourceSelection(client, sessionId, request);
    await getScoreSourceSelectionAudits(client, sessionId);

    expect(client.request).toHaveBeenNthCalledWith(1, SCORE_REVIEW_ENDPOINTS.review(sessionId));
    expect(client.request).toHaveBeenNthCalledWith(2, SCORE_REVIEW_ENDPOINTS.preview(sessionId), {
      method: "POST",
      body: request,
    });
    expect(client.request).toHaveBeenNthCalledWith(3, SCORE_REVIEW_ENDPOINTS.apply(sessionId), {
      method: "POST",
      body: request,
    });
    expect(client.request).toHaveBeenNthCalledWith(4, SCORE_REVIEW_ENDPOINTS.audits(sessionId));
  });
});
