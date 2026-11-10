import { describe, expect, it } from "vitest";
import {
  HIGH_IMPACT_POINTS,
  changedTaskTypes,
  describeChange,
  impactScenarios,
  isHighImpact,
  scoreShift,
} from "../../../../features/scoringrubric/versionImpact";
import { RUBRIC_EDIT_TEXT } from "../../../../features/scoringrubric/versionConstants";
import { rubric, trait } from "./fixtures";

const T = RUBRIC_EDIT_TEXT.vi;
const change = (path: string, beforeValue: string | null, afterValue: string | null) => ({ path, beforeValue, afterValue });
const names = new Map([["WRITE_ESSAY.CONTENT", "Nội dung"]]);

describe("describeChange", () => {
  it("names the trait and the kind of setting", () => {
    expect(describeChange(change("taskTypes.WRITE_ESSAY.traitWeights.CONTENT", "1", "2"), names, T))
      .toEqual({ taskType: "WRITE_ESSAY", what: "Nội dung · trọng số", before: "1", after: "2" });
  });

  it("shows a gate as on or off", () => {
    const line = describeChange(change("taskTypes.WRITE_ESSAY.gateEnabled.CONTENT", "true", "false"), names, T);
    expect(line).toMatchObject({ what: "Nội dung · điều kiện chặn", before: T.on, after: T.off });
  });

  it("describes a Form band and keeps an unknown path as it is", () => {
    expect(describeChange(change("taskTypes.WRITE_ESSAY.formBands[1].minWords", "200", "180"), names, T).what)
      .toBe(`${T.changeForm} #2 · minWords`);
    expect(describeChange(change("azureBandMappingVersion", "1", "2"), names, T))
      .toEqual({ taskType: null, what: "azureBandMappingVersion", before: "1", after: "2" });
  });

  it("falls back to the trait key when no name is known", () => {
    expect(describeChange(change("taskTypes.WRITE_ESSAY.traitWeights.GRAMMAR", "1", "2"), names, T).what)
      .toBe("GRAMMAR · trọng số");
  });
});

describe("changedTaskTypes", () => {
  it("lists each task type once, in order", () => {
    expect(changedTaskTypes([
      change("taskTypes.B.traitWeights.X", "1", "2"),
      change("taskTypes.A.gateEnabled.Y", "true", "false"),
      change("taskTypes.B.traitWeights.Z", "1", "3"),
      change("azureBandMappingVersion", "1", "2"),
    ])).toEqual(["B", "A"]);
  });
});

describe("impactScenarios", () => {
  const essay = rubric("WRITE_ESSAY", ["WRITING"], {
    traits: [trait("CONTENT", 6, false, {}), trait("FORM", 2, false, {}), trait("GRAMMAR", 2, false, {})],
    formBands: [{ minWords: 120, maxWords: 199, band: 1 }, { minWords: 200, maxWords: 300, band: 2 }],
  });
  const readAloud = rubric("READ_ALOUD", ["SPEAKING"], { traits: [trait("CONTENT", null, true, {}), trait("PRONUNCIATION", 5, false, {})] });

  it("has a top, a middle and, for a changed weight, a strong-in-that-trait sample", () => {
    const scenarios = impactScenarios(essay, [change("taskTypes.WRITE_ESSAY.traitWeights.CONTENT", "6", "9")]);

    expect(scenarios.map((entry) => entry.kind)).toEqual(["MAX", "MID", "CHANGED"]);
    expect(scenarios[0].request.traitScores).toEqual({ CONTENT: 6, GRAMMAR: 2 });
    expect(scenarios[1].request.traitScores).toEqual({ CONTENT: 3, GRAMMAR: 1 });
    expect(scenarios[2].request.traitScores).toEqual({ CONTENT: 6, GRAMMAR: 1 });
  });

  it("leaves out the changed-trait sample when only a gate or a band changed", () => {
    expect(impactScenarios(essay, [change("taskTypes.WRITE_ESSAY.gateEnabled.CONTENT", "true", "false")]).map((entry) => entry.kind))
      .toEqual(["MAX", "MID"]);
  });

  it("gives a Form-scored task clean text at the lowest length of the best band", () => {
    expect(impactScenarios(essay, [])[0].request.textMetrics)
      .toEqual({ wordCount: 200, sentenceCount: 1, allCaps: false, punctuationPresent: true, bulletOnly: false });
  });

  it("uses a passage length for a per-word trait", () => {
    const [top] = impactScenarios(readAloud, []);

    expect(top.request.traitScores.CONTENT).toBe(60);
    expect(top.request.wordCount).toBe(60);
    expect(top.request.textMetrics).toBeUndefined();
  });

  it("has no samples for a task without traits", () => {
    expect(impactScenarios(rubric("X", [], { traits: [] }), [])).toEqual([]);
  });
});

describe("shifts", () => {
  it("is the new score minus the old one, and high at ten points either way", () => {
    expect(scoreShift(50, 64)).toBe(14);
    expect(scoreShift(50, 41)).toBe(-9);
    expect(isHighImpact([3, -HIGH_IMPACT_POINTS])).toBe(true);
    expect(isHighImpact([3, -9, 9])).toBe(false);
    expect(isHighImpact([])).toBe(false);
  });
});
