"use client";

import type { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { Badge, Button, TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from "@pte/ui";
import type { ExaminerReportRecentItem } from "@pte/api-client";
import { useExaminerWorkspaceText } from "../hooks/useExaminerWorkspaceText";

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

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-800">{text.recentFinalizedTitle}</h3>
      {recentItems.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
          {text.recentFinalizedEmpty}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <TableRoot>
            <TableHeader>
              <TableRow>
                <TableHead>{text.attemptLabel}</TableHead>
                <TableHead>{text.sessionLabel}</TableHead>
                <TableHead>Scores</TableHead>
                <TableHead>Avg Score</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>{text.asOfLabel}</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentItems.map((item) => (
                <TableRow key={`${item.sessionPublicId}-${item.attemptPublicId}-${item.finalizedAt}`}>
                  <TableCell className="font-mono text-xs font-medium text-slate-800">
                    <span title={item.attemptPublicId}>
                      #{item.attemptPublicId.slice(0, 8).toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">
                    <span title={item.sessionPublicId}>
                      #{item.sessionPublicId.slice(0, 8).toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-xs text-slate-700">
                    {item.scoreCount} questions
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
                      <span className="ml-1 text-amber-600 font-semibold">(regrade)</span>
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
