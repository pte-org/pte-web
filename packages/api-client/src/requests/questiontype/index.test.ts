import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import {
  QUESTION_TYPE_ENDPOINTS,
  TASK_TYPE_ENDPOINTS,
  createQuestionType,
  createTaskType,
  listQuestionTypes,
  listTaskTypes,
} from "./index";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn().mockResolvedValue([]),
    upload: vi.fn(),
    download: vi.fn(),
  } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

describe("task-type catalog compatibility adapters", () => {
  it("keeps the new endpoint alias on the existing question-types route", () => {
    expect(TASK_TYPE_ENDPOINTS).toBe(QUESTION_TYPE_ENDPOINTS);
    expect(TASK_TYPE_ENDPOINTS.types).toBe("/api/v1/question-types");
  });

  it("keeps old and new list callers on the same wire contract", async () => {
    const legacyClient = fakeClient();
    const taskClient = fakeClient();

    await listQuestionTypes(legacyClient, { activeOnly: true });
    await listTaskTypes(taskClient, { activeOnly: true });

    expect(legacyClient.request.mock.calls[0]?.[0]).toBe("/api/v1/question-types?activeOnly=true");
    expect(taskClient.request.mock.calls[0]?.[0]).toBe("/api/v1/question-types?activeOnly=true");
  });

  it("preserves the create payload while exposing the task-type name", async () => {
    const client = fakeClient();
    const payload = {
      code: "READ_ALOUD",
      displayName: "Read Aloud",
      shortName: "RA",
      section: "SPEAKING" as const,
      displayOrder: 1,
      active: true,
    };

    await createQuestionType(client, payload);
    await createTaskType(client, payload);

    expect(client.request).toHaveBeenNthCalledWith(1, QUESTION_TYPE_ENDPOINTS.types, {
      method: "POST",
      body: payload,
    });
    expect(client.request).toHaveBeenNthCalledWith(2, TASK_TYPE_ENDPOINTS.types, {
      method: "POST",
      body: payload,
    });
  });
});
