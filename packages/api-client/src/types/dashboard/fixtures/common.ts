import type {
  DashboardMeta,
  DashboardSection,
  MonthlyAmount,
  MonthlyPoint,
  TrendValue,
} from "../index";

/**
 * Typed dashboard fixtures. They are annotated with the production contract types, so a TS-side
 * rename or removal breaks compilation here; `contract.test.ts` then compares their keys with
 * the pte-api `overview` records, so a backend-side change breaks that test. Test support only:
 * never exported from the package barrels.
 *
 * "Nullables" fixtures set every nullable field to null; the "OK" fixtures set every field to a
 * realistic non-null value. Neither is a scenario of one real tenant: they exist to cover shapes.
 */

export const DASHBOARD_META_FIXTURE: DashboardMeta = {
  generatedAt: "2026-10-13T03:00:00Z",
  windowDays: 30,
  windowStart: "2026-09-13T03:00:00Z",
  windowEnd: "2026-10-13T03:00:00Z",
  zone: "Asia/Ho_Chi_Minh",
};

export const TREND_GROWING: TrendValue = { current: 40, previous: 20, changePct: 100 };
/** `previous` is zero, so the backend sends no percentage. */
export const TREND_FROM_ZERO: TrendValue = { current: 12, previous: 0, changePct: null };
export const TREND_ZERO: TrendValue = { current: 0, previous: 0, changePct: null };

const MONTHS_IN_SERIES = 12;
const SERIES_END_MONTH = "2026-10";

/** The 12 `yyyy-MM` buckets ending with `2026-10`, oldest first. */
export const SERIES_MONTHS: readonly string[] = Array.from({ length: MONTHS_IN_SERIES }, (_, i) => {
  const monthIndex = 9 - (MONTHS_IN_SERIES - 1 - i);
  const year = monthIndex >= 0 ? 2026 : 2025;
  const month = ((monthIndex % 12) + 12) % 12 + 1;
  return `${year}-${String(month).padStart(2, "0")}`;
});

export function monthlyPoints(counts: readonly number[]): MonthlyPoint[] {
  return SERIES_MONTHS.map((month, i) => ({
    month,
    count: counts[i] ?? 0,
    partial: month === SERIES_END_MONTH,
  }));
}

export function monthlyAmounts(amounts: readonly number[]): MonthlyAmount[] {
  return SERIES_MONTHS.map((month, i) => ({
    month,
    amount: amounts[i] ?? 0,
    partial: month === SERIES_END_MONTH,
  }));
}

export function ok<T>(data: T): DashboardSection<T> {
  return { status: "OK", data };
}

export function forbidden<T>(): DashboardSection<T> {
  return { status: "FORBIDDEN", data: null };
}

export function failed<T>(): DashboardSection<T> {
  return { status: "ERROR", data: null };
}

export const SESSION_ID_1 = "11111111-1111-4111-8111-111111111111";
export const SESSION_ID_2 = "22222222-2222-4222-8222-222222222222";
export const SUBSCRIPTION_ID = "33333333-3333-4333-8333-333333333333";
export const TENANT_ID_1 = "44444444-4444-4444-8444-444444444444";
export const TENANT_ID_2 = "55555555-5555-4555-8555-555555555555";
export const APPLICATION_ID = "66666666-6666-4666-8666-666666666666";
export const TICKET_ID = "77777777-7777-4777-8777-777777777777";
export const ACTIVITY_ID = "88888888-8888-4888-8888-888888888888";
export const ACTOR_ID = "99999999-9999-4999-8999-999999999999";
