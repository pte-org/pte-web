import { describe, expect, it } from "vitest";
import type { ScoreTemplateFeasibilityResponse } from "@pte/api-client";
import {
  buildLivePool,
  countShortTypes,
  rememberAvailable,
} from "../../../../../features/hostTemplates/utils/pool";

const feasibility = (slots: { taskType: string; available: number }[]): ScoreTemplateFeasibilityResponse => ({
  examDefinitionPublicId: "template",
  examDefinitionVersion: 1,
  ready: false,
  slots: slots.map((slot) => ({ ...slot, section: "SPEAKING", required: 1, ready: true, reason: null })),
});

const ITEMS = [
  { taskTypeKey: "READ_ALOUD", maxCount: 2 },
  { taskTypeKey: "REPEAT_SENTENCE", maxCount: 3 },
];

describe("template coverage while editing", () => {
  it("needs each row's maximum count and compares it with the bank", () => {
    const available = rememberAvailable(new Map(), feasibility([
      { taskType: "READ_ALOUD", available: 0 },
      { taskType: "REPEAT_SENTENCE", available: 5 },
    ]));
    const pool = buildLivePool(available, ITEMS);
    expect(pool.get("READ_ALOUD")).toEqual({ available: 0, required: 2, ready: false });
    expect(pool.get("REPEAT_SENTENCE")).toEqual({ available: 5, required: 3, ready: true });
  });

  it("keeps a removed type's bank count, so adding it back shows coverage before saving", () => {
    const first = rememberAvailable(new Map(), feasibility([
      { taskType: "READ_ALOUD", available: 4 },
      { taskType: "REPEAT_SENTENCE", available: 5 },
    ]));
    // Saved without READ_ALOUD: the server no longer reports it.
    const afterSave = rememberAvailable(first, feasibility([{ taskType: "REPEAT_SENTENCE", available: 5 }]));
    expect(buildLivePool(afterSave, ITEMS).get("READ_ALOUD")).toEqual({ available: 4, required: 2, ready: true });
  });

  it("follows an edited maximum count without saving", () => {
    const available = rememberAvailable(new Map(), feasibility([{ taskType: "REPEAT_SENTENCE", available: 5 }]));
    const pool = buildLivePool(available, [{ taskTypeKey: "REPEAT_SENTENCE", maxCount: 9 }]);
    expect(pool.get("REPEAT_SENTENCE")).toEqual({ available: 5, required: 9, ready: false });
  });

  it("shows nothing for a type the server never reported, and nothing before the first answer", () => {
    expect(buildLivePool(new Map(), ITEMS).size).toBe(0);
    expect(rememberAvailable(new Map(), undefined).size).toBe(0);
  });

  it("counts only the listed task types that are short", () => {
    const available = rememberAvailable(new Map(), feasibility([
      { taskType: "READ_ALOUD", available: 0 },
      { taskType: "REPEAT_SENTENCE", available: 5 },
    ]));
    const pool = buildLivePool(available, ITEMS);
    expect(countShortTypes(pool, ["READ_ALOUD", "REPEAT_SENTENCE"])).toBe(1);
    expect(countShortTypes(pool, ["UNKNOWN"])).toBe(0);
  });
});
