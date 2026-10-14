import { describe, expect, expectTypeOf, it } from "vitest";
// The package entry (package.json "main"/"exports" -> ./src/index.ts), i.e. what '@pte/ui' resolves to.
import * as ui from "./index";
import type {
  ActivityListItem,
  ActivityListLinkProps,
  ActivityListProps,
  ActivityListVariant,
  ChartTone,
  DashboardLoadingStateProps,
  DashboardLoadingVariant,
  DashboardPanelEmptyProps,
  DashboardPanelErrorProps,
  DashboardPanelProps,
  DashboardPanelStatus,
  StatCardDeltaDirection,
  StatCardDeltaTone,
  StatusDonutChartProps,
  StatusDonutItem,
  StatusDonutTone,
  TrendBarChartProps,
  TrendChartBaseProps,
  TrendChartDatum,
  TrendChartSeries,
  TrendLineChartProps,
} from "./index";

const NEW_COMPONENTS = [
  "StatCard",
  "DashboardPanel",
  "ActivityList",
  "TrendBarChart",
  "TrendLineChart",
  "StatusDonutChart",
  "DashboardLoadingState",
] as const;

const NEW_ICONS = [
  "CalendarIcon",
  "ClockIcon",
  "TrendUpIcon",
  "TrendDownIcon",
  "TrendFlatIcon",
  "ChartBarIcon",
  "ActivityIcon",
] as const;

describe("@pte/ui barrel: Phase 6 runtime exports", () => {
  it.each(NEW_COMPONENTS)("exports component %s as a function", (name) => {
    expect(typeof ui[name]).toBe("function");
  });

  it.each(NEW_ICONS)("exports icon %s as a function", (name) => {
    expect(typeof ui[name]).toBe("function");
  });

  it("keeps pre-existing exports that Phase 6 touched or sits next to", () => {
    for (const name of ["DataTable", "EmptyState", "ErrorState", "Skeleton", "Badge", "Button", "DashboardCard"] as const) {
      expect(typeof ui[name], name).toBe("function");
    }
  });
});

describe("@pte/ui barrel: Phase 6 type exports (compile-time, enforced by tsc)", () => {
  it("resolves every new public type with the documented shape", () => {
    expectTypeOf<ChartTone>().toEqualTypeOf<StatusDonutTone>();
    expectTypeOf<StatCardDeltaDirection>().toEqualTypeOf<"up" | "down" | "flat">();
    expectTypeOf<StatCardDeltaTone>().toEqualTypeOf<"good" | "bad" | "neutral">();
    expectTypeOf<DashboardPanelStatus>().toEqualTypeOf<"content" | "loading" | "error" | "empty">();
    expectTypeOf<ActivityListVariant>().toEqualTypeOf<"timeline" | "actions">();
    expectTypeOf<DashboardLoadingVariant>().toEqualTypeOf<"page" | "detail" | "table" | "overview">();
    expectTypeOf<DashboardPanelErrorProps["retryLabel"]>().toEqualTypeOf<string>();
    expectTypeOf<DashboardPanelErrorProps["onRetry"]>().toEqualTypeOf<(() => void) | undefined>();
    expectTypeOf<DashboardPanelEmptyProps["title"]>().toEqualTypeOf<string>();
    expectTypeOf<DashboardPanelProps["status"]>().toEqualTypeOf<DashboardPanelStatus | undefined>();
    expectTypeOf<ActivityListItem["id"]>().toEqualTypeOf<string>();
    expectTypeOf<ActivityListLinkProps["href"]>().toEqualTypeOf<string>();
    expectTypeOf<ActivityListProps["renderLink"]>().not.toEqualTypeOf<undefined>();
    expectTypeOf<DashboardLoadingStateProps["variant"]>().toEqualTypeOf<DashboardLoadingVariant | undefined>();
    expectTypeOf<StatusDonutChartProps["items"]>().toEqualTypeOf<readonly StatusDonutItem[]>();
    expectTypeOf<TrendChartBaseProps["data"]>().toEqualTypeOf<readonly TrendChartDatum[]>();
    expectTypeOf<TrendChartBaseProps["series"]>().toEqualTypeOf<readonly TrendChartSeries[]>();
    expectTypeOf<TrendBarChartProps["stacked"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<TrendLineChartProps>().toEqualTypeOf<TrendChartBaseProps>();
    expectTypeOf<TrendChartSeries["tone"]>().toEqualTypeOf<ChartTone | undefined>();
    expect(true).toBe(true);
  });

  it("rejects out-of-contract props", () => {
    // @ts-expect-error - "sideways" is not a StatCardDeltaDirection
    const direction: StatCardDeltaDirection = "sideways";
    // @ts-expect-error - "huge" is not a ChartTone
    const tone: ChartTone = "huge";
    // @ts-expect-error - "pending" is not a DashboardPanelStatus
    const status: DashboardPanelStatus = "pending";
    expect([direction, tone, status]).toHaveLength(3);
  });
});
