import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../../../src/client/client";
import { getQuestionGenerationPresets, getQuestionGenerationQuota } from "../../../../src/requests/generation";

function clientReturning(value: unknown): { client: ApiClient; request: ReturnType<typeof vi.fn> } {
  const request = vi.fn().mockResolvedValue(value);
  const client: ApiClient = {
    request,
    upload: vi.fn(),
    download: vi.fn(),
    uploadDownload: vi.fn(),
    ensureFreshAccessToken: vi.fn(),
    openStream: vi.fn(),
  };
  return { client, request };
}

describe("generation presets and quota requests", () => {
  it("GETs the active template presets", async () => {
    const presets = [{ taskType: "READ_ALOUD", section: "SPEAKING", maxCount: 7 }];
    const { client, request } = clientReturning(presets);

    await expect(getQuestionGenerationPresets(client)).resolves.toEqual(presets);
    expect(request).toHaveBeenCalledWith("/api/v1/question-generation/presets");
  });

  it("passes the unlimited quota fields through", async () => {
    const quota = { usedToday: 70, dailyLimit: 0, remaining: null, unlimited: true, scope: null, maxItemsPerBatch: 500 };
    const { client } = clientReturning(quota);

    await expect(getQuestionGenerationQuota(client)).resolves.toEqual(quota);
  });
});
