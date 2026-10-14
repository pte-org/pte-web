import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import { listAuditLogs } from "./auditLogs";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return { request: vi.fn().mockResolvedValue({}), upload: vi.fn(), download: vi.fn() } as never;
}

describe("audit log requests", () => {
  it("encodes the optional search parameter", async () => {
    const client = fakeClient();

    await listAuditLogs(client, "StudentClass", 2, 10, "  class & published ");

    expect(client.request).toHaveBeenCalledWith(
      "/api/v1/audit-logs?page=2&size=10&aggregateType=StudentClass&search=class+%26+published",
    );
  });
});
