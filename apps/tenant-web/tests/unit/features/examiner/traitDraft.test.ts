import { describe, expect, it } from "vitest";
import type { ExaminerRubricResponse } from "@pte/api-client";
import { traitRequest, aiTraitDraft, sameDraftInput, applySavedDraft } from "../../../../features/examiner/traitDraft";
const rubric: ExaminerRubricResponse = { rubricVersionPublicId: "v1", taskType: "DESCRIBE_IMAGE", mechanicalScores: {}, traits: [
  { key: "DI_CONTENT", displayNameVi: "Nội dung", displayNameEn: "Content", maxScore: 6, source: "AI_LLM", editable: true, useAiWhenNull: false, levels: [] },
  { key: "PRONUNCIATION", displayNameVi: "Phát âm", displayNameEn: "Pronunciation", maxScore: 5, source: "AZURE", editable: true, useAiWhenNull: true, levels: [] },
  { key: "FORM", displayNameVi: "Hình thức", displayNameEn: "Form", maxScore: 2, source: "MECHANICAL", editable: false, useAiWhenNull: false, levels: [] },
] };
describe("examiner trait request boundary", () => {
  it("omits Form, sends an Azure band the examiner chose and null (machine band) when left blank", () => {
    expect(traitRequest(rubric, { DI_CONTENT: 0, FORM: 2, PRONUNCIATION: 5 })).toEqual({ DI_CONTENT: 0, PRONUNCIATION: 5 });
    expect(traitRequest(rubric, { DI_CONTENT: 0 })).toEqual({ DI_CONTENT: 0, PRONUNCIATION: null });
    expect(traitRequest(rubric, { DI_CONTENT: 0, PRONUNCIATION: 6 })).toBeNull();
  });
  const invalidInputs: Record<string, number | null>[] = [{}, { DI_CONTENT: null }, { DI_CONTENT: 1.5 }, { DI_CONTENT: -1 }, { DI_CONTENT: 7 }];
  it.each(invalidInputs)("blocks incomplete or invalid human traits %s", (values) => {
    expect(traitRequest(rubric, values)).toBeNull();
  });
  it("uses the machine's human traits only with the same pinned version", () => {
    const ai = { availability: "AVAILABLE" as const, score: 60, version: "ai1", rubricVersionPublicId: "v1", traitScores: { DI_CONTENT: 4, PRONUNCIATION: 3, FORM: 2 } };
    expect(aiTraitDraft(rubric, ai)).toEqual({ DI_CONTENT: 4, PRONUNCIATION: 3 });
    expect(aiTraitDraft(rubric, { ...ai, rubricVersionPublicId: "v2" })).toBeNull();
    expect(aiTraitDraft(rubric, { ...ai, availability: "FAILED" })).toBeNull();
  });
  it("detects edits during an in-flight save, including traits and decision kind", () => {
    const a = { score: "", decisionKind: "MANUAL", traitScores: { DI_CONTENT: 4 } };
    expect(sameDraftInput(a, { ...a, traitScores: { DI_CONTENT: 3 } })).toBe(false);
    expect(sameDraftInput(a, { ...a, decisionKind: "CONFIRM_AI" })).toBe(false);
    expect(sameDraftInput(a, { ...a })).toBe(true);
  });
});
describe("server item score from the draft-save response", () => {
  const sent = { score: "", decisionKind: "MANUAL" as const, traitScores: { DI_CONTENT: 0 }, reviewedAiVersion: null,
    initialReviewVersion: "rv", draftVersion: 1, isDirty: true };
  const trace = { itemScore: 0, rawPercent: 0, gateTriggeredBy: "DI_CONTENT", contributions: [] };
  const response = { itemScore: 0, scoreTrace: trace, draft: { draftVersion: 2, savedAt: "2026-11-05T00:00:00Z" } };
  it("shows exactly the backend score and trace when nothing changed while saving", () => {
    const next = applySavedDraft(sent, sent, response);
    expect(next).toMatchObject({ itemScore: 0, scoreTrace: trace, draftVersion: 2, isDirty: false });
  });
  it("drops a stale server score when the examiner changed a trait in flight", () => {
    const next = applySavedDraft({ ...sent, traitScores: { DI_CONTENT: 3 } }, sent, response);
    expect(next).toMatchObject({ itemScore: null, scoreTrace: null, isDirty: true, draftVersion: 2 });
  });
});
