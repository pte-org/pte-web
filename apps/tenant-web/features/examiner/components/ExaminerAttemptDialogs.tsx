"use client";
import type { ReactElement } from "react";
import { ConfirmDialog } from "@pte/ui";
import { ConfirmAttemptFinalizeDialog } from "./ConfirmAttemptFinalizeDialog";
import { ReportIssueDialog } from "./ReportIssueDialog";
import { ExaminerGuidelinesDialog } from "./ExaminerGuidelinesDialog";
import { ExaminerGradingHistoryDialog } from "./ExaminerGradingHistoryDialog";
import type { ExaminerAttemptController } from "../useExaminerAttemptController";
export function ExaminerAttemptDialogs({ state }: { state: ExaminerAttemptController }): ReactElement {
  const { T, confirmLeaveOpen, setConfirmLeaveOpen, executeBack, finalizeOpen, answers, isFinalizing, handleConfirmFinalize, setFinalizeOpen, reportIssueOpen, reportIssueMutation, handleReportIssue, setReportIssueOpen, guidelinesOpen, guidelinesQuery, setGuidelinesOpen, historyOpen, sessionPublicId, attemptPublicId, attemptTitle, setHistoryOpen } = state;
  return <>
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
        attemptTitle={attemptTitle}
        onClose={() => setHistoryOpen(false)}
      />
  </>;
}
