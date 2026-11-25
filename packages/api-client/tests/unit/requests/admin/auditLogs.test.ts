import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../../../src/client/client";
import {
  getPlatformAuditLog,
  listAuditLogs,
  listPlatformAuditActors,
  listPlatformAuditLogs,
} from "../../../../src/requests/admin/auditLogs";
import { listQuestionRevisions } from "../../../../src/requests/question";

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

  it("narrows the platform log to one actor and one audited item", async () => {
    const client = fakeClient();

    await listPlatformAuditLogs(client, "Question", 0, 50, "", undefined, undefined, {
      actorId: "actor-1",
      aggregateId: "question-1",
    });

    expect(client.request).toHaveBeenCalledWith(
      "/api/v1/platform/audit-logs?page=0&size=50&aggregateType=Question&actorId=actor-1&aggregateId=question-1",
    );
  });

  it("loads one platform entry with its snapshots and a question's revision chain", async () => {
    const client = fakeClient();

    await getPlatformAuditLog(client, "entry-1");
    await listQuestionRevisions(client, "question-1");

    expect(client.request).toHaveBeenNthCalledWith(1, "/api/v1/platform/audit-logs/entry-1");
    expect(client.request).toHaveBeenNthCalledWith(2, "/api/v1/questions/question-1/revisions");
  });

  it("requests the platform actor directory separately", async () => {
    const client = fakeClient();

    await listPlatformAuditActors(client);

    expect(client.request).toHaveBeenCalledWith("/api/v1/platform-users/directory");
  });
});
