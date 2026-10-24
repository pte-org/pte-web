import { beforeAll, describe, expect, it } from "vitest";
import {
  DASHBOARD_ENDPOINTS,
  DASHBOARD_WINDOW_OPTIONS,
  DEFAULT_DASHBOARD_WINDOW_DAYS,
} from "../../requests/dashboard";
import type { ActivationSource, PlanType, SubscriptionStatus } from "../billing";
import type { QuestionPool, QuestionStatus } from "../question";
import type { SessionStatus } from "../scheduling";
import type { TicketCategory } from "../support";
import type { TenantStatusResponse } from "../tenant";
import {
  ADMIN_DASHBOARD_EMPTY,
  ADMIN_DASHBOARD_ERROR,
  ADMIN_DASHBOARD_FORBIDDEN,
  ADMIN_DASHBOARD_NULLABLES,
  ADMIN_DASHBOARD_OK,
  DASHBOARD_META_FIXTURE,
  HOST_DASHBOARD_EMPTY,
  HOST_DASHBOARD_ERROR,
  HOST_DASHBOARD_FORBIDDEN,
  HOST_DASHBOARD_MIXED,
  HOST_DASHBOARD_NULLABLES,
  HOST_DASHBOARD_OK,
} from "./fixtures";
import {
  BACKEND_REQUIRED_ENV,
  BACKEND_ROOT_ENV,
  CACHE_ONLY_RECORDS,
  CONSTANTS_FILE,
  NULLABLE_FIELDS,
  backendPresent,
  backendRequired,
  backendRoot,
  loadBackend,
  type Backend,
} from "./javaContract";
import { walkResponse, type WalkResult } from "./javaWalker";
import type { DashboardSectionStatus } from "./index";

/**
 * Contract conformance: the pte-api `overview` records are the source of truth, the typed
 * fixtures are the TypeScript contract made concrete. Every Java record component must appear in
 * the fixtures and vice versa, at every nesting depth, in both directions. The backend sources
 * are read from disk; without them (CI without the backend checked out) the suite is skipped
 * with a message, unless PTE_API_REQUIRED=1.
 */

// Presence is decided at collection time (cheap); the Java parsing happens in beforeAll so a parser
// error fails the suites with a clear message instead of failing the file at import.
const present = backendPresent();
let backend: Backend | null = null;

beforeAll(() => {
  if (present) backend = loadBackend();
});

function need(): Backend {
  if (!backend) throw new Error(`pte-api sources not found at ${backendRoot()}`);
  return backend;
}

/** Java enum name -> the TS union members, kept exhaustive by `Record<Union, true>`. */
const TS_ENUMS: Readonly<Record<string, readonly string[]>> = {
  SessionStatus: Object.keys({
    DRAFT: true,
    PREPARING: true,
    READY: true,
    SCHEDULED: true,
    OPEN: true,
    CLOSED: true,
    CANCELLED: true,
  } satisfies Record<SessionStatus, true>),
  PlanType: Object.keys({ EXAM_PACKAGE: true, STUDENT_CAPACITY: true } satisfies Record<PlanType, true>),
  SubscriptionStatus: Object.keys({ ACTIVE: true, EXPIRED: true, CANCELLED: true } satisfies Record<
    SubscriptionStatus,
    true
  >),
  ActivationSource: Object.keys({ PAYMENT: true, LICENSE_CODE: true } satisfies Record<ActivationSource, true>),
  QuestionStatus: Object.keys({
    DRAFT: true,
    PENDING_APPROVAL: true,
    APPROVED: true,
    ARCHIVED: true,
  } satisfies Record<QuestionStatus, true>),
  QuestionPool: Object.keys({ EXAM: true, PRACTICE: true } satisfies Record<QuestionPool, true>),
  TicketCategory: Object.keys({
    BUG: true,
    CONTENT_COMPLAINT: true,
    GENERAL_FEEDBACK: true,
  } satisfies Record<TicketCategory, true>),
  OrganizationStatus: Object.keys({ PENDING: true, ACTIVE: true, REJECTED: true, SUSPENDED: true } satisfies Record<TenantStatusResponse, true>),
};

