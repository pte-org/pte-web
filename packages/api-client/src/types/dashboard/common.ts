/**
 * Shared building blocks of the overview dashboards. Mirrors the pte-api `overview` module
 * records (`DashboardSection`, `SectionStatus`, `TrendValue`, `DashboardMeta`, `MonthlyPoint`,
 * `MonthlyAmount`) field for field.
 */

/** Rolling windows the backend accepts for `?windowDays=`; any other value is rejected with 400. */
export type DashboardWindowDays = 7 | 30 | 90;

/**
 * Outcome of computing one section. `ERROR` and `FORBIDDEN` carry `data: null` and never fail the
 * page (HTTP stays 200); `FORBIDDEN` means the caller's role may not see the section, so hide it.
 */
export type DashboardSectionStatus = "OK" | "ERROR" | "FORBIDDEN";

/**
 * One independently computed widget payload, mirroring the Java invariant "`data` is null unless
 * `status` is `OK`": narrowing on `section.status === "OK"` yields `data: T`, while `ERROR` and
 * `FORBIDDEN` always carry `data: null`. The backend runner only builds `OK` from a loaded value
 * (every loader returns a record or a list, never null), so `OK` with null data is not modelled;
 * a `T` that is itself nullable would have to say so in its own type argument.
 */
export type DashboardSection<T> =
  | { status: "OK"; data: T }
  | { status: Exclude<DashboardSectionStatus, "OK">; data: null };

/**
 * Period-over-period figure on rolling windows: `current` is `[windowStart, windowEnd)` and
 * `previous` the equally long window before it. `changePct` is computed by the backend and is
 * `null` when `previous` is zero (no honest ratio): show "new" or a dash, never a fake percentage.
 */
export interface TrendValue {
  current: number;
  previous: number;
  changePct: number | null;
}

/**
 * Response metadata. All instants are ISO-8601 strings. `zone` is the IANA zone used for the
 * calendar-month buckets of the series (always `Asia/Ho_Chi_Minh` today).
 */
export interface DashboardMeta {
  generatedAt: string;
  windowDays: DashboardWindowDays;
  windowStart: string;
  windowEnd: string;
  zone: string;
}

/** One calendar-month bucket. `month` is `yyyy-MM`; `partial` marks the month still in progress. */
export interface MonthlyPoint {
  month: string;
  count: number;
  partial: boolean;
}

/**
 * One calendar-month amount. `amount` is a JSON number (the backend `BigDecimal`): format it with
 * `Intl.NumberFormat` for the series currency and never add amounts of different currencies.
 *
 * Precision limit: delivered as a JSON number, so it is exact only up to 2^53 and only while the
 * platform's currencies have no fractional digits (VND today, whole amounts). Before enabling a
 * currency with fractional digits the backend must switch these fields to strings (or minor
 * units) and this type must follow.
 */
export interface MonthlyAmount {
  month: string;
  amount: number;
  partial: boolean;
}
