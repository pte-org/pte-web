import type { ReactElement } from "react";
import { useState } from "react";
import Link from "next/link";
import type { QuestionGenerationBatchResponse } from "@pte/api-client";
import {
  DashboardPanel,
  DataTable,
  ProgressBar,
  Select,
  calendarDate,
  type DataTableColumn,
  type DateRangeValue,
} from "@pte/ui";
import { BatchStatusBadge } from "../../batchgeneration/components/_BatchStatusBadge";
import { BATCH_STATUS_VARIANT } from "../../batchgeneration/constants";
import type { BatchMessages } from "../../batchgeneration/messages/en";
import { useBatchMessages } from "../../batchgeneration/messages/useBatchMessages";
import { useBatchHistory } from "../api";
import { aiBatchDetailHref, BATCH_HISTORY_PAGE_SIZE, type AiAdminCopy } from "../constants";
import { batchProgress, filterBatches, summarizeBatch } from "../utils/batchHistory";

const ALL = "";
const POOLS = ["PRACTICE", "EXAM"] as const;

interface BatchHistoryProps {
  range: DateRangeValue;
  copy: AiAdminCopy;
}

const createdLabel = (batch: QuestionGenerationBatchResponse): string => new Date(batch.createdAt).toLocaleString();
const poolLabel = (batch: QuestionGenerationBatchResponse, messages: BatchMessages): string =>
  // Same pool wording as the batch detail page; an unknown pool code is shown as is.
  (messages[`pool${batch.pool}` as keyof BatchMessages] as string | undefined) ?? batch.pool;
const contentLabel = (batch: QuestionGenerationBatchResponse, copy: AiAdminCopy): string => {
  const { types, questions } = summarizeBatch(batch);
  return copy.BATCH_CONTENT_VALUE.replace("{types}", String(types)).replace("{questions}", String(questions));
};

const buildColumns = (copy: AiAdminCopy, messages: BatchMessages): DataTableColumn<QuestionGenerationBatchResponse>[] => [
  {
    key: "created",
    header: copy.JOB_WHEN,
    cell: (batch) => (
      <Link href={aiBatchDetailHref(batch.publicId)} className="font-medium text-[var(--action)] hover:underline">
        {createdLabel(batch)}
      </Link>
    ),
    sortAccessor: (batch) => new Date(batch.createdAt),
    filterAccessor: createdLabel,
  },
  { key: "pool", header: copy.BATCH_POOL, cell: (batch) => poolLabel(batch, messages), filterAccessor: (batch) => poolLabel(batch, messages) },
  {
    key: "content",
    header: copy.BATCH_CONTENT,
    cell: (batch) => contentLabel(batch, copy),
    sortAccessor: (batch) => summarizeBatch(batch).questions,
    filterAccessor: (batch) => contentLabel(batch, copy),
  },
  {
    key: "progress",
    header: copy.BATCH_PROGRESS,
    cell: (batch) => {
      const { done, total } = batchProgress(batch);
      return (
        <span className="flex items-center gap-2">
          <ProgressBar value={done} max={Math.max(total, 1)} label={`${done}/${total}`} className="w-24" />
          {`${done}/${total}`}
        </span>
      );
    },
    sortAccessor: (batch) => {
      const { done, total } = batchProgress(batch);
      return total === 0 ? 0 : done / total;
    },
    filterable: false,
  },
  {
    key: "status",
    header: copy.JOB_STATUS,
    cell: (batch) => <BatchStatusBadge status={batch.status} messages={messages} />,
    sortAccessor: (batch) => batch.status,
    filterable: false,
  },
];

/** Every admin's recent generation batches: searched, filtered, sorted and paged here; a date opens the batch. */
export const BatchHistory = ({ range, copy }: BatchHistoryProps): ReactElement => {
  const messages = useBatchMessages();
  const [status, setStatus] = useState(ALL);
  const [pool, setPool] = useState(ALL);
  const history = useBatchHistory();
  const batches = history.data?.data ?? [];
  const shown = filterBatches(batches, range, status, calendarDate).filter((batch) => pool === ALL || batch.pool === pool);
  const statusOptions = [
    { value: ALL, label: copy.FILTER_ALL_STATUSES },
    ...Object.keys(BATCH_STATUS_VARIANT).map((value) => ({
      value,
      label: messages[`status${value}` as keyof BatchMessages] ?? value,
    })),
  ];
  const poolOptions = [
    { value: ALL, label: copy.FILTER_ALL_POOLS },
    ...POOLS.map((value) => ({ value, label: messages[`pool${value}` as keyof BatchMessages] ?? value })),
  ];
  const panelStatus = history.isError ? "error" : history.isLoading ? "loading" : batches.length === 0 ? "empty" : "content";
  return (
    <DashboardPanel
      title={copy.BATCH_HISTORY}
      status={panelStatus}
      loadingLabel={copy.LOADING}
      empty={{ title: copy.NO_BATCHES }}
      error={{ title: copy.BATCH_LOAD_ERROR, retryLabel: copy.LOAD_ERROR_RETRY, onRetry: () => void history.refetch() }}
    >
      <DataTable
        columns={buildColumns(copy, messages)}
        rows={shown}
        getRowKey={(batch) => batch.publicId}
        searchPlaceholder={copy.BATCH_SEARCH}
        searchAriaLabel={copy.BATCH_SEARCH}
        emptyTitle={copy.NO_BATCHES}
        initialSort={{ key: "created", direction: "desc" }}
        initialPageSize={BATCH_HISTORY_PAGE_SIZE}
        filters={
          <>
            <Select variant="table" aria-label={copy.BATCH_POOL} options={poolOptions} value={pool} onChange={(e) => setPool(e.target.value)} />
            <Select variant="table" aria-label={copy.JOB_STATUS} options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value)} />
          </>
        }
      />
    </DashboardPanel>
  );
};
