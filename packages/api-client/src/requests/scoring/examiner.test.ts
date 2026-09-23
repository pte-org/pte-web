import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import {
  EXAMINER_WORK_ENDPOINTS,
  getExaminerAttemptWork,
  listExaminerWork,
  submitExaminerScore,
} from "./examiner";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn().mockResolvedValue({}),
    upload: vi.fn(),
    download: vi.fn(),
  } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

describe("examiner work requests", () => {
  it("builds queue, attempt detail, and score submission requests", async () => {
    const client = fakeClient();
    const sessionId = "session-id";
    const attemptId = "attempt-id";
    const answerId = "answer-id";
    const payload = { score: 82 };

    await listExaminerWork(client, {
      status: "IN_PROGRESS",
      sessionPublicId: sessionId,
      page: 1,
      size: 15,
    });
    await getExaminerAttemptWork(client, sessionId, attemptId);
    await submitExaminerScore(client, answerId, payload);

    expect(client.request).toHaveBeenNthCalledWith(
      1,
      `${EXAMINER_WORK_ENDPOINTS.queue}?status=IN_PROGRESS&sessionPublicId=${sessionId}&page=1&size=15`,
    );
    expect(client.request).toHaveBeenNthCalledWith(
      2,
      EXAMINER_WORK_ENDPOINTS.attempt(sessionId, attemptId),
    );
    expect(client.request).toHaveBeenNthCalledWith(3, EXAMINER_WORK_ENDPOINTS.score(answerId), {
      method: "POST",
      body: payload,
    });
  });

  it("uses defaults without requiring caller-provided pagination", async () => {
    const client = fakeClient();
    await listExaminerWork(client);

    expect(client.request).toHaveBeenCalledWith(EXAMINER_WORK_ENDPOINTS.queue);
  });
});
