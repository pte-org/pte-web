import { describe, expect, it, vi } from "vitest";
import { createApiClient } from "../../client/client";
import {
  issueLicenseCode,
  listAdminLicenseCodes,
  lookupLicenseCode,
  previewLicenseCodeRevoke,
  revealLicenseCode,
  revokeLicenseCode,
} from "./licenseCodes";

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

describe("license revoke scope", () => {
  it("uses the public id preview and confirm endpoints", async () => {
    const fetchFn = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({
        success: true,
        data: { publicId: "code-id", planId: "plan-id", effectiveState: "REDEEMED",
          impactCategory: "EXAM_SUBSCRIPTION", subscriptionPublicId: "sub-id",
          subscriptionStatus: "ACTIVE", tenantPublicId: "tenant-id",
          scheduledCount: 1, openCount: 0, closedCount: 0, scheduledSessionPublicIds: ["session-id"],
          previewExpiresAt: "2030-01-01T00:05:00Z", scopeDigest: "digest" },
      }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        success: true,
        data: { publicId: "code-id", status: "REVOKED", impactCategory: "EXAM_SUBSCRIPTION",
          subscriptionPublicId: "sub-id", subscriptionStatus: "CANCELLED",
          subscriptionCancelled: true, scheduledCancelledCount: 1,
          openPreservedCount: 0, closedPreservedCount: 0, cancelledSessionPublicIds: ["session-id"] },
      }), { status: 200 }));
    const client = createApiClient({ baseUrl: "https://test.invalid", fetchFn });
    const preview = await previewLicenseCodeRevoke(client, "code-id");
    await revokeLicenseCode(client, "code-id", {
      reason: "fraud review", scopeDigest: preview.scopeDigest,
      previewExpiresAt: preview.previewExpiresAt, expectedEffectiveState: preview.effectiveState,
      expectedPlanId: preview.planId, expectedSubscriptionPublicId: preview.subscriptionPublicId,
      expectedSubscriptionStatus: preview.subscriptionStatus, cancelSubscription: true,
      cancelScheduledScope: true, preserveOpenClosed: true,
    });
    expect(fetchFn.mock.calls[0][0]).toBe("https://test.invalid/api/v1/admin/license-codes/code-id/revoke-preview");
    expect(fetchFn.mock.calls[1][0]).toBe("https://test.invalid/api/v1/admin/license-codes/code-id/revoke");
    expect(fetchFn.mock.calls[1][1].body).toContain("fraud review");
  });
});

describe("bounded admin license reads", () => {
  it("keeps page filters in metadata and secret reads direct/non-cacheable", async () => {
    const fetchFn = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: {
        data: [{ publicId: "row-id", maskedCode: "•••• STUV", effectiveStatus: "ISSUED" }],
        meta: { page: 1, size: 25, totalElements: 26, totalPages: 2, first: false, last: true,
          hasNext: false, hasPrevious: true },
      } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: {
        publicId: "row-id", maskedCode: "•••• STUV", effectiveStatus: "ISSUED",
      } }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: { code: "SYNTHETIC-CODE" } }), { status: 200 }));
    const client = createApiClient({ baseUrl: "https://test.invalid", fetchFn });

    await expect(listAdminLicenseCodes(client, {
      page: 1, size: 25, status: "ISSUED", planId: "plan-id", tenantId: "tenant-id",
    })).resolves.toMatchObject({ meta: { page: 1, totalElements: 26 } });
    await expect(lookupLicenseCode(client, "SYNTHETIC-CODE")).resolves.toMatchObject({ maskedCode: "•••• STUV" });
    await expect(revealLicenseCode(client, "row-id")).resolves.toEqual({ code: "SYNTHETIC-CODE" });

    expect(fetchFn.mock.calls[0][0]).toContain("/api/v1/admin/license-codes?page=1&size=25&status=ISSUED");
    expect(fetchFn.mock.calls[0][0]).toContain("planId=plan-id");
    expect(fetchFn.mock.calls[0][0]).toContain("tenantId=tenant-id");
    expect(fetchFn.mock.calls[1][1].body).toBe(JSON.stringify({ code: "SYNTHETIC-CODE" }));
    expect(fetchFn.mock.calls[1][1].cache).toBe("no-store");
    expect(fetchFn.mock.calls[2][1].cache).toBe("no-store");
    expect(new Headers(fetchFn.mock.calls[2][1].headers).get("Cache-Control")).toBe("no-store");
  });
});
