import { describe, expect, it } from "vitest";
import { failed, makeAdminDashboard, ok } from "../testing/fixtures";
import { deriveAdminAttention } from "./attention";

describe("deriveAdminAttention", () => {
  it("derives all attention items sorted by severity (danger before warning)", () => {
    const dashboard = makeAdminDashboard({
      support: ok({
        open: 3,
        inProgress: 1,
        openedInWindow: { current: 1, previous: 0, changePct: null },
        oldestOpen: [],
      }),
      applications: ok({
        pending: 2,
        receivedInWindow: { current: 2, previous: 0, changePct: null },
        oldestPending: [],
      }),
      subscriptions: ok({
        active: 10,
        expiringSoon: 4,
        expiringSoonDays: 30,
        activatedInWindow: { current: 1, previous: 0, changePct: null },
        activatedBySource: { PAYMENT: 1, LICENSE_CODE: 0 },
      }),
      licenses: ok({
        issuedValid: 50,
        redeemed: 20,
        revoked: 0,
        expired: 0,
        expiringSoon: 5,
        expiringSoonDays: 14,
        redeemedInWindow: { current: 1, previous: 0, changePct: null },
      }),
    });

    const result = deriveAdminAttention(dashboard);
    expect(result.items.length).toBe(4);
    // Danger (open tickets) first
    expect(result.items[0].kind).toBe("openTickets");
    expect(result.items[0].tone).toBe("danger");
    expect(result.items[0].count).toBe(3);

    // Remaining warning items
    const kinds = result.items.slice(1).map((i) => i.kind);
    expect(kinds).toContain("pendingApplications");
    expect(kinds).toContain("expiringSubscriptions");
    expect(kinds).toContain("expiringLicenses");

    expect(result.available).toBe(4);
    expect(result.failed).toBe(0);
  });

  it("handles zero waiting items without creating empty cards", () => {
    const dashboard = makeAdminDashboard({
      applications: ok({
        pending: 0,
        receivedInWindow: { current: 0, previous: 0, changePct: null },
        oldestPending: [],
      }),
      subscriptions: ok({
        active: 10,
        expiringSoon: 0,
        expiringSoonDays: 30,
        activatedInWindow: { current: 0, previous: 0, changePct: null },
        activatedBySource: { PAYMENT: 0, LICENSE_CODE: 0 },
      }),
      licenses: ok({
        issuedValid: 10,
        redeemed: 5,
        revoked: 0,
        expired: 0,
        expiringSoon: 0,
        expiringSoonDays: 14,
        redeemedInWindow: { current: 0, previous: 0, changePct: null },
      }),
      support: ok({
        open: 0,
        inProgress: 0,
        openedInWindow: { current: 0, previous: 0, changePct: null },
        oldestOpen: [],
      }),
    });

    const result = deriveAdminAttention(dashboard);
    expect(result.items).toEqual([]);
    expect(result.available).toBe(4);
    expect(result.failed).toBe(0);
  });

  it("tracks failed sources accurately", () => {
    const dashboard = makeAdminDashboard({
      applications: failed(),
      support: failed(),
    });

    const result = deriveAdminAttention(dashboard);
    expect(result.failed).toBe(2);
    expect(result.available).toBe(2);
  });
});
