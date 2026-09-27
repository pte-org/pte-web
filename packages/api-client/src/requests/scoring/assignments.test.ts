import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import {
  confirmExaminerAssignmentPreview,
  createExaminerAssignmentPreview,
  EXAMINER_ASSIGNMENT_ENDPOINTS,
  getExaminerAssignmentOverview,
} from "./assignments";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn().mockResolvedValue({}),
    upload: vi.fn(),
    download: vi.fn(),
  } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

describe("examiner assignment requests", () => {
  it("uses session-scoped paths for overview, durable preview and confirmation", async () => {
    const client = fakeClient();
    const sessionId = "session-public-id";
    const batchId = "batch-public-id";
    const payload = {
      mode: "RANDOM" as const,
      scopes: [{ type: "CLASS" as const, scopePublicId: "class-id", examinerPublicId: null }],
      examinerPublicIds: ["examiner-a", "examiner-b"],
    };

    await getExaminerAssignmentOverview(client, sessionId, 2, 25);
    await createExaminerAssignmentPreview(client, sessionId, payload);
    await confirmExaminerAssignmentPreview(client, sessionId, batchId);

    expect(client.request).toHaveBeenNthCalledWith(
      1,
      EXAMINER_ASSIGNMENT_ENDPOINTS.overview(sessionId, 2, 25),
    );
    expect(client.request).toHaveBeenNthCalledWith(
      2,
      EXAMINER_ASSIGNMENT_ENDPOINTS.previews(sessionId),
      {
        method: "POST",
        body: payload,
      },
    );
    expect(client.request).toHaveBeenNthCalledWith(
      3,
      EXAMINER_ASSIGNMENT_ENDPOINTS.confirm(sessionId, batchId),
      {
        method: "POST",
      },
    );
  });
});
