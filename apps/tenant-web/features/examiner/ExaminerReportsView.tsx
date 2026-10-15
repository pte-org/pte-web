"use client";

import { useMemo, useState, type ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Button, ErrorState, Input, LoadingState, PageHeader, Select } from "@pte/ui";
import type { ExaminerQueueStatus } from "@pte/api-client";
import { useExaminerReports } from "./api";
import { useExaminerWorkspaceText } from "./hooks/useExaminerWorkspaceText";
import { ExaminerReportKpis } from "./components/ExaminerReportKpis";
import { ExaminerReportBreakdownTable } from "./components/ExaminerReportBreakdownTable";
import { ExaminerReportRecentTable } from "./components/ExaminerReportRecentTable";

const TASK_TYPE_OPTIONS = [
  { value: "", label: "All Question Types" },
  { value: "READ_ALOUD", label: "Read Aloud" },
  { value: "REPEAT_SENTENCE", label: "Repeat Sentence" },
  { value: "DESCRIBE_IMAGE", label: "Describe Image" },
  { value: "RE_TELL_LECTURE", label: "Re-tell Lecture" },
  { value: "ANSWER_SHORT_QUESTION", label: "Answer Short Question" },
  { value: "SUMMARIZE_WRITTEN_TEXT", label: "Summarize Written Text" },
  { value: "WRITE_ESSAY", label: "Write Essay" },
];

export const ExaminerReportsView = (): ReactElement => {
  const router = useRouter();
  const text = useExaminerWorkspaceText();

  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [taskType, setTaskType] = useState<string>("");
  const [status, setStatus] = useState<ExaminerQueueStatus>("ALL");

  const reportsQuery = useExaminerReports({
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    taskType: taskType || undefined,
    status: status !== "ALL" ? status : undefined,
  });

  const statusOptions = useMemo(
    () => [
      { value: "ALL", label: text.statusAll },
      { value: "PENDING", label: text.statusPending },
      { value: "IN_PROGRESS", label: text.statusInProgress },
      { value: "COMPLETED", label: text.statusCompleted },
    ],
    [text],
  );

  const taskOptions = useMemo(() => {
    const defaultOpts = TASK_TYPE_OPTIONS.map((opt) =>
      opt.value === "" ? { ...opt, label: text.filterAllTaskTypes } : opt,
    );
    // Merge any additional types from data
    const existing = new Set(defaultOpts.map((o) => o.value));
    const extra = (reportsQuery.data?.taskTypeBreakdowns ?? [])
      .filter((b) => !existing.has(b.taskType))
      .map((b) => ({ value: b.taskType, label: b.taskType.replaceAll("_", " ") }));
    return [...defaultOpts, ...extra];
  }, [text, reportsQuery.data?.taskTypeBreakdowns]);

  const handleResetFilters = (): void => {
    setFromDate("");
    setToDate("");
    setTaskType("");
    setStatus("ALL");
  };

  const hasActiveFilters = Boolean(fromDate || toDate || taskType || status !== "ALL");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title={text.reportsTitle}
          subtitle={text.reportsSubtitle}
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => router.push("/examiner/work")}
        >
          {text.title}
        </Button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label htmlFor="report-from-date" className="block text-xs font-medium text-slate-700 mb-1">
              {text.filterDateFrom}
            </label>
            <Input
              id="report-from-date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="report-to-date" className="block text-xs font-medium text-slate-700 mb-1">
              {text.filterDateTo}
            </label>
            <Input
              id="report-to-date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="report-task-type" className="block text-xs font-medium text-slate-700 mb-1">
              {text.filterTaskType}
            </label>
            <Select
              id="report-task-type"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              options={taskOptions}
            />
          </div>
          <div>
            <label htmlFor="report-status" className="block text-xs font-medium text-slate-700 mb-1">
              {text.filterStatus}
            </label>
            <Select
              id="report-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ExaminerQueueStatus)}
              options={statusOptions}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                {text.resetFilters}
              </Button>
            )}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void reportsQuery.refetch()}
            disabled={reportsQuery.isFetching}
          >
            {reportsQuery.isFetching ? text.refreshing : text.refresh}
          </Button>
        </div>
      </div>

      {reportsQuery.isLoading ? (
        <LoadingState variant="table" label={text.loadingReports} />
      ) : reportsQuery.isError ? (
        <ErrorState
          title={text.reportsError}
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void reportsQuery.refetch()}
            >
              {text.retry}
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <ExaminerReportKpis summary={reportsQuery.data?.summary} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ExaminerReportBreakdownTable
              breakdown={reportsQuery.data?.taskTypeBreakdowns ?? []}
            />
            <ExaminerReportRecentTable
              recentItems={reportsQuery.data?.recentFinalizedItems ?? []}
            />
          </div>
        </div>
      )}
    </div>
  );
};
