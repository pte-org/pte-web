import { createElement, type ReactElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ExaminerAnswerDetailResponse, ExaminerWorkflowView } from "@pte/api-client";
import type { DraftEntry } from "@/features/examiner/submissionTypes";

const hoisted = vi.hoisted(() => ({
  apiClient: { request: "stub" },
  saveExaminerDraft: vi.fn(),
  finalizeExaminerWork: vi.fn(),
}));

vi.mock("@/lib/apiClient", () => ({ apiClient: hoisted.apiClient }));
vi.mock("@pte/api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@pte/api-client")>();
  return {
    ...actual,
    saveExaminerDraft: hoisted.saveExaminerDraft,
    finalizeExaminerWork: hoisted.finalizeExaminerWork,
  };
});

import { useExaminerDraftState } from "@/features/examiner/useExaminerDraftState";
import { useExaminerSubmissionActions } from "@/features/examiner/useExaminerSubmissionActions";
import { useExaminerSubmissions } from "@/features/examiner/useExaminerSubmissions";

/** The submission hooks read the query client (trait drafts refresh the attempt), so every render needs a provider. */
const renderWithClient = (element: ReactElement): string =>
  renderToStaticMarkup(createElement(QueryClientProvider, { client: new QueryClient() }, element));

const sampleAnswer: ExaminerAnswerDetailResponse = {
  answerPublicId: "ans-1",
  questionPublicId: "q-1",
  reviewVersion: 2,
  myScore: 80,
  maxScore: 90,
  aiReference: { version: "v1", score: 85, explanation: "Good" },
  decision: { decisionKind: "MANUAL", kind: "MANUAL" },
} as unknown as ExaminerAnswerDetailResponse;

const sampleWorkflow: ExaminerWorkflowView = {
  workVersion: 1,
  drafts: [],
} as unknown as ExaminerWorkflowView;

describe("features/examiner - Submission Hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useExaminerDraftState", () => {
    it("initializes activeDraft from currentAnswer fallback", () => {
      let state!: ReturnType<typeof useExaminerDraftState>;
      renderWithClient(
        createElement(() => {
          state = useExaminerDraftState({
            currentAnswer: sampleAnswer,
            workflow: sampleWorkflow,
          });
          return null;
        }),
      );

      expect(state.activeDraft).not.toBeNull();
      expect(state.activeDraft?.score).toBe("80");
      expect(state.activeDraft?.comment).toBe("");
      expect(state.hasUnsaved).toBe(false);
      expect(state.isStale).toBe(false);

      // Verify draft mutation triggers
      expect(() => {
        state.handleScoreChange("85");
        state.handleCommentChange("Updated comment");
        state.handleApplyAiScore(85, "v1");
        state.handleAcknowledgeStale();
      }).not.toThrow();
    });

    it("handles null currentAnswer cleanly", () => {
      let state!: ReturnType<typeof useExaminerDraftState>;
      renderWithClient(
        createElement(() => {
          state = useExaminerDraftState({ currentAnswer: null });
          return null;
        }),
      );

      expect(state.activeDraft).toBeNull();
      expect(state.hasUnsaved).toBe(false);
    });
  });

  describe("useExaminerSubmissionActions", () => {
    it("handles save draft validation and API call", async () => {
      hoisted.saveExaminerDraft.mockResolvedValue({
        draft: { draftVersion: 2, savedAt: "2026-05-01T11:00:00Z" },
      });

      let draftState!: ReturnType<typeof useExaminerDraftState>;
      let actions!: ReturnType<typeof useExaminerSubmissionActions>;
      const refetchAttempt = vi.fn().mockResolvedValue(undefined);

      renderWithClient(
        createElement(() => {
          draftState = useExaminerDraftState({
            currentAnswer: sampleAnswer,
            workflow: sampleWorkflow,
          });
          actions = useExaminerSubmissionActions({
            answers: [sampleAnswer],
            currentAnswer: sampleAnswer,
            workflow: sampleWorkflow,
            sessionPublicId: "sess-1",
            attemptPublicId: "att-1",
            refetchAttempt,
            draftState,
          });
          return null;
        }),
      );

      // Mock drafts entry
      draftState.drafts["ans-1"] = {
        score: "105",
        comment: "Too high",
        decisionKind: "MANUAL",
        draftVersion: 1,
        initialReviewVersion: "2",
        isDirty: true,
        reviewedAiVersion: null,
        savedAt: null,
      } as DraftEntry;

      // Invalid score (> 100) returns false
      const invalidResult = await actions.handleSaveDraft();
      expect(invalidResult).toBe(false);

      // Valid score saves draft
      draftState.drafts["ans-1"].score = "85";
      const validResult = await actions.handleSaveDraft();
      expect(validResult).toBe(true);
      expect(hoisted.saveExaminerDraft).toHaveBeenCalled();
    });

    it("handles finalize attempt and calls refetch", async () => {
      hoisted.finalizeExaminerWork.mockResolvedValue({});
      let draftState!: ReturnType<typeof useExaminerDraftState>;
      let actions!: ReturnType<typeof useExaminerSubmissionActions>;
      const refetchAttempt = vi.fn().mockResolvedValue(undefined);

      renderWithClient(
        createElement(() => {
          draftState = useExaminerDraftState({
            currentAnswer: sampleAnswer,
            workflow: sampleWorkflow,
          });
          actions = useExaminerSubmissionActions({
            answers: [sampleAnswer],
            currentAnswer: sampleAnswer,
            workflow: sampleWorkflow,
            sessionPublicId: "sess-1",
            attemptPublicId: "att-1",
            refetchAttempt,
            draftState,
          });
          return null;
        }),
      );

      const finalizeResult = await actions.handleFinalizeAttempt();
      expect(finalizeResult).toBe(true);
      expect(hoisted.finalizeExaminerWork).toHaveBeenCalled();
      expect(refetchAttempt).toHaveBeenCalled();
    });
  });

  describe("useExaminerSubmissions", () => {
    it("aggregates draft state and actions", () => {
      let combined!: ReturnType<typeof useExaminerSubmissions>;

      renderWithClient(
        createElement(() => {
          combined = useExaminerSubmissions({
            answers: [sampleAnswer],
            currentAnswer: sampleAnswer,
            workflow: sampleWorkflow,
            sessionPublicId: "sess-1",
            attemptPublicId: "att-1",
            refetchAttempt: vi.fn(),
          });
          return null;
        }),
      );

      expect(combined.activeDraft).toBeDefined();
      expect(combined.isSavingDraft).toBe(false);
      expect(combined.isFinalizing).toBe(false);
      expect(typeof combined.handleSaveDraft).toBe("function");
      expect(typeof combined.handleFinalizeAttempt).toBe("function");
    });
  });
});
