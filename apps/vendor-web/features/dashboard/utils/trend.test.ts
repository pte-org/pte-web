import { describe, expect, it } from "vitest";
import { buildDelta } from "./trend";

describe("buildDelta", () => {
  it("formats positive growth as up with good tone", () => {
    const delta = buildDelta({ current: 20, previous: 10, changePct: 100 }, "en");
    expect(delta).toEqual({
      change: "+100%",
      direction: "up",
      tone: "good",
    });
  });

  it("formats decrease as down with neutral tone (never danger)", () => {
    const delta = buildDelta({ current: 5, previous: 10, changePct: -50 }, "en");
    expect(delta).toEqual({
      change: "-50%",
      direction: "down",
      tone: "neutral",
    });
  });

  it("formats 0% change as flat with neutral tone", () => {
    const delta = buildDelta({ current: 10, previous: 10, changePct: 0 }, "en");
    expect(delta).toEqual({
      change: "0%",
      direction: "flat",
      tone: "neutral",
    });
  });

  it("returns null when changePct is null (e.g. from zero baseline)", () => {
    const delta = buildDelta({ current: 10, previous: 0, changePct: null }, "en");
    expect(delta).toBeNull();
  });
});
