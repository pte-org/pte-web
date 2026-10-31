import { describe, expect, it } from "vitest";
import { failed, forbidden, ok } from "../testing/fixtures";
import { sectionAvailability, sectionData } from "../../../../../features/dashboard/utils/sections";

describe("sections", () => {
  it("maps each status to its availability", () => {
    expect(sectionAvailability(ok({ n: 1 }))).toBe("ok");
    expect(sectionAvailability(failed())).toBe("error");
    expect(sectionAvailability(forbidden())).toBe("forbidden");
  });

  it("handles null and undefined gracefully", () => {
    expect(sectionAvailability(null)).toBe("forbidden");
    expect(sectionAvailability(undefined)).toBe("forbidden");
  });

  it("returns data only for an OK section", () => {
    expect(sectionData(ok({ n: 1 }))).toEqual({ n: 1 });
    expect(sectionData(failed())).toBeUndefined();
    expect(sectionData(forbidden())).toBeUndefined();
    expect(sectionData(null)).toBeUndefined();
    expect(sectionData(undefined)).toBeUndefined();
  });

  it("treats zero or empty array as valid data", () => {
    expect(sectionData(ok(0))).toBe(0);
    expect(sectionData(ok([]))).toEqual([]);
  });
});
