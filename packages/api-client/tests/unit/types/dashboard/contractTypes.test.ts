import { describe, expect, expectTypeOf, it } from "vitest";
import type { PlanType, SubscriptionStatus } from "../../../../src/types/billing";
import type { SessionStatus } from "../../../../src/types/scheduling";
import type { TicketCategory } from "../../../../src/types/support";
import type { TenantStatusResponse } from "../../../../src/types/tenant";
import type {
  AdminApplicationsData,
  AdminDashboardResponse,
  AdminLearnersData,
  AdminLicensesData,
  AdminPlansData,
  AdminQuestionBankData,
  AdminRecentTenantsData,
  AdminRevenueData,
  AdminSubscriptionsData,
  AdminSupportData,
  AdminTenantsData,
  DashboardActivityItem,
  DashboardCurrencyRevenue,
  DashboardMeta,
  DashboardOldestTicket,
  DashboardPendingApplication,
  DashboardRecentTenant,
  DashboardSeatUtilisation,
  DashboardSection,
  DashboardSectionStatus,
  DashboardSubscription,
  DashboardUpcomingSession,
  DashboardWindowDays,
  HostAcademicsData,
  HostAttemptsData,
  HostBillingData,
  HostDashboardResponse,
  HostExamsData,
  HostGradingData,
  HostLearnersData,
  HostQuotaData,
  HostStaffData,
  HostSubscriptionData,
  HostSupportData,
  MonthlyAmount,
  MonthlyPoint,
  TrendValue,
} from "../../../../src/types/dashboard/index";
import {
  ADMIN_DASHBOARD_ERROR,
  ADMIN_DASHBOARD_FORBIDDEN,
  ADMIN_DASHBOARD_NULLABLES,
  ADMIN_DASHBOARD_OK,
  HOST_DASHBOARD_EMPTY,
  HOST_DASHBOARD_ERROR,
  HOST_DASHBOARD_FORBIDDEN,
  HOST_DASHBOARD_MIXED,
  HOST_DASHBOARD_NULLABLES,
  HOST_DASHBOARD_OK,
  SERIES_MONTHS,
} from "./fixtures";

/**
 * Backend-independent checks of the TypeScript contract. The `expectTypeOf` assertions and the
 * `@ts-expect-error` lines are enforced by the compiler (`pnpm --filter @pte/api-client
 * typecheck`, which includes test files); at runtime they are no-ops. The fixture checks run in
 * `vitest`.
 */

type AllContractObjects =
  | DashboardMeta
  | TrendValue
  | MonthlyPoint
  | MonthlyAmount
  | HostDashboardResponse
  | HostLearnersData
  | HostQuotaData
  | HostAcademicsData
  | HostStaffData
  | DashboardUpcomingSession
  | HostExamsData
  | HostAttemptsData
  | HostGradingData
  | DashboardSubscription
  | HostSubscriptionData
  | HostBillingData
  | HostSupportData
  | DashboardActivityItem
  | AdminDashboardResponse
  | AdminTenantsData
  | DashboardSeatUtilisation
  | AdminLearnersData
  | DashboardRecentTenant
  | AdminRecentTenantsData
  | DashboardPendingApplication
  | AdminApplicationsData
  | AdminLicensesData
  | AdminSubscriptionsData
  | AdminPlansData
  | DashboardOldestTicket
  | AdminSupportData
  | DashboardCurrencyRevenue
  | AdminRevenueData
  | AdminQuestionBankData;

type OptionalKeys<T> = { [K in keyof T]-?: object extends Pick<T, K> ? K : never }[keyof T];
type OptionalKeysOfUnion<T> = T extends unknown ? OptionalKeys<T> : never;

