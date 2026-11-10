import { describe, expect, it } from "vitest";
import {
  categoryTone,
  engineTone,
  levelDot,
} from "../../../../features/aiadmin/utils/promptTone";

describe("engineTone", () => {
  it("gives each engine its own colour and a neutral one to an unknown tag", () => {
    const engines = ["GEMINI", "AZURE", "CODE", "LLM", "TTS", "CHART"];
    const dots = engines.map((engine) => engineTone(engine).dot);

    expect(new Set(dots).size).toBe(engines.length);
    expect(engineTone("SPEAKING")).toEqual(engineTone("CODE"));
  });
});

describe("categoryTone", () => {
  it("colours the four categories differently", () => {
    const dots = (["GENERATION", "REVIEW", "SCORING", "SHARED"] as const).map((name) => categoryTone(name).dot);

    expect(new Set(dots).size).toBe(4);
  });
});

describe("levelDot", () => {
  it("runs from red at zero to green at the top level", () => {
    expect(levelDot(0, 5)).toBe("bg-rose-500");
    expect(levelDot(2, 5)).toBe("bg-amber-500");
    expect(levelDot(3, 5)).toBe("bg-lime-500");
    expect(levelDot(5, 5)).toBe("bg-emerald-500");
    expect(levelDot(0, 0)).toBe("bg-rose-500");
  });
});
