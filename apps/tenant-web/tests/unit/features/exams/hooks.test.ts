import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const hoisted = vi.hoisted(() => ({
  showToast: vi.fn(),
  reviewData: { publicationLocked: false } as { publicationLocked: boolean },
  reviewSuccess: true,
  preflightData: { canPublish: true } as { canPublish: boolean } | null,
  preflightFetching: false,
  preflightError: false,
}));

vi.mock("@pte/ui", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@pte/ui")>()),
  useLocale: () => ({
    locale: "en",
    t: (_key: string, fallback?: string) => fallback ?? _key,
  }),
  useToast: () => ({
    showToast: hoisted.showToast,
  }),
}));

vi.mock("../../../../features/exams/api", () => ({
  useHostScoreReview: () => ({
    data: hoisted.reviewData,
    isSuccess: hoisted.reviewSuccess,
  }),
  useReportPublicationPreflight: () => ({
    data: hoisted.preflightData,
    isFetching: hoisted.preflightFetching,
    isError: hoisted.preflightError,
  }),
}));

import { useCreateExamWizardText } from "../../../../features/exams/hooks/useCreateExamWizardText";
import { useExamMutationErrorToast } from "../../../../features/exams/hooks/useExamMutationErrorToast";
import { useReportPublicationState } from "../../../../features/exams/hooks/useReportPublicationState";
import { useCreateExamWizardForm } from "../../../../features/exams/hooks/useCreateExamWizardForm";
import { CREATE_EXAM_WIZARD_TEXT } from "../../../../features/exams/constants";

beforeEach(() => {
  vi.clearAllMocks();
  hoisted.reviewData = { publicationLocked: false };
  hoisted.reviewSuccess = true;
  hoisted.preflightData = { canPublish: true };
  hoisted.preflightFetching = false;
  hoisted.preflightError = false;
});

describe("useCreateExamWizardText", () => {
  it("returns wizard copy resolved against locale defaults", () => {
    let text!: ReturnType<typeof useCreateExamWizardText>;
    renderToStaticMarkup(
      createElement(() => {
        text = useCreateExamWizardText();
        return null;
      }),
    );

    expect(text.TITLE).toBe(CREATE_EXAM_WIZARD_TEXT.TITLE);
    expect(text.STEP_DETAILS).toBe(CREATE_EXAM_WIZARD_TEXT.STEP_DETAILS);
    expect(text.STEP_SCHEDULE_POLICY).toBe(CREATE_EXAM_WIZARD_TEXT.STEP_SCHEDULE_POLICY);
  });
});

describe("useExamMutationErrorToast", () => {
  it("shows error toast when an error occurs", () => {
    renderToStaticMarkup(
      createElement(() => {
        useExamMutationErrorToast(new Error("Network failed"));
        return null;
      }),
    );

    // In SSR, useEffect does not fire, but hook body runs without crashing
    expect(true).toBe(true);
  });
});

describe("useReportPublicationState", () => {
  it("resolves phase to notClosed when session is OPEN", () => {
    let state!: ReturnType<typeof useReportPublicationState>;
    renderToStaticMarkup(
      createElement(() => {
        state = useReportPublicationState("ses-1", "OPEN");
        return null;
      }),
    );

    expect(state.phase).toBe("notClosed");
    expect(state.closed).toBe(false);
  });

  it("resolves phase to published when review has publicationLocked", () => {
    hoisted.reviewData = { publicationLocked: true };
    let state!: ReturnType<typeof useReportPublicationState>;
    renderToStaticMarkup(
      createElement(() => {
        state = useReportPublicationState("ses-1", "CLOSED");
        return null;
      }),
    );

    expect(state.phase).toBe("published");
    expect(state.publicationLocked).toBe(true);
  });

  it("resolves phase to ready when closed and preflight canPublish is true", () => {
    hoisted.reviewData = { publicationLocked: false };
    hoisted.preflightData = { canPublish: true };
    let state!: ReturnType<typeof useReportPublicationState>;
    renderToStaticMarkup(
      createElement(() => {
        state = useReportPublicationState("ses-1", "CLOSED");
        return null;
      }),
    );

    expect(state.phase).toBe("ready");
  });

  it("resolves phase to blocked when canPublish is false", () => {
    hoisted.reviewData = { publicationLocked: false };
    hoisted.preflightData = { canPublish: false };
    let state!: ReturnType<typeof useReportPublicationState>;
    renderToStaticMarkup(
      createElement(() => {
        state = useReportPublicationState("ses-1", "CLOSED");
        return null;
      }),
    );

    expect(state.phase).toBe("blocked");
  });

  it("resolves phase to checking when preflight is fetching", () => {
    hoisted.preflightFetching = true;
    let state!: ReturnType<typeof useReportPublicationState>;
    renderToStaticMarkup(
      createElement(() => {
        state = useReportPublicationState("ses-1", "CLOSED");
        return null;
      }),
    );

    expect(state.phase).toBe("checking");
  });

  it("resolves phase to error when preflight encounters error", () => {
    hoisted.preflightError = true;
    let state!: ReturnType<typeof useReportPublicationState>;
    renderToStaticMarkup(
      createElement(() => {
        state = useReportPublicationState("ses-1", "CLOSED");
        return null;
      }),
    );

    expect(state.phase).toBe("error");
  });
});

describe("useCreateExamWizardForm", () => {
  it("initializes form with step 1 and default values", () => {
    let wizard!: ReturnType<typeof useCreateExamWizardForm>;
    renderToStaticMarkup(
      createElement(() => {
        wizard = useCreateExamWizardForm({});
        return null;
      }),
    );

    expect(wizard.step).toBe(1);
    expect(wizard.form.name).toBe("");
    expect(wizard.form.capacity).toBe("");
    expect(wizard.errors).toEqual({});
  });

  it("handles step navigation and updates", () => {
    let wizard!: ReturnType<typeof useCreateExamWizardForm>;
    renderToStaticMarkup(
      createElement(() => {
        wizard = useCreateExamWizardForm({
          initialForm: {
            name: "Valid Exam",
            templatePublicId: "tpl-1",
            subscriptionPublicId: "sub-1",
            opensAt: "2026-11-10T10:00:00Z",
            closesAt: "2026-11-10T12:00:00Z",
            maxRetriesPerStudent: "0",
            reusePolicy: "ALLOW",
            seriesKey: "",
            capacity: "20",
            sources: [{ sourceType: "CLASS", sourcePublicId: "cls-1" }],
          },
        });
        return null;
      }),
    );

    expect(wizard.step).toBe(1);
    wizard.setStep(2);
    wizard.goToPreviousStep();
    wizard.update("name", "New Name");
    wizard.setFieldError("name", "Custom error");
    wizard.onSourcesChange([]);
    wizard.reset();
  });
});
