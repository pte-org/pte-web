"use client";

import { Fragment, type ReactElement } from "react";
import { useScoringRubricText } from "../hooks/useScoringRubricText";
import { traitDisplayName } from "../rubricView";
import type { TaskTypeRubricResponse } from "../types";
import { ObjectiveRuleCard } from "./_ObjectiveRuleCard";
import { traitTone } from "@pte/ui";

interface RubricOverviewTabProps {
  rubric: TaskTypeRubricResponse;
}

/** How the item score is put together: one chip per trait (scale and weight) and the gate, nothing else. */
export const RubricOverviewTab = ({ rubric }: RubricOverviewTabProps): ReactElement => {
  const { locale, messages: M, format } = useScoringRubricText();

  if (rubric.objectiveRule) return <ObjectiveRuleCard rule={rubric.objectiveRule} />;

  const nameOf = (key: string): string => {
    const trait = rubric.traits.find((candidate) => candidate.key === key);
    return trait ? traitDisplayName(trait, locale) : key;
  };
  const enabledGates = rubric.gates.filter((gate) => gate.enabled).map((gate) => nameOf(gate.traitKey));

  return (
    <div className="space-y-5">
      <section className="space-y-4 rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--ink-secondary)]">
          {M.formulaTitle}
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {rubric.traits.map((trait, index) => (
            <Fragment key={trait.key}>
              {index > 0 && <span className="text-lg text-[var(--ink-muted)]">+</span>}
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${traitTone(index).soft}`}
              >
                <span className={`h-2 w-2 rounded-full ${traitTone(index).dot}`} aria-hidden="true" />
                {traitDisplayName(trait, locale)}
                <span className="font-mono text-xs opacity-80">
                  {format("formulaScale", { max: trait.perWord ? M.perWordSymbol : String(trait.maxScore) })}
                </span>
                <span className="rounded-md bg-[var(--surface-card)] px-1.5 font-mono text-xs">
                  {format(trait.perWord ? "formulaWeightPerWord" : "formulaWeight", { weight: trait.weight })}
                </span>
              </span>
            </Fragment>
          ))}
        </div>
        <p className="font-mono text-sm text-[var(--ink-primary)]">{M.formulaExpression}</p>
        <p className="text-sm text-[var(--ink-secondary)]">{M.formulaHint}</p>
      </section>

      {enabledGates.length > 0 ? (
        <div className="rounded-xl border border-amber-300/60 bg-amber-500/10 p-4">
          <div>
            <p className="text-sm font-semibold text-[var(--ink-primary)]">{M.gatesTitle}</p>
            <p className="text-sm text-[var(--ink-secondary)]">
              {format("gateBanner", { traits: enabledGates.join(", ") })}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--ink-muted)]">{M.gatesEmpty}</p>
      )}
    </div>
  );
};
