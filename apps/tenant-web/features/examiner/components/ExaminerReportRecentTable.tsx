"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, EmptyState, TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from "@pte/ui";
import type { ExaminerReportRecentItem } from "@pte/api-client";
import { useExaminerWorkText } from "../hooks/useExaminerWorkText";
import { useExaminerWorkspaceText } from "../hooks/useExaminerWorkspaceText";
import { formatAttemptNumber } from "../utils/attemptLabels";

interface ExaminerReportRecentTableProps {
  recentItems: ExaminerReportRecentItem[];
}

function formatDateTime(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleString(locale === "vi" ? "vi-VN" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function ExaminerReportRecentTable({
  recentItems,
}: ExaminerReportRecentTableProps): ReactElement {
  const router = useRouter();
  const text = useExaminerWorkspaceText();
  const T = useExaminerWorkText();

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-800">{text.recentFinalizedTitle}</h3>
      {recentItems.length === 0 ? (
        <EmptyState title={text.recentFinalizedEmpty} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <TableRoot>
            <TableHeader>
              <TableRow>
                <TableHead>{text.attemptLabel}</TableHead>
                <TableHead>{text.sessionLabel}</TableHead>
                <TableHead>{T.TABLE_HEADER_SCORES}</TableHead>
                <TableHead>{T.TABLE_HEADER_AVG_SCORE}</TableHead>
                <TableHead>{T.TABLE_HEADER_VERSION}</TableHead>
                <TableHead>{text.asOfLabel}</TableHead>
                <TableHead className="text-right">{T.TABLE_HEADER_ACTION}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentItems.map((item) => (
                <TableRow key={`${item.sessionPublicId}-${item.attemptPublicId}-${item.finalizedAt}`}>
                  <TableCell className="text-xs font-medium text-slate-800">
                    {formatAttemptNumber(text.attemptLabel, item)}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    {item.sessionName ?? "—"}
                  </TableCell>
                  <TableCell className="text-xs text-slate-700">
                    {item.scoreCount} {T.QUESTIONS_SUFFIX}
                  </TableCell>
                  <TableCell>
                    {item.averageScore != null ? (
                      <Badge variant="success">{item.averageScore.toFixed(1)} / 100</Badge>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-slate-500">
                    v{item.workVersion}
                    {item.workVersion > 2 && (
                      <span className="ml-1 text-amber-600 font-semibold">{T.REGRADE_LABEL}</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-slate-500">
                    {formatDateTime(item.finalizedAt, text.locale)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        router.push(`/examiner/work/${item.sessionPublicId}/${item.attemptPublicId}`)
                      }
                    >
                      {text.viewAttempt}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </TableRoot>
        </div>
      )}
    </div>
  );
}
