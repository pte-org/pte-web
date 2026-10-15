"use client";

import type { ReactElement } from "react";
import { EmptyState, TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from "@pte/ui";
import type { ExaminerReportTaskTypeBreakdown } from "@pte/api-client";
import { EXAMINER_WORK_TEXT } from "../constants";
import { useExaminerWorkspaceText } from "../hooks/useExaminerWorkspaceText";

interface ExaminerReportBreakdownTableProps {
  breakdown: ExaminerReportTaskTypeBreakdown[];
}

export function ExaminerReportBreakdownTable({
  breakdown,
}: ExaminerReportBreakdownTableProps): ReactElement {
  const text = useExaminerWorkspaceText();

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-slate-800">{text.breakdownTitle}</h3>
      {breakdown.length === 0 ? (
        <EmptyState title={text.noData} />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <TableRoot>
            <TableHeader>
              <TableRow>
                <TableHead>{text.breakdownTaskType}</TableHead>
                <TableHead>{EXAMINER_WORK_TEXT.SCORED_OVER_TOTAL}</TableHead>
                <TableHead>{text.breakdownAvgScore}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breakdown.map((row) => (
                <TableRow key={row.taskType}>
                  <TableCell className="font-medium text-slate-800">
                    {row.taskType.replaceAll("_", " ")}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {row.scoredQuestions} / {row.totalQuestions}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-800">
                    {row.averageScore != null ? row.averageScore.toFixed(1) : "—"}
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
