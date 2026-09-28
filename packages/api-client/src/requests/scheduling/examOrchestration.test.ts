import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import { resolveExamLockdownMode } from "../../types/scheduling";
import { createExamDraft, patchExamDraft } from "./examOrchestration";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn().mockResolvedValue({}),
    upload: vi.fn(),
    download: vi.fn(),
  } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

const baseCreatePayload = {
  name: "Practice security policy test",
  templatePublicId: "template-1",
  subscriptionPublicId: "subscription-1",
  opensAt: "2026-10-01T10:00:00Z",
  closesAt: "2026-10-01T11:00:00Z",
  examMode: "PRACTICE" as const,
  formMode: "SHARED_FORM" as const,
  reusePolicy: "ALLOW" as const,
  seriesKey: null,
  capacity: 1,
  selectedSkills: ["SPEAKING"],
  maxRetriesPerStudent: 0,
};

describe("exam orchestration lockdown policy payloads", () => {
  it.each([
    ["PRACTICE", false, "NONE"],
    ["PRACTICE", true, "STANDARD"],
    ["OFFICIAL_EXAM", false, "STRICT"],
    ["OFFICIAL_EXAM", true, "STRICT"],
  ] as const)("maps %s/%s to %s", (examMode, enabled, expected) => {
    expect(resolveExamLockdownMode(examMode, enabled)).toBe(expected);
  });

  it.each(["NONE", "STANDARD", "STRICT"] as const)(
    "serializes lockdownMode=%s on draft create",
    async (lockdownMode) => {
      const client = fakeClient();

      await createExamDraft(client, { ...baseCreatePayload, lockdownMode });

      expect(client.request).toHaveBeenCalledWith("/api/v1/sessions/drafts", {
        method: "POST",
        body: { ...baseCreatePayload, lockdownMode },
      });
    },
  );

  it("serializes the policy on draft patch without changing the endpoint contract", async () => {
    const client = fakeClient();
    const payload = { expectedVersion: 3, lockdownMode: "STANDARD" as const };

    await patchExamDraft(client, "session-1", payload);

    expect(client.request).toHaveBeenCalledWith("/api/v1/sessions/session-1", {
      method: "PATCH",
      body: payload,
    });
  });
});
