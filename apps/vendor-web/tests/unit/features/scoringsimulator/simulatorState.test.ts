import { describe, expect, it } from "vitest";
import type { TaskTypeRubricResponse } from "@pte/api-client";
import { initialSimulatorState, scoreGuideExample, simulationReady, selectSimulatorTrait, simulationRequest } from "../../../../features/scoringsimulator/simulatorState";

const rubric: TaskTypeRubricResponse = {
  taskType: "WRITE_ESSAY", skills: ["WRITING"], versionPublicId: "version-1", versionNo: 1,
  catalogVersion: 1, gates: [], formBands: [{ minWords: 200, maxWords: 300, band: 2 }], objectiveRule: null, azureMapping: null,
  traits: ["CONTENT", "FORM", "GRAMMAR"].map((key) => ({ key, displayNameVi: key, displayNameEn: key,
    maxScore: key === "CONTENT" ? 6 : 2, perWord: false, source: "AI_LLM", weight: 2, levels: [] })),
};

describe("simulator input serialization", () => {
  it("sends exactly the chosen version and trait inputs without a client Form score", () => {
    const state = initialSimulatorState(rubric);
    state.traitScores.CONTENT = 4;
    expect(simulationRequest(rubric, state)).toEqual({ taskType: "WRITE_ESSAY", rubricVersionPublicId: "version-1",
      traitScores: { CONTENT: 4, GRAMMAR: 0 }, textMetrics: state.textMetrics });
  });
  it("Guide example contains inputs within API scales", () => {
    const state = scoreGuideExample(rubric);
    expect(state.textMetrics.wordCount).toBe(150);
    for (const trait of rubric.traits.filter((entry) => entry.key !== "FORM")) {
      expect(state.traitScores[trait.key]).toBeLessThanOrEqual(trait.maxScore ?? 0);
    }
    expect(state.traitScores).not.toHaveProperty("FORM");
  });
  it("only includes N for a per-word trait", () => {
    const ra = { ...rubric, taskType: "READ_ALOUD", formBands: null,
      traits: rubric.traits.filter((entry) => entry.key === "CONTENT").map((entry) => ({ ...entry, perWord: true, maxScore: null })) };
    const state = initialSimulatorState(ra);
    expect(simulationRequest(ra, state)).toEqual({ taskType: "READ_ALOUD", rubricVersionPublicId: "version-1", traitScores: { CONTENT: 0 }, wordCount: 60 });
  });
  it("does not treat untouched zero defaults as an intentional selection", () => {
    const state = initialSimulatorState(rubric);
    expect(simulationReady(rubric, state)).toBe(false);
    const content = selectSimulatorTrait(state, "CONTENT", 0);
    expect(simulationReady(rubric, content)).toBe(false);
    const complete = selectSimulatorTrait(content, "GRAMMAR", 0);
    expect(simulationReady(rubric, complete)).toBe(true);
    expect(simulationRequest(rubric, complete).traitScores).toEqual({ CONTENT: 0, GRAMMAR: 0 });
  });
  it("loads complete sample inputs and blocks cleared, fractional and out-of-scale numbers", () => {
    const state = scoreGuideExample(rubric);
    expect(simulationReady(rubric, state)).toBe(true);
    for (const invalid of [Number.NaN, -1, 1.5, 7]) {
      expect(simulationReady(rubric, selectSimulatorTrait(state, "CONTENT", invalid))).toBe(false);
    }
    expect(simulationReady(rubric, { ...state, textMetrics: { ...state.textMetrics, wordCount: Number.NaN } })).toBe(false);
  });
});
