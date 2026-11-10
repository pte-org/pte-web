"use client";

import type { ReactElement } from "react";
import { TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from "@pte/ui";
import { formatApiNumber } from "../explanationView";
import { useScoreExplanationText } from "../hooks/useScoreExplanationText";
import type { TaskTypeAverageResponse } from "../types";
import { ExplanationSection } from "./_ExplanationSection";

interface TaskTypeAverageTableProps {
  averages: TaskTypeAverageResponse[];
}

/** Task type averages with how many answers were scored and how many were left blank (counted as 0). */
export const TaskTypeAverageTable = ({ averages }: TaskTypeAverageTableProps): ReactElement => {
  const { messages: M } = useScoreExplanationText();

  return (
    <ExplanationSection title={M.averagesTitle} hint={M.averagesHint}>
      {averages.length === 0 ? (
        <p className="text-sm text-[var(--ink-secondary)]">{M.averagesEmpty}</p>
      ) : (
        <TableRoot>
          <TableHeader>
            <TableRow>
              <TableHead>{M.columnTaskType}</TableHead>
              <TableHead>{M.columnScored}</TableHead>
              <TableHead>{M.columnBlank}</TableHead>
              <TableHead>{M.columnSum}</TableHead>
              <TableHead>{M.columnAverage}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {averages.map((average) => (
              <TableRow key={average.taskType}>
                <TableCell className="font-mono text-xs">{average.taskType}</TableCell>
                <TableCell>{average.scoredCount}</TableCell>
                <TableCell>{average.blankCount}</TableCell>
                <TableCell>{formatApiNumber(average.sum)}</TableCell>
                <TableCell>{formatApiNumber(average.average)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>
      )}
    </ExplanationSection>
  );
};
