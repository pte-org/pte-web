import { describe, expect, it } from "vitest";
import { buildExaminerQueueHref, parseExaminerQueueStatus } from "./constants";
import { EXAMINER_QUERY_KEYS } from "./queryKeys";

describe("Examiner queue parameters and status resolution", () => {
  it("resolves valid status query parameters", () => {
    expect(parseExaminerQueueStatus("PENDING")).toBe("PENDING");
    expect(parseExaminerQueueStatus("IN_PROGRESS")).toBe("IN_PROGRESS");
    expect(parseExaminerQueueStatus("COMPLETED")).toBe("COMPLETED");
    expect(parseExaminerQueueStatus("ALL")).toBe("ALL");
  });

  it("falls back to ALL for invalid, empty, or missing status", () => {
    expect(parseExaminerQueueStatus(null)).toBe("ALL");
    expect(parseExaminerQueueStatus(undefined)).toBe("ALL");
    expect(parseExaminerQueueStatus("")).toBe("ALL");
    expect(parseExaminerQueueStatus("UNKNOWN_STATUS")).toBe("ALL");
    expect(parseExaminerQueueStatus("in_progress")).toBe("ALL");
  });

  it("builds unique and consistent query keys for queue caching", () => {
    const tenantId = "tenant-1";
    const actorId = "examiner-1";
    const key1 = EXAMINER_QUERY_KEYS.queue(tenantId, actorId, {
      status: "IN_PROGRESS",
      page: 0,
      size: 20,
      sort: "ASSIGNED_ASC",
    });
    const key2 = EXAMINER_QUERY_KEYS.queue(tenantId, actorId, {
      status: "IN_PROGRESS",
      page: 0,
      size: 20,
      sort: "ASSIGNED_ASC",
    });
    const key3 = EXAMINER_QUERY_KEYS.queue(tenantId, actorId, {
      status: "COMPLETED",
      page: 0,
      size: 20,
      sort: "ASSIGNED_ASC",
    });

    expect(key1).toEqual(key2);
    expect(key1).not.toEqual(key3);
  });

  it("keeps the status in the queue URL for every filter combination", () => {
    expect(buildExaminerQueueHref("ALL", 0, "", "ASSIGNED_ASC")).toBe("/examiner/work?status=ALL");
    expect(buildExaminerQueueHref("PENDING", 0, "", "ASSIGNED_ASC")).toBe("/examiner/work?status=PENDING");
    expect(buildExaminerQueueHref("ALL", 2, " abc ", "ASSIGNED_DESC")).toBe(
      "/examiner/work?status=ALL&page=2&search=abc&sort=ASSIGNED_DESC",
    );
    for (const status of ["ALL", "PENDING", "IN_PROGRESS", "COMPLETED"] as const) {
      const href = buildExaminerQueueHref(status, 1, "x", "ASSIGNED_DESC");
      expect(new URL(href, "http://localhost").searchParams.get("status")).toBe(status);
    }
  });
});
