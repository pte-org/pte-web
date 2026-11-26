import { describe, expect, it } from "vitest";
import type { RubricTaskParameters, TaskTypeRubricResponse } from "@pte/api-client";
import { matchesPearson, resetToPearson, weightShare, weightTotal } from "../../../../features/scoringrubric/traitWeights";

const trait = (key: string, defaultWeight?: number) =>
  ({ key, defaultWeight }) as unknown as TaskTypeRubricResponse["traits"][number];

const rubric = {
  traits: [trait("CONTENT", 3), trait("PRONUNCIATION", 5), trait("FLUENCY", 5)],
} as unknown as TaskTypeRubricResponse;

const value = (weights: Record<string, number>): RubricTaskParameters => ({
  traitWeights: weights,
  traitScales: {},
  formBands: null,
  gateEnabled: { CONTENT: true },
});

describe("trait weights", () => {
  it("totals the weights and gives each trait its share with one decimal", () => {
    const parameters = value({ CONTENT: 3, PRONUNCIATION: 5, FLUENCY: 5 });
    expect(weightTotal(parameters)).toBe(13);
    expect(weightShare(3, 13)).toBe(23.1);
    expect(weightShare(5, 13)).toBe(38.5);
    expect(weightShare(0, 0)).toBeNull();
  });

  it("matches Pearson only while every referenced trait carries its reference weight", () => {
    expect(matchesPearson(rubric, value({ CONTENT: 3, PRONUNCIATION: 5, FLUENCY: 5 }))).toBe(true);
    expect(matchesPearson(rubric, value({ CONTENT: 4, PRONUNCIATION: 5, FLUENCY: 5 }))).toBe(false);
  });

  it("ignores a trait that has no reference weight", () => {
    const withPerWord = { traits: [trait("CONTENT", 3), trait("FORM")] } as unknown as TaskTypeRubricResponse;
    expect(matchesPearson(withPerWord, value({ CONTENT: 3, FORM: 9 }))).toBe(true);
  });

  it("resets the weights to Pearson and leaves the gates and the traits without a reference alone", () => {
    const withPerWord = { traits: [trait("CONTENT", 3), trait("FORM")] } as unknown as TaskTypeRubricResponse;
    const reset = resetToPearson(withPerWord, value({ CONTENT: 8, FORM: 9 }));
    expect(reset.traitWeights).toEqual({ CONTENT: 3, FORM: 9 });
    expect(reset.gateEnabled).toEqual({ CONTENT: true });
  });
});
