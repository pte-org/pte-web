"use client";

import { useState, type ReactElement } from "react";
import { Badge, DataTable, PaginationControls, Select, type DataTableColumn } from "@pte/ui";
import type { AnswerListItemResponse } from "@pte/api-client";
import {
  ANSWER_STATUS_LABELS,
  ANSWER_STATUS_VARIANT,
  ANSWER_TABLE_HEADERS,
  ANSWERS_SECTION_TEXT,
} from "../constants";
import { useAnswers } from "../api";
import { AnswerDetailModal } from "./AnswerDetailModal";

interface AnswersSectionProps {
  sessionPublicId: string;
}

const T = ANSWERS_SECTION_TEXT;

const STATUS_OPTIONS = [
  { label: ANSWER_STATUS_LABELS.PENDING, value: "PENDING" },
  { label: ANSWER_STATUS_LABELS.AI_SCORING, value: "AI_SCORING" },
  { label: ANSWER_STATUS_LABELS.SCORING_FAILED, value: "SCORING_FAILED" },
  { label: ANSWER_STATUS_LABELS.SCORED, value: "SCORED" },
];

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatScore(score: number | null): string {
  return score === null ? "—" : String(score);
}

export const AnswersSection = ({ sessionPublicId }: AnswersSectionProps): ReactElement => {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);

  const { data, isLoading } = useAnswers(sessionPublicId, statusFilter, page);

  const columns: DataTableColumn<AnswerListItemResponse>[] = [
    {
      key: "taskType",
      header: ANSWER_TABLE_HEADERS.TASK_TYPE,
      cell: (row) => <span className="font-medium text-gray-900">{row.taskType}</span>,
    },
    {
      key: "status",
      header: ANSWER_TABLE_HEADERS.STATUS,
      cell: (row) => (
        <Badge variant={ANSWER_STATUS_VARIANT[row.status]}>{ANSWER_STATUS_LABELS[row.status]}</Badge>
      ),
    },
    { key: "rawScore", header: ANSWER_TABLE_HEADERS.AI_SCORE, cell: (row) => formatScore(row.rawScore) },
    {
      key: "teacherScore",
      header: ANSWER_TABLE_HEADERS.TEACHER_SCORE,
      cell: (row) => formatScore(row.teacherScore),
    },
    {
      key: "createdAt",
      header: ANSWER_TABLE_HEADERS.SUBMITTED_AT,
      cell: (row) => formatDateTime(row.createdAt),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="w-56">
          <Select
            label={T.STATUS_FILTER_LABEL}
            placeholder={T.STATUS_FILTER_ALL}
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(0);
            }}
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={data?.items ?? []}
        getRowKey={(row) => row.answerPublicId}
        isLoading={isLoading}
        emptyTitle={T.EMPTY_TITLE}
        rowActionsHeader={ANSWER_TABLE_HEADERS.ACTIONS}
        rowActions={(row) => (
          <button
            type="button"
            onClick={() => setSelectedAnswerId(row.answerPublicId)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {T.VIEW}
          </button>
        )}
      />

      {data && data.totalPages > 1 && (
        <PaginationControls meta={data} onPageChange={setPage} disabled={isLoading} />
      )}

      <AnswerDetailModal
        key={selectedAnswerId ?? "answer-detail-closed"}
        answerPublicId={selectedAnswerId}
        onClose={() => setSelectedAnswerId(null)}
      />
    </div>
  );
};
