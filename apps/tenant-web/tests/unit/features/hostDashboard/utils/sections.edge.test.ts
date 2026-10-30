import type { DashboardSection } from "@pte/api-client";
import { describe, expect, expectTypeOf, it } from "vitest";
import { failed, forbidden, ok } from "../testing/fixtures";
import { sectionAvailability, sectionData } from "../../../../../features/hostDashboard/utils/sections";

describe("section narrowing", () => {
  it("narrows an OK section to its data and erases the others", () => {
    const section: DashboardSection<{ n: number }> = ok({ n: 3 });
    if (section.status === "OK") {
      expectTypeOf(section.data).toEqualTypeOf<{ n: number }>();
    }
    expectTypeOf(sectionData(section)).toEqualTypeOf<{ n: number } | undefined>();
    expect(sectionData(section)?.n).toBe(3);
  });

  it("gives ERROR and FORBIDDEN no data even if a stale payload sits in them", () => {
    const staleError = { status: "ERROR", data: { n: 1 } } as unknown as DashboardSection<{ n: number }>;
    const staleForbidden = { status: "FORBIDDEN", data: { n: 1 } } as unknown as DashboardSection<{ n: number }>;
    expect(sectionData(staleError)).toBeUndefined();
    expect(sectionData(staleForbidden)).toBeUndefined();
  });

  it("maps the three statuses to three distinct availabilities", () => {
    const states = [sectionAvailability(ok(1)), sectionAvailability(failed()), sectionAvailability(forbidden())];
    expect(states).toEqual(["ok", "error", "forbidden"]);
    expect(new Set(states).size).toBe(3);
  });

  it("hides (forbidden) any status it does not know, instead of showing an error or content", () => {
    // A future backend status must never render as content or as an error with a retry.
    expect(sectionAvailability({ status: "SOMETHING_NEW" as never })).toBe("forbidden");
    expect(sectionData({ status: "SOMETHING_NEW", data: 5 } as never)).toBeUndefined();
  });

  it("reads only the status, so sections of different data types map together", () => {
    const mixed = [ok({ a: 1 }), failed<string>(), forbidden<number[]>()].map(sectionAvailability);
    expect(mixed).toEqual(["ok", "error", "forbidden"]);
  });

  it("keeps falsy data of an OK section: 0, empty string, empty list and false are data", () => {
    expect(sectionData(ok(0))).toBe(0);
    expect(sectionData(ok(""))).toBe("");
    expect(sectionData(ok([] as number[]))).toEqual([]);
    expect(sectionData(ok(false))).toBe(false);
  });
});
