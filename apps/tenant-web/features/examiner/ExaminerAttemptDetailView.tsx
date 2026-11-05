"use client";
import type { ReactElement } from "react";
import { Alert, Badge, Button } from "@pte/ui";
import { getExaminerBlockingText } from "./hooks/useExaminerWorkText";
import { ExaminerAttemptHeader } from "./components/ExaminerAttemptHeader";
import { ExaminerAttemptContent } from "./components/ExaminerAttemptContent";
import { ExaminerAttemptDialogs } from "./components/ExaminerAttemptDialogs";
import { useExaminerAttemptController } from "./useExaminerAttemptController";
export const ExaminerAttemptDetailView = (props: { sessionPublicId: string; attemptPublicId: string; onBack?: () => void }): ReactElement => {
  const state = useExaminerAttemptController(props);
  const { T, query, attemptTitle, workflowStatus, setGuidelinesOpen, setHistoryOpen, setReportIssueOpen, workflow, startMutation, handleStartWork, isFinalizing, hasOpenIssue, hasUnsaved, isSavingDraft, setFinalizeOpen, sessionPublicId, attemptPublicId, handleBack } = state;
  return (
    <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
      <ExaminerAttemptHeader
        title={attemptTitle}
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
                disabled={isFinalizing || hasOpenIssue || hasUnsaved || isSavingDraft}
                onClick={() => setFinalizeOpen(true)}
              >
                {isFinalizing ? T.FINALIZING : T.FINALIZE_WORK}
              </Button>
            )}
          </>
        }
        scoreExplanation={{ sessionPublicId, attemptPublicId }}
        onBack={handleBack}
      />

      {hasOpenIssue && (
        <Alert tone="error" title={T.ACTIVE_ISSUE_TITLE}>
          {T.ISSUES_BLOCKING}
        </Alert>
      )}

      {workflow?.blockingReason && (
        <Alert tone="warning" title={T.SCORING_NOTICE_TITLE}>
          {getExaminerBlockingText(T, workflow.blockingReason)}
        </Alert>
      )}

      <ExaminerAttemptContent state={state} />

      <ExaminerAttemptDialogs state={state} />
    </div>
  );
};
