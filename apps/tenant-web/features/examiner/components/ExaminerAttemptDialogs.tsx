"use client";
import type { ReactElement } from "react";
import { ConfirmDialog } from "@pte/ui";
import { ConfirmAttemptFinalizeDialog } from "./ConfirmAttemptFinalizeDialog";
import { ReportIssueDialog } from "./ReportIssueDialog";
import type { ExaminerAttemptController } from "../useExaminerAttemptController";
export function ExaminerAttemptDialogs({ state }: { state: ExaminerAttemptController }): ReactElement {
  const { T, confirmLeaveOpen, setConfirmLeaveOpen, handleSaveAndLeave, isSavingDraft, finalizeOpen, answers, isFinalizing, handleConfirmFinalize, setFinalizeOpen, reportIssueOpen, reportIssueMutation, handleReportIssue, setReportIssueOpen } = state;
  return <>
      <ConfirmDialog
        open={confirmLeaveOpen}
        title={T.UNSAVED_CHANGES_TITLE}
        confirmLabel={T.SAVE_AND_LEAVE}
        cancelLabel={T.CANCEL}
        description={T.UNSAVED_CHANGES_WARNING}
        isConfirming={isSavingDraft}
        onConfirm={() => void handleSaveAndLeave()}
        onClose={() => { if (!isSavingDraft) setConfirmLeaveOpen(false); }}
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


  </>;
}
