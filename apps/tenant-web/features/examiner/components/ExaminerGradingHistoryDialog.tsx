"use client";

import { useState, type ReactElement } from "react";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  Modal,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@pte/ui";
import { useExaminerHistory } from "../api";
import type { ExaminerHistoryItemResponse } from "@pte/api-client";
import { useExaminerHistoryText, useExaminerOperationBadges } from "../hooks/useExaminerWorkText";

interface ExaminerGradingHistoryDialogProps {
  open: boolean;
  onClose: () => void;
  sessionPublicId: string;
  attemptPublicId: string;
}

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
  const T = useExaminerHistoryText();
  const operationBadges = useExaminerOperationBadges();
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
      title={`${T.TITLE_PREFIX} (#${attemptPublicId.slice(0, 8).toUpperCase()})`}
      size="xl"
    >
      <div className="space-y-4 py-2">
        <p className="text-sm text-slate-600">
          {T.DESCRIPTION}
        </p>

        {isLoading ? (
          <LoadingState variant="table" label={T.LOADING} />
        ) : isError ? (
          <ErrorState
            title={T.ERROR_TITLE}
            action={
              <Button variant="secondary" size="sm" onClick={() => void refetch()}>
                {T.RETRY}
              </Button>
            }
          />
        ) : items.length === 0 ? (
          <EmptyState title={T.EMPTY_TITLE} />
        ) : (
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <TableRoot>
              <TableHeader>
                <TableRow>
                  <TableHead>{T.COL_TIMESTAMP}</TableHead>
                  <TableHead>{T.COL_ACTION}</TableHead>
                  <TableHead>{T.COL_ACTOR}</TableHead>
                  <TableHead>{T.COL_TARGET_VERSION}</TableHead>
                  <TableHead>{T.COL_SCORE_VALUES}</TableHead>
                  <TableHead>{T.COL_RUBRIC}</TableHead>
                  <TableHead>{T.COL_REASON_NOTES}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item: ExaminerHistoryItemResponse) => {
                  const badgeInfo = operationBadges[item.operation] ?? {
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
                          <span>{T.ANSWER_PREFIX}{item.answerPublicId.slice(0, 8)}</span>
                        ) : (
                          <span className="italic text-slate-400">{T.ATTEMPT_LEVEL}</span>
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
              {T.PAGE_LABEL} {page + 1} {T.PAGE_OF} {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                {T.PREVIOUS}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                {T.NEXT}
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-3">
          <Button variant="secondary" onClick={onClose}>
            {T.CLOSE}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
