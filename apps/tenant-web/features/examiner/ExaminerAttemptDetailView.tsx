"use client";

import { useState, type ReactElement } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Badge, Button, ConfirmDialog } from "@pte/ui";
import { EXAMINER_WORK_TEXT as T } from "./constants";
import {
  useExaminerAttempt,
  useExaminerGuidelines,
  useExaminerIssues,
  useReportExaminerIssue,
  useStartExaminerWork,
  useSubmitExaminerScore,
} from "./api";
import { PromptRenderer, ResponseRenderer } from "./components/AnswerContentRenderer";
import { AiReferencePanel } from "./components/AiReferencePanel";
import { DecisionPanel } from "./components/DecisionPanel";
import { QuestionNavigator } from "./components/QuestionNavigator";
import { ExaminerAttemptHeader } from "./components/ExaminerAttemptHeader";
import { ConfirmAttemptFinalizeDialog } from "./components/ConfirmAttemptFinalizeDialog";
import { ReportIssueDialog } from "./components/ReportIssueDialog";
import { ExaminerGuidelinesDialog } from "./components/ExaminerGuidelinesDialog";
import { ExaminerGradingHistoryDialog } from "./components/ExaminerGradingHistoryDialog";
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
  const startMutation = useStartExaminerWork(sessionPublicId, attemptPublicId);
  const reportIssueMutation = useReportExaminerIssue(sessionPublicId, attemptPublicId);
  const guidelinesQuery = useExaminerGuidelines(sessionPublicId, attemptPublicId);
  const issuesQuery = useExaminerIssues(sessionPublicId, attemptPublicId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [reportIssueOpen, setReportIssueOpen] = useState(false);
  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [promptMediaBroken, setPromptMediaBroken] = useState(false);
  const [responseMediaBroken, setResponseMediaBroken] = useState(false);

  const answers = query.data?.answers ?? [];
  const workflow = query.data?.workflow;
  const currentAnswer = answers[currentIndex] ?? null;

  const {
    drafts,
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
  } = useExaminerSubmissions({
    answers,
    currentAnswer,
    workflow,
    sessionPublicId,
    attemptPublicId,
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

  const handleStartWork = async () => {
    await startMutation.mutateAsync({
      requestPublicId: crypto.randomUUID(),
      expectedWorkVersion: workflow?.workVersion ?? 0,
    });
    void query.refetch();
  };

  const handleConfirmFinalize = async () => {
    const success = await handleFinalizeAttempt();
    if (success) {
      setFinalizeOpen(false);
    }
  };

  const handleReportIssue = async (type: import("@pte/api-client").ExaminerGradingIssueType, description: string) => {
    await reportIssueMutation.mutateAsync({
      requestPublicId: crypto.randomUUID(),
      expectedWorkVersion: workflow?.workVersion ?? 0,
      answerPublicId: currentAnswer?.answerPublicId ?? null,
      type,
      description,
    });
    setReportIssueOpen(false);
    void query.refetch();
  };

  const hasOpenIssue = issuesQuery.data?.some((i) => i.status === "OPEN");
  const workflowStatus = workflow?.status ?? (query.data?.submittedAnswerCount === query.data?.eligibleAnswerCount ? "COMPLETED" : "IN_PROGRESS");

  return (
    <div className="mx-auto w-full max-w-6xl p-5 sm:p-8 space-y-6">
      <ExaminerAttemptHeader
        sessionPublicId={sessionPublicId}
        attemptPublicId={attemptPublicId}
        publicationState={query.data?.publicationState}
        submittedCount={query.data?.submittedAnswerCount ?? 0}
        eligibleCount={query.data?.eligibleAnswerCount ?? 0}
        statusBadge={
          workflowStatus === "PENDING" ? (
            <Badge variant="neutral">{T.STATUS_PENDING}</Badge>
          ) : workflowStatus === "IN_PROGRESS" ? (
            <Badge variant="warning">{T.STATUS_IN_PROGRESS}</Badge>
          ) : (
            <Badge variant="success">{T.STATUS_COMPLETED}</Badge>
          )
        }
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setGuidelinesOpen(true)}>
              {T.GUIDELINES}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setHistoryOpen(true)}>
              {T.HISTORY_AUDIT}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setReportIssueOpen(true)}>
              {T.REPORT_ISSUE}
            </Button>
            {workflow?.canStart && (
              <Button
                variant="primary"
                size="sm"
                disabled={startMutation.isPending}
                onClick={handleStartWork}
              >
                {startMutation.isPending ? T.STARTING_WORK : T.START_WORK}
              </Button>
            )}
            {workflow?.canFinalize && (
              <Button
                variant="primary"
                size="sm"
                disabled={isFinalizing || hasOpenIssue}
                onClick={() => setFinalizeOpen(true)}
              >
                {isFinalizing ? T.FINALIZING : T.FINALIZE_WORK}
              </Button>
            )}
          </>
        }
        onBack={handleBack}
      />

      {hasOpenIssue && (
        <Alert tone="error" title="Active Issue Blocking Finalization">
          {T.ISSUES_BLOCKING}
        </Alert>
      )}

      {workflow?.blockingReason && (
        <Alert tone="warning" title="Scoring Status Notice">
          {workflow.blockingReason}
        </Alert>
      )}

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
              draftComment={activeDraft?.comment ?? ""}
              draftSavedAt={activeDraft?.savedAt}
              decisionKind={activeDraft?.decisionKind ?? "MANUAL"}
              isStale={isStale}
              isMediaBroken={promptMediaBroken || responseMediaBroken}
              isSubmitting={submitMutation.isPending}
              isSavingDraft={isSavingDraft}
              isReconciling={isCurrentReconciling}
              submitError={submitMutation.isError ? T.SUBMIT_ERROR : null}
              onScoreChange={handleScoreChange}
              onCommentChange={handleCommentChange}
              onSaveDraft={() => void handleSaveDraft()}
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

      <ConfirmAttemptFinalizeDialog
        open={finalizeOpen}
        totalAnswers={answers.length}
        isFinalizing={isFinalizing}
        onConfirm={handleConfirmFinalize}
        onClose={() => setFinalizeOpen(false)}
      />

      <ReportIssueDialog
        open={reportIssueOpen}
        isSubmitting={reportIssueMutation.isPending}
        onSubmit={handleReportIssue}
        onClose={() => setReportIssueOpen(false)}
      />

      <ExaminerGuidelinesDialog
        open={guidelinesOpen}
        guidelines={guidelinesQuery.data}
        isLoading={guidelinesQuery.isLoading}
        onClose={() => setGuidelinesOpen(false)}
      />

      <ExaminerGradingHistoryDialog
        open={historyOpen}
        sessionPublicId={sessionPublicId}
        attemptPublicId={attemptPublicId}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  );
};
