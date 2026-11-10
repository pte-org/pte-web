import { describe, expect, it } from "vitest";
import type { ScoreTemplateFeasibilityResponse } from "@pte/api-client";
import { buildPoolIndex, countShortTypes } from "../../../../../features/hostTemplates/utils/pool";

const feasibility: ScoreTemplateFeasibilityResponse = {
  examDefinitionPublicId: "template",
  examDefinitionVersion: 1,
  ready: false,
  slots: [
    { taskType: "READ_ALOUD", section: "SPEAKING", required: 2, available: 0, ready: false, reason: "INSUFFICIENT_POOL" },
    { taskType: "REPEAT_SENTENCE", section: "SPEAKING", required: 3, available: 5, ready: true, reason: null },
  ],
};

describe("buildPoolIndex", () => {
  it("indexes each slot by task type", () => {
    const pool = buildPoolIndex(feasibility);
    expect(pool.get("READ_ALOUD")).toEqual({ available: 0, required: 2, ready: false });
    expect(pool.get("REPEAT_SENTENCE")).toEqual({ available: 5, required: 3, ready: true });
  });

  it("is empty before the feasibility response arrives", () => {
    expect(buildPoolIndex(undefined).size).toBe(0);
  });
});

describe("countShortTypes", () => {
  it("counts only the listed task types that are short", () => {
    const pool = buildPoolIndex(feasibility);
    expect(countShortTypes(pool, ["READ_ALOUD", "REPEAT_SENTENCE"])).toBe(1);
    expect(countShortTypes(pool, ["REPEAT_SENTENCE"])).toBe(0);
  });

  it("ignores task types the server did not report", () => {
    expect(countShortTypes(buildPoolIndex(feasibility), ["UNKNOWN"])).toBe(0);
  });
});
