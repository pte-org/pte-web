"use client";
import { useState, type ReactElement } from "react";
import { Alert, Badge, Button, TabPanel, Tabs } from "@pte/ui";
import { ExaminerGradingHistoryTable } from "./components/ExaminerGradingHistoryTable";
import { getExaminerBlockingText } from "./hooks/useExaminerWorkText";
import { ExaminerAttemptHeader } from "./components/ExaminerAttemptHeader";
import { ExaminerAttemptContent } from "./components/ExaminerAttemptContent";
import { ExaminerAttemptDialogs } from "./components/ExaminerAttemptDialogs";
import { QuestionListButton } from "./components/QuestionListButton";
import { useExaminerAttemptController } from "./useExaminerAttemptController";
export const ExaminerAttemptDetailView = (props: { sessionPublicId: string; attemptPublicId: string; onBack?: () => void }): ReactElement => {
  const state = useExaminerAttemptController(props);
  const { T, query, attemptTitle, workflowStatus, setReportIssueOpen, workflow, hasOpenIssue, isFinalizing, hasUnsaved,
    isSavingDraft } = state;
  const [activeTab, setActiveTab] = useState("marking");
  const [historyVisited, setHistoryVisited] = useState(false);
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
        actions={<div className="flex items-center gap-2">
          <QuestionListButton state={state} />
          <Button variant="primary" size="sm" className="whitespace-nowrap" onClick={() => setReportIssueOpen(true)}>
            {T.REPORT_ISSUE}
          </Button>
          {workflow?.canFinalize && (
            <Button variant="primary" size="sm" className="whitespace-nowrap"
              disabled={isFinalizing || Boolean(hasOpenIssue) || hasUnsaved || isSavingDraft}
              onClick={() => state.setFinalizeOpen(true)}>{isFinalizing ? T.FINALIZING : T.FINALIZE_WORK}</Button>
          )}
        </div>}
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

      <Tabs id="examiner-attempt" variant="minimal" value={activeTab}
        items={[{ id: "marking", label: T.MARKING_TAB }, { id: "history", label: T.HISTORY_AUDIT }]}
        onChange={(tab) => { setActiveTab(tab); if (tab === "history") setHistoryVisited(true); }} />
      <TabPanel id="examiner-attempt-panel-marking" labelledBy="examiner-attempt-tab-marking" active={activeTab === "marking"} keepMounted>
        <ExaminerAttemptContent state={state} />
      </TabPanel>
      {historyVisited && <TabPanel id="examiner-attempt-panel-history" labelledBy="examiner-attempt-tab-history" active={activeTab === "history"} keepMounted>
        <ExaminerGradingHistoryTable sessionPublicId={state.sessionPublicId} attemptPublicId={state.attemptPublicId} />
      </TabPanel>}

      <ExaminerAttemptDialogs state={state} />
    </div>
  );
};
