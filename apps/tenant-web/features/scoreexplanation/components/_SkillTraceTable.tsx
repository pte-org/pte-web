"use client";

import type { ReactElement } from "react";
import { Badge, DescriptionList, TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from "@pte/ui";
import { formatApiNumber } from "../explanationView";
import { useScoreExplanationText } from "../hooks/useScoreExplanationText";
import type { SkillExplanationResponse } from "../types";

interface SkillTraceTableProps {
  title: string;
  skill: SkillExplanationResponse;
}

/** One skill's (or Overall's) chain: weighted terms, Σ, Σw, ratio, 10 + 80 × ratio and the rounded score. */
export const SkillTraceTable = ({ title, skill }: SkillTraceTableProps): ReactElement => {
  const { messages: M } = useScoreExplanationText();
  const hasChain = skill.terms.length > 0 || skill.weightedSum !== null;

  return (
    <div className="space-y-3 rounded-lg border border-[var(--shell-border)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--ink-primary)]">{title}</h3>
        <span className="text-xl font-semibold text-[var(--ink-primary)]">
          {skill.sufficientData ? formatApiNumber(skill.score) : <Badge variant="neutral">{M.insufficient}</Badge>}
        </span>
      </div>
      {!hasChain && <p className="text-sm text-[var(--ink-secondary)]">{M.noChain}</p>}
      {skill.terms.length > 0 && (
        <TableRoot>
          <TableHeader>
            <TableRow>
              <TableHead>{M.columnTaskType}</TableHead>
              <TableHead>{M.columnWeight}</TableHead>
              <TableHead>{M.columnAverage}</TableHead>
              <TableHead>{M.columnContribution}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skill.terms.map((term) => (
              <TableRow key={term.taskType}>
                <TableCell className="font-mono text-xs">
                  {term.taskType}{" "}
                  {term.excluded && <Badge variant="neutral">{M.excluded}</Badge>}
                </TableCell>
                <TableCell>{formatApiNumber(term.weight)}</TableCell>
                <TableCell>{formatApiNumber(term.average)}</TableCell>
                <TableCell>{formatApiNumber(term.contribution)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>
      )}
      {hasChain && (
        <DescriptionList
          variant="inline"
          items={[
            { label: M.weightedSum, value: formatApiNumber(skill.weightedSum) },
            { label: M.totalWeight, value: formatApiNumber(skill.totalWeight) },
            { label: M.ratio, value: formatApiNumber(skill.ratio) },
            { label: M.scaledScore, value: formatApiNumber(skill.scaledScore) },
            { label: M.roundedScore, value: formatApiNumber(skill.score), fullWidth: true },
          ]}
        />
      )}
    </div>
  );
};