const HOST_FIXTURES = {
  ok: HOST_DASHBOARD_OK,
  nullables: HOST_DASHBOARD_NULLABLES,
  empty: HOST_DASHBOARD_EMPTY,
  forbidden: HOST_DASHBOARD_FORBIDDEN,
  error: HOST_DASHBOARD_ERROR,
  mixed: HOST_DASHBOARD_MIXED,
} as const;

const ADMIN_FIXTURES = {
  ok: ADMIN_DASHBOARD_OK,
  nullables: ADMIN_DASHBOARD_NULLABLES,
  empty: ADMIN_DASHBOARD_EMPTY,
  forbidden: ADMIN_DASHBOARD_FORBIDDEN,
  error: ADMIN_DASHBOARD_ERROR,
} as const;

if (!present) {
  const message = `pte-api sources not found at ${backendRoot()} (set ${BACKEND_ROOT_ENV} to the .../com/pte directory)`;
  if (backendRequired()) {
    it(`requires the backend sources (${BACKEND_REQUIRED_ENV}=1)`, () => {
      throw new Error(message);
    });
  } else {
    it.skip(`SKIPPED dashboard contract conformance: ${message}`, () => undefined);
  }
}

describe.skipIf(!present)("dashboard contract vs pte-api overview records", () => {
  it("finds both response roots with the expected section lists", () => {
    const registry = need().registry;
    const sections = (root: string): string[] =>
      registry.get(root)?.record.components.map((component) => component.name) ?? [];

    expect(sections("HostDashboardResponse")).toEqual([
      "meta", "learners", "quota", "academics", "staff", "exams", "attempts", "grading",
      "subscription", "billing", "support", "recentActivity",
    ]);
    expect(sections("AdminDashboardResponse")).toEqual([
      "meta", "tenants", "learners", "recentTenants", "applications", "licenses", "subscriptions",
      "plans", "support", "revenue", "questionBank",
    ]);
  });

  describe.each(Object.entries(HOST_FIXTURES))("HostDashboardResponse fixture %s", (_name, fixture) => {
    it("has exactly the Java fields, kinds, enum values and nullability", () => {
      const { problems } = walkResponse(need(), "HostDashboardResponse", fixture);
      expect(problems).toEqual([]);
    });
  });

  describe.each(Object.entries(ADMIN_FIXTURES))("AdminDashboardResponse fixture %s", (_name, fixture) => {
    it("has exactly the Java fields, kinds, enum values and nullability", () => {
      const { problems } = walkResponse(need(), "AdminDashboardResponse", fixture);
      expect(problems).toEqual([]);
    });
  });

  it("reaches every Java response record from the fixtures (no unmapped record in the DTO package)", () => {
    const visited = new Set<string>();
    const collect = (result: WalkResult): void => result.visited.forEach((name) => visited.add(name));
    Object.values(HOST_FIXTURES).forEach((fixture) => collect(walkResponse(need(), "HostDashboardResponse", fixture)));
    Object.values(ADMIN_FIXTURES).forEach((fixture) => collect(walkResponse(need(), "AdminDashboardResponse", fixture)));

    const expected = [
      ...need().dtoRecordNames.filter((name) => !CACHE_ONLY_RECORDS.has(name)),
      "UpcomingSessionView",
      "CurrentSubscriptionView",
    ];
    expect(expected.filter((name) => !visited.has(name))).toEqual([]);
  });

  it("exercises every documented nullable field as null at least once", () => {
    const seen = new Set<string>();
    const collect = (result: WalkResult): void => result.nullSeen.forEach((id) => seen.add(id));
    Object.values(HOST_FIXTURES).forEach((fixture) => collect(walkResponse(need(), "HostDashboardResponse", fixture)));
    Object.values(ADMIN_FIXTURES).forEach((fixture) => collect(walkResponse(need(), "AdminDashboardResponse", fixture)));

    expect([...NULLABLE_FIELDS].filter((id) => !seen.has(id))).toEqual([]);
  });

  it("flags drift in both directions on a mutated fixture (the walker is not vacuous)", () => {
    const { learners, ...withoutLearners } = HOST_DASHBOARD_OK;
    const extraKey = { ...HOST_DASHBOARD_OK, templates: { status: "OK", data: null } };
    const nullQuota = { ...HOST_DASHBOARD_OK, quota: { status: "OK", data: { used: null, limit: 1, remaining: 1 } } };
    const badEnum = {
      ...HOST_DASHBOARD_OK,
      exams: { status: "OK", data: { ...HOST_DASHBOARD_OK.exams.data, byStatus: { DRAFT: 1 } } },
    };
    void learners;

    expect(walkResponse(need(), "HostDashboardResponse", withoutLearners).problems.join("\n")).toContain(
      'Java HostDashboardResponse has component "learners"',
    );
    expect(walkResponse(need(), "HostDashboardResponse", extraKey).problems.join("\n")).toContain(
      'key "templates" that Java HostDashboardResponse lacks',
    );
    expect(walkResponse(need(), "HostDashboardResponse", nullQuota).problems.join("\n")).toContain(
      "HostSectionData.Quota.used is not documented as nullable",
    );
    expect(walkResponse(need(), "HostDashboardResponse", badEnum).problems.join("\n")).toContain(
      "differ from Java SessionStatus",
    );
  });

  it.each(Object.entries(TS_ENUMS))("TS union %s equals the Java enum of the same name", (name, tsValues) => {
    const javaValues = need().enums.get(name)?.constants;
    expect([...tsValues].sort()).toEqual([...(javaValues ?? [])].sort());
  });

  it("keeps the TS section statuses equal to the Java SectionStatus", () => {
    const javaValues = need().enums.get("SectionStatus")?.constants ?? [];
    const tsValues = Object.keys({ OK: true, ERROR: true, FORBIDDEN: true } satisfies Record<DashboardSectionStatus, true>);
    expect(tsValues.sort()).toEqual([...javaValues].sort());
  });
});

