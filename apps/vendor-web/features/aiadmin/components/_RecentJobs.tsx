import type { ReactElement } from "react";
import { useState } from "react";
import type { GenerationFailureStats, QuestionGenerationJobResponse } from "@pte/api-client";
import { Badge, DashboardPanel, DataTable, Select, type BadgeVariant, type DataTableColumn } from "@pte/ui";
import type { AiAdminCopy } from "../constants";
import { failureLabel } from "../utils/presentation";

const ALL = "";

const STATUS_VARIANT: Record<string, BadgeVariant> = {
  COMPLETED: "success",
  FAILED: "danger",
  CANCELLED: "neutral",
  RUNNING: "info",
  QUEUED: "info",
  CANCELLING: "warning",
};

interface RecentJobsProps {
  jobs: QuestionGenerationJobResponse[];
  taskTypes: string[];
  failures: GenerationFailureStats[];
  copy: AiAdminCopy;
  locale: "en" | "vi";
}

const hasFailure = (job: QuestionGenerationJobResponse, code: string): boolean =>
  job.failureCode === code || job.items.some((item) => item.failureCode === code);

export const RecentJobs = ({ jobs, taskTypes, failures, copy, locale }: RecentJobsProps): ReactElement => {
  const [taskType, setTaskType] = useState(ALL);
  const [status, setStatus] = useState(ALL);
  const [reason, setReason] = useState(ALL);
  const shown = jobs.filter(
    (job) =>
      (taskType === ALL || job.taskType === taskType) &&
      (status === ALL || job.status === status) &&
      (reason === ALL || hasFailure(job, reason)),
  );
  const typeOptions = [
    { value: ALL, label: copy.FILTER_ALL_TYPES },
    ...[...new Set([...taskTypes, ...jobs.map((job) => job.taskType)])].sort().map((value) => ({ value, label: value })),
  ];
  const statusOptions = [
    { value: ALL, label: copy.FILTER_ALL_STATUSES },
    ...Object.keys(STATUS_VARIANT).map((value) => ({ value, label: value })),
  ];
  const reasonOptions = [
    { value: ALL, label: copy.FILTER_ALL_REASONS },
    ...failures.map((row) => ({ value: row.code, label: `${failureLabel(row.code, locale)} (${row.count})` })),
  ];
  const columns: DataTableColumn<QuestionGenerationJobResponse>[] = [
    { key: "type", header: copy.JOB_TYPE, cell: (job) => job.taskType, sortable: false },
    { key: "level", header: copy.JOB_LEVEL, cell: (job) => job.cefrLevel, sortable: false },
    {
      key: "result",
      header: copy.JOB_RESULT,
      cell: (job) => `${job.succeededCount}/${job.requestedCount}`,
      sortable: false,
    },
    {
      key: "status",
      header: copy.JOB_STATUS,
      cell: (job) => <Badge variant={STATUS_VARIANT[job.status] ?? "neutral"}>{job.status}</Badge>,
      sortable: false,
    },
    {
      key: "created",
      header: copy.JOB_WHEN,
      cell: (job) => new Date(job.createdAt).toLocaleString(),
      sortable: false,
    },
  ];
  return (
    <DashboardPanel
      title={copy.RECENT_JOBS}
      status={jobs.length === 0 ? "empty" : "content"}
      empty={{ title: copy.NO_JOBS }}
    >
      <DataTable
        columns={columns}
        rows={shown}
        getRowKey={(job) => job.publicId}
        searchPlaceholder={copy.JOB_SEARCH}
        searchAriaLabel={copy.JOB_SEARCH}
        filters={
          <>
            <Select variant="table" aria-label={copy.JOB_TYPE} options={typeOptions} value={taskType} onChange={(e) => setTaskType(e.target.value)} searchable />
            <Select variant="table" aria-label={copy.JOB_STATUS} options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value)} />
            <Select variant="table" aria-label={copy.FAILURE} options={reasonOptions} value={reason} onChange={(e) => setReason(e.target.value)} />
          </>
        }
      />
    </DashboardPanel>
  );
};
