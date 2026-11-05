"use client";

import { useState, type ReactElement } from "react";
import { useScoringRubricText } from "../hooks/useScoringRubricText";
import { traitDisplayName } from "../rubricView";
import type { TaskTypeRubricResponse } from "../types";
import { AzureBandMapping } from "./_AzureBandMapping";
import { levelDotClass, traitTone } from "./_traitTone";

interface TraitLevelsTabProps {
  rubric: TaskTypeRubricResponse;
}

const AZURE_SOURCE = "AZURE";

/** Level descriptions of one trait at a time (picked with pills); the Azure mapping follows an Azure-scored trait. */
export const TraitLevelsTab = ({ rubric }: TraitLevelsTabProps): ReactElement => {
  const { locale, messages: M, format } = useScoringRubricText();
  const traits = rubric.traits.filter((trait) => trait.levels.length > 0 || trait.source === AZURE_SOURCE);
  const [selectedKey, setSelectedKey] = useState<string | undefined>(traits[0]?.key);
  const selected = traits.find((trait) => trait.key === selectedKey) ?? traits[0];

  if (!selected) return <p className="text-sm text-[var(--ink-secondary)]">{M.levelsEmpty}</p>;

  const levels = [...selected.levels].sort((left, right) => right.level - left.level);
  const topLevel = levels[0]?.level ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2" role="group" aria-label={M.levelsPick}>
        {traits.map((trait) => {
          const index = rubric.traits.indexOf(trait);
          const active = trait.key === selected.key;
          return (
            <button
              key={trait.key}
              type="button"
              aria-pressed={active}
              onClick={() => setSelectedKey(trait.key)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? `border-transparent ${traitTone(index).soft}`
                  : "border-[var(--shell-border)] text-[var(--ink-secondary)] hover:bg-[var(--surface-subtle)]"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${traitTone(index).dot}`} aria-hidden="true" />
              {traitDisplayName(trait, locale)}
            </button>
          );
        })}
      </div>

      {levels.length > 0 && (
        <section className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)]">
          <ol className="divide-y divide-[var(--shell-border)]">
            {levels.map((level) => (
              <li key={level.level} className="flex gap-4 px-5 py-3">
                <span className="flex w-16 shrink-0 items-center gap-2 font-semibold text-[var(--ink-primary)]">
                  <span className={`h-2.5 w-2.5 rounded-full ${levelDotClass(level.level, topLevel)}`} aria-hidden="true" />
                  {format("levelLabel", { level: level.level })}
                </span>
                <span className="text-sm text-[var(--ink-secondary)]">{level.text}</span>
              </li>
            ))}
          </ol>
          <p className="border-t border-[var(--shell-border)] px-5 py-2 text-xs text-[var(--ink-muted)]">
            {M.levelsNote}
          </p>
        </section>
      )}

      {selected.source === AZURE_SOURCE && rubric.azureMapping && (
        <AzureBandMapping mapping={rubric.azureMapping} />
      )}
    </div>
  );
};
