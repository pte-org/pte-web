import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../../../src/client/client";
import { SCORING_ANSWER_ENDPOINTS, listAnswers, listAttemptReviews } from "../../../../src/requests/scoring/answers";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn().mockResolvedValue({}),
    upload: vi.fn(),
    download: vi.fn(),
  } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

describe("Answer review requests", () => {
  it("narrows the answer list to one attempt", async () => {
    const client = fakeClient();

    await listAnswers(client, { sessionPublicId: "s1", attemptPublicId: "a1" });

    expect(client.request).toHaveBeenCalledWith(
      `${SCORING_ANSWER_ENDPOINTS.answers}?sessionPublicId=s1&attemptPublicId=a1`,
    );
  });

  it("encodes the optional server-side search parameter", async () => {
    const client = fakeClient();

    await listAnswers(client, {
      sessionPublicId: "session-id",
      page: 0,
      size: 20,
      search: "  describe & summarize ",
    });

    expect(client.request).toHaveBeenCalledWith(
      "/api/v1/answers?sessionPublicId=session-id&search=describe+%26+summarize&page=0&size=20",
    );
  });

  it("lists one review row per attempt of a session", async () => {
    const client = fakeClient();

    await listAttemptReviews(client, "s1");

    expect(client.request).toHaveBeenCalledWith("/api/v1/scoring/sessions/s1/attempts");
  });
});