describe("dashboard TS contract: types", () => {
  it("has no optional member anywhere (every Java record component is always serialised)", () => {
    expectTypeOf<OptionalKeysOfUnion<AllContractObjects>>().toEqualTypeOf<never>();
  });

  it("allows exactly the windows the backend accepts", () => {
    expectTypeOf<DashboardWindowDays>().toEqualTypeOf<7 | 30 | 90>();
    expectTypeOf<DashboardMeta["windowDays"]>().toEqualTypeOf<DashboardWindowDays>();
  });

  it("models a section as a discriminated union: OK carries data, ERROR/FORBIDDEN carry null", () => {
    expectTypeOf<DashboardSectionStatus>().toEqualTypeOf<"OK" | "ERROR" | "FORBIDDEN">();
    expectTypeOf<DashboardSection<number>>().toEqualTypeOf<
      { status: "OK"; data: number } | { status: "ERROR" | "FORBIDDEN"; data: null }
    >();
    expectTypeOf<DashboardSection<number>["status"]>().toEqualTypeOf<DashboardSectionStatus>();
  });

  it("narrows `data` when the status is checked", () => {
    const section = HOST_DASHBOARD_OK.quota;

    if (section.status === "OK") {
      expectTypeOf(section.data).toEqualTypeOf<HostQuotaData>();
    } else {
      expectTypeOf(section.status).toEqualTypeOf<"ERROR" | "FORBIDDEN">();
      expectTypeOf(section.data).toEqualTypeOf<null>();
    }
    expect(section.status).toBe("OK");
  });

  it("types every nullable Java component as `| null` and nothing else as nullable", () => {
    expectTypeOf<TrendValue["changePct"]>().toEqualTypeOf<number | null>();
    expectTypeOf<DashboardUpcomingSession["capacity"]>().toEqualTypeOf<number | null>();
    expectTypeOf<DashboardSubscription["planName"]>().toEqualTypeOf<string | null>();
    expectTypeOf<DashboardSubscription["planType"]>().toEqualTypeOf<PlanType | null>();
    expectTypeOf<HostSubscriptionData["nearestExpiryAt"]>().toEqualTypeOf<string | null>();
    expectTypeOf<HostSubscriptionData["daysToExpiry"]>().toEqualTypeOf<number | null>();
    expectTypeOf<DashboardRecentTenant["planName"]>().toEqualTypeOf<string | null>();
    expectTypeOf<DashboardRecentTenant["subscriptionExpiresAt"]>().toEqualTypeOf<string | null>();
    expectTypeOf<DashboardOldestTicket["tenantName"]>().toEqualTypeOf<string | null>();
    expectTypeOf<DashboardCurrencyRevenue["changePct"]>().toEqualTypeOf<number | null>();

    expectTypeOf<HostQuotaData["used"]>().toEqualTypeOf<number>();
    expectTypeOf<TrendValue["current"]>().toEqualTypeOf<number>();
    expectTypeOf<DashboardUpcomingSession["enrolled"]>().toEqualTypeOf<number>();
    expectTypeOf<DashboardSubscription["expiresAt"]>().toEqualTypeOf<string>();
    expectTypeOf<DashboardRecentTenant["seatLimit"]>().toEqualTypeOf<number>();
    expectTypeOf<DashboardOldestTicket["openedAt"]>().toEqualTypeOf<string>();
    expectTypeOf<HostSubscriptionData["expiringSoon"]>().toEqualTypeOf<boolean>();
  });

  it("keys enum-valued members by the shared enum unions", () => {
    expectTypeOf<DashboardUpcomingSession["status"]>().toEqualTypeOf<SessionStatus>();
    expectTypeOf<HostExamsData["byStatus"]>().toEqualTypeOf<Record<SessionStatus, number>>();
    expectTypeOf<DashboardSubscription["status"]>().toEqualTypeOf<SubscriptionStatus>();
    expectTypeOf<DashboardRecentTenant["status"]>().toEqualTypeOf<TenantStatusResponse>();
    expectTypeOf<DashboardOldestTicket["category"]>().toEqualTypeOf<TicketCategory>();
  });

  it("rejects invalid shapes at compile time", () => {
    const quota = HOST_DASHBOARD_OK.quota.data as HostQuotaData; // fixture is OK, so data is set

    // @ts-expect-error `used` is a non-null long in the backend record
    const nullUsed: HostQuotaData = { ...quota, used: null };
    // @ts-expect-error a section status outside OK/ERROR/FORBIDDEN is not part of the contract
    const unknownStatus: DashboardSection<number> = { status: "PENDING", data: null };
    // @ts-expect-error 14 is not an accepted window (the backend answers 400)
    const badWindow: DashboardMeta = { ...HOST_DASHBOARD_OK.meta, windowDays: 14 };
    // @ts-expect-error the response has no payment-link field (contract excludes it)
    const withPaymentLink: HostBillingData = { pendingOrders: 1, paymentLink: "https://pay.example" };
    // @ts-expect-error a trend always carries `changePct` (null, never absent)
    const noPct: TrendValue = { current: 1, previous: 0 };
    // @ts-expect-error a session status outside the lifecycle enum
    const badSession: DashboardUpcomingSession["status"] = "ARCHIVED";
    // @ts-expect-error an OK section always carries data (the backend sends null only for ERROR/FORBIDDEN)
    const okWithoutData: DashboardSection<number> = { status: "OK", data: null };
    // @ts-expect-error an ERROR section never carries data
    const errorWithData: DashboardSection<number> = { status: "ERROR", data: 1 };
    // @ts-expect-error a FORBIDDEN section never carries data
    const forbiddenWithData: DashboardSection<number> = { status: "FORBIDDEN", data: 1 };

    expect([
      nullUsed,
      unknownStatus,
      badWindow,
      withPaymentLink,
      noPct,
      badSession,
      okWithoutData,
      errorWithData,
      forbiddenWithData,
    ]).toHaveLength(9);
  });
});

