import { expect, it } from "vitest";
import { versionActions, canConfirmActivation, parametersFromRubrics, parametersLookValid } from "../../../../features/scoringrubric/versionEditing";
import { rubric, trait } from "./fixtures";
import { RUBRIC_EDIT_TEXT } from "../../../../features/scoringrubric/versionConstants";

it("staff can submit drafts but cannot activate", () => {
  expect(versionActions("DRAFT", ["ACADEMIC_STAFF"], false)).toEqual({ edit: true, submit: true, activate: false, reject: false, discard: true });
});
it("manager cannot self-approve a pending submission, while admin can", () => {
  expect(versionActions("PENDING", ["ACADEMIC_MANAGER"], true).activate).toBe(false);
  expect(versionActions("PENDING", ["PLATFORM_ADMIN"], true).activate).toBe(true);
});
it("activation confirmation always requires a loaded digest and an explicit check", () => {
  expect(canConfirmActivation(false, "digest", false)).toBe(false);
  expect(canConfirmActivation(true, null, false)).toBe(false);
  expect(canConfirmActivation(true, "digest", true)).toBe(false);
  expect(canConfirmActivation(true, "digest", false)).toBe(true);
});

const essay = rubric("WRITE_ESSAY", ["WRITING"], { traits: [trait("CONTENT", 6), trait("FORM", 2)],
  gates: [{ traitKey: "CONTENT", enabled: true }, { traitKey: "FORM", enabled: true }],
  formBands: [{ minWords: 120, maxWords: 199, band: 1 }, { minWords: 200, maxWords: 300, band: 2 }] });
const ra = rubric("READ_ALOUD", ["SPEAKING"], { traits: [trait("CONTENT", null, true, { weight: 2 }), trait("PRONUNCIATION", 5)],
  azureMapping: { version: "1", calibrated: false, label: "uncalibrated", pronunciationInput: null, oralFluencyInput: null,
    pronunciationBands: [], oralFluencyBands: [] } });

it("serializes full API values with fixed scales and no descriptors or prompts", () => {
  const document = parametersFromRubrics([essay, ra]);
  expect(document.azureBandMappingVersion).toBe(1);
  expect(document.taskTypes.READ_ALOUD.traitWeights.CONTENT).toBe(2);
  expect(document.taskTypes.READ_ALOUD.traitScales.CONTENT).toBe("PER_WORD");
  expect(document.taskTypes.WRITE_ESSAY.formBands).toEqual(essay.formBands);
  expect(document.taskTypes.WRITE_ESSAY.formBands).not.toBe(essay.formBands);
  expect(JSON.stringify(document)).not.toContain("displayName");
  expect(parametersLookValid(document, [essay, ra])).toBe(true);
});

it.each(["GATE_ZERO", "FRACTION", "OUT_OF_RANGE", "OVERLAP", "NO_MAX", "ALL_ZERO"])("gives early editor feedback for %s", (kind) => {
  const document = parametersFromRubrics([essay, ra]);
  const task = document.taskTypes.WRITE_ESSAY;
  if (kind === "GATE_ZERO") { task.traitWeights.CONTENT = 0; task.gateEnabled.CONTENT = false; }
  if (kind === "FRACTION") task.traitWeights.CONTENT = 1.5;
  if (kind === "OUT_OF_RANGE") task.traitWeights.CONTENT = 11;
  if (kind === "OVERLAP" && task.formBands) task.formBands[0].maxWords = 250;
  if (kind === "NO_MAX" && task.formBands) task.formBands[1].band = 1;
  if (kind === "ALL_ZERO") document.taskTypes.READ_ALOUD.traitWeights = { CONTENT: 0, PRONUNCIATION: 0 };
  expect(parametersLookValid(document, [essay, ra])).toBe(false);
});

it.each(["ACTIVE", "RETIRED"])("%s has no editing actions", (status) => {
  expect(Object.values(versionActions(status, ["PLATFORM_ADMIN"], true))).toEqual([false, false, false, false, false]);
});
it("keeps editor copy translated", () => {
  expect(Object.keys(RUBRIC_EDIT_TEXT.vi)).toEqual(Object.keys(RUBRIC_EDIT_TEXT.en));
});
