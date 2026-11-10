"use client";

import type { ReactElement } from "react";
import { Badge } from "@pte/ui";
import { useScoringRubricText } from "../hooks/useScoringRubricText";
import { traitDisplayName } from "../rubricView";
import type { TaskTypeRubricResponse } from "../types";
import { FormBandTable } from "./_FormBandTable";
import { traitTone } from "@pte/ui";

interface TraitCardsProps {
  rubric: TaskTypeRubricResponse;
}

const SOURCE_ICON: Record<string, string> = { AI_LLM: "✦", AZURE: "🎙", MECHANICAL: "⚙", OBJECTIVE: "✓" };

/** One card per trait: scale, scorer, weight and Score Guide pages, then the Form bands when the task has them. */
export const TraitCards = ({ rubric }: TraitCardsProps): ReactElement => {
  const { locale, messages: M, format, codeLabel } = useScoringRubricText();
  const gateKeys = new Set(rubric.gates.filter((gate) => gate.enabled).map((gate) => gate.traitKey));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rubric.traits.map((trait, index) => (
          <article
            key={trait.key}
            className={`space-y-4 rounded-xl border border-t-4 border-[var(--shell-border)] bg-[var(--surface-card)] p-5 ${traitTone(index).stripe}`}
          >
            <header className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-[var(--ink-primary)]">
                  {traitDisplayName(trait, locale)}
                </h3>
                <p className="font-mono text-xs text-[var(--ink-muted)]">{trait.key}</p>
              </div>
              {gateKeys.has(trait.key) && <Badge variant="warning">{M.gateBadge}</Badge>}
            </header>
            <p className="text-3xl font-semibold text-[var(--ink-primary)]">
              {format("formulaScale", { max: trait.perWord ? M.perWordSymbol : String(trait.maxScore) })}
            </p>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--ink-secondary)]">{M.traitSource}</dt>
                <dd className="text-right text-[var(--ink-primary)]">
                  <span aria-hidden="true">{SOURCE_ICON[trait.source] ?? "•"} </span>
                  {codeLabel("source", trait.source)}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--ink-secondary)]">{M.traitWeight}</dt>
                <dd className="font-mono text-[var(--ink-primary)]">
                  {format(trait.perWord ? "formulaWeightPerWord" : "formulaWeight", { weight: trait.weight })}
                </dd>
              </div>
            </dl>
            {trait.perWord && <p className="text-xs text-[var(--ink-muted)]">{M.perWordMax}</p>}
          </article>
        ))}
      </div>
      {rubric.formBands && <FormBandTable bands={rubric.formBands} />}
    </div>
  );
};
