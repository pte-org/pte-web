import { describe, expect, it } from "vitest";
import { CREATE_EXAM_WIZARD_ERRORS } from "../../../../../features/exams/constants";
import { createEmptyExamWorkflow, filterWorkflowErrors, getCreateExamStepFields } from "../../../../../features/exams/utils/createExamWizard";
import { validateCreateExamWorkflow } from "../../../../../features/exams/utils/validateCreateExamWorkflow";

describe("exam capacity validation", () => {
  it("rejects capacity over the selected plan without changing input values", () => {
    const form = { ...createEmptyExamWorkflow("template"), name: "Exam 01", subscriptionPublicId: "plan", capacity: "101" };
    const before = structuredClone(form);
    const errors = validateCreateExamWorkflow(form, 0, false, false, 100);
    expect(errors.capacity).toBe(CREATE_EXAM_WIZARD_ERRORS.CAPACITY_EXCEEDS_PLAN);
    expect(form).toEqual(before);
    expect(filterWorkflowErrors(errors, getCreateExamStepFields(1)).capacity).toBe(errors.capacity);
  });

  it("accepts the limit and rechecks against a smaller plan", () => {
    const form = { ...createEmptyExamWorkflow(), capacity: "100" };
    expect(validateCreateExamWorkflow(form, 0, false, false, 100).capacity).toBeUndefined();
    expect(validateCreateExamWorkflow(form, 0, false, false, 50).capacity).toBe(CREATE_EXAM_WIZARD_ERRORS.CAPACITY_EXCEEDS_PLAN);
  });

  it("rejects an audience larger than the exam capacity at the audience step", () => {
    const form = { ...createEmptyExamWorkflow(), capacity: "1", sources: [
      { sourceType: "STUDENT" as const, sourcePublicId: "student-1" },
      { sourceType: "STUDENT" as const, sourcePublicId: "student-2" },
    ] };
    const errors = validateCreateExamWorkflow(form, 0, true, false, 100);
    expect(filterWorkflowErrors(errors, getCreateExamStepFields(3)).sources).toBe(CREATE_EXAM_WIZARD_ERRORS.AUDIENCE_EXCEEDS_CAPACITY);
  });
});
