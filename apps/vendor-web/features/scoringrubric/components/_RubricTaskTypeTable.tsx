"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import {
  Badge,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@pte/ui";
import { PER_WORD_MAX_SYMBOL, scoringRubricDetailHref } from "../constants";
import { useScoringRubricText } from "../hooks/useScoringRubricText";
import { formatRubricMaxTotal, hasEnabledGate } from "../rubricView";
import type { RubricTaskTypeGroup } from "../types";

interface RubricTaskTypeTableProps {
  group: RubricTaskTypeGroup;
}

/** The task types of one skill: traits, gate, maximum points and Score Guide pages, each linking to its rubric. */
export const RubricTaskTypeTable = ({ group }: RubricTaskTypeTableProps): ReactElement => {
  const { messages: M, format, codeLabel } = useScoringRubricText();

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="text-base font-semibold text-[var(--ink-primary)]">
          {codeLabel("skill", group.skill)}
        </h2>
        <span className="text-xs text-[var(--ink-secondary)]">
          {format("groupCount", { count: group.taskTypes.length })}
        </span>
      </div>
      <TableRoot>
        <TableHeader>
          <TableRow>
            <TableHead>{M.columnTaskType}</TableHead>
            <TableHead>{M.columnSkills}</TableHead>
            <TableHead>{M.columnTraits}</TableHead>
            <TableHead>{M.columnGate}</TableHead>
            <TableHead>{M.columnMaxTotal}</TableHead>
            <TableHead>{M.columnPages}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {group.taskTypes.map((rubric) => (
            <TableRow key={rubric.taskType}>
              <TableCell>
                <Link
                  href={scoringRubricDetailHref(rubric.taskType)}
                  className="font-mono text-xs font-medium text-[var(--action)] hover:underline"
                  aria-label={`${M.viewDetail}: ${rubric.taskType}`}
                >
                  {rubric.taskType}
                </Link>
              </TableCell>
              <TableCell>
                <span className="flex flex-wrap gap-1">
                  {rubric.skills.map((skill) => (
                    <Badge key={skill} variant="neutral">
                      {codeLabel("skill", skill)}
                    </Badge>
                  ))}
                </span>
              </TableCell>
              <TableCell>{rubric.traits.length > 0 ? rubric.traits.length : M.answerKey}</TableCell>
              <TableCell>
                {hasEnabledGate(rubric) && <Badge variant="warning">{M.gateBadge}</Badge>}
              </TableCell>
              <TableCell>{formatRubricMaxTotal(rubric.traits, PER_WORD_MAX_SYMBOL) ?? M.answerKey}</TableCell>
              <TableCell>{rubric.pearsonPages}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableRoot>
    </section>
  );
};
