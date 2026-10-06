import { describe, expect, it, vi } from "vitest";
import { createApiClient } from "../../client/client";
import { issueLicenseCode } from "./licenseCodes";

describe("license issue intent", () => {
  it("reuses the supplied key and returns only the safe receipt", async () => {
    const receipt = { publicId: "result-id", planId: "plan-id", status: "ISSUED", persistedStatus: "ISSUED", replayed: true };
    const fetchFn = vi.fn().mockImplementation(() => Promise.resolve(new Response(
      JSON.stringify({ success: true, data: receipt }), { status: 200 },
    )));
    const client = createApiClient({ baseUrl: "https://test.invalid", fetchFn });
    const payload = { planId: "plan-id", codeExpiresAt: null };
    for (let attempt = 0; attempt < 2; attempt++) {
      await expect(issueLicenseCode(client, payload, "same-key")).resolves.toEqual(receipt);
    }
    for (const [url, options] of fetchFn.mock.calls) {
      expect(url).toBe("https://test.invalid/api/v1/admin/license-codes");
      expect(new Headers(options.headers).get("Idempotency-Key")).toBe("same-key");
      expect(options.body).toBe(JSON.stringify(payload));
    }
    expect(receipt).not.toHaveProperty("code");
  });
});