describe.skipIf(!present)("constants shared between the controller layer and api-client", () => {
  function constant(name: string): string {
    const code = need().read(CONSTANTS_FILE);
    const match = new RegExp(`${name}\\s*=\\s*([^;]+);`).exec(code);
    if (!match) throw new Error(`${name} not found in ${CONSTANTS_FILE}`);
    return match[1].trim();
  }
  const text = (name: string): string => constant(name).replace(/^"|"$/g, "");

  it("serves the endpoints api-client calls", () => {
    expect(`${text("API_BASE")}${text("HOST_PATH")}`).toBe(DASHBOARD_ENDPOINTS.host);
    expect(`${text("API_BASE")}${text("ADMIN_PATH")}`).toBe(DASHBOARD_ENDPOINTS.admin);
  });

  it("accepts exactly the windows api-client offers, with the same default", () => {
    const allowed = /Set\.of\(([^)]*)\)/.exec(constant("ALLOWED_WINDOW_DAYS"))?.[1].split(",").map((n) => Number(n.trim()));
    expect([...(allowed ?? [])].sort((a, b) => a - b)).toEqual([...DASHBOARD_WINDOW_OPTIONS]);
    expect(Number(constant("DEFAULT_WINDOW_DAYS"))).toBe(DEFAULT_DASHBOARD_WINDOW_DAYS);
  });

  it("reads the window from the query parameter api-client sends", () => {
    expect(text("PARAM_WINDOW_DAYS")).toBe("windowDays");
  });

  it("reports the bucketing zone, series length and revenue basis the fixtures assume", () => {
    expect(text("BUCKET_ZONE")).toBe(DASHBOARD_META_FIXTURE.zone);
    expect(Number(constant("SERIES_MONTHS"))).toBe(HOST_DASHBOARD_OK.attempts.data?.monthlySubmitted.length);
    expect(text("REVENUE_SOURCE_ONLINE_ORDERS")).toBe(ADMIN_DASHBOARD_OK.revenue.data?.source);
  });

  it("rejects bad windows with the code api-client tests assert", () => {
    expect(text("INVALID_DASHBOARD_WINDOW")).toBe("INVALID_DASHBOARD_WINDOW");
    expect(need().read("overview/internal/exception/InvalidDashboardWindowException.java")).toContain("HttpStatus.BAD_REQUEST");
  });
});

