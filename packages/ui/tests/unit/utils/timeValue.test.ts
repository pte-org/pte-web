import { describe, expect, it } from "vitest";
import { formatTime, isBeforeMinTime, minuteOptions, parseTypedTime, splitTime } from "../../../src/utils/timeValue";

describe("parseTypedTime", () => {
  it.each([
    ["9", "09:00"],
    ["930", "09:30"],
    ["0930", "09:30"],
    ["9:30", "09:30"],
    ["09.30", "09:30"],
    ["9h30", "09:30"],
    ["17:05", "17:05"],
    [" 13:30 ", "13:30"],
  ])("reads %s as %s", (typed, expected) => {
    expect(parseTypedTime(typed)).toBe(expected);
  });

  it.each(["", "24:00", "12:60", "abc", "1:2", "12:300"])("rejects %j", (typed) => {
    expect(parseTypedTime(typed)).toBeNull();
  });
});

describe("splitTime and formatTime", () => {
  it("round-trips a stored value and reports an empty one as null", () => {
    expect(splitTime("08:05")).toEqual({ hour: 8, minute: 5 });
    expect(formatTime(8, 5)).toBe("08:05");
    expect(splitTime("")).toEqual({ hour: null, minute: null });
  });
});

describe("minuteOptions", () => {
  it("uses a five-minute grid and keeps an off-grid current minute in place", () => {
    expect(minuteOptions(null)).toHaveLength(12);
    expect(minuteOptions(30)).toHaveLength(12);
    const withCurrent = minuteOptions(44);
    expect(withCurrent).toHaveLength(13);
    expect(withCurrent[withCurrent.indexOf(44) - 1]).toBe(40);
    expect(withCurrent[withCurrent.indexOf(44) + 1]).toBe(45);
  });
});

describe("isBeforeMinTime", () => {
  it("is true only for a time earlier than the bound", () => {
    expect(isBeforeMinTime("08:59", "09:00")).toBe(true);
    expect(isBeforeMinTime("09:00", "09:00")).toBe(false);
    expect(isBeforeMinTime("10:00", "09:00")).toBe(false);
    expect(isBeforeMinTime("00:00", undefined)).toBe(false);
  });
});
