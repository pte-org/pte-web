"use client";

import type { ReactElement } from "react";
import { Badge } from "@pte/ui";
import {
  formatApiNumber,
  storedTraitEntries,
  traceKindMessageKey,
  traitTraceRows,
} from "../explanationView";
import { useScoreExplanationText } from "../hooks/useScoreExplanationText";
import type { ItemExplanationResponse } from "../types";

interface TraitRowsProps {
  item: ItemExplanationResponse;
}

/**
 * How one item score was reached. A rubric trace lists each trait's achieved/max and weight, the gate that fired
 * and the unrounded percentage; every other kind says honestly why there is no breakdown.
 */
export const TraitRows = ({ item }: TraitRowsProps): ReactElement => {
  const { messages: M, format } = useScoreExplanationText();
  const rows = traitTraceRows(item);
  const stored = storedTraitEntries(item);
  const gate = item.trace?.gateTriggeredBy;

  return (
    <div className="space-y-2 text-sm">
      <p className="text-[var(--ink-secondary)]">{M[traceKindMessageKey(item.traceKind)]}</p>
      {item.objectiveRuleCode && (
        <p className="font-mono text-xs">{format("objectiveRule", { rule: item.objectiveRuleCode })}</p>
      )}
      {rows.length > 0 && (
        <table className="w-full text-left text-xs">
          <thead className="text-[var(--ink-secondary)]">
            <tr>
              <th className="py-1 pr-4 font-medium">{M.traitColumn}</th>
              <th className="py-1 pr-4 font-medium">{M.achievedColumn}</th>
              <th className="py-1 font-medium">{M.weightColumn}</th>
              <th className="py-1 font-medium">{M.contributionColumn}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-[var(--shell-border)]">
                <td className="py-1 pr-4 font-mono">
                  {row.key} {row.gateTriggered && <Badge variant="danger">{M.gateBadge}</Badge>}
                </td>
                <td className="py-1 pr-4">{`${row.achieved}/${row.max}`}</td>
                <td className="py-1">{formatApiNumber(row.effectiveWeight)}</td>
                <td className="py-1">{formatApiNumber(row.weightedContribution)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {gate && <p className="text-[var(--blush-action)]">{format("gateTriggered", { trait: gate })}</p>}
      {item.trace && (
        <p className="text-xs text-[var(--ink-secondary)]">
          {format("rawPercent", { value: formatApiNumber(item.trace.rawPercent) })}
        </p>
      )}
      {stored.length > 0 && (
        <p className="font-mono text-xs">
          {M.storedTraits}: {stored.map(([key, value]) => `${key} ${value}`).join(" · ")}
        </p>
      )}
      {item.wordCount !== null && (
        <p className="text-xs text-[var(--ink-secondary)]">
          {format("wordCount", { count: item.wordCount })}
        </p>
      )}
    </div>
  );
};
