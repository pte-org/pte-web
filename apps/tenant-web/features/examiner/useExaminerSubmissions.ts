"use client";

import { useEffect, useState } from "react";
import {
  ApiError,
  type ExaminerAnswerDetailResponse,
  type ExaminerDecisionKind,
  type SubmitExaminerScoreRequest,
} from "@pte/api-client";
import type { useSubmitExaminerScore } from "./api";

export interface DraftEntry {
  score: string;
  comment?: string;
  decisionKind: ExaminerDecisionKind;
  reviewedAiVersion: string | null;
  initialReviewVersion: string | null;
  draftVersion?: number;
  savedAt?: string | null;
  isDirty?: boolean;
}

export interface RetainedSubmission {
  payload: SubmitExaminerScoreRequest;
  submittedAt: number;
}

interface UseExaminerSubmissionsParams {
  answers: ExaminerAnswerDetailResponse[];
  currentAnswer: ExaminerAnswerDetailResponse | null;
  workflow?: import("@pte/api-client").ExaminerWorkflowView | null;
  sessionPublicId: string;
  attemptPublicId: string;
  refetchAttempt: () => Promise<unknown>;
  submitMutation: ReturnType<typeof useSubmitExaminerScore>;
}

function isStaleReviewVersionError(err: unknown): boolean {
  if (err instanceof ApiError) {
    return (
      err.status === 409 &&
      (err.code === "STALE_REVIEW_VERSION" || err.message?.includes("STALE_REVIEW_VERSION"))
    );
  }
  if (typeof err === "object" && err !== null) {
    const e = err as { status?: number; code?: string; message?: string };
    return (
      e.status === 409 &&
      (e.code === "STALE_REVIEW_VERSION" ||
        (typeof e.message === "string" && e.message.includes("STALE_REVIEW_VERSION")))
    );
  }
  return false;
}

