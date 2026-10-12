"use client";

import { useState, type ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ConfirmDialog } from "@pte/ui";
import { EXAMINER_WORK_TEXT as T } from "./constants";
import { useExaminerAttempt, useSubmitExaminerScore } from "./api";
import { PromptRenderer, ResponseRenderer } from "./components/AnswerContentRenderer";
import { AiReferencePanel } from "./components/AiReferencePanel";
import { DecisionPanel } from "./components/DecisionPanel";
import { QuestionNavigator } from "./components/QuestionNavigator";
import { ExaminerAttemptHeader } from "./components/ExaminerAttemptHeader";
import { useExaminerSubmissions } from "./useExaminerSubmissions";

export const ExaminerAttemptDetailView = ({
  sessionPublicId,
  attemptPublicId,
  onBack,
}: {
  sessionPublicId: string;
  attemptPublicId: string;
  onBack?: () => void;
}): ReactElement => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromStatus = searchParams?.get("fromStatus");
  const fromPage = searchParams?.get("fromPage");

  const query = useExaminerAttempt(sessionPublicId, attemptPublicId);
  const submitMutation = useSubmitExaminerScore(sessionPublicId, attemptPublicId);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [promptMediaBroken, setPromptMediaBroken] = useState(false);
  const [responseMediaBroken, setResponseMediaBroken] = useState(false);

  const answers = query.data?.answers ?? [];
  const currentAnswer = answers[currentIndex] ?? null;

  const {
    drafts,
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
  } = useExaminerSubmissions({
    answers,
    currentAnswer,
    refetchAttempt: () => query.refetch(),
    submitMutation,
  });

  const executeBack = (): void => {
    if (onBack) {
      onBack();
    } else {
      const params = new URLSearchParams();
      if (fromStatus) params.set("status", fromStatus);
      if (fromPage) params.set("page", fromPage);
      const qs = params.toString();
      router.push(qs ? `/examiner/work?${qs}` : "/examiner/work");
    }
  };

  const handleBack = (): void => {
    if (hasUnsaved) {
      setConfirmLeaveOpen(true);
    } else {
      executeBack();
    }
  };

  const handleSelectIndex = (index: number): void => {
    setCurrentIndex(index);
    setPromptMediaBroken(false);
    setResponseMediaBroken(false);
  };

  return (
    <div className="mx-auto w-full max-w-6xl p-5 sm:p-8 space-y-6">
      <ExaminerAttemptHeader
        sessionPublicId={sessionPublicId}
        attemptPublicId={attemptPublicId}
        publicationState={query.data?.publicationState}
        submittedCount={query.data?.submittedAnswerCount ?? 0}
        eligibleCount={query.data?.eligibleAnswerCount ?? 0}
        onBack={handleBack}
      />

      {query.isLoading ? (
        <p className="rounded-md bg-white p-5 text-sm text-slate-600">{T.LOADING_DETAIL}</p>
      ) : query.isError ? (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800" role="alert">
          {T.DETAIL_ERROR}{" "}
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="font-semibold underline"
          >
            Retry
          </button>
        </div>
      ) : answers.length === 0 ? (
        <p className="rounded-md bg-white p-5 text-sm text-slate-600">{T.NO_ANSWERS}</p>
      ) : currentAnswer ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <QuestionNavigator
              answers={answers}
              currentIndex={currentIndex}
              drafts={Object.fromEntries(
                Object.entries(drafts).map(([k, v]) => [k, v.score]),
              )}
              onSelectIndex={handleSelectIndex}
            />
          </div>

          <div className="space-y-4 lg:col-span-3">
            <PromptRenderer
              key={`prompt-${currentAnswer.answerPublicId}`}
              prompt={currentAnswer.prompt}
              onMediaError={setPromptMediaBroken}
              onRefreshMedia={() => void query.refetch()}
            />
            <ResponseRenderer
              key={`response-${currentAnswer.answerPublicId}`}
              response={currentAnswer.response}
              onMediaError={setResponseMediaBroken}
              onRefreshMedia={() => void query.refetch()}
            />
            <AiReferencePanel
              reference={currentAnswer.aiReference}
              readOnly={currentAnswer.myScore !== null}
              disabled={isCurrentReconciling || isCurrentSubmitting}
              onApplyAiScore={handleApplyAiScore}
            />
            <DecisionPanel
              answer={currentAnswer}
              draftScore={activeDraft?.score ?? ""}
              decisionKind={activeDraft?.decisionKind ?? "MANUAL"}
              isStale={isStale}
              isMediaBroken={promptMediaBroken || responseMediaBroken}
              isSubmitting={submitMutation.isPending}
              isReconciling={isCurrentReconciling}
              submitError={submitMutation.isError ? T.SUBMIT_ERROR : null}
              onScoreChange={handleScoreChange}
              onSubmit={handleSubmit}
              onRetryIdentical={handleRetryIdentical}
              onReconcileServer={handleReconcileServer}
              onAcknowledgeStale={handleAcknowledgeStale}
            />
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmLeaveOpen}
        title={T.UNSAVED_CHANGES_TITLE}
        tone="danger"
        confirmLabel={T.DISCARD_AND_LEAVE}
        cancelLabel={T.CANCEL}
        description={T.UNSAVED_CHANGES_WARNING}
        onConfirm={() => {
          setConfirmLeaveOpen(false);
          executeBack();
        }}
        onClose={() => setConfirmLeaveOpen(false)}
      />
    </div>
  );
};
