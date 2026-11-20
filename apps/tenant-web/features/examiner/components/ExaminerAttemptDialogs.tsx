"use client";
import type { ReactElement } from "react";
import { UnsavedChangesDialog, UnsavedChangesGuard } from "@pte/ui";
import { useRouter } from "next/navigation";
import { ConfirmAttemptFinalizeDialog } from "./ConfirmAttemptFinalizeDialog";
import { ReportIssueDialog } from "./ReportIssueDialog";
import type { ExaminerAttemptController } from "../useExaminerAttemptController";
export function ExaminerAttemptDialogs({ state }: { state: ExaminerAttemptController }): ReactElement {
  const { T, confirmLeaveOpen, setConfirmLeaveOpen, handleSaveAndLeave, saveThen, hasUnsaved, executeBack, isSavingDraft, finalizeOpen, answers, isFinalizing, handleConfirmFinalize, setFinalizeOpen, reportIssueOpen, reportIssueMutation, handleReportIssue, setReportIssueOpen } = state;
  const router = useRouter();
  return <>
      <UnsavedChangesGuard isDirty={hasUnsaved} onSaveAndLeave={saveThen} isSaving={isSavingDraft}
        onNavigate={(href) => router.push(href)} />
      <UnsavedChangesDialog
        open={confirmLeaveOpen}
        isSaving={isSavingDraft}
        onSaveAndLeave={() => void handleSaveAndLeave()}
        onLeave={() => { setConfirmLeaveOpen(false); executeBack(); }}
        onStay={() => { if (!isSavingDraft) setConfirmLeaveOpen(false); }}
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