export const useExaminerSubmissions = ({
  answers,
  currentAnswer,
  workflow,
  sessionPublicId,
  attemptPublicId,
  refetchAttempt,
  submitMutation,
}: UseExaminerSubmissionsParams) => {
  const [drafts, setDrafts] = useState<Record<string, DraftEntry>>({});
  const [unresolvedSubmissions, setUnresolvedSubmissions] = useState<Record<string, RetainedSubmission>>({});
  const [submittingAnswerPublicId, setSubmittingAnswerPublicId] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  // Sync server drafts into local state
  const [prevServerDrafts, setPrevServerDrafts] = useState(workflow?.drafts);
  if (workflow?.drafts && workflow.drafts !== prevServerDrafts) {
    setPrevServerDrafts(workflow.drafts);
    setDrafts((prev) => {
      const next = { ...prev };
      for (const d of workflow.drafts) {
        if (!next[d.answerPublicId] || !next[d.answerPublicId].isDirty) {
          next[d.answerPublicId] = {
            score: d.score !== null ? String(d.score) : "",
            comment: d.comment ?? "",
            decisionKind: d.decisionKind ?? "MANUAL",
            reviewedAiVersion: d.reviewedAiVersion,
            initialReviewVersion: d.expectedReviewVersion,
            draftVersion: d.draftVersion,
            savedAt: d.savedAt,
            isDirty: false,
          };
        }
      }
      return next;
    });
  }

  const hasUnsaved =
    Object.values(drafts).some((d) => d.isDirty && d.score.trim() !== "") ||
    Object.keys(unresolvedSubmissions).length > 0;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
      if (hasUnsaved) e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsaved]);

  const [prevAnswers, setPrevAnswers] = useState(answers);
  if (answers && answers !== prevAnswers) {
    setPrevAnswers(answers);
    const answeredIds = new Set(
      answers
        .filter((a) => a.myScore !== null || a.decision !== null)
        .map((a) => a.answerPublicId),
    );
    if (answeredIds.size > 0) {
      setUnresolvedSubmissions((prev) => {
        const keysToRemove = Object.keys(prev).filter((id) => answeredIds.has(id));
        if (keysToRemove.length === 0) return prev;
        const next = { ...prev };
        for (const id of keysToRemove) delete next[id];
        return next;
      });
    }
  }

  const activeDraft: DraftEntry | null = currentAnswer
    ? drafts[currentAnswer.answerPublicId] ?? {
        score: currentAnswer.myScore !== null ? String(currentAnswer.myScore) : "",
        comment: "",
        decisionKind: currentAnswer.decision?.decisionKind ?? currentAnswer.decision?.kind ?? "MANUAL",
        reviewedAiVersion: currentAnswer.aiReference?.version ?? null,
        initialReviewVersion: currentAnswer.reviewVersion ?? null,
        draftVersion: 0,
        savedAt: null,
        isDirty: false,
      }
    : null;

  const handleScoreChange = (score: string): void => {
    if (!currentAnswer) return;
    const answerId = currentAnswer.answerPublicId;
    if (unresolvedSubmissions[answerId] || submittingAnswerPublicId === answerId) return;
    setDrafts((prev) => ({
      ...prev,
      [answerId]: {
        score,
        comment: prev[answerId]?.comment ?? "",
        decisionKind: prev[answerId]?.decisionKind ?? "MANUAL",
        reviewedAiVersion: prev[answerId]?.reviewedAiVersion ?? currentAnswer.aiReference?.version ?? null,
        initialReviewVersion: prev[answerId]?.initialReviewVersion ?? currentAnswer.reviewVersion ?? null,
        draftVersion: prev[answerId]?.draftVersion ?? 0,
        savedAt: prev[answerId]?.savedAt ?? null,
        isDirty: true,
      },
    }));
  };

  const handleCommentChange = (comment: string): void => {
    if (!currentAnswer) return;
    const answerId = currentAnswer.answerPublicId;
    setDrafts((prev) => ({
      ...prev,
      [answerId]: {
        score: prev[answerId]?.score ?? "",
        comment,
        decisionKind: prev[answerId]?.decisionKind ?? "MANUAL",
        reviewedAiVersion: prev[answerId]?.reviewedAiVersion ?? currentAnswer.aiReference?.version ?? null,
        initialReviewVersion: prev[answerId]?.initialReviewVersion ?? currentAnswer.reviewVersion ?? null,
        draftVersion: prev[answerId]?.draftVersion ?? 0,
        savedAt: prev[answerId]?.savedAt ?? null,
        isDirty: true,
      },
    }));
  };

  const handleApplyAiScore = (aiScore: number, version: string | null): void => {
    if (!currentAnswer) return;
    const answerId = currentAnswer.answerPublicId;
    if (unresolvedSubmissions[answerId] || submittingAnswerPublicId === answerId) return;
    setDrafts((prev) => ({
      ...prev,
      [answerId]: {
        score: String(aiScore),
        comment: prev[answerId]?.comment ?? "",
        decisionKind: "CONFIRM_AI",
        reviewedAiVersion: version,
        initialReviewVersion: currentAnswer.reviewVersion ?? null,
        draftVersion: prev[answerId]?.draftVersion ?? 0,
        savedAt: prev[answerId]?.savedAt ?? null,
        isDirty: true,
      },
    }));
  };

  const handleAcknowledgeStale = (): void => {
    if (!currentAnswer) return;
    const answerId = currentAnswer.answerPublicId;
    setDrafts((prev) => ({
      ...prev,
      [answerId]: {
        score: activeDraft?.score ?? "",
        comment: activeDraft?.comment ?? "",
        decisionKind: activeDraft?.decisionKind ?? "MANUAL",
        reviewedAiVersion: currentAnswer.aiReference?.version ?? null,
        initialReviewVersion: currentAnswer.reviewVersion ?? null,
        draftVersion: activeDraft?.draftVersion ?? 0,
        savedAt: activeDraft?.savedAt ?? null,
        isDirty: true,
      },
    }));
  };

  const handleSubmit = (
    score: number,
    decisionKind: ExaminerDecisionKind,
    requestPublicId: string,
    expectedReviewVersion: string,
  ): void => {
    if (!currentAnswer) return;
    const answerId = currentAnswer.answerPublicId;
    const payload: SubmitExaminerScoreRequest = {
      score,
      decisionKind,
      reviewedAiVersion: activeDraft?.reviewedAiVersion ?? null,
      expectedReviewVersion,
      requestPublicId,
    };
    setSubmittingAnswerPublicId(answerId);
    setUnresolvedSubmissions((prev) => ({
      ...prev,
      [answerId]: { payload, submittedAt: Date.now() },
    }));
    submitMutation.mutate(
      { answerPublicId: answerId, payload },
      {
        onSuccess: () => {
          setSubmittingAnswerPublicId(null);
          setUnresolvedSubmissions((prev) => {
            const next = { ...prev };
            delete next[answerId];
            return next;
          });
          setDrafts((prev) => {
            const next = { ...prev };
            delete next[answerId];
            return next;
          });
        },
        onError: async (error: unknown) => {
          setSubmittingAnswerPublicId(null);
          if (isStaleReviewVersionError(error)) {
            // Definitive rejection: remove retained intent, refetch fresh review version
            setUnresolvedSubmissions((prev) => {
              const next = { ...prev };
              delete next[answerId];
              return next;
            });
            await refetchAttempt();
          }
        },
      },
    );
  };

  const handleRetryIdentical = (): void => {
    if (!currentAnswer) return;
    const answerId = currentAnswer.answerPublicId;
    const retained = unresolvedSubmissions[answerId];
    if (!retained) return;

    setSubmittingAnswerPublicId(answerId);
    submitMutation.mutate(
      { answerPublicId: answerId, payload: retained.payload },
      {
        onSuccess: () => {
          setSubmittingAnswerPublicId(null);
          setUnresolvedSubmissions((prev) => {
            const next = { ...prev };
            delete next[answerId];
            return next;
          });
          setDrafts((prev) => {
            const next = { ...prev };
            delete next[answerId];
            return next;
          });
        },
        onError: async (error: unknown) => {
          setSubmittingAnswerPublicId(null);
          if (isStaleReviewVersionError(error)) {
            // Definitive rejection on retry: remove retained intent, refetch fresh review version
            setUnresolvedSubmissions((prev) => {
              const next = { ...prev };
              delete next[answerId];
              return next;
            });
            await refetchAttempt();
          }
        },
      },
    );
  };

  const handleReconcileServer = async (): Promise<void> => {
    if (!currentAnswer) return;
    const answerId = currentAnswer.answerPublicId;
    const retained = unresolvedSubmissions[answerId];
    const result = (await refetchAttempt()) as {
      data?: { answers?: ExaminerAnswerDetailResponse[] };
    };
    const matched = result.data?.answers?.find((a) => a.answerPublicId === answerId);
    if (!matched) return;

    const isCommitted = matched.myScore !== null || matched.decision !== null;
    const receiptMatches =
      Boolean(retained?.payload.requestPublicId) &&
      matched.decision?.requestPublicId === retained?.payload.requestPublicId;

    if (isCommitted || receiptMatches) {
      setUnresolvedSubmissions((prev) => {
        const next = { ...prev };
        delete next[answerId];
        return next;
      });
      setDrafts((prev) => {
        const next = { ...prev };
        delete next[answerId];
        return next;
      });
    }
  };

  const isStale =
    Boolean(currentAnswer?.reviewVersion) &&
    Boolean(activeDraft?.initialReviewVersion) &&
    currentAnswer?.reviewVersion !== activeDraft?.initialReviewVersion;

  const currentUnresolved = currentAnswer
    ? unresolvedSubmissions[currentAnswer.answerPublicId]
    : undefined;
  const isCurrentSubmitting =
    submitMutation.isPending &&
    submittingAnswerPublicId === currentAnswer?.answerPublicId;
  const isCurrentReconciling = Boolean(currentUnresolved) && !isCurrentSubmitting;

  const handleSaveDraft = async (answerIdToSave?: string): Promise<boolean> => {
    const targetAnswer = answerIdToSave ? answers.find((a) => a.answerPublicId === answerIdToSave) : currentAnswer;
    if (!targetAnswer) return false;
    const answerId = targetAnswer.answerPublicId;
    const draft = drafts[answerId];
    if (!draft) return false;

    const parsedScore = draft.score.trim() === "" ? null : Number(draft.score);
    if (parsedScore !== null && (!Number.isInteger(parsedScore) || parsedScore < 0 || parsedScore > 100)) {
      return false;
    }

    try {
      setIsSavingDraft(true);
      const { saveExaminerDraft } = await import("@pte/api-client");
      const { apiClient } = await import("@/lib/apiClient");
      const res = await saveExaminerDraft(apiClient, sessionPublicId, attemptPublicId, answerId, {
        requestPublicId: crypto.randomUUID(),
        expectedWorkVersion: workflow?.workVersion ?? 0,
        expectedDraftVersion: draft.draftVersion ?? 0,
        score: parsedScore,
        comment: draft.comment || null,
        decisionKind: draft.decisionKind,
        expectedReviewVersion: targetAnswer.reviewVersion,
        reviewedAiVersion: draft.reviewedAiVersion,
      });

      setDrafts((prev) => {
        const current = prev[answerId];
        if (!current) return prev;
        const hasUnsavedChanges = current.score !== draft.score || current.comment !== draft.comment;
        return {
          ...prev,
          [answerId]: {
            ...current,
            draftVersion: res.draft?.draftVersion ?? (draft.draftVersion ?? 0) + 1,
            savedAt: res.draft?.savedAt ?? new Date().toISOString(),
            isDirty: hasUnsavedChanges,
          },
        };
      });
      return true;
    } catch {
      return false;
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleFinalizeAttempt = async (): Promise<boolean> => {
    try {
      setIsFinalizing(true);
      const { finalizeExaminerWork } = await import("@pte/api-client");
      const { apiClient } = await import("@/lib/apiClient");

      const items = answers.map((a) => {
        const d = drafts[a.answerPublicId];
        return {
          answerPublicId: a.answerPublicId,
          expectedDraftVersion: d?.draftVersion ?? 0,
          expectedReviewVersion: a.reviewVersion,
          reviewedAiVersion: d?.reviewedAiVersion ?? null,
        };
      });

      await finalizeExaminerWork(apiClient, sessionPublicId, attemptPublicId, {
        requestPublicId: crypto.randomUUID(),
        expectedWorkVersion: workflow?.workVersion ?? 0,
        answers: items,
      });

      await refetchAttempt();
      return true;
    } catch {
      return false;
    } finally {
      setIsFinalizing(false);
    }
  };

  return {
    drafts,
    unresolvedSubmissions,
    activeDraft,
    hasUnsaved,
    isStale,
    isCurrentReconciling,
    isCurrentSubmitting,
    isSavingDraft,
    isFinalizing,
    handleScoreChange,
    handleCommentChange,
    handleApplyAiScore,
    handleAcknowledgeStale,
    handleSaveDraft,
    handleFinalizeAttempt,
    handleSubmit,
    handleRetryIdentical,
    handleReconcileServer,
  };
};
