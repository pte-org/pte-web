import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../../../src/client/client";
import {
  commitExaminerAssignment,
  EXAMINER_ASSIGNMENT_ENDPOINTS,
  getExaminerAssignmentRoster,
} from "../../../../src/requests/scoring/assignments";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn().mockResolvedValue({}),
    upload: vi.fn(),
    download: vi.fn(),
  } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

describe("examiner assignment requests", () => {
  it("reads the roster and commits the edited table on session-scoped paths", async () => {
    const client = fakeClient();
    const sessionId = "session-public-id";
    const payload = {
      entries: [{ attemptPublicId: "attempt-a", examinerPublicId: "examiner-a" }],
    };

    await getExaminerAssignmentRoster(client, sessionId);
    await commitExaminerAssignment(client, sessionId, payload);

    expect(client.request).toHaveBeenNthCalledWith(
      1,
      EXAMINER_ASSIGNMENT_ENDPOINTS.roster(sessionId),
    );
    expect(client.request).toHaveBeenNthCalledWith(
      2,
      EXAMINER_ASSIGNMENT_ENDPOINTS.commit(sessionId),
      { method: "POST", body: payload },
    );
  });
});
