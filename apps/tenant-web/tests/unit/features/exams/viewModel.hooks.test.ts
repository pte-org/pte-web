import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ScoreTemplateResponse } from "@pte/api-client";
import { ExamPreflightBlockedError } from "@/features/exams/utils/examPreflight";

const hoisted = vi.hoisted(() => ({
  showToast: vi.fn(),
  subscriptions: [{ publicId: "sub-1", status: "ACTIVE", planPublicId: "plan-1" }],
  plans: [{ publicId: "plan-1", name: "Basic" }],
}));

vi.mock("@pte/ui", () => ({
  useLocale: () => ({
    t: (_k: string, fb?: string) => fb ?? _k,
    locale: "en",
  }),
  useToast: () => ({ showToast: hoisted.showToast }),
}));

vi.mock("@/features/commercialization/api", () => ({
  useSubscriptionsQuery: () => ({ data: hoisted.subscriptions, isLoading: false }),
  useTenantPlansQuery: () => ({ data: hoisted.plans }),
}));
vi.mock("@/features/classes/api", () => ({
  useAllTenantClasses: () => ({ data: [], isLoading: false }),
}));
vi.mock("@/features/examoperations/api", () => ({
  useTenantStudents: () => ({ data: [], isLoading: false }),
}));
vi.mock("@/features/programs/api", () => ({
  useMyOrganizations: () => ({ data: [] }),
  usePrograms: () => ({ data: [], isLoading: false }),
}));
vi.mock("@/features/studentSearch/api", () => ({
  useClassMemberships: () => ({ data: [], isLoading: false }),
}));

import { useCreateExamWizardViewModel } from "@/features/exams/hooks/useCreateExamWizardViewModel";

const sampleTemplate: ScoreTemplateResponse = {
  publicId: "tpl-1",
  name: "Mock PTE Test",
  items: [
    { type: "SPEAKING_READ_ALOUD", score: 10 },
    { type: "WRITING_SUMMARIZE_WRITTEN", score: 10 },
  ],
} as unknown as ScoreTemplateResponse;

describe("useCreateExamWizardViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes wizard view model with step labels and step props", () => {
    let vm!: ReturnType<typeof useCreateExamWizardViewModel>;

    renderToStaticMarkup(createElement(() => {
      vm = useCreateExamWizardViewModel({
        open: true,
        activeTemplate: sampleTemplate,
        templates: [sampleTemplate],
      });
      return null;
    }));

    expect(vm.step).toBe(1);
    expect(vm.stepLabels).toHaveLength(4);
    expect(vm.stepLabels.map((s) => s.id)).toEqual(["details", "schedule", "audience", "review"]);
    expect(vm.detailsStepProps).toBeDefined();
    expect(vm.scheduleStepProps).toBeDefined();
    expect(vm.audienceStepProps).toBeDefined();
    expect(vm.reviewStepProps).toBeDefined();
    expect(vm.submitMessage).toBeUndefined();

    // Verify navigation methods
    expect(() => {
      vm.goToNextStep();
      vm.goToPreviousStep();
      vm.validate();
    }).not.toThrow();
  });

  it("handles template error", () => {
    let vm!: ReturnType<typeof useCreateExamWizardViewModel>;

    renderToStaticMarkup(createElement(() => {
      vm = useCreateExamWizardViewModel({
        open: true,
        templates: [],
        templateError: new Error("Failed to load templates"),
      });
      return null;
    }));

    expect(vm.detailsStepProps.templateMessage).toBeDefined();
  });

  it("formats PreflightBlockedError as submitMessage", () => {
    let vm!: ReturnType<typeof useCreateExamWizardViewModel>;
    const preflightError = new ExamPreflightBlockedError(
      ["SUBSCRIPTION_EXHAUSTED"],
      [{ taskType: "READ_ALOUD", required: 5, available: 2 } as unknown as import("@pte/api-client").ScoreTemplateSlotFeasibilityResponse],
      [],
    );

    renderToStaticMarkup(createElement(() => {
      vm = useCreateExamWizardViewModel({
        open: true,
        activeTemplate: sampleTemplate,
        error: preflightError,
      });
      return null;
    }));

    expect(vm.submitMessage).toBeDefined();
    expect(vm.submitMessage).toContain("READ_ALOUD");
  });
});
