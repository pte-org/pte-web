import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import {
  listPlatformOrders,
  listPlatformSubscriptions,
  PLATFORM_COMMERCIAL_ENDPOINTS,
} from "./platformCommercial";

describe("platform commercial reporting request contract", () => {
  it("keeps platform order reporting separate from tenant order creation", async () => {
    const client = {
      request: vi.fn().mockResolvedValue({ data: [], meta: {} }),
    } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };

    await listPlatformOrders(client, 1, 25, "tenant/1");
    expect(client.request).toHaveBeenCalledWith(
      `${PLATFORM_COMMERCIAL_ENDPOINTS.orders}?page=1&size=25&tenantId=tenant%2F1`,
    );
  });

  it("uses the safe masked subscription projection endpoint", async () => {
    const client = {
      request: vi.fn().mockResolvedValue({ data: [], meta: {} }),
    } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };

    await listPlatformSubscriptions(client, 0, 10);
    expect(client.request).toHaveBeenCalledWith(
      `${PLATFORM_COMMERCIAL_ENDPOINTS.subscriptions}?page=0&size=10`,
    );
  });
});
