import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import { listAuditLogs, listPlatformAuditActors, listPlatformAuditLogs } from "./auditLogs";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return { request: vi.fn().mockResolvedValue({}), upload: vi.fn(), download: vi.fn() } as never;
}

describe("audit log requests", () => {
  it("encodes the optional search parameter", async () => {
    const client = fakeClient();

    await listAuditLogs(
      client,
      "StudentClass",
      2,
      10,
      "  class & published ",
      "2026-10-13",
      "2026-10-14",
    );

    expect(client.request).toHaveBeenCalledWith(
      "/api/v1/audit-logs?page=2&size=10&aggregateType=StudentClass&search=class+%26+published&createdFrom=2026-10-13&createdTo=2026-10-14",
    );
  });

  it("requests platform audit logs with the same server-side filters", async () => {
    const client = fakeClient();

    await listPlatformAuditLogs(
      client,
      "Plan",
      1,
      25,
      "  plan & published ",
      "2026-10-13",
      "2026-10-14",
    );

    expect(client.request).toHaveBeenCalledWith(
      "/api/v1/platform/audit-logs?page=1&size=25&aggregateType=Plan&search=plan+%26+published&createdFrom=2026-10-13&createdTo=2026-10-14",
    );
  });

  it("requests the platform actor directory separately", async () => {
    const client = fakeClient();

    await listPlatformAuditActors(client);

    expect(client.request).toHaveBeenCalledWith("/api/v1/platform-users/directory");
  });
});
