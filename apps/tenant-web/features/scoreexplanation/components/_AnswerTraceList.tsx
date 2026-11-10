"use client";

import type { ReactElement } from "react";
import { TableBody, TableCell, TableHead, TableHeader, TableRoot, TableRow } from "@pte/ui";
import { formatApiNumber } from "../explanationView";
import { useScoreExplanationText } from "../hooks/useScoreExplanationText";
import type { ItemExplanationResponse } from "../types";
import { ExplanationSection } from "./_ExplanationSection";
import { TraitRows } from "./_TraitRows";

interface AnswerTraceListProps {
  items: ItemExplanationResponse[];
}

/** Each answer: task type, score source, how the item score was reached and the item score itself. */
export const AnswerTraceList = ({ items }: AnswerTraceListProps): ReactElement => {
  const { messages: M, codeLabel } = useScoreExplanationText();

  return (
    <ExplanationSection title={M.itemsTitle} hint={M.itemsHint}>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--ink-secondary)]">{M.itemsEmpty}</p>
      ) : (
        <TableRoot>
          <TableHeader>
            <TableRow>
              <TableHead>{M.columnNumber}</TableHead>
              <TableHead>{M.columnTaskType}</TableHead>
              <TableHead>{M.columnSource}</TableHead>
              <TableHead>{M.columnExplanation}</TableHead>
              <TableHead>{M.columnItemScore}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={item.answerPublicId}>
                <TableCell className="align-top">{index + 1}</TableCell>
                <TableCell className="align-top">
                  <div className="font-mono text-xs">{item.taskType}</div>
                  {item.section && (
                    <div className="text-xs text-[var(--ink-muted)]">
                      {codeLabel("skill", item.section)}
                    </div>
                  )}
                </TableCell>
                <TableCell className="align-top">
                  {item.scoreSource ? codeLabel("source", item.scoreSource) : M.sourceNone}
                </TableCell>
                <TableCell className="align-top">
                  <TraitRows item={item} />
                </TableCell>
                <TableCell className="align-top text-base font-semibold">
                  {formatApiNumber(item.itemScore)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableRoot>
      )}
    </ExplanationSection>
  );
};
