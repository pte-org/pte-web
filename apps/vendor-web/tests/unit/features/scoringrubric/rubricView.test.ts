import { describe, expect, it } from "vitest";
import {
  countDistinctTaskTypes,
  findTemplateWeights,
  formatAchievedOfMax,
  formatMessage,
  formatRubricMaxTotal,
  groupTaskTypesBySkill,
  hasEnabledGate,
  resolveSelectedTemplate,
  traitDisplayName,
  uncalibratedLabel,
} from "../../../../features/scoringrubric/rubricView";
import { rubric, template, trait } from "./fixtures";

describe("groupTaskTypesBySkill", () => {
  const ra = rubric("READ_ALOUD", ["SPEAKING"]);
  const rs = rubric("REPEAT_SENTENCE", ["LISTENING", "SPEAKING"]);
  const we = rubric("WRITE_ESSAY", ["WRITING"]);
  const wfd = rubric("WRITE_FROM_DICTATION", ["LISTENING", "WRITING"]);

  it("lists every task type under each skill it counts toward, in skill order, keeping API order", () => {
    const groups = groupTaskTypesBySkill([ra, rs, we, wfd], "ALL");
    expect(groups.map((group) => group.skill)).toEqual(["SPEAKING", "WRITING", "LISTENING"]);
    expect(groups[0].taskTypes.map((item) => item.taskType)).toEqual(["READ_ALOUD", "REPEAT_SENTENCE"]);
    expect(groups[1].taskTypes.map((item) => item.taskType)).toEqual(["WRITE_ESSAY", "WRITE_FROM_DICTATION"]);
    expect(groups[2].taskTypes.map((item) => item.taskType)).toEqual([
      "REPEAT_SENTENCE",
      "WRITE_FROM_DICTATION",
    ]);
  });

  it("keeps only the filtered skill", () => {
    const groups = groupTaskTypesBySkill([ra, rs, we, wfd], "LISTENING");
    expect(groups).toHaveLength(1);
    expect(groups[0].taskTypes).toHaveLength(2);
  });

  it("counts distinct task types, not group rows", () => {
    expect(countDistinctTaskTypes([ra, rs, we, wfd, rs])).toBe(4);
  });
});

describe("gates and totals", () => {
  it("reports a gate only when at least one gate trait is enabled", () => {
    expect(hasEnabledGate(rubric("X", ["WRITING"], { gates: [] }))).toBe(false);
    expect(
      hasEnabledGate(rubric("X", ["WRITING"], { gates: [{ traitKey: "CONTENT", enabled: false }] })),
    ).toBe(false);
    expect(
      hasEnabledGate(rubric("X", ["WRITING"], { gates: [{ traitKey: "CONTENT", enabled: true }] })),
    ).toBe(true);
  });

  it("sums the declared maxima and names a per-word scale instead of inventing a number", () => {
    expect(formatRubricMaxTotal([trait("CONTENT", 6), trait("FORM", 2), trait("GRAMMAR", 2)], "N")).toBe("10");
    expect(
      formatRubricMaxTotal([trait("CONTENT", null, true), trait("PRONUNCIATION", 5), trait("ORAL_FLUENCY", 5)], "N"),
    ).toBe("N + 10");
    expect(formatRubricMaxTotal([trait("CONTENT", null, true)], "N")).toBe("N");
    expect(formatRubricMaxTotal([], "N")).toBeNull();
  });

  it("formats achieved over maximum", () => {
    expect(formatAchievedOfMax(3, 5)).toBe("3/5");
    expect(formatAchievedOfMax(0, "N")).toBe("0/N");
  });
});

describe("template weights", () => {
  const items = [
    { taskTypeKey: "READ_ALOUD", speakingWeight: 8.91, overallWeight: 2.23 },
    { taskTypeKey: "REPEAT_SENTENCE", speakingWeight: 15.84, listeningWeight: 16.83, overallWeight: 8.17 },
  ];

  it("takes the stored weights of the matching template item as they are", () => {
    expect(findTemplateWeights(template("t1", "ACTIVE", items), "REPEAT_SENTENCE")).toEqual({
      overall: 8.17,
      speaking: 15.84,
      writing: 0,
      reading: 0,
      listening: 16.83,
    });
  });

  it("returns null when the template does not include the task type", () => {
    expect(findTemplateWeights(template("t1", "ACTIVE", items), "WRITE_ESSAY")).toBeNull();
  });

  it("defaults to the ACTIVE template, honours an explicit choice and allows choosing none", () => {
    const templates = [template("draft", "DRAFT"), template("active", "ACTIVE"), template("old", "RETIRED")];
    expect(resolveSelectedTemplate(templates, undefined)?.publicId).toBe("active");
    expect(resolveSelectedTemplate(templates, "old")?.publicId).toBe("old");
    expect(resolveSelectedTemplate(templates, "")).toBeNull();
    expect(resolveSelectedTemplate(templates, "missing")).toBeNull();
    expect(resolveSelectedTemplate([template("draft", "DRAFT")], undefined)).toBeNull();
  });
});

describe("labels", () => {
  it("shows the API's uncalibrated label, falls back when it is blank, and shows nothing when calibrated", () => {
    expect(uncalibratedLabel({ calibrated: false, label: "chưa hiệu chỉnh với dữ liệu người chấm" }, "fb")).toBe(
      "chưa hiệu chỉnh với dữ liệu người chấm",
    );
    expect(uncalibratedLabel({ calibrated: false, label: "  " }, "fallback")).toBe("fallback");
    expect(uncalibratedLabel({ calibrated: false, label: null }, "fallback")).toBe("fallback");
    expect(uncalibratedLabel({ calibrated: true, label: null }, "fallback")).toBeNull();
    expect(uncalibratedLabel(null, "fallback")).toBeNull();
  });

  it("picks the trait name for the locale", () => {
    const content = trait("CONTENT", 6);
    expect(traitDisplayName(content, "vi")).toBe("CONTENT vi");
    expect(traitDisplayName(content, "en")).toBe("CONTENT en");
  });

  it("fills placeholders and leaves unknown ones visible", () => {
    expect(formatMessage("{a} of {b} ({c})", { a: 1, b: "x" })).toBe("1 of x ({c})");
  });
});
