import type { RubricSimulationRequest, TaskTypeRubricResponse } from "@pte/api-client";
import { SIMULATOR_CONFIG } from "./constants";
import type { SimulatorState } from "./types";

export function initialSimulatorState(rubric: TaskTypeRubricResponse): SimulatorState {
  return {
    traitScores: Object.fromEntries(rubric.traits.filter((trait) => trait.key !== SIMULATOR_CONFIG.formKey)
      .map((trait) => [trait.key, 0])),
    wordCount: SIMULATOR_CONFIG.initialWordCount,
    textMetrics: { wordCount: SIMULATOR_CONFIG.initialWordCount, sentenceCount: 1,
      allCaps: false, punctuationPresent: true, bulletOnly: false },
  };
}

/** Only input data from the Guide; bounds are checked against the viewed API catalog. No scoring formula. */
export function scoreGuideExample(rubric: TaskTypeRubricResponse): SimulatorState {
  const state = initialSimulatorState(rubric);
  const candidates: Record<string, number> = { CONTENT: 4, PRONUNCIATION: 3, ORAL_FLUENCY: 4,
    DEVELOPMENT_STRUCTURE_COHERENCE: 4, GRAMMAR: 1, GENERAL_LINGUISTIC_RANGE: 4,
    VOCABULARY_RANGE: 1, VOCABULARY: 1, SPELLING: 1 };
  for (const trait of rubric.traits) {
    if (trait.key === SIMULATOR_CONFIG.formKey) continue;
    const value = candidates[trait.key] ?? 0;
    const maximum = trait.perWord ? state.wordCount : trait.maxScore ?? 0;
    state.traitScores[trait.key] = value <= maximum ? value : maximum;
  }
  if (rubric.taskType === "WRITE_ESSAY") state.textMetrics.wordCount = 150;
  return state;
}

export function simulationRequest(rubric: TaskTypeRubricResponse, state: SimulatorState): RubricSimulationRequest {
  return {
    taskType: rubric.taskType, rubricVersionPublicId: rubric.versionPublicId,
    traitScores: { ...state.traitScores },
    ...(rubric.formBands ? { textMetrics: { ...state.textMetrics } } : {}),
    ...(rubric.traits.some((trait) => trait.perWord) ? { wordCount: state.wordCount } : {}),
  };
}
