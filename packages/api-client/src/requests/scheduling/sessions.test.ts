import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import { patchExamPolicy, patchExamSchedule } from "./sessions";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return {
    request: vi.fn().mockResolvedValue({}),
    upload: vi.fn(),
    download: vi.fn(),
  } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };
}

describe("exam policy requests", () => {
  it("patches the scheduled exam policy on the session policy endpoint", async () => {
    const client = fakeClient();
    const payload = {
      replayPolicyType: "LIMITED" as const,
      replayPolicyLimit: 2,
      deviceCheckRequired: true,
      proctorRequired: false,
      answerIntegrityLevel: "STRICT" as const,
    };

    await patchExamPolicy(client, "session-1", payload);

    expect(client.request).toHaveBeenCalledWith("/api/v1/sessions/session-1/policy", {
      method: "PATCH",
      body: payload,
    });
  });
});

describe("exam schedule requests", () => {
  it("patches the schedule on the lifecycle schedule endpoint", async () => {
    const client = fakeClient();
    const payload = {
      name: "Writing mock",
      opensAt: "2026-10-13T12:00:00.000Z",
      closesAt: "2026-10-13T14:00:00.000Z",
      expectedVersion: 4,
    };

    await patchExamSchedule(client, "session-1", payload);

    expect(client.request).toHaveBeenCalledWith("/api/v1/sessions/session-1/schedule", {
      method: "PATCH",
      body: payload,
    });
  });
});
