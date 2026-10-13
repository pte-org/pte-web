"use client";

import { useState, type ReactElement } from "react";
import {
  Badge,
  Button,
  Modal,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@pte/ui";
import { useExaminerHistory } from "../api";
import type { ExaminerGradingOperation, ExaminerHistoryItemResponse } from "@pte/api-client";

interface ExaminerGradingHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  sessionPublicId: string;
  attemptPublicId: string;
}

const OPERATION_BADGES: Record<
  ExaminerGradingOperation,
  { label: string; variant: "neutral" | "info" | "warning" | "success" | "danger" }
> = {
  START: { label: "Started", variant: "info" },
  SAVE_DRAFT: { label: "Draft Saved", variant: "neutral" },
  SCORE_CHANGE: { label: "Score Changed", variant: "warning" },
  FINALIZE: { label: "Finalized", variant: "success" },
  REOPEN: { label: "Reopened", variant: "warning" },
  REGRADE: { label: "Regraded", variant: "warning" },
  REPORT_ISSUE: { label: "Issue Reported", variant: "danger" },
  RESOLVE_ISSUE: { label: "Issue Resolved", variant: "success" },
};

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function ExaminerGradingHistoryDialog({
  open,
  onClose,
  sessionPublicId,
  attemptPublicId,
}: ExaminerGradingHistoryDialogProps): ReactElement {
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const { data, isLoading, isError, refetch } = useExaminerHistory(
    sessionPublicId,
    attemptPublicId,
    page,
    pageSize,
  );

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Grading History & Audit Trail (#${attemptPublicId.slice(0, 8).toUpperCase()})`}
      size="xl"
    >
      <div className="space-y-4 py-2">
        <p className="text-sm text-slate-600">
          Immutable audit record of all scoring and workflow transitions for this assigned attempt.
        </p>

        {isLoading ? (
          <div className="py-8 text-center text-sm text-slate-500">Loading audit history…</div>
        ) : isError ? (
          <div className="rounded bg-red-50 p-4 text-center text-sm text-red-700">
            Could not load grading history.{" "}
            <button
              type="button"
              onClick={() => void refetch()}
              className="font-medium underline hover:text-red-900"
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            No grading events recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <TableRoot>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Target / Version</TableHead>
                  <TableHead>Score Values</TableHead>
                  <TableHead>Rubric</TableHead>
                  <TableHead>Reason / Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: ExaminerHistoryItemResponse) => {
                  const badgeInfo = OPERATION_BADGES[item.operation] ?? {
                    label: item.operation,
                    variant: "neutral" as const,
                  };
                  return (
                    <TableRow key={item.eventPublicId}>
                      <TableCell className="whitespace-nowrap text-xs text-slate-600">
                        {formatDateTime(item.occurredAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-700">
                        {item.actorRole ?? "EXAMINER"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {item.answerPublicId ? (
                          <span>Ans: #{item.answerPublicId.slice(0, 8)}</span>
                        ) : (
                          <span className="italic text-slate-400">Attempt level</span>
                        )}
                        <span className="ml-1 text-slate-400">
                          (w:v{item.workVersion}
                          {item.draftVersion != null ? `, d:v${item.draftVersion}` : ""})
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">
                        {item.previousScore != null && item.newScore != null ? (
                          <span className="font-semibold text-amber-700">
                            {item.previousScore} → {item.newScore}
                          </span>
                        ) : item.newScore != null ? (
                          <span className="font-medium text-slate-800">{item.newScore} / 100</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {item.rubricVersion != null ? `v${item.rubricVersion}` : "v1"}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-xs text-slate-600" title={item.reason ?? ""}>
                        {item.reason || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </TableRoot>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Page {page + 1} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
