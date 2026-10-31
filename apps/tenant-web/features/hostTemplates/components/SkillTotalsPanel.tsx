"use client";

import type { ReactElement } from "react";
import { areWeightsValid, formatWeight, type SkillTotal } from "../utils/weights";
import { FULL_SKILL_WEIGHT, SKILLS } from "../constants";
import { useEditorText, useSkillLabels } from "../hooks/useTemplateText";

interface SkillTotalsPanelProps {
  totals: readonly SkillTotal[];
}

/** One bar per skill: green at exactly 100 (or an untested 0), red otherwise. */
export const SkillTotalsPanel = ({ totals }: SkillTotalsPanelProps): ReactElement => {
  const text = useEditorText();
  const labels = useSkillLabels();
  const overallOk = areWeightsValid(totals);

  return (
    <section className="rounded-xl border border-[var(--shell-border)] bg-[var(--surface-card)] p-4">
      <h2 className="text-base font-semibold text-[var(--ink-primary)]">{text.TOTALS_TITLE}</h2>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">{text.TOTALS_HINT}</p>
      <ul className="mt-3 flex flex-col gap-3">
        {SKILLS.map((skill) => {
          const entry = totals.find((item) => item.skill === skill);
          if (!entry) return null;
          const percent = Math.min(100, Math.max(0, (entry.total / FULL_SKILL_WEIGHT) * 100));
          const unused = entry.ok && entry.total === 0;
          const status = unused ? text.TOTAL_UNUSED : entry.ok ? text.TOTAL_OK : text.TOTAL_NEEDS_100;
          return (
            <li key={skill}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="font-medium text-[var(--ink-primary)]">{labels[skill]}</span>
                <span
                  className={
                    entry.ok ? "text-[var(--mint-action)]" : "font-semibold text-[var(--blush-action)]"
                  }
                >
                  {formatWeight(entry.total)} / {FULL_SKILL_WEIGHT} · {status}
                </span>
              </div>
              <div
                role="progressbar"
                aria-label={labels[skill]}
                aria-valuemin={0}
                aria-valuemax={FULL_SKILL_WEIGHT}
                aria-valuenow={entry.total}
                className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--surface-subtle)]"
              >
                <div
                  className={`h-full rounded-full ${entry.ok ? "bg-[var(--mint-action)]" : "bg-[var(--blush-action)]"}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
      {!overallOk && totals.every((entry) => entry.total === 0) && (
        <p className="mt-3 text-xs text-[var(--blush-action)]">{text.OVERALL_ZERO}</p>
      )}
    </section>
  );
};
