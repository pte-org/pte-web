import { describe, expect, it } from "vitest";
import { buildDelta, deltaDirection, deltaTone } from "../../../../../features/hostDashboard/utils/trend";

describe("deltaDirection", () => {
  it("follows the sign of the change", () => {
    expect(deltaDirection(12)).toBe("up");
    expect(deltaDirection(-0.5)).toBe("down");
    expect(deltaDirection(0)).toBe("flat");
  });

  it("is flat without a change", () => {
    expect(deltaDirection(null)).toBe("flat");
    expect(deltaDirection(Number.NaN)).toBe("flat");
  });
});

describe("deltaTone", () => {
  it("is good only for growth; a drop is neutral, never bad", () => {
    expect(deltaTone("up")).toBe("good");
    expect(deltaTone("down")).toBe("neutral");
    expect(deltaTone("flat")).toBe("neutral");
  });
});

describe("buildDelta", () => {
  it("formats a growing trend", () => {
    expect(buildDelta({ current: 40, previous: 20, changePct: 100 }, "en")).toEqual({
      change: "+100%",
      direction: "up",
      tone: "good",
    });
  });

  it("formats a shrinking trend as a neutral decrease", () => {
    expect(buildDelta({ current: 10, previous: 20, changePct: -50 }, "en")).toEqual({
      change: "-50%",
      direction: "down",
      tone: "neutral",
    });
  });

  it("formats an unchanged trend", () => {
    expect(buildDelta({ current: 20, previous: 20, changePct: 0 }, "en")).toEqual({
      change: "0%",
      direction: "flat",
      tone: "neutral",
    });
  });

  it("has no percentage when the previous period was zero (null changePct)", () => {
    expect(buildDelta({ current: 12, previous: 0, changePct: null }, "en")).toEqual({
      change: null,
      direction: "flat",
      tone: "neutral",
    });
  });

  it("has no percentage when both periods are zero", () => {
    expect(buildDelta({ current: 0, previous: 0, changePct: null }, "vi").change).toBeNull();
  });
});
