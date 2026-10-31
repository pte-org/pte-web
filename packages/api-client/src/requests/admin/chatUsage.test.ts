import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import { CHAT_USAGE_ENDPOINT, getChatUsage } from "./chatUsage";

function fakeClient(result: unknown = []): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return { request: vi.fn().mockResolvedValue(result), upload: vi.fn(), download: vi.fn() } as never;
}

describe("chat usage request", () => {
  it("asks for the report of the given dates", async () => {
    const client = fakeClient();

    await getChatUsage(client, "2026-10-01", "2026-10-31");

    expect(client.request).toHaveBeenCalledWith("/api/v1/admin/chat/usage?from=2026-10-01&to=2026-10-31");
  });

  it("uses the platform admin endpoint of the chat API", () => {
    expect(CHAT_USAGE_ENDPOINT).toBe("/api/v1/admin/chat/usage");
  });

  it("returns the days the server sent", async () => {
    const days = [{ date: "2026-10-29", messages: 3 }];

    await expect(getChatUsage(fakeClient(days), "2026-10-29", "2026-10-29")).resolves.toBe(days);
  });
});
