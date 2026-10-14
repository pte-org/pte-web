import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import { createExamDraft, patchExamDraft } from "./examOrchestration";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn().mockResolvedValue({}),
    upload: vi.fn(),
    download: vi.fn(),
  } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

const baseCreatePayload = {
  name: "Official security policy test",
  templatePublicId: "template-1",
  subscriptionPublicId: "subscription-1",
  opensAt: "2026-10-01T10:00:00Z",
  closesAt: "2026-10-01T11:00:00Z",
  examMode: "OFFICIAL_EXAM" as const,
  lockdownMode: "STRICT" as const,
  formMode: "SHARED_FORM" as const,
  reusePolicy: "ALLOW" as const,
  seriesKey: null,
  capacity: 1,
  maxRetriesPerStudent: 2,
};

describe("exam orchestration draft payloads", () => {
  it("serializes the official strict policy and retries on draft create", async () => {
    const client = fakeClient();

    await createExamDraft(client, baseCreatePayload);

    expect(client.request).toHaveBeenCalledWith("/api/v1/sessions/drafts", {
      method: "POST",
      body: baseCreatePayload,
    });
    const [, init] = client.request.mock.calls[0];
    expect(init.body).not.toHaveProperty("selectedSkills");
  });

  it("serializes the policy on draft patch without changing the endpoint contract", async () => {
    const client = fakeClient();
    const payload = { expectedVersion: 3, lockdownMode: "STRICT" as const, maxRetriesPerStudent: 1 };

    await patchExamDraft(client, "session-1", payload);

    expect(client.request).toHaveBeenCalledWith("/api/v1/sessions/session-1", {
      method: "PATCH",
      body: payload,
    });
  });
});
