import { describe, expect, it } from "vitest";
import { ABOUT_PTE_GUIDE_EN } from "../../../../features/aboutPte/constants/aboutPteGuide.en";
import { ABOUT_PTE_GUIDE_VI } from "../../../../features/aboutPte/constants/aboutPteGuide.vi";
import { OFFICIAL_RULES } from "../../../../features/aboutPte/constants/officialScoring";
import { STANDARD_TASK_WEIGHTS } from "../../../../features/aboutPte/constants/scoringWeights";

describe("About PTE guide catalogs", () => {
  it("keeps both languages in step", () => {
    expect(ABOUT_PTE_GUIDE_VI.testDay.steps).toHaveLength(ABOUT_PTE_GUIDE_EN.testDay.steps.length);
    expect(ABOUT_PTE_GUIDE_VI.glossary.terms).toHaveLength(ABOUT_PTE_GUIDE_EN.glossary.terms.length);
    expect(ABOUT_PTE_GUIDE_VI.samples.describeImage.months).toHaveLength(ABOUT_PTE_GUIDE_EN.samples.describeImage.months.length);
  });

  it("gives every sample bar a month label", () => {
    // The sample chart draws four bars; a different number of labels would misalign them.
    expect(ABOUT_PTE_GUIDE_EN.samples.describeImage.months).toHaveLength(4);
  });

  it("only samples question types that exist", () => {
    const keys = STANDARD_TASK_WEIGHTS.map((task) => task.key);
    for (const key of ["READ_ALOUD", "DESCRIBE_IMAGE", "WRITE_FROM_DICTATION"]) {
      expect(keys).toContain(key);
      expect(OFFICIAL_RULES[key]).toBeDefined();
    }
  });
});
