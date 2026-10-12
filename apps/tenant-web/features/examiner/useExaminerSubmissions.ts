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
  decisionKind: ExaminerDecisionKind;
  reviewedAiVersion: string | null;
  initialReviewVersion: string | null;
}

export interface RetainedSubmission {
  payload: SubmitExaminerScoreRequest;
  submittedAt: number;
}

interface UseExaminerSubmissionsParams {
  answers: ExaminerAnswerDetailResponse[];
  currentAnswer: ExaminerAnswerDetailResponse | null;
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
  refetchAttempt,
  submitMutation,
}: UseExaminerSubmissionsParams) => {
  const [drafts, setDrafts] = useState<Record<string, DraftEntry>>({});
  const [unresolvedSubmissions, setUnresolvedSubmissions] = useState<Record<string, RetainedSubmission>>({});
  const [submittingAnswerPublicId, setSubmittingAnswerPublicId] = useState<string | null>(null);

  const hasUnsaved =
    Object.values(drafts).some((d) => d.score.trim() !== "") ||
    Object.keys(unresolvedSubmissions).length > 0;

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
      if (hasUnsaved) e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsaved]);

  useEffect(() => {
    if (!answers || answers.length === 0) return;
    const answeredIds = new Set(
      answers
        .filter((a) => a.myScore !== null || a.decision !== null)
        .map((a) => a.answerPublicId),
    );
    if (answeredIds.size === 0) return;

    setUnresolvedSubmissions((prev) => {
      const keysToRemove = Object.keys(prev).filter((id) => answeredIds.has(id));
      if (keysToRemove.length === 0) return prev;
      const next = { ...prev };
      for (const id of keysToRemove) delete next[id];
      return next;
    });

    setDrafts((prev) => {
      const keysToRemove = Object.keys(prev).filter((id) => answeredIds.has(id));
      if (keysToRemove.length === 0) return prev;
      const next = { ...prev };
      for (const id of keysToRemove) delete next[id];
      return next;
    });
  }, [answers]);

  const activeDraft: DraftEntry | null = currentAnswer
    ? drafts[currentAnswer.answerPublicId] ?? {
        score: currentAnswer.myScore !== null ? String(currentAnswer.myScore) : "",
        decisionKind: currentAnswer.decision?.decisionKind ?? currentAnswer.decision?.kind ?? "MANUAL",
        reviewedAiVersion: currentAnswer.aiReference?.version ?? null,
        initialReviewVersion: currentAnswer.reviewVersion ?? null,
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
        decisionKind: "MANUAL",
        reviewedAiVersion: prev[answerId]?.reviewedAiVersion ?? currentAnswer.aiReference?.version ?? null,
        initialReviewVersion: prev[answerId]?.initialReviewVersion ?? currentAnswer.reviewVersion ?? null,
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
        decisionKind: "CONFIRM_AI",
        reviewedAiVersion: version,
        initialReviewVersion: currentAnswer.reviewVersion ?? null,
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
        decisionKind: activeDraft?.decisionKind ?? "MANUAL",
        reviewedAiVersion: currentAnswer.aiReference?.version ?? null,
        initialReviewVersion: currentAnswer.reviewVersion ?? null,
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

  return {
    drafts,
    unresolvedSubmissions,
    activeDraft,
    hasUnsaved,
    isStale,
    isCurrentReconciling,
    isCurrentSubmitting,
    handleScoreChange,
    handleApplyAiScore,
    handleAcknowledgeStale,
    handleSubmit,
    handleRetryIdentical,
    handleReconcileServer,
  };
};
