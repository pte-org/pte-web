import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import { CHAT_USAGE_ENDPOINT, getChatTopStudents, getChatUsage } from "./chatUsage";

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

describe("chat top students request", () => {
  it("asks for the students of the given dates", async () => {
    const client = fakeClient();

    await getChatTopStudents(client, "2026-10-01", "2026-10-31");

    expect(client.request).toHaveBeenCalledWith("/api/v1/admin/chat/usage/students?from=2026-10-01&to=2026-10-31");
  });

  it("passes the limit when one is given", async () => {
    const client = fakeClient();

    await getChatTopStudents(client, "2026-10-01", "2026-10-31", 10);

    expect(client.request).toHaveBeenCalledWith(
      "/api/v1/admin/chat/usage/students?from=2026-10-01&to=2026-10-31&limit=10",
    );
  });

  it("returns the students the server sent", async () => {
    const students = [{ studentId: "7d3b7c9e-0d3a-4f5e-9a6b-2c1d4e5f6a7b", messages: 42 }];

    await expect(getChatTopStudents(fakeClient(students), "2026-10-01", "2026-10-31")).resolves.toBe(students);
  });
});
