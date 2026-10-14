import { describe, expect, it } from "vitest";
import { getGreeting } from "./greeting";

describe("getGreeting", () => {
  it("returns greetingMorning between 5:00 and 11:59", () => {
    expect(getGreeting("Alice", 5)).toEqual({ key: "greetingMorning", name: "Alice" });
    expect(getGreeting("Alice", 11)).toEqual({ key: "greetingMorning", name: "Alice" });
  });

  it("returns greetingAfternoon between 12:00 and 17:59", () => {
    expect(getGreeting("Alice", 12)).toEqual({ key: "greetingAfternoon", name: "Alice" });
    expect(getGreeting("Alice", 17)).toEqual({ key: "greetingAfternoon", name: "Alice" });
  });

  it("returns greetingEvening outside 5-17", () => {
    expect(getGreeting("Alice", 18)).toEqual({ key: "greetingEvening", name: "Alice" });
    expect(getGreeting("Alice", 23)).toEqual({ key: "greetingEvening", name: "Alice" });
    expect(getGreeting("Alice", 0)).toEqual({ key: "greetingEvening", name: "Alice" });
    expect(getGreeting("Alice", 4)).toEqual({ key: "greetingEvening", name: "Alice" });
  });

  it("uses fallback name when fullName is null, undefined or whitespace", () => {
    expect(getGreeting(null, 10, "Default Admin")).toEqual({
      key: "greetingMorning",
      name: "Default Admin",
    });
    expect(getGreeting("   ", 10, "Default Admin")).toEqual({
      key: "greetingMorning",
      name: "Default Admin",
    });
  });
});
