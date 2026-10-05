import { describe, expect, it, vi } from "vitest";
import type { ApiClient } from "../../client/client";
import { getApplication } from "./applications";

describe("tenant application detail request", () => {
  it("loads one application by public id", async () => {
    const client = {
      request: vi.fn().mockResolvedValue({ publicId: "application-id" }),
    } as unknown as ApiClient & { request: ReturnType<typeof vi.fn> };

    await expect(getApplication(client, "application-id")).resolves.toEqual({
      publicId: "application-id",
    });
    expect(client.request).toHaveBeenCalledWith("/api/v1/applications/application-id");
  });
});