describe("dashboard fixtures", () => {
  const HOST_ALL = [
    HOST_DASHBOARD_OK,
    HOST_DASHBOARD_NULLABLES,
    HOST_DASHBOARD_EMPTY,
    HOST_DASHBOARD_FORBIDDEN,
    HOST_DASHBOARD_ERROR,
    HOST_DASHBOARD_MIXED,
  ];

  function sectionsOf(response: HostDashboardResponse | AdminDashboardResponse): DashboardSection<unknown>[] {
    const { meta, ...sections } = response;
    void meta;
    return Object.values(sections);
  }

  it("OK fixtures carry data in every section; FORBIDDEN and ERROR fixtures carry none", () => {
    for (const response of [HOST_DASHBOARD_OK, HOST_DASHBOARD_NULLABLES, ADMIN_DASHBOARD_OK, ADMIN_DASHBOARD_NULLABLES]) {
      expect(sectionsOf(response).every((s) => s.status === "OK" && s.data !== null)).toBe(true);
    }
    for (const response of [HOST_DASHBOARD_FORBIDDEN, HOST_DASHBOARD_ERROR, ADMIN_DASHBOARD_ERROR]) {
      expect(sectionsOf(response).every((s) => s.status !== "OK" && s.data === null)).toBe(true);
    }
    expect(sectionsOf(HOST_DASHBOARD_FORBIDDEN).every((s) => s.status === "FORBIDDEN")).toBe(true);
    expect(sectionsOf(HOST_DASHBOARD_ERROR).every((s) => s.status === "ERROR")).toBe(true);
  });

  it("mixes section states independently in one response", () => {
    const statuses = sectionsOf(HOST_DASHBOARD_MIXED).map((s) => s.status);
    expect(new Set(statuses)).toEqual(new Set(["OK", "ERROR", "FORBIDDEN"]));
  });

  it("models the academic-role admin view: only the question bank is visible", () => {
    const { meta, questionBank, ...hidden } = ADMIN_DASHBOARD_FORBIDDEN;
    void meta;

    expect(questionBank.status).toBe("OK");
    expect(Object.values(hidden).every((s) => s.status === "FORBIDDEN" && s.data === null)).toBe(true);
  });

  it("builds 12 monthly buckets, oldest first, with only the current month partial", () => {
    expect(SERIES_MONTHS).toHaveLength(12);
    expect([...SERIES_MONTHS].sort()).toEqual([...SERIES_MONTHS]);
    expect(new Set(SERIES_MONTHS).size).toBe(12);

    const series = [
      HOST_DASHBOARD_OK.attempts.data?.monthlySubmitted,
      ADMIN_DASHBOARD_OK.tenants.data?.monthlyCreated,
      ...(ADMIN_DASHBOARD_OK.revenue.data?.currencies.map((c) => c.monthly) ?? []),
    ];
    for (const points of series) {
      expect(points?.map((p) => p.month)).toEqual([...SERIES_MONTHS]);
      expect(points?.map((p) => p.partial)).toEqual([...Array<boolean>(11).fill(false), true]);
    }
  });

  it("keeps changePct null exactly when the previous value is zero", () => {
    const trends: TrendValue[] = [
      HOST_DASHBOARD_OK.learners.data?.newInWindow,
      HOST_DASHBOARD_NULLABLES.learners.data?.newInWindow,
      HOST_DASHBOARD_EMPTY.learners.data?.newInWindow,
      ADMIN_DASHBOARD_NULLABLES.revenue.data?.paidOrders,
    ].filter((trend): trend is TrendValue => trend !== undefined);

    expect(trends).toHaveLength(4);
    for (const trend of trends) expect(trend.changePct === null).toBe(trend.previous === 0);
  });

  it("keeps revenue amounts as JSON numbers (whole VND) and never mixes currencies in one entry", () => {
    const currencies = ADMIN_DASHBOARD_OK.revenue.data?.currencies ?? [];

    expect(currencies.map((c) => c.currency)).toEqual(["USD", "VND"]);
    expect(currencies.every((c) => typeof c.current === "number" && typeof c.previous === "number")).toBe(true);
    expect(currencies.every((c) => Number.isInteger(c.current) && Number.isInteger(c.previous))).toBe(true);
    expect(currencies[1].current).toBe(1500000);
  });

  it("survives a JSON round trip unchanged (nulls stay explicit, nothing is undefined)", () => {
    for (const response of [...HOST_ALL, ADMIN_DASHBOARD_OK, ADMIN_DASHBOARD_NULLABLES, ADMIN_DASHBOARD_FORBIDDEN]) {
      expect(JSON.parse(JSON.stringify(response))).toStrictEqual(response);
    }
    expect(JSON.stringify(HOST_DASHBOARD_NULLABLES)).toContain('"capacity":null');
  });
});
