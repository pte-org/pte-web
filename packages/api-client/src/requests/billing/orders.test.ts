import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import { listOrders } from "./orders";

function fakeClient(): ApiClient & { request: ReturnType<typeof vi.fn> } {
  return { request: vi.fn().mockResolvedValue({}), upload: vi.fn(), download: vi.fn() } as never;
}

describe("order requests", () => {
  it("encodes the optional server-side search parameter", async () => {
    const client = fakeClient();

    await listOrders(client, 1, 20, "  paid & plan ");

    expect(client.request).toHaveBeenCalledWith(
      "/api/v1/orders?page=1&size=20&search=paid+%26+plan",
    );
  });

  it("encodes server-side status and date filters", async () => {
    const client = fakeClient();

    await listOrders(client, 0, 20, "Free Exam Package", {
      status: "PAID",
      createdFrom: "2026-10-01",
      createdTo: "2026-10-14",
    });

    expect(client.request).toHaveBeenCalledWith(
      "/api/v1/orders?page=0&size=20&search=Free+Exam+Package&status=PAID&createdFrom=2026-10-01&createdTo=2026-10-14",
    );
  });
});
